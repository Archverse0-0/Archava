import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePublicClient, useReadContract } from "wagmi";
import { formatUnits, parseEventLogs, zeroAddress } from "viem";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT } from "@/data/whiterock";
import { BOOKING_ESCROW_ABI, CONTRACT_ADDRESSES, DAYBED_TYPES } from "@/web3/contracts";

type BookingTuple = readonly [
  bigint,
  `0x${string}`,
  number,
  bigint,
  bigint,
  `0x${string}`,
  boolean,
  boolean,
  boolean,
];

const TX_RE = /^0x[0-9a-fA-F]{64}$/;

/** The `BookingCreated` fields that must agree with the stored booking record. */
type BookingEvent = {
  guest: `0x${string}`;
  daybedType: number;
  visitTimestamp: bigint;
  depositAmount: bigint;
  paymentToken: `0x${string}`;
};

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const publicClient = usePublicClient();

  const rawBookingId = searchParams.get("bookingId");
  const txHash = searchParams.get("tx") || "";
  const isWeb3 = Boolean(rawBookingId || txHash);
  const bookingId = rawBookingId && /^\d+$/.test(rawBookingId) ? BigInt(rawBookingId) : null;
  const validTxHash = TX_RE.test(txHash);

  const { data, isLoading: bookingLoading, isError: bookingReadError } = useReadContract({
    address: CONTRACT_ADDRESSES.bookingEscrow,
    abi: BOOKING_ESCROW_ABI,
    functionName: "bookings",
    args: bookingId !== null ? [bookingId] : undefined,
    query: { enabled: isWeb3 && bookingId !== null },
  });
  const chainBooking = data as BookingTuple | undefined;

  const [txVerified, setTxVerified] = useState<boolean | null>(isWeb3 ? null : false);
  const [eventFields, setEventFields] = useState<BookingEvent | null>(null);

  useEffect(() => {
    if (!isWeb3) return;
    if (!publicClient || bookingId === null || !validTxHash) {
      setTxVerified(false);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
        const logs = parseEventLogs({
          abi: BOOKING_ESCROW_ABI,
          eventName: "BookingCreated",
          logs: receipt.logs,
          strict: false,
        });
        const matched = logs.find(
          (log) =>
            log.address.toLowerCase() === CONTRACT_ADDRESSES.bookingEscrow.toLowerCase() &&
            log.args.bookingId === bookingId,
        );
        if (active) {
          setEventFields(
            matched
              ? {
                  guest: matched.args.guest as `0x${string}`,
                  daybedType: Number(matched.args.daybedType),
                  visitTimestamp: BigInt(matched.args.visitTimestamp as bigint),
                  depositAmount: BigInt(matched.args.depositAmount as bigint),
                  paymentToken: matched.args.paymentToken as `0x${string}`,
                }
              : null,
          );
          setTxVerified(receipt.status === "success" && Boolean(matched));
        }
      } catch {
        if (active) {
          setEventFields(null);
          setTxVerified(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [bookingId, isWeb3, publicClient, txHash, validTxHash]);

  // A matching bookingId in a receipt only proves *some* booking was created.
  // The stored `bookings(id)` record is the authoritative state, so every field
  // the event carries must also match it before the page calls the booking
  // verified — otherwise a receipt from a different booking (or a token swap
  // after deploy) would render as a confirmed reservation.
  const onChainRecordMatches = useMemo(() => {
    if (bookingId === null || !chainBooking || chainBooking[0] !== bookingId) return false;
    if (chainBooking[1] === zeroAddress) return false;
    if (!eventFields) return false;
    return (
      chainBooking[1].toLowerCase() === eventFields.guest.toLowerCase() &&
      Number(chainBooking[2]) === eventFields.daybedType &&
      BigInt(chainBooking[3]) === eventFields.visitTimestamp &&
      BigInt(chainBooking[4]) === eventFields.depositAmount &&
      chainBooking[5].toLowerCase() === eventFields.paymentToken.toLowerCase()
    );
  }, [bookingId, chainBooking, eventFields]);
  const verified = isWeb3 && txVerified === true && onChainRecordMatches && !bookingReadError;
  const verifying = isWeb3 && (txVerified === null || bookingLoading);

  const display = useMemo(() => {
    if (verified && chainBooking) {
      const daybed = DAYBED_TYPES[Number(chainBooking[2])];
      const date = new Date(Number(chainBooking[3]) * 1000);
      const isNative = chainBooking[5] === zeroAddress;
      return {
        roomType: daybed?.name || `Daybed ${chainBooking[2]}`,
        checkIn: date.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
        deposit: `${formatUnits(chainBooking[4], isNative ? 18 : 6)} ${isNative ? "MON" : "USDT"}`,
        guest: chainBooking[1],
        checkedIn: chainBooking[6],
        cancelled: chainBooking[7],
        settled: chainBooking[8],
      };
    }

    const checkInRaw = searchParams.get("checkin");
    const date = checkInRaw ? new Date(`${checkInRaw}T00:00:00`) : null;
    return {
      roomType: searchParams.get("room") || "Reservation Request",
      checkIn: date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
        : "Not verified",
      deposit: "Not verified",
      guest: null,
      checkedIn: false,
      cancelled: false,
      settled: false,
    };
  }, [chainBooking, searchParams, verified]);

  const statusLabel = display.cancelled
    ? "CANCELLED"
    : display.settled
      ? "SETTLED"
      : display.checkedIn
        ? "CHECKED IN"
        : verified
          ? "ESCROWED"
          : "UNVERIFIED";

  const heroEyebrow = verified
    ? "ON-CHAIN BOOKING VERIFIED"
    : verifying
      ? "VERIFYING MONAD TESTNET"
      : isWeb3
        ? "ON-CHAIN VERIFICATION FAILED"
        : "RESERVATION REQUEST SUMMARY";
  const heroTitle = verified
    ? "RESERVATION VERIFIED ON-CHAIN"
    : verifying
      ? "CHECKING TRANSACTION..."
      : isWeb3
        ? "BOOKING COULD NOT BE VERIFIED"
        : "REQUEST DETAILS GENERATED";

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen text-slate-100 pb-20">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow={heroEyebrow}
        title={heroTitle}
        subtitle={
          verified
            ? "The booking ID, transaction event, and escrow record all match the configured BookingEscrow contract."
            : verifying
              ? "Archava is reading the transaction receipt and booking record directly from Monad Testnet."
              : isWeb3
                ? "Do not use this page as proof of payment or check-in until the on-chain verification succeeds."
                : "This summary is not an on-chain booking. A Web3 booking is valid only after a confirmed transaction."
        }
        height="tall"
      >
        <div className="mt-6 flex justify-center">
          <div className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center shadow-[0_0_30px_rgba(252,211,77,0.5)]">
            {verifying ? (
              <Loader2 className="h-9 w-9 text-slate-950 animate-spin" />
            ) : verified ? (
              <CheckCircle className="h-9 w-9 text-slate-950 stroke-[2.5]" />
            ) : (
              <AlertTriangle className="h-9 w-9 text-slate-950 stroke-[2.5]" />
            )}
          </div>
        </div>
      </PageHero>

      <main className="container mx-auto px-5 md:px-8 -mt-10 relative z-20 max-w-5xl">
        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal delay={0}>
              <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 md:p-8 border border-amber-300/30 space-y-5 h-full">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-cinzel text-xl font-bold text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" /> RESERVATION DETAILS
                  </h3>
                  {bookingId !== null && <span className="font-mono text-amber-300">#{bookingId.toString()}</span>}
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">VIP Area / Daybed Type</span>
                    <p className="font-cinzel text-xl font-bold text-white">{display.roomType}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Visit Date</span>
                      <p className="font-semibold text-white">{display.checkIn}</p>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Status</span>
                      <p className="font-bold text-amber-300">{statusLabel}</p>
                    </div>
                  </div>
                  {verified && (
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">Escrow Deposit</span>
                      <p className="font-mono text-white">{display.deposit}</p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 md:p-8 border border-amber-300/30 space-y-5 h-full">
                <h3 className="font-cinzel text-xl font-bold text-amber-300 flex items-center gap-2 border-b border-white/10 pb-4">
                  <ExternalLink className="h-5 w-5" /> ON-CHAIN PROOF
                </h3>
                {txHash && TX_RE.test(txHash) && (
                  <a
                    href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-300 hover:text-amber-200 font-mono text-xs break-all"
                  >
                    {txHash.slice(0, 18)}...{txHash.slice(-10)} ↗
                  </a>
                )}
                <a
                  href={`https://testnet.monadexplorer.com/address/${CONTRACT_ADDRESSES.bookingEscrow}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-amber-300 hover:text-amber-200 font-mono text-xs"
                >
                  BookingEscrow {CONTRACT_ADDRESSES.bookingEscrow.slice(0, 10)}... ↗
                </a>
                <div className={`rounded-2xl border p-4 text-xs ${verified ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-rose-400/30 bg-rose-400/10 text-rose-300"}`}>
                  {verifying
                    ? "Verification in progress..."
                    : verified
                      ? "Verified: transaction emitted BookingCreated and the stored booking record matches."
                      : "Unverified: URL parameters alone are not accepted as proof of a booking."}
                </div>
              </div>
            </Reveal>
          </div>

          {verified && bookingId !== null && (
            <div className="grid md:grid-cols-3 gap-6">
              <Reveal delay={200}>
                <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 border border-amber-300/30 flex flex-col items-center text-center space-y-4 h-full">
                  <div className="flex items-center gap-2 text-amber-300 font-cinzel text-base font-bold">
                    <QrCode className="h-5 w-5" /> VERIFIED CHECK-IN QR
                  </div>
                  <div className="bg-white p-4 rounded-2xl">
                    <QRCodeSVG
                      value={JSON.stringify({
                        chainId: 10143,
                        contract: CONTRACT_ADDRESSES.bookingEscrow,
                        bookingId: bookingId.toString(),
                        txHash,
                      })}
                      size={160}
                      level="M"
                    />
                  </div>
                  <p className="text-xs text-slate-400 font-mono">Booking #{bookingId.toString()}</p>
                </div>
              </Reveal>

              <Reveal delay={300} className="md:col-span-2">
                <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 h-full">
                  <h3 className="font-cinzel text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-300" /> VIP ARRIVAL GUIDELINES
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Present this verified booking ID or QR code on arrival. Staff should still read the booking from the contract before executing check-in.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-400" /> Melasti Beach, Ungasan Uluwatu Bali
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-400" />
                      <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-amber-300">
                        {CONTACT.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          )}

          <Reveal delay={400}>
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <Button variant="luxury" size="lg" onClick={() => navigate("/")} className="rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider">
                RETURN TO HOMEPAGE
              </Button>
              <Button variant="hero" size="lg" onClick={() => window.print()} className="rounded-full text-xs font-bold uppercase tracking-wider px-8 py-4">
                <Printer className="h-4 w-4 mr-2 text-amber-300" /> PRINT SUMMARY
              </Button>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
