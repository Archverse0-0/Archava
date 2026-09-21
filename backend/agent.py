import json
import os
import sys

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import NOT_GIVEN, Agent, AgentSession, APIConnectOptions, room_io
from livekit.plugins import google, tavus

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from degradation import degraded
from mcp_client import MCPServerSse
from mcp_client.agent_tools import MCPToolsIntegration
from prompts import AGENT_INSTRUCTION
from tools import (
    check_room_availability,
    close_session,
    open_browser,
    send_booking_email,
    sign_web3_transaction,
    trigger_web3_booking,
)

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


def required_env(name: str) -> str:
    """Read a mandatory setting, failing fast with an actionable message.

    LiveKit distinguishes "argument not supplied" from "argument supplied as
    None"; passing a missing API key through as ``None`` would only surface at
    the first provider call, far from the misconfiguration.
    """
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(
            f"{name} is required but is not configured. See backend/.env.example."
        )
    return value


def create_session() -> AgentSession:
    return AgentSession(
        llm=google.realtime.RealtimeModel(
            model=os.environ.get("GEMINI_MODEL", "gemini-3.1-flash-live-preview"),
            api_key=required_env("GEMINI_API_KEY"),
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
        with degraded("n8n MCP server", "init"):
            mcp_server = MCPServerSse(
                params={"url": mcp_url},
                cache_tools_list=True,
                name="SSE MCP Server"
            )
            agent = await MCPToolsIntegration.create_agent_with_tools(
                agent_class=Assistant,
                mcp_servers=[mcp_server]
            )
        if not isinstance(agent, Assistant):
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
            # ``pal_id`` selects a reusable persona and is genuinely optional;
            # LiveKit needs the "not supplied" sentinel rather than ``None``.
            pal_id=pal_id if pal_id is not None else NOT_GIVEN,
            api_key=tavus_key,
            # Do not retry non-recoverable provider errors (for example HTTP 402)
            # three times before enabling voice-only mode.
            conn_options=APIConnectOptions(max_retry=1, retry_interval=0.5, timeout=8.0),
        )

    await ctx.connect()

    avatar_status = "voice_only"
    if avatar is not None:
        with degraded("Tavus avatar", "start"):
            # Current LiveKit avatar lifecycle: start and join the avatar before
            # starting AgentSession so its audio output is routed correctly.
            await avatar.start(session, room=ctx.room)
            await avatar.wait_for_join(timeout=20.0)
            avatar_status = "ready"
            print("[agent] Tavus avatar connected", flush=True)
        if avatar_status == "voice_only":
            # AvatarSession may replace the audio output after its API call.
            # A fresh session guarantees that fallback audio goes to the room.
            with degraded("Tavus avatar", "close"):
                await avatar.aclose()
            avatar = None
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

    with degraded("avatar status", "publish"):
        await publish_avatar_status(ctx, avatar_status)

    # Gemini 3.1 native audio cannot use AgentSession.say() without a separate
    # TTS/audio source. The first user utterance triggers the greeting rules in
    # AGENT_INSTRUCTION.
    print(f"[agent] ready ({avatar_status})", flush=True)


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
