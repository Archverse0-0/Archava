import { useEffect, useRef } from "react";
import { ASSETS } from "@/data/whiterock";
import { cn } from "@/lib/utils";

type BgVideoProps = {
  className?: string;
  /** prefers the lightweight webm when the browser supports it */
  webmSrc?: string;
  mp4Src?: string;
  poster?: string;
};

/**
 * Background loop video that aggressively recovers from the "stuck"/frozen
 * state: some browsers stop autoplaying after a loop boundary or throttle the
 * 6 Mbps source, so we re-issue play() on stalled/waiting/error and fall back
 * to the poster if the element never becomes ready.
 */
export function BgVideo({
  className,
  webmSrc = ASSETS.bgVideoWebm,
  mp4Src = ASSETS.bgVideo,
  poster = ASSETS.aerial,
}: BgVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    // Kick off on mount (autoplay policies allow muted playback)
    tryPlay();

    // Re-issue play() whenever the browser stalls the stream
    const onStall = () => tryPlay();
    const onWaiting = () => tryPlay();
    const onCanPlay = () => tryPlay();
    const onError = () => {
      // If the preferred source failed, force the other one to load
      if (v.currentSrc.endsWith(".webm") && mp4Src) {
        v.load();
        tryPlay();
      }
    };

    v.addEventListener("stalled", onStall);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("error", onError);

    // visibility: resume when tab becomes visible again
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      v.removeEventListener("stalled", onStall);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [mp4Src, webmSrc]);

  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      className={cn("absolute inset-0 w-full h-full object-cover", className)}
    >
      <source src={webmSrc} type="video/webm" />
      <source src={mp4Src} type="video/mp4" />
    </video>
  );
}
