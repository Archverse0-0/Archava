import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import { LangProvider } from "@/lib/i18n";
import { CONTRACT_ADDRESSES } from "@/web3/contracts";

/**
 * Web3BookingButton is the guest's payment path: it decides whether to prompt
 * for a USDT approval, submits the escrow call, and reads the bookingId back out
 * of the confirmed receipt. Every one of those steps can fail in a way that is
 * invisible to the guest — a skipped approval reverts on-chain, a mis-parsed
 * event loses the booking, and a bookingId accepted from the wrong contract or
 * the wrong guest would hand someone else's booking to this user. All of that is
 * exercised here against stubbed wagmi/viem handles.
 */

const readContract = vi.fn();
const writeContractAsync = vi.fn();
const waitForTransactionReceipt = vi.fn();
const refetchAllowance = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mockAddress, isConnected: !!mockAddress }),
  usePublicClient: () => (mockPublicClient ? { waitForTransactionReceipt } : undefined),
  useWriteContract: () => ({ writeContractAsync }),
  useReadContract: (config: { functionName: string }) => readContract(config),
}));

// viem's parseEventLogs is the boundary between a confirmed receipt and a
// bookingId. Stubbed so each test controls exactly what the receipt "contained".
vi.mock("viem", () => ({
  parseEventLogs: (opts: { logs: unknown[]; eventName: string }) => {
    const all = mockLogs.map((l) => ({ ...l, eventName: opts.eventName }));
    return all.filter((l) => !mockRejectedLogs.includes(l.address.toLowerCase()));
  },
  formatUnits: (value: bigint, decimals: number) => {
    const divisor = 10n ** BigInt(decimals);
    const whole = value / divisor;
    const frac = value % divisor;
    if (frac === 0n) return whole.toString();
    return `${whole}.${frac.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
  },
}));

// RainbowKit renders a full connect modal; the component only needs the button.
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

let mockAddress: `0x${string}` | undefined = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
let mockPublicClient = true;
let mockLogs: Array<{ address: string; args: Record<string, unknown> }> = [];
let mockRejectedLogs: string[] = [];

const GUEST = "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const OTHER = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
const ESCROW = CONTRACT_ADDRESSES.bookingEscrow;
const USDT = CONTRACT_ADDRESSES.mockUSDT;
const DEPOSIT = 150n * 10n ** 6n;

/**
 * A future date, so the "visit date must be in the future" guard passes. The
 * component compares against `Date.now()`, so this has to stay ahead of it.
 */
const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function stubReads(opts: {
  deposit?: bigint;
  allowance?: bigint;
  balance?: bigint;
}) {
  readContract.mockImplementation((config: { functionName: string }) => {
    switch (config.functionName) {
      case "calculateDeposit":
        return { data: opts.deposit };
      case "allowance":
        return { data: opts.allowance, refetch: refetchAllowance };
      case "balanceOf":
        return { data: opts.balance };
      default:
        return { data: undefined };
    }
  });
}

/** A confirmed receipt carrying one BookingCreated log. */
function receiptWithBooking(opts: {
  status?: "success" | "reverted";
  bookingId?: bigint | number;
  address?: string;
  guest?: string;
}) {
  // `bookingId` is coerced rather than assumed: one test feeds a non-numeric
  // value to check the component's own `typeof !== "bigint"` guard, and it must
  // reach that guard instead of throwing here first.
  const bookingId = opts.bookingId === undefined ? 7n : (opts.bookingId as bigint);
  mockLogs = [
    {
      address: opts.address ?? ESCROW,
      args: {
        bookingId,
        guest: opts.guest ?? GUEST,
        daybedType: 1,
        visitTimestamp: 1893456000n,
        depositAmount: DEPOSIT,
        paymentToken: USDT,
      },
    },
  ];
  waitForTransactionReceipt.mockResolvedValue({
    status: opts.status ?? "success",
    logs: mockLogs,
  });
}

const importButton = async () =>
  (await import("../Web3BookingButton")).Web3BookingButton;

function renderButton(props: { daybedType?: number; dateString?: string; onSuccess?: (id: number, hash: string) => void } = {}) {
  const onSuccess = props.onSuccess ?? vi.fn();
  const utils = render(
    <LangProvider>
      <Web3BookingButtonHarness
        daybedType={props.daybedType ?? 1}
        dateString={props.dateString ?? FUTURE_DATE}
        onSuccess={onSuccess}
      />
    </LangProvider>,
  );
  return { ...utils, onSuccess };
}

// Separate component so the import can stay lazy per-test while props stay simple.
let Web3BookingButtonHarness: React.FC<{
  daybedType: number;
  dateString: string;
  onSuccess?: (id: number, hash: string) => void;
}>;

beforeEach(async () => {
  vi.clearAllMocks();
  mockAddress = GUEST as `0x${string}`;
  mockPublicClient = true;
  mockLogs = [];
  mockRejectedLogs = [];
  refetchAllowance.mockResolvedValue({ data: undefined });
  writeContractAsync.mockResolvedValue("0xdeadbeef");
  Web3BookingButtonHarness = (await importButton()) as typeof Web3BookingButtonHarness;
});

describe("Web3BookingButton", () => {
  describe("allowance gate", () => {
    it("skips the approval prompt when the existing allowance already covers the deposit", async () => {
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT * 4n, balance: DEPOSIT * 10n });
      receiptWithBooking({});
      const { getByText } = renderButton();

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(writeContractAsync).toHaveBeenCalled());
      // Exactly one write: the booking itself. An approval would be a second.
      expect(writeContractAsync).toHaveBeenCalledTimes(1);
      expect(writeContractAsync.mock.calls[0][0].functionName).toBe("createBooking");
      expect(refetchAllowance).not.toHaveBeenCalled();
    });

    it("treats an exactly-equal allowance as sufficient (boundary is `>=`, not `>`)", async () => {
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({});
      const { getByText } = renderButton();

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(writeContractAsync).toHaveBeenCalled());
      expect(writeContractAsync).toHaveBeenCalledTimes(1);
      expect(refetchAllowance).not.toHaveBeenCalled();
    });

    it("prompts for approval when the allowance is short of the deposit", async () => {
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT - 1n, balance: DEPOSIT * 10n });
      receiptWithBooking({});
      const { getByText } = renderButton();

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(writeContractAsync).toHaveBeenCalledTimes(2));
      expect(writeContractAsync.mock.calls[0][0].functionName).toBe("approve");
      // The approval is for the escrow and for the exact deposit — not an
      // unlimited approval, which would be a standing permission to drain.
      expect(writeContractAsync.mock.calls[0][0].args).toEqual([ESCROW, DEPOSIT]);
      expect(writeContractAsync.mock.calls[1][0].functionName).toBe("createBooking");
    });

    it("treats an unknown allowance (undefined) as insufficient so a booking never reverts on approval", async () => {
      // `undefined` means the read is still in flight or unreadable. Skipping
      // the approval in that state would submit a booking that reverts.
      stubReads({ deposit: DEPOSIT, allowance: undefined, balance: DEPOSIT * 10n });
      receiptWithBooking({});
      const { getByText } = renderButton();

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(writeContractAsync).toHaveBeenCalledTimes(2));
      expect(writeContractAsync.mock.calls[0][0].functionName).toBe("approve");
    });

    it("refreshes the allowance after a successful approval so the next booking can skip it", async () => {
      stubReads({ deposit: DEPOSIT, allowance: 0n, balance: DEPOSIT * 10n });
      receiptWithBooking({});
      const { getByText } = renderButton();

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(refetchAllowance).toHaveBeenCalledTimes(1));
    });
  });

  describe("approval failure", () => {
    it("surfaces the revert and never submits a booking", async () => {
      stubReads({ deposit: DEPOSIT, allowance: 0n, balance: DEPOSIT * 10n });
      waitForTransactionReceipt.mockResolvedValue({ status: "reverted", logs: [] });
      const { getByText, findByText } = renderButton();

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await findByText(/USDT approval reverted/i);
      // The approval is the only write attempted; a booking is never sent.
      expect(writeContractAsync).toHaveBeenCalledTimes(1);
      expect(writeContractAsync.mock.calls[0][0].functionName).toBe("approve");
    });
  });

  describe("booking failure", () => {
    it("surfaces the revert and does not report a booking id", async () => {
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      waitForTransactionReceipt.mockResolvedValue({ status: "reverted", logs: [] });
      const onSuccess = vi.fn();
      const { getByText, findByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await findByText(/Booking transaction reverted/i);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("BookingCreated event validation", () => {
    it("rejects a confirmed booking whose receipt contains no BookingCreated log", async () => {
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      waitForTransactionReceipt.mockResolvedValue({ status: "success", logs: [] });
      const onSuccess = vi.fn();
      const { getByText, findByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await findByText(/BookingCreated event was not found/i);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("rejects a bookingId that is not a bigint", async () => {
      // A malformed log (or an ABI drift) must not be coerced into a number.
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({ bookingId: "not-a-bigint" as unknown as bigint });
      const onSuccess = vi.fn();
      const { getByText, findByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await findByText(/BookingCreated event was not found/i);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("rejects a bookingId larger than Number.MAX_SAFE_INTEGER", async () => {
      // Past 2^53 a JS number silently loses precision, so the id the guest is
      // shown and the id on-chain would diverge.
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({ bookingId: 2n ** 60n });
      const onSuccess = vi.fn();
      const { getByText, findByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await findByText(/BookingCreated event was not found/i);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("ignores a BookingCreated emitted by a different contract", async () => {
      // An escrow upgrade or a proxy could emit from another address; taking
      // that id would track a booking this contract never recorded.
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({ address: "0x0000000000000000000000000000000000000abc" });
      const onSuccess = vi.fn();
      const { getByText, findByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await findByText(/BookingCreated event was not found/i);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("ignores a BookingCreated for a different guest", async () => {
      // The id must belong to the connected wallet. Accepting another guest's
      // booking would show this user someone else's reservation.
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({ guest: OTHER });
      const onSuccess = vi.fn();
      const { getByText, findByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await findByText(/BookingCreated event was not found/i);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("successful booking", () => {
    it("propagates the real on-chain bookingId and tx hash to the caller", async () => {
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({ bookingId: 4242n });
      const onSuccess = vi.fn();
      const { getByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      // 4242 as a number, not the string "4242" and not the bigint.
      expect(onSuccess).toHaveBeenCalledWith(4242, "0xdeadbeef");
    });

    it("submits the booking against the escrow with the daybed type and visit timestamp", async () => {
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({});
      const { getByText } = renderButton({ daybedType: 2 });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(writeContractAsync).toHaveBeenCalled());
      const call = writeContractAsync.mock.calls[0][0];
      expect(call.address).toBe(ESCROW);
      expect(call.functionName).toBe("createBooking");
      expect(call.args[0]).toBe(2);
      expect(call.args[2]).toBe(USDT);
      // The visit timestamp must be SECONDS, not milliseconds, and must land on
      // the date the guest picked. A millisecond value would be ~1000× larger
      // and the escrow would reject it; Date.now() would book today, not the
      // selected date.
      const visitTimestamp = Number(call.args[1]);
      expect(Number.isInteger(visitTimestamp)).toBe(true);
      const expectedSeconds = Math.floor(
        new Date(`${FUTURE_DATE}T00:00:00`).getTime() / 1000,
      );
      expect(visitTimestamp).toBe(expectedSeconds);
      expect(visitTimestamp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe("input guards", () => {
    it("disables the pay button for an out-of-range daybed type", async () => {
      // The UI layer refuses first: the button is disabled unless the daybed
      // type indexes a real tier, so a bad prop cannot be clicked into a write.
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      const onSuccess = vi.fn();
      const { getByText } = renderButton({ daybedType: 99, onSuccess });

      const payButton = getByText(/USDT DEPOSIT/i).closest("button");
      expect(payButton).toBeTruthy();
      expect((payButton as HTMLButtonElement).disabled).toBe(true);
      expect(writeContractAsync).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("still refuses an unsupported daybed inside the handler via the auto-sign path", async () => {
      // Defense in depth: `handleBooking` re-checks the range itself, and the
      // auto-sign effect calls that handler directly without going through the
      // disabled button. daybedType -1 is out of range but still has no tier
      // entry, so the deposit read resolves and the flow reaches the handler's
      // own guard rather than bailing earlier.
      stubReads({ deposit: DEPOSIT, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      receiptWithBooking({});
      const onSuccess = vi.fn();
      render(
        <LangProvider>
          <Web3BookingButtonHarness
            daybedType={-1}
            dateString={FUTURE_DATE}
            autoSign
            onSuccess={onSuccess}
          />
        </LangProvider>,
      );

      // Auto-sign fires once connected with both reads resolved.
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(writeContractAsync).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("refuses to send any transaction before the deposit read resolves", async () => {
      // With the deposit unknown the first guard returns silently: no error is
      // shown and nothing is written. A guest clicking before the chain read
      // lands must not trigger a booking priced from an unknown amount.
      stubReads({ deposit: undefined, allowance: DEPOSIT, balance: DEPOSIT * 10n });
      const onSuccess = vi.fn();
      const { getByText } = renderButton({ onSuccess });

      await act(async () => {
        getByText(/USDT DEPOSIT/i).click();
      });

      await waitFor(() => expect(writeContractAsync).not.toHaveBeenCalled());
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe("wallet not connected", () => {
    it("renders the connect button instead of the booking flow", async () => {
      mockAddress = undefined;
      stubReads({});
      renderButton();

      expect(screen.getByRole("button", { name: /Connect Wallet/i })).toBeTruthy();
    });
  });
});
