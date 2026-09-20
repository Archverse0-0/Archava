from dotenv import load_dotenv
from prompts import AGENT_INSTRUCTION
from livekit import agents
from livekit.agents import APIConnectOptions, AgentSession, Agent, room_io
from livekit.plugins import google
from mcp_client import MCPServerSse
from mcp_client.agent_tools import MCPToolsIntegration
import json
import os
from tools import open_browser, send_booking_email, close_session, check_room_availability, trigger_web3_booking, sign_web3_transaction
from livekit.plugins import tavus
load_dotenv()


def optional_env(name: str) -> str | None:
    """Return configured optional values while ignoring checked-in placeholders."""
    value = os.environ.get(name, "").strip()
    if not value or value.lower().startswith("your_") or ".example" in value.lower():
        return None
    return value


def env_flag(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def create_session() -> AgentSession:
    return AgentSession(
        llm=google.realtime.RealtimeModel(
            model=os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-live-preview"),
            api_key=os.environ.get("GEMINI_API_KEY"),
            voice=os.environ.get("GEMINI_VOICE", "Kore"),
            # Gemini 3.1 does not accept mid-session instruction updates.
            instructions=AGENT_INSTRUCTION,
        )
    )


async def publish_avatar_status(ctx: agents.JobContext, status: str) -> None:
    payload = json.dumps({"action": "avatar_status", "status": status}).encode("utf-8")
    await ctx.room.local_participant.publish_data(
        payload,
        reliable=True,
        topic="avatar_status",
    )


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            tools=[open_browser, send_booking_email, close_session, check_room_availability, trigger_web3_booking, sign_web3_transaction],
        )


async def entrypoint(ctx: agents.JobContext):
    session = create_session()

    mcp_url = optional_env("N8N_MCP_SERVER_URL")
    if mcp_url:
        try:
            mcp_server = MCPServerSse(
                params={"url": mcp_url},
                cache_tools_list=True,
                name="SSE MCP Server"
            )
            agent = await MCPToolsIntegration.create_agent_with_tools(
                agent_class=Assistant,
                mcp_servers=[mcp_server]
            )
        except Exception as e:
            print(f"[agent] Warning: MCP server init failed ({e}), falling back to standard Assistant", flush=True)
            agent = Assistant()
    else:
        agent = Assistant()

    # Tavus is optional. Any provider/quota failure falls back to Gemini voice-only.
    tavus_enabled = env_flag("TAVUS_ENABLED", default=True)
    tavus_key = optional_env("TAVUS_API_KEY")
    face_id = optional_env("FACE_ID")
    pal_id = optional_env("PAL_ID")
    avatar = None
    if tavus_enabled and tavus_key and face_id:
        avatar = tavus.AvatarSession(
            face_id=face_id,
            pal_id=pal_id,
            api_key=tavus_key,
            # Do not retry non-recoverable provider errors (for example HTTP 402)
            # three times before enabling voice-only mode.
            conn_options=APIConnectOptions(max_retry=1, retry_interval=0.5, timeout=8.0),
        )

    await ctx.connect()

    avatar_status = "voice_only"
    if avatar is not None:
        try:
            # Current LiveKit avatar lifecycle: start and join the avatar before
            # starting AgentSession so its audio output is routed correctly.
            await avatar.start(session, room=ctx.room)
            await avatar.wait_for_join(timeout=20.0)
            avatar_status = "ready"
            print("[agent] Tavus avatar connected", flush=True)
        except Exception as exc:
            print(
                f"[agent] Tavus unavailable ({type(exc).__name__}); continuing voice-only",
                flush=True,
            )
            await avatar.aclose()
            avatar = None
            # AvatarSession may replace the audio output after its API call.
            # A fresh session guarantees that fallback audio goes to the room.
            session = create_session()
    else:
        reason = "disabled" if not tavus_enabled else "not configured"
        print(f"[agent] Tavus {reason}; continuing voice-only", flush=True)

    await session.start(
        room=ctx.room,
        agent=agent,
        room_options=room_io.RoomOptions(
            participant_identity="admin",
            close_on_disconnect=True,
        ),
    )

    try:
        await publish_avatar_status(ctx, avatar_status)
    except Exception as exc:
        print(f"[agent] Could not publish avatar status: {exc}", flush=True)

    # Gemini 3.1 native audio cannot use AgentSession.say() without a separate
    # TTS/audio source. The first user utterance triggers the greeting rules in
    # AGENT_INSTRUCTION.
    print(f"[agent] ready ({avatar_status})", flush=True)


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
