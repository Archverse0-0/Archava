import React, { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESSES, BOOKING_ESCROW_ABI, DAYBED_TYPES } from "@/web3/contracts";
import { Button } from "@/components/ui/button";
import { Loader2, Droplets, CheckCircle, ExternalLink } from "lucide-react";
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
    inputs: [
      { name: "account", type: "address" },
    ],
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

export const Web3BookingButton: React.FC<Web3BookingButtonProps> = ({
  daybedType,
  dateString,
  autoSign = false,
  onSuccess,
}) => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const { tf } = useLang();
  const [step, setStep] = useState<"idle" | "fauceting" | "approving" | "booking">("idle");

  // Read required deposit in USDT (6 decimals)
  const { data: depositUsdt } = useReadContract({
    address: CONTRACT_ADDRESSES.bookingEscrow,
    abi: BOOKING_ESCROW_ABI,
    functionName: "calculateDeposit",
    args: address ? [address, daybedType, CONTRACT_ADDRESSES.mockUSDT] : undefined,
    query: { enabled: !!address },
  });

  // Read user USDT balance
  const { data: usdtBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.mockUSDT,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const handleFaucet = async () => {
    setStep("fauceting");
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.mockUSDT,
        abi: ERC20_ABI,
        functionName: "faucet",
      });
      refetchBalance();
    } catch (err) {
      console.error("Faucet claim failed:", err);
    }
    setStep("idle");
  };

  const handleBooking = async () => {
    if (!depositUsdt || !dateString || !address) return;

    setStep("approving");
    try {
      // Step 1: Approve USDT to BookingEscrow
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.mockUSDT,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACT_ADDRESSES.bookingEscrow, depositUsdt],
      });

      setStep("booking");

      // Step 2: Create booking with USDT
      const visitTimestamp = BigInt(Math.floor(new Date(dateString).getTime() / 1000));
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.bookingEscrow,
        abi: BOOKING_ESCROW_ABI,
        functionName: "createBooking",
        args: [daybedType, visitTimestamp, CONTRACT_ADDRESSES.mockUSDT],
        value: 0n,
      });

      if (onSuccess) {
        onSuccess(1, hash);
      }
    } catch (err) {
      console.error("Booking failed:", err);
    }
    setStep("idle");
  };

  // Auto-trigger Rabby / Wallet popup when autoSign prop is true and balance is ready
  React.useEffect(() => {
    if (autoSign && isConnected && usdtBalance !== undefined && depositUsdt !== undefined && usdtBalance >= depositUsdt && step === "idle") {
      console.log("[web3] Voice auto-sign triggered! Opening Rabby / Wallet signature popup...");
      handleBooking();
    }
  }, [autoSign, isConnected, usdtBalance, depositUsdt]);

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

  const daybedName = DAYBED_TYPES[daybedType]?.name || "Daybed";
  const depositFormatted = depositUsdt ? formatUnits(depositUsdt, 6) : "...";
  const balanceFormatted = usdtBalance ? formatUnits(usdtBalance, 6) : "0";
  const hasEnoughBalance = usdtBalance !== undefined && depositUsdt !== undefined && usdtBalance >= depositUsdt;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Deposit info */}
      <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/80 border border-white/10">
        <span className="text-slate-400">
          Escrow Deposit ({daybedName})
        </span>
        <span className="text-amber-300 font-bold font-mono">{depositFormatted} USDT</span>
      </div>

      {/* Balance info & Direct Faucet Claim Button */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-slate-400">Your USDT Balance</span>
        <span className={hasEnoughBalance ? "text-amber-300 font-bold font-mono" : "text-rose-400 font-bold font-mono"}>
          {balanceFormatted} USDT
        </span>
      </div>

      {/* Claim Free Faucet Button if low balance */}
      {!hasEnoughBalance && (
        <Button
          variant="outline"
          size="sm"
          disabled={step === "fauceting"}
          onClick={handleFaucet}
          className="w-full rounded-xl border-amber-400/40 text-amber-300 hover:bg-amber-400/10 text-xs font-semibold py-2 flex items-center justify-center gap-2"
        >
          {step === "fauceting" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Droplets className="h-3.5 w-3.5 text-amber-300" />
          )}
          Claim 1,000 Free Mock USDT (Faucet)
        </Button>
      )}

      {/* Book button */}
      <Button
        variant="luxury"
        size="lg"
        disabled={isPending || !depositUsdt || !hasEnoughBalance}
        onClick={handleBooking}
        className="w-full rounded-full py-3.5 gold-gradient text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            {step === "approving"
              ? "Approving USDT..."
              : "Booking on Monad..."
            }
          </span>
        ) : (
          `PAY ${depositFormatted} USDT DEPOSIT`
        )}
      </Button>
    </div>
  );
};
