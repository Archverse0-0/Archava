from dotenv import load_dotenv
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    google,  # Gemini Live realtime (voice brain) — drop-in buat OpenAI Realtime
    noise_cancellation,
)
from mcp_client import MCPServerSse
from mcp_client.agent_tools import MCPToolsIntegration
import os
from tools import open_browser, send_booking_email, close_session, check_room_availability, trigger_web3_booking, sign_web3_transaction
from livekit.plugins import tavus
load_dotenv()


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=AGENT_INSTRUCTION,
            tools=[open_browser, send_booking_email, close_session, check_room_availability, trigger_web3_booking, sign_web3_transaction],
        )


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-3.1-flash-live-preview",  # native audio, realtime
            api_key=os.environ.get("GEMINI_API_KEY"),
            voice=os.environ.get("GEMINI_VOICE", "Kore"),  # Female voice (Kore / Aoede)
        )
    )

    mcp_url = os.environ.get("N8N_MCP_SERVER_URL")
    if mcp_url and mcp_url.strip():
        try:
            mcp_server = MCPServerSse(
                params={"url": mcp_url.strip()},
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

    # Tavus avatar — opsional: kalau TAVUS_API_KEY kosong, jalan voice-only
    # URUTAN BENAR (livekit-agents 1.6.8):
    # 1. ctx.connect()  -> agent join room sebagai participant
    # 2. session.start() -> RoomIO link ke participant USER (admin), BUKAN avatar
    # 3. avatar.start()  -> avatar join belakangan (gak jadi input source = no feedback loop)
    tavus_key = os.environ.get("TAVUS_API_KEY")
    avatar = None
    if tavus_key and os.environ.get("FACE_ID"):
        avatar = tavus.AvatarSession(
            # Tavus API (pipeline full) — face_id = wajah, pal_id = persona
            face_id=os.environ.get("FACE_ID"),
            pal_id=os.environ.get("PAL_ID") or None,  # None = izin default
            api_key=tavus_key,
        )

    await ctx.connect()

    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            # WAJIB: link ke user (identity "admin" dari frontend), bukan avatar
            participant_identity="admin",
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            # noise_cancellation=noise_cancellation.BVC(),  # self-host: omit
        ),
    )

    import asyncio
    if avatar is not None:
        # Start Tavus avatar in background task so voice conversation connects instantly (<1s)
        asyncio.create_task(avatar.start(session, room=ctx.room))
        print("[agent] Tavus avatar initialization started in background", flush=True)
    else:
        print("[agent] Tavus FACE_ID kosong -> voice-only mode", flush=True)

    try:
        await session.say("Halo! Selamat datang di White Rock Beach Club. Saya Ava, concierge AI kamu. Ada yang bisa Ava bantu hari ini?", allow_interruptions=True)
        print("[agent] Initial greeting spoken successfully", flush=True)
    except Exception as e:
        print(f"[agent] Initial reply trigger note: {e}", flush=True)

    print("[agent] entrypoint selesai", flush=True)


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
