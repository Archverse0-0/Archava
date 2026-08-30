import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/lib/i18n";
import { CONTRACT_ADDRESSES, BOOKING_ESCROW_ABI, DAYBED_TYPES } from "@/web3/contracts";
import { Calendar, MapPin, Clock, ExternalLink, Loader2, XCircle, CheckCircle, ShieldCheck } from "lucide-react";
import { formatUnits } from "viem";

export default function MyBookings() {
  const { address, isConnected } = useAccount();
  const { tf } = useLang();
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);
  const { writeContractAsync } = useWriteContract();

  const { data: bookings, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.bookingEscrow,
    abi: BOOKING_ESCROW_ABI,
    functionName: "getUserBookings",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const handleCancel = async (bookingId: bigint) => {
    setCancellingId(bookingId);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.bookingEscrow,
        abi: BOOKING_ESCROW_ABI,
        functionName: "cancelBooking",
        args: [bookingId],
      });
      refetch();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
    setCancellingId(null);
  };

  if (!isConnected) {
    return (
      <div className="bg-[hsl(222_47%_9%)] min-h-screen">
        <PageHero
          bgImage="/assets/whiterock/aerial.jpg"
          eyebrow="ON-CHAIN ESCROW MANAGEMENT"
          title="MY WEB3 BOOKINGS"
          subtitle="Connect your Web3 wallet to manage on-chain daybed reservations and NFT passes."
          height="tall"
        >
          <div className="mt-8 flex justify-center">
            <ConnectButton />
          </div>
        </PageHero>
      </div>
    );
  }

  const bookingList = bookings ? Array.from(bookings) : [];

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen text-slate-100">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow="ON-CHAIN ESCROW MANAGEMENT"
        title="MY WEB3 BOOKINGS"
        subtitle="All your luxury daybed reservations are secured on the Monad Testnet blockchain with 24-hour cancellation guarantee."
        height="tall"
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          {isLoading ? (
            <div className="text-center text-slate-400 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-300 mx-auto mb-4" />
              <p className="font-cinzel text-sm">Loading on-chain reservations...</p>
            </div>
          ) : bookingList.length === 0 ? (
            <div className="text-center py-16 glow-card glass rounded-3xl p-12 border border-white/10">
              <ShieldCheck className="h-12 w-12 text-amber-300/80 mx-auto mb-4" />
              <h3 className="font-cinzel text-2xl font-bold text-white mb-2">No Active Reservations</h3>
              <p className="text-slate-400 text-sm font-light max-w-md mx-auto mb-8">
                You don't have any active Web3 daybed reservations on Monad Testnet yet.
              </p>
              <Button
                variant="luxury"
                size="lg"
                onClick={() => (window.location.href = "/booking")}
                className="rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                MAKE A RESERVATION
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookingList.map((b, i) => {
                const daybedName = DAYBED_TYPES[b.daybedType]?.name || `Type ${b.daybedType}`;
                const visitDate = new Date(Number(b.visitTimestamp) * 1000).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                const isCancelled = b.cancelled;
                const isSettled = b.settled;
                const isCheckedIn = b.checkedIn;
                const canCancel = !isCancelled && !isSettled && !isCheckedIn;
                const isUsdt = b.paymentToken.toLowerCase() === CONTRACT_ADDRESSES.mockUSDT.toLowerCase();

                const depositDisplay = isUsdt
                  ? `${formatUnits(b.depositAmount, 6)} USDT`
                  : `${formatUnits(b.depositAmount, 18)} MON`;

                return (
                  <Reveal key={Number(b.bookingId)} delay={i * 60}>
                    <Card
                      className={`glow-card glass rounded-3xl border transition-all ${
                        isCancelled
                          ? "border-rose-500/30 bg-rose-950/10"
                          : isSettled
                          ? "border-emerald-500/30 bg-emerald-950/10"
                          : "border-amber-300/30"
                      }`}
                    >
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="font-cinzel text-xl font-bold text-amber-300">
                                Booking #{String(b.bookingId)}
                              </span>
                              <Badge
                                variant="secondary"
                                className={
                                  isCancelled
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold"
                                    : isSettled
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                                    : isCheckedIn
                                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold"
                                    : "gold-gradient text-[hsl(222_47%_8%)] text-[10px] font-black"
                                }
                              >
                                {isCancelled
                                  ? "CANCELLED"
                                  : isSettled
                                  ? "SETTLED"
                                  : isCheckedIn
                                  ? "CHECKED IN"
                                  : "ACTIVE ESCROW"}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-white font-cinzel text-lg">
                              <MapPin className="h-4 w-4 text-amber-400" />
                              <span>{daybedName}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300 font-light">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-amber-300" />
                                {visitDate}
                              </span>
                              <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                                <Clock className="h-3.5 w-3.5" />
                                {depositDisplay}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={cancellingId === b.bookingId}
                                onClick={() => handleCancel(b.bookingId)}
                                className="rounded-full border-rose-500/40 text-rose-300 hover:bg-rose-500 hover:text-white transition-all text-xs font-semibold px-5 py-2"
                              >
                                {cancellingId === b.bookingId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1.5" /> Cancel Reservation
                                  </>
                                )}
                              </Button>
                            )}

                            <a
                              href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESSES.bookingEscrow}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Button
                                variant="hero"
                                size="sm"
                                className="rounded-full border-white/20 text-slate-300 hover:text-white transition-all text-xs px-4 py-2"
                              >
                                Explorer <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
