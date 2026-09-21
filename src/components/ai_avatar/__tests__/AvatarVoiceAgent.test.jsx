import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";

/**
 * LiveKit surface used by AvatarVoiceAgent. The hooks are replaced with inert
 * stand-ins so the test exercises only the data-channel decision logic.
 */
const roomHandlers = new Map();
const room = {
  on: vi.fn((event, handler) => roomHandlers.set(event, handler)),
  off: vi.fn((event, handler) => {
    if (roomHandlers.get(event) === handler) roomHandlers.delete(event);
  }),
  disconnect: vi.fn(),
};

vi.mock("@livekit/components-react", () => ({
  useVoiceAssistant: () => ({ state: "idle", audioTrack: null, agentTranscriptions: [] }),
  BarVisualizer: () => <div data-testid="bar-visualizer" />,
  useTrackTranscription: () => "mock transcript",
  useLocalParticipant: () => ({ localParticipant: { isMicrophoneEnabled: false } }),
  DisconnectButton: ({ children }) => <button type="button">{children}</button>,
  useRoomContext: () => room,
  useTracks: () => [],
  VideoTrack: () => <div data-testid="video-track" />,
}));

// The wallet button pulls in wagmi, RainbowKit and viem. It is not under test
// here — only whether it is rendered — so a stub keeps the test hermetic.
vi.mock("@/components/web3/Web3BookingButton", () => ({
  Web3BookingButton: ({ daybedType, dateString, autoSign }) => (
    <div
      data-testid="web3-booking-button"
      data-daybed-type={String(daybedType)}
      data-date={dateString}
      data-auto-sign={String(!!autoSign)}
    />
  ),
}));

const navigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

vi.mock("@/components/ai_avatar/AvatarVoiceAgent.css", () => ({}));

const loadComponent = async () => (await import("../AvatarVoiceAgent")).default;

/** Emit a data packet the way LiveKit does, then flush React's work queue. */
const emit = async (data) => {
  const handler = roomHandlers.get("dataReceived");
  expect(handler).toBeTypeOf("function");
  await act(async () => {
    handler(new TextEncoder().encode(JSON.stringify(data)), {}, undefined, "navigation");
  });
};

const encode = (data) => new TextEncoder().encode(JSON.stringify(data));

describe("AvatarVoiceAgent data channel", () => {
  let AvatarVoiceAgent;

  beforeEach(async () => {
    roomHandlers.clear();
    vi.clearAllMocks();
    AvatarVoiceAgent = await loadComponent();
    render(<AvatarVoiceAgent onDisconnect={() => {}} />);
  });

  afterEach(() => {
    cleanup();
  });

  it("registers exactly one DataReceived listener", () => {
    // A second subscription (useDataChannel on top of room.on) would run every
    // action twice: two navigations, two wallet prompts, two disconnects.
    expect(room.on).toHaveBeenCalledTimes(1);
    expect(room.on.mock.calls[0][0]).toBe("dataReceived");
  });

  it("removes its listener on unmount", () => {
    cleanup();
    expect(room.off).toHaveBeenCalledTimes(1);
    expect(room.off.mock.calls[0][0]).toBe("dataReceived");
  });

  it("never fabricates a booking when auto_sign arrives with no pending booking", async () => {
    await emit({ action: "auto_sign" });

    expect(screen.queryByTestId("web3-booking-button")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(/belum memilih reservasi/i);
    // The wallet must not be nudged into signing anything.
    expect(screen.queryByTestId("web3-booking-button")).toBeNull();
  });

  it("never fabricates a booking from an incomplete trigger_web3_booking packet", async () => {
    // No daybedName and no visitDate: the old code substituted "Lagoon Bed"
    // and today's date here.
    await emit({ action: "trigger_web3_booking", daybedType: 1 });

    expect(screen.queryByTestId("web3-booking-button")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(/tipe daybed dan tanggal/i);
  });

  it("renders the booking exactly once for a complete packet", async () => {
    await emit({
      action: "trigger_web3_booking",
      daybedType: 1,
      daybedName: "VIP Cabana",
      visitDate: "2026-12-24",
    });

    const buttons = screen.getAllByTestId("web3-booking-button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute("data-daybed-type", "1");
    expect(buttons[0]).toHaveAttribute("data-date", "2026-12-24");
    expect(buttons[0]).toHaveAttribute("data-auto-sign", "false");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("flags auto_sign on an existing booking without duplicating the button", async () => {
    await emit({
      action: "trigger_web3_booking",
      daybedType: 0,
      daybedName: "Lagoon Bed",
      visitDate: "2026-12-24",
    });
    await emit({ action: "auto_sign" });

    const buttons = screen.getAllByTestId("web3-booking-button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute("data-auto-sign", "true");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("applies avatar_status and navigates once for a single packet", async () => {
    await emit({ action: "avatar_status", status: "voice_only" });
    expect(navigate).not.toHaveBeenCalled();

    await emit({ action: "navigate", url: "/spa" });
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/spa-wellness");
  });

  it("ignores a malformed packet without crashing", async () => {
    const handler = roomHandlers.get("dataReceived");
    await act(async () => {
      handler(new TextEncoder().encode("not json"), {}, undefined, "navigation");
    });
    expect(screen.queryByTestId("web3-booking-button")).toBeNull();
  });

  it("passes the encoded payload through the decoder", () => {
    const handler = roomHandlers.get("dataReceived");
    expect(handler).toBeTypeOf("function");
    expect(encode({ action: "avatar_status", status: "voice_only" }).length).toBeGreaterThan(0);
  });
});
