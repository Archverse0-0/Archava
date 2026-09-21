import { useCallback, useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import AvatarVoiceAgent from "./AvatarVoiceAgent";
import { useLang } from "@/lib/i18n";
import "./LiveKitWidget.css";

/**
 * Origin of the token server that issues LiveKit access tokens.
 *
 * This is a build-time Vite variable because the browser cannot read runtime
 * environment variables from a static bundle: once `npm run build` has run,
 * every `import.meta.env.VITE_*` reference has been substituted with a literal
 * string. Leaving it empty makes the request same-origin (`/api/getToken`),
 * which is correct behind the nginx reverse proxy in docker-compose and in the
 * Vite dev server (which proxies `/api` to `localhost:5001`).
 *
 * It must be set when the frontend and the token server are on different
 * origins — most importantly on Vercel, where no reverse proxy exists and a
 * relative `/api/getToken` would 404. See DEPLOY_GUIDE.md.
 */
const TOKEN_API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

const tokenEndpoint = () => `${TOKEN_API_BASE}/api/getToken`;

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
      const response = await fetch(tokenEndpoint(), {
        signal: controller.signal,
        credentials: "same-origin",
        headers: { Accept: "text/plain" },
      });
      if (!response.ok) throw new Error(`token ${response.status}`);
      const nextToken = (await response.text()).trim();
      if (!nextToken) throw new Error("empty token");
      setToken(nextToken);
    } catch (err) {
      console.error("Ava token error:", err);
      setError(err.name === "AbortError" ? "token request timed out" : err.message || "connection failed");
    } finally {
      clearTimeout(timeout);
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    void getToken();
  }, [getToken]);

  return (
    <div className="modal-content" style={{ position: "relative" }}>
      <button type="button" className="modal-close" aria-label="Close" onClick={() => setShowSupport(false)}>
        ✕
      </button>
      <div className="support-room">
        {isConnecting ? (
          <div className="connecting-status">
            <h3 style={{ fontSize: "0.9rem", color: "#e2e8f0", marginBottom: 8 }}>
              Menghubungkan ke Ava (Concierge)…
            </h3>
            <button type="button" className="cancel-button" onClick={() => setShowSupport(false)}>
              Batal
            </button>
          </div>
        ) : error ? (
          <div className="connecting-status">
            <h3 style={{ fontSize: "0.9rem", color: "#fca5a5", marginBottom: 8 }}>Concierge belum tersedia</h3>
            <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 12 }}>
              {tf({
                id: "Ava sedang offline. Coba lagi atau hubungi kami via WhatsApp.",
                en: "Ava is offline. Try again or reach us on WhatsApp.",
                ru: "Ава не в сети. Попробуйте снова или свяжитесь с нами через WhatsApp.",
                ko: "에이바가 오프라인입니다. 다시 시도하거나 WhatsApp으로 연락하세요.",
              })}
            </p>
            <div className="flex gap-2">
              <button type="button" className="cancel-button" onClick={() => void getToken()}>
                {tf({ id: "Coba Lagi", en: "Retry", ru: "Повторить", ko: "다시 시도" })}
              </button>
              <button type="button" className="cancel-button" onClick={() => setShowSupport(false)}>
                {tf({ id: "Tutup", en: "Close", ru: "Закрыть", ko: "닫기" })}
              </button>
            </div>
          </div>
        ) : token ? (
          <LiveKitRoom
            serverUrl={import.meta.env.VITE_LIVEKIT_URL || "wss://receptionist-lwypqvqa.livekit.cloud"}
            token={token}
            connect
            video={false}
            audio
            onDisconnected={() => {
              setToken(null);
              setShowSupport(false);
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
