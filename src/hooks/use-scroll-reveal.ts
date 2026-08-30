import { useEffect, useRef, useState } from "react";

// Hoisted to module scope so the default object identity is stable across
// renders — otherwise every consumer would tear down & rebuild its
// IntersectionObserver on every parent re-render (e.g. 60×/sec during
// CountUp's animation frames).
const DEFAULT_OPTIONS: IntersectionObserverInit = {
  threshold: 0.15,
  rootMargin: "0px 0px -10% 0px",
};

/**
 * Reveal-on-scroll using IntersectionObserver.
 * Returns a ref to attach and a boolean that flips true once in view.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = DEFAULT_OPTIONS
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      });
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);

  return { ref, visible };
}
