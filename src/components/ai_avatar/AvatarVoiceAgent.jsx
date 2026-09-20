import {
  useVoiceAssistant,
  BarVisualizer,
  useTrackTranscription,
  useLocalParticipant,
  DisconnectButton,
  useRoomContext,
  useDataChannel,
} from "@livekit/components-react";
import { Track, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import { useTracks, VideoTrack } from '@livekit/components-react';
import { useNavigate } from "react-router-dom";
import { Sparkles, Mic, Loader2 } from "lucide-react";
import { Web3BookingButton } from "@/components/web3/Web3BookingButton";
import "./AvatarVoiceAgent.css";

const AvatarVoiceAgent = ({ onDisconnect }) => {
  const navigate = useNavigate();
  const room = useRoomContext();
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const [pendingBooking, setPendingBooking] = useState(null);
  const [avatarStatus, setAvatarStatus] = useState("connecting");

  const handleDataReceived = useCallback((payload, participant, kind, topic) => {
    try {
      const decoded = typeof payload === "string" ? payload : new TextDecoder().decode(payload);
      const data = JSON.parse(decoded);
      console.log("[ai-avatar] Received room data packet:", data, "topic:", topic);
      if (data && data.action === "avatar_status") {
        setAvatarStatus(data.status || "voice_only");
        return;
      }
      if (data && data.action === "disconnect") {
        console.log("[ai-avatar] Disconnect action received from agent, scheduling room disconnect in 3.5s...");
        setTimeout(() => {
          if (room) room.disconnect();
        }, 3500);
        return;
      }
      if (data && data.action === "trigger_web3_booking") {
        console.log("[ai-avatar] Web3 booking modal triggered by Ava:", data);
        setPendingBooking({
          daybedType: data.daybedType ?? 0,
          daybedName: data.daybedName || "Lagoon Bed",
          visitDate: data.visitDate || new Date().toISOString().split("T")[0],
          autoSign: !!data.autoSign,
        });
        return;
      }
      if (data && data.action === "auto_sign") {
        console.log("[ai-avatar] Voice auto-sign command received!");
        setPendingBooking((prev) => (prev ? { ...prev, autoSign: true } : { daybedType: 0, daybedName: "Lagoon Bed", visitDate: new Date().toISOString().split("T")[0], autoSign: true }));
        return;
      }
      if (data && (data.action === "navigate" || data.url)) {
        let path = data.url;
        if (path.startsWith("http://") || path.startsWith("https://")) {
          const parsed = new URL(path);
          path = parsed.pathname + parsed.search;
        }
        const rawPath = path.split("?")[0];
        const queryStr = path.includes("?") ? "?" + path.split("?").slice(1).join("?") : "";
        const lowerPath = rawPath.toLowerCase();
        const ROUTE_ALIASES = {
          "/room-types": "/#daybeds",
          "/rooms": "/#daybeds",
          "/room": "/#daybeds",
          "/pricing": "/#daybeds",
          "/price": "/#daybeds",
          "/harga": "/#daybeds",
          "/kamar": "/#daybeds",
          "/daybed": "/#daybeds",
          "/daybeds": "/#daybeds",
          "/daybed-suites": "/#daybeds",
          "/daybeds-suites": "/#daybeds",
          "/suites": "/#daybeds",
          "/suite": "/#daybeds",
          "/spa": "/spa-wellness",
          "/wellness": "/spa-wellness",
          "/home": "/",
          "/confirmation": "/bookingconfirmation",
          "/confirm": "/bookingconfirmation",
        };
        if (ROUTE_ALIASES[lowerPath]) {
          path = ROUTE_ALIASES[lowerPath] + queryStr;
        }

        console.log("[ai-avatar] Navigating React router to:", path);
        if (path.includes("#")) {
          const [pathname, hash] = path.split("#");
          const targetPath = pathname || "/";
          console.log("[ai-avatar] Navigating React router to page:", targetPath, "section hash:", hash);
          navigate(targetPath + queryStr);
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              console.log("[ai-avatar] Smooth scrolling to exact section id:", hash);
              element.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              const navBtn = Array.from(document.querySelectorAll('button, a')).find(
                (b) => b.id === `nav-btn-${hash}` || (b.textContent && b.textContent.toLowerCase().includes(hash))
              );
              if (navBtn) {
                console.log("[ai-avatar] Clicking section link button:", navBtn);
                navBtn.click();
              }
            }
          }, 300);
        } else {
          navigate(path);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } catch (err) {
      console.error("[ai-avatar] Error processing navigation data packet:", err);
    }
  }, [room, navigate]);

  // Listen to LiveKit navigation data packets from backend agent tool (open_browser)
  useEffect(() => {
    if (!room) return;
    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, handleDataReceived]);

  useDataChannel("navigation", (data) => {
    if (data && data.payload) {
      handleDataReceived(data.payload, null, null, "navigation");
    }
  });

  const { segments: userTranscriptions } = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  const trackRefs = useTracks([Track.Source.Camera]);
  const localCamTrackRef = trackRefs.find(
    (trackRef) => trackRef.participant.identity === "tavus-avatar-agent"
  ) ?? trackRefs.find((t) => t.participant.isAgent);

  useEffect(() => {
    if (localCamTrackRef) setAvatarStatus("ready");
  }, [localCamTrackRef]);

  const stateLabel = {
    disconnected: "Ready — press mic to talk",
    connecting: "Connecting LiveKit audio...",
    connected: "Ava AI Voice Connected",
    listening: "🎤 Listening to your voice...",
    thinking: "🤔 Processing request...",
    speaking: "🔊 Ava is speaking...",
  };

  useEffect(() => {
    const enableMicOnJoin = async () => {
      try {
        const lp = localParticipant.localParticipant;
        if (lp && !lp.isMicrophoneEnabled) {
          await lp.setMicrophoneEnabled(true, {
            captureOptions: { audio: { echoCancellation: true, noiseSuppression: true } },
          });
        }
      } catch (e) {
        console.error("[ai-avatar] auto enable mic error:", e);
      }
    };
    enableMicOnJoin();
  }, [localParticipant.localParticipant]);

  return (
    <div className="voice-assistant-container select-none">
      {/* Audio visualizer */}
      <div className="visualizer-container">
        <BarVisualizer state={state} barCount={7} trackRef={audioTrack} />
      </div>

      {/* Video or Animated Avatar Placeholder */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-amber-400/30 bg-slate-950/90 shadow-2xl flex flex-col items-center justify-center p-4 min-h-[190px]">
        {localCamTrackRef ? (
          <VideoTrack trackRef={localCamTrackRef} className="w-full h-full object-cover rounded-xl" />
        ) : avatarStatus === "voice_only" ? (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
            <div className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center shadow-[0_0_25px_rgba(252,211,77,0.5)] border-2 border-amber-300">
              <Mic className="h-8 w-8 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                Ava Voice Mode Active
              </p>
              <p className="text-[11px] text-slate-400 font-light mt-1">
                Video unavailable — say hello to begin
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center shadow-[0_0_25px_rgba(252,211,77,0.5)] border-2 border-amber-300 animate-pulse">
                <Sparkles className="h-8 w-8 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <p className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                Ava AI Voice Active
              </p>
              <p className="text-[11px] text-slate-400 font-light flex items-center justify-center gap-1 mt-1">
                <Loader2 className="h-3 w-3 animate-spin text-amber-300" />
                Initializing Tavus Video Stream...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instant 1-Click Web3 Payment Drawer */}
      {pendingBooking && (
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-300/40 shadow-2xl space-y-3 w-full animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
              1-Click Web3 Escrow Deposit
            </span>
            <button
              onClick={() => setPendingBooking(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="text-xs space-y-1 text-slate-300">
            <p className="font-semibold text-white text-sm">{pendingBooking.daybedName}</p>
            <p className="text-amber-300 font-mono">Date: {pendingBooking.visitDate}</p>
          </div>

          <Web3BookingButton
            daybedType={pendingBooking.daybedType}
            dateString={pendingBooking.visitDate}
            autoSign={pendingBooking.autoSign}
            onSuccess={(bId, txHash) => {
              setPendingBooking(null);
              navigate(`/bookingconfirmation?bookingId=${bId}&tx=${txHash}&room=${encodeURIComponent(pendingBooking.daybedName)}&checkin=${pendingBooking.visitDate}`);
            }}
          />
        </div>
      )}

      {/* Status indicator */}
      <div className="agent-state text-xs font-medium text-amber-300/90 mt-3 text-center">
        {stateLabel[state] || state}
      </div>

      {/* Disconnect Button */}
      <div className="control-section flex justify-center mt-3">
        <DisconnectButton
          onClick={onDisconnect}
          className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500 hover:text-white px-6 py-2 text-xs font-semibold transition-all shadow-md"
        >
          Disconnect
        </DisconnectButton>
      </div>
    </div>
  );
};

export default AvatarVoiceAgent;
