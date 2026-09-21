import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LangProvider } from "@/lib/i18n";

/**
 * NFTPassCard is the only surface that tells a guest what discount their pass
 * actually grants. The on-chain value is a uint16 in basis points (500 = 5%),
 * and the whole card is gated behind a balance read — so the failure modes that
 * matter are: showing a discount that is off by 100×, or rendering the card at
 * all for a wallet with no pass. `wagmi` is stubbed so each of those reads can
 * be driven directly.
 */

const readContract = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mockAddress }),
  useReadContract: (config: { functionName: string; args?: readonly unknown[] }) =>
    readContract(config),
}));

let mockAddress: `0x${string}` | undefined = "0x1111111111111111111111111111111111111111";

/** Wire the two reads the component makes to fixed values. */
function stubReads(opts: { balance?: bigint; discountBps?: bigint }) {
  readContract.mockImplementation((config: { functionName: string }) => {
    if (config.functionName === "balanceOf") return { data: opts.balance ?? 0n };
    if (config.functionName === "getDiscountBpsForUser") return { data: opts.discountBps };
    return { data: undefined };
  });
}

const importCard = async () => (await import("../NFTPassCard")).NFTPassCard;

/** Wrap in LangProvider — the card reads localized strings through useLang. */
const renderCard = (NFTPassCard: () => JSX.Element) =>
  render(
    <LangProvider>
      <NFTPassCard />
    </LangProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  mockAddress = "0x1111111111111111111111111111111111111111";
});

describe("NFTPassCard", () => {
  it("renders nothing until a wallet is connected", async () => {
    mockAddress = undefined;
    stubReads({ balance: 3n });
    const NFTPassCard = await importCard();

    const { container } = renderCard(NFTPassCard);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the connected wallet holds no pass", async () => {
    // A zero balance must not show an empty card shell — the guard is
    // `!balance || balance === 0n`.
    stubReads({ balance: 0n, discountBps: 0n });
    const NFTPassCard = await importCard();

    const { container } = renderCard(NFTPassCard);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not fire the contract reads until an address exists", async () => {
    mockAddress = undefined;
    stubReads({ balance: 0n });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);
    for (const call of readContract.mock.calls) {
      expect(call[0].args).toBeUndefined();
    }
  });

  it("passes the connected address through to both reads", async () => {
    stubReads({ balance: 1n, discountBps: 0n });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);

    const balanceCall = readContract.mock.calls.find(
      (c) => c[0].functionName === "balanceOf",
    );
    const discountCall = readContract.mock.calls.find(
      (c) => c[0].functionName === "getDiscountBpsForUser",
    );
    expect(balanceCall?.[0].args).toEqual([mockAddress]);
    expect(discountCall?.[0].args).toEqual([mockAddress]);
  });

  it("shows the pass count for a holder", async () => {
    stubReads({ balance: 2n, discountBps: 0n });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("Your VIP Pass")).toBeTruthy();
  });

  it("converts basis points to a percentage, not a raw count", async () => {
    // 1000 bps must render as "10% OFF". Rendering "1000% OFF" is the classic
    // off-by-100× bug this guards against.
    stubReads({ balance: 1n, discountBps: 1000n });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);
    expect(screen.getByText("10% OFF")).toBeTruthy();
  });

  it("renders the highest tier's discount as a percentage too", async () => {
    stubReads({ balance: 1n, discountBps: 2000n });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);
    expect(screen.getByText("20% OFF")).toBeTruthy();
  });

  it("hides the discount row when the pass grants none", async () => {
    stubReads({ balance: 1n, discountBps: 0n });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);
    expect(screen.queryByText(/OFF/)).toBeNull();
    // The pass count itself still shows — a holder with no discount still has a pass.
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("hides the discount row before the read resolves, rather than showing 0%", async () => {
    // `discountBps` is undefined while the read is in flight. Treating that as
    // 0 would flash a "0% OFF" badge at every holder.
    stubReads({ balance: 1n, discountBps: undefined });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);
    expect(screen.queryByText(/OFF/)).toBeNull();
  });

  it("always lists every tier's discount so a holder can see what they hold", async () => {
    stubReads({ balance: 1n, discountBps: 500n });
    const NFTPassCard = await importCard();

    renderCard(NFTPassCard);
    for (const label of ["Lagoon Pass: 5%", "VIP Cabana Pass: 10%", "Party Suite Pass: 20%"]) {
      expect(screen.getByText(label), `${label} should be listed`).toBeTruthy();
    }
  });
});
