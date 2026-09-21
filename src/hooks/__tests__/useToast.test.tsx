import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { reducer, useToast } from "../use-toast";

/**
 * The toast store is module-level singleton state shared by every consumer, so
 * a bug here does not show up as a broken component — it shows up as two
 * unrelated parts of the page disagreeing about what is on screen. The reducer
 * is exported precisely so it can be tested without that shared state.
 */

const baseState = { toasts: [] as ReturnType<typeof reducer>["toasts"] };

const makeToast = (id: string) => ({
  id,
  title: `toast-${id}`,
  description: "body",
  open: true,
});

describe("toast reducer", () => {
  it("prepends a new toast and keeps it open", () => {
    const next = reducer(baseState, { type: "ADD_TOAST", toast: makeToast("1") });
    expect(next.toasts).toHaveLength(1);
    expect(next.toasts[0].id).toBe("1");
    expect(next.toasts[0].open).toBe(true);
  });

  it("never grows past TOAST_LIMIT", () => {
    // TOAST_LIMIT is 1: a second toast replaces the first rather than stacking,
    // which is what the single-slot Toaster component expects.
    let state = baseState;
    state = reducer(state, { type: "ADD_TOAST", toast: makeToast("1") });
    state = reducer(state, { type: "ADD_TOAST", toast: makeToast("2") });
    state = reducer(state, { type: "ADD_TOAST", toast: makeToast("3") });

    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe("3");
  });

  it("merges an update into the matching toast only", () => {
    let state = reducer(baseState, { type: "ADD_TOAST", toast: makeToast("1") });
    state = reducer(state, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "updated", open: false },
    });

    expect(state.toasts[0].title).toBe("updated");
    expect(state.toasts[0].open).toBe(false);
    // Untouched fields survive the partial update.
    expect(state.toasts[0].description).toBe("body");
  });

  it("ignores an update for an id that is not present", () => {
    const state = reducer(baseState, { type: "ADD_TOAST", toast: makeToast("1") });
    const next = reducer(state, { type: "UPDATE_TOAST", toast: { id: "nope", title: "x" } });

    expect(next.toasts[0].title).toBe("toast-1");
  });

  it("marks only the named toast as closed on dismiss", () => {
    let state = reducer(baseState, { type: "ADD_TOAST", toast: makeToast("1") });
    state = { toasts: [...state.toasts, makeToast("2")] };
    state = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });

    expect(state.toasts.find((t) => t.id === "1")?.open).toBe(false);
    expect(state.toasts.find((t) => t.id === "2")?.open).toBe(true);
  });

  it("marks every toast closed when dismiss is called without an id", () => {
    let state = { toasts: [makeToast("1"), makeToast("2")] };
    state = reducer(state, { type: "DISMISS_TOAST" });

    expect(state.toasts.every((t) => t.open === false)).toBe(true);
    expect(state.toasts).toHaveLength(2);
  });

  it("removes the named toast and leaves the others", () => {
    let state = { toasts: [makeToast("1"), makeToast("2")] };
    state = reducer(state, { type: "REMOVE_TOAST", toastId: "1" });

    expect(state.toasts.map((t) => t.id)).toEqual(["2"]);
  });

  it("clears everything when remove is called without an id", () => {
    let state = { toasts: [makeToast("1"), makeToast("2")] };
    state = reducer(state, { type: "REMOVE_TOAST" });

    expect(state.toasts).toEqual([]);
  });

  it("does not mutate the previous state", () => {
    const state = { toasts: [makeToast("1")] };
    const snapshot = JSON.parse(JSON.stringify(state));
    reducer(state, { type: "DISMISS_TOAST", toastId: "1" });

    expect(state).toEqual(snapshot);
  });
});

describe("useToast hook", () => {
  afterEach(() => {
    // The store is module-level, so tests have to clean up after themselves or
    // the next case inherits a toast. A bare DISMISS_TOAST is enough because
    // the removal timeout (TOAST_REMOVE_DELAY, 1 000 000 ms) never fires inside
    // a test run — so the store is drained by setting the list empty rather
    // than waiting on it.
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss();
    });
  });

  it("returns a dismiss and update handle for a new toast", () => {
    const { result } = renderHook(() => useToast());

    let handle: ReturnType<typeof result.current.toast> | undefined;
    act(() => {
      handle = result.current.toast({ title: "Booking confirmed" });
    });

    expect(handle).toBeDefined();
    expect(typeof handle?.dismiss).toBe("function");
    expect(typeof handle?.update).toBe("function");
    expect(handle?.id).toBeTruthy();
  });

  it("pushes a new toast into the subscribed state", () => {
    const { result } = renderHook(() => useToast());
    const before = result.current.toasts.length;

    act(() => {
      result.current.toast({ title: "Hello" });
    });

    // TOAST_LIMIT is 1, so the store holds at most one toast; assert on the
    // newly raised one rather than on an absolute count.
    expect(result.current.toasts).toHaveLength(Math.min(before + 1, 1));
    expect(result.current.toasts[0].title).toBe("Hello");
    expect(result.current.toasts[0].open).toBe(true);
  });

  it("gives consecutive toasts distinct ids", () => {
    const { result } = renderHook(() => useToast());
    const ids: string[] = [];

    act(() => {
      ids.push(result.current.toast({ title: "a" }).id);
      ids.push(result.current.toast({ title: "b" }).id);
    });

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("closes the toast when its dismiss handle is called, and keeps the slot until the timeout", () => {
    const { result } = renderHook(() => useToast());

    let handle: ReturnType<typeof result.current.toast> | undefined;
    act(() => {
      handle = result.current.toast({ title: "transient" });
    });

    act(() => {
      handle?.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
    // DISMISS only flips `open`; REMOVE_TOAST (the 1 000 000 ms timer) is what
    // frees the slot, so the toast is still tracked after dismissal.
    expect(result.current.toasts).toHaveLength(1);
  });

  it("closes the toast when the underlying open state goes false", () => {
    // Radix calls onOpenChange(false) when the user swipes the toast away.
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({ title: "swipe me" });
    });
    const toast = result.current.toasts[0];
    expect(typeof toast.onOpenChange).toBe("function");

    act(() => {
      toast.onOpenChange?.(false);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it("keeps two mounted consumers in sync through the shared store", () => {
    // Two components can call useToast() at once; both must observe the same
    // toasts, otherwise the Toaster renders nothing while the caller believes
    // it raised one.
    const first = renderHook(() => useToast());
    const second = renderHook(() => useToast());

    act(() => {
      first.result.current.toast({ title: "shared" });
    });

    expect(first.result.current.toasts).toHaveLength(1);
    expect(second.result.current.toasts).toHaveLength(1);
    expect(second.result.current.toasts[0].title).toBe("shared");
  });
});
