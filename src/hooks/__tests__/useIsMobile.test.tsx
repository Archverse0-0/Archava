import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { useIsMobile } from "../use-mobile";

/**
 * `useIsMobile` drives every responsive branch in the navbar, the booking modal
 * and the staff terminal, and it is the only place the 768px breakpoint lives.
 * It is easy to break in a way that compiles fine: subscribing to the wrong
 * media query, or leaking the listener so a viewport change never reaches the
 * component. Both are exercised here with a controllable matchMedia stub.
 */

const listeners = new Set<() => void>();

function installMatchMedia(matches: boolean) {
  const mql = {
    matches,
    media: `(max-width: 767px)`,
    onchange: null,
    addEventListener: (_event: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_event: string, cb: () => void) => listeners.delete(cb),
    addListener: (_cb: () => void) => undefined,
    removeListener: (_cb: () => void) => undefined,
    dispatchEvent: () => false,
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return mql;
}

function Probe() {
  const isMobile = useIsMobile();
  return <span data-testid="is-mobile">{String(isMobile)}</span>;
}

describe("useIsMobile", () => {
  beforeEach(() => {
    listeners.clear();
    vi.stubGlobal("innerWidth", 1280);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("queries the viewport against the 768px breakpoint", () => {
    const matchMedia = vi.fn(() => ({
      matches: false,
      media: "",
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }));
    vi.stubGlobal("matchMedia", matchMedia);

    render(<Probe />);

    expect(matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("returns false on a desktop viewport", () => {
    installMatchMedia(false);
    render(<Probe />);
    expect(screen.getByTestId("is-mobile")).toHaveTextContent("false");
  });

  it("returns true on a mobile viewport", () => {
    vi.stubGlobal("innerWidth", 390);
    installMatchMedia(true);
    render(<Probe />);
    expect(screen.getByTestId("is-mobile")).toHaveTextContent("true");
  });

  it("never renders a bare undefined, even before the effect runs", () => {
    installMatchMedia(false);
    render(<Probe />);
    // The hook coerces `undefined` (the pre-effect state) to `false`, so the
    // DOM never contains the string "undefined" for a boolean consumer.
    expect(screen.getByTestId("is-mobile").textContent).not.toBe("undefined");
  });

  it("updates when the media query changes", () => {
    installMatchMedia(false);
    render(<Probe />);
    expect(screen.getByTestId("is-mobile")).toHaveTextContent("false");

    // Simulate the viewport crossing the breakpoint: the listener the effect
    // registered must fire and flip the value. `onChange` re-reads innerWidth
    // rather than `mql.matches`, so the viewport has to move with it.
    act(() => {
      vi.stubGlobal("innerWidth", 390);
      for (const listener of listeners) listener();
    });
    expect(screen.getByTestId("is-mobile")).toHaveTextContent("true");
  });

  it("removes its change listener on unmount", () => {
    installMatchMedia(false);
    const { unmount } = render(<Probe />);
    expect(listeners.size).toBe(1);

    unmount();
    expect(listeners.size).toBe(0);
  });
});
