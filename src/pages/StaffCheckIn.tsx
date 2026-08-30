import { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/lib/i18n";
import { CONTRACT_ADDRESSES, BOOKING_ESCROW_ABI } from "@/web3/contracts";
import { QrCode, CheckCircle, Loader2, ExternalLink, AlertTriangle, ShieldCheck } from "lucide-react";

export default function StaffCheckIn() {
  const { address, isConnected } = useAccount();
  const { tf } = useLang();
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.bookingEscrow,
    abi: BOOKING_ESCROW_ABI,
    functionName: "getUserBookings",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const handleCheckIn = async () => {
    if (!bookingIdInput) return;
    setIsChecking(true);
    setResult(null);

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.bookingEscrow,
        abi: BOOKING_ESCROW_ABI,
        functionName: "checkIn",
        args: [BigInt(bookingIdInput)],
      });
      setResult({ success: true, txHash: hash });
      refetch();
    } catch (err: any) {
      setResult({ success: false, error: err.message?.slice(0, 200) || "Check-in failed" });
    }
    setIsChecking(false);
  };

  if (!isConnected) {
    return (
      <div className="bg-[hsl(222_47%_9%)] min-h-screen">
        <PageHero
          bgImage="/assets/whiterock/aerial.jpg"
          eyebrow="STAFF VERIFICATION PORTAL"
          title="GUEST CHECK-IN TERMINAL"
          subtitle="Connect venue administrator wallet to verify guest arrivals and release escrow funds on Monad Testnet."
          height="tall"
        >
          <div className="mt-8 flex justify-center">
            <ConnectButton />
          </div>
        </PageHero>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen text-slate-100">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow="STAFF VERIFICATION PORTAL"
        title="GUEST CHECK-IN TERMINAL"
        subtitle="Verify guest QR code or Booking ID to execute instant check-in and release escrow deposits."
        height="tall"
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-2xl space-y-6">
          {/* Check-In Input Card */}
          <Reveal>
            <Card className="glow-card glass rounded-3xl border border-amber-300/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2.5 font-cinzel text-xl text-white">
                  <QrCode className="h-5 w-5 text-amber-300" />
                  VERIFY GUEST BOOKING ID
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    value={bookingIdInput}
                    onChange={(e) => setBookingIdInput(e.target.value)}
                    placeholder="Enter Booking ID (e.g. 1)"
                    className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-950/80 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-cinzel text-sm"
                  />
                  <Button
                    variant="luxury"
                    disabled={isChecking || !bookingIdInput}
                    onClick={handleCheckIn}
                    className="rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
                  >
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    ) : (
                      "EXECUTE CHECK-IN"
                    )}
                  </Button>
                </div>

                {result && (
                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      result.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {result.success ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-cinzel text-base font-bold text-emerald-400">
                          <CheckCircle className="h-5 w-5" />
                          GUEST CHECK-IN SUCCESSFUL!
                        </div>
                        {result.txHash && (
                          <a
                            href={`https://testnet.monadexplorer.com/tx/${result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-emerald-300 hover:underline font-mono"
                          >
                            Tx Hash: {result.txHash.slice(0, 14)}...{result.txHash.slice(-8)}
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                        )}
                        <p className="text-xs text-slate-400 font-light">
                          Escrow deposit successfully released on-chain to venue treasury.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-300 font-medium text-xs">
                        <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                        <span>{result.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Reveal>

          {/* Quick Notice */}
          <Reveal delay={100}>
            <Card className="glass rounded-2xl border border-white/10">
              <CardContent className="p-5 flex items-center gap-3.5 text-xs text-slate-400 font-light">
                <ShieldCheck className="h-5 w-5 text-amber-300 shrink-0" />
                <p>
                  Only authorized admin/owner wallets can trigger guest check-ins. Ensure your connected wallet address matches the deployed escrow owner.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
