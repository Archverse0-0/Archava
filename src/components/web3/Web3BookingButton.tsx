import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseEventLogs } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESSES, BOOKING_ESCROW_ABI, DAYBED_TYPES } from "@/web3/contracts";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Droplets, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "faucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

interface Web3BookingButtonProps {
  daybedType: number;
  dateString: string;
  autoSign?: boolean;
  onSuccess?: (bookingId: number, txHash: string) => void;
}

type Step = "idle" | "fauceting" | "approving" | "booking" | "confirming";

export const Web3BookingButton: React.FC<Web3BookingButtonProps> = ({
  daybedType,
  dateString,
  autoSign = false,
  onSuccess,
}) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { tf } = useLang();
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const autoSignHandled = useRef(false);

  const { data: depositUsdt } = useReadContract({
    address: CONTRACT_ADDRESSES.bookingEscrow,
    abi: BOOKING_ESCROW_ABI,
    functionName: "calculateDeposit",
    args: address ? [address, daybedType, CONTRACT_ADDRESSES.mockUSDT] : undefined,
    query: { enabled: !!address && daybedType >= 0 && daybedType < DAYBED_TYPES.length },
  });

  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDT,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const handleFaucet = async () => {
    if (!publicClient) return;
    setError(null);
    setStep("fauceting");
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.mockUSDT,
        abi: ERC20_ABI,
        functionName: "faucet",
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Faucet transaction reverted");
      await refetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faucet claim failed");
    } finally {
      setStep("idle");
    }
  };

  const handleBooking = useCallback(async () => {
    if (!depositUsdt || !dateString || !address || !publicClient) return;
    if (daybedType < 0 || daybedType >= DAYBED_TYPES.length) {
      setError("Unsupported daybed type");
      return;
    }

    const visitMs = new Date(`${dateString}T00:00:00`).getTime();
    if (!Number.isFinite(visitMs) || visitMs <= Date.now()) {
      setError("Visit date must be in the future");
      return;
    }

    setError(null);
    try {
      setStep("approving");
      const approvalHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.mockUSDT,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.bookingEscrow, depositUsdt],
      });
      const approvalReceipt = await publicClient.waitForTransactionReceipt({ hash: approvalHash });
      if (approvalReceipt.status !== "success") throw new Error("USDT approval reverted");

      setStep("booking");
      const visitTimestamp = BigInt(Math.floor(visitMs / 1000));
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.bookingEscrow,
        abi: BOOKING_ESCROW_ABI,
        functionName: "createBooking",
        args: [daybedType, visitTimestamp, CONTRACT_ADDRESSES.mockUSDT],
        value: 0n,
      });

      setStep("confirming");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Booking transaction reverted");

      const bookingLogs = parseEventLogs({
        abi: BOOKING_ESCROW_ABI,
        eventName: "BookingCreated",
        logs: receipt.logs,
        strict: false,
      });
      const bookingLog = bookingLogs.find(
        (log) =>
          log.address.toLowerCase() === CONTRACT_ADDRESSES.bookingEscrow.toLowerCase() &&
          log.args.guest?.toLowerCase() === address.toLowerCase(),
      );
      const bookingId = bookingLog?.args.bookingId;
      if (typeof bookingId !== "bigint" || bookingId > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error("BookingCreated event was not found in the confirmed transaction");
      }

      onSuccess?.(Number(bookingId), hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setStep("idle");
    }
  }, [address, dateString, daybedType, depositUsdt, onSuccess, publicClient, writeContractAsync]);

  useEffect(() => {
    if (!autoSign) {
      autoSignHandled.current = false;
      return;
    }
    if (
      !autoSignHandled.current &&
      isConnected &&
      usdtBalance !== undefined &&
      depositUsdt !== undefined &&
      usdtBalance >= depositUsdt &&
      step === "idle"
    ) {
      autoSignHandled.current = true;
      void handleBooking();
    }
  }, [autoSign, depositUsdt, handleBooking, isConnected, step, usdtBalance]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3">
        <ConnectButton
          label={tf({
            id: "Hubungkan Wallet untuk Booking",
            en: "Connect Wallet to Book",
            ru: "Подключите кошелёк для бронирования",
            ko: "예약을 위해 지갑을 연결하세요",
          })}
        />
      </div>
    );
  }

  const daybedName = DAYBED_TYPES[daybedType]?.name || "Unsupported Daybed";
  const depositFormatted = depositUsdt !== undefined ? formatUnits(depositUsdt, 6) : "...";
  const balanceFormatted = usdtBalance !== undefined ? formatUnits(usdtBalance, 6) : "0";
  const hasEnoughBalance =
    usdtBalance !== undefined && depositUsdt !== undefined && usdtBalance >= depositUsdt;
  const busy = step !== "idle";

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/80 border border-white/10">
        <span className="text-slate-400">Escrow Deposit ({daybedName})</span>
        <span className="text-amber-300 font-bold font-mono">{depositFormatted} USDT</span>
      </div>

      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-slate-400">Your Mock USDT Balance</span>
        <span className={hasEnoughBalance ? "text-amber-300 font-bold font-mono" : "text-rose-400 font-bold font-mono"}>
          {balanceFormatted} USDT
        </span>
      </div>

      {!hasEnoughBalance && (
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={handleFaucet}
          className="w-full rounded-xl border-amber-400/40 text-amber-300 hover:bg-amber-400/10 text-xs font-semibold py-2 flex items-center justify-center gap-2"
        >
          {step === "fauceting" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Droplets className="h-3.5 w-3.5" />}
          Claim 1,000 Free Mock USDT (Testnet Faucet)
        </Button>
      )}

      <Button
        variant="luxury"
        size="lg"
        disabled={busy || !depositUsdt || !hasEnoughBalance || !DAYBED_TYPES[daybedType]}
        onClick={() => void handleBooking()}
        className="w-full rounded-full py-3.5 gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            {step === "approving" && "Approving USDT..."}
            {step === "booking" && "Submitting booking..."}
            {step === "confirming" && "Confirming on-chain..."}
            {step === "fauceting" && "Claiming faucet..."}
          </span>
        ) : (
          `PAY ${depositFormatted} USDT DEPOSIT`
        )}
      </Button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
