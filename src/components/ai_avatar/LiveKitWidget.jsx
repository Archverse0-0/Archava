import { useState, useCallback, useEffect } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import AvatarVoiceAgent from "./AvatarVoiceAgent";
import { useLang } from "@/lib/i18n";
import "./LiveKitWidget.css";

const LiveKitWidget = ({ setShowSupport }) => {
  const { tf } = useLang();
  const [token, setToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  const getToken = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(
        `/api/getToken?name=${encodeURIComponent("admin")}`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error(`token ${response.status}`);
      const token = (await response.text()).trim();
      if (!token) throw new Error("empty token");
      setToken(token);
      setIsConnecting(false);
    } catch (err) {
      console.error("Ava token error:", err);
      setError(err.name === "AbortError" ? "token request timed out" : (err.message || "connection failed"));
      setIsConnecting(false);
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    getToken();
  }, [getToken]);

  return (
    <div className="modal-content" style={{ position: "relative" }}>
      <button
        type="button"
        className="modal-close"
        aria-label="Close"
        onClick={() => setShowSupport(false)}
      >
        ✕
      </button>
      <div className="support-room">
        {isConnecting ? (
          <div className="connecting-status">
            <h3 style={{ fontSize: "0.9rem", color: "#e2e8f0", marginBottom: 8 }}>
              Menghubungkan ke Ava (Concierge)…
            </h3>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setShowSupport(false)}
            >
              Batal
            </button>
          </div>
        ) : error ? (
          <div className="connecting-status">
            <h3 style={{ fontSize: "0.9rem", color: "#fca5a5", marginBottom: 8 }}>
              Concierge belum tersedia
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 12 }}>
              {tf({ id: "Ava sedang offline. Coba lagi atau hubungi kami via WhatsApp.", en: "Ava is offline. Try again or reach us on WhatsApp.", ru: "Ава не в сети. Попробуйте снова или свяжитесь с нами через WhatsApp.", ko: "에이바가 오프라인입니다. 다시 시도하거나 WhatsApp으로 연락하세요." })}
            </p>
            <div className="flex gap-2">
              <button type="button" className="cancel-button" onClick={getToken}>
                {tf({ id: "Coba Lagi", en: "Retry", ru: "Повторить", ko: "다시 시도" })}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowSupport(false)}
              >
                {tf({ id: "Tutup", en: "Close", ru: "Закрыть", ko: "닫기" })}
              </button>
            </div>
          </div>
        ) : token ? (
          <LiveKitRoom
            serverUrl={import.meta.env.VITE_LIVEKIT_URL || "wss://receptionist-lwypqvqa.livekit.cloud"}
            token={token}
            connect={true}
            video={false}
            audio={true}
            onDisconnected={() => {
              setShowSupport(false);
              setIsConnecting(true);
            }}
          >
            <RoomAudioRenderer />
            <AvatarVoiceAgent />
          </LiveKitRoom>
        ) : null}
      </div>
    </div>
  );
};

export default LiveKitWidget;
