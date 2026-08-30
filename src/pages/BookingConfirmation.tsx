import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Phone, Clock, ExternalLink, ShieldCheck, QrCode, Printer } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { CONTACT } from "@/data/whiterock";
import { QRCodeSVG } from "qrcode.react";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tf } = useLang();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const bookingId = searchParams.get("bookingId") || "1";
  const txHash = searchParams.get("tx") || "";
  const roomType = searchParams.get("room") || "Lagoon Bed";
  const checkInRaw = searchParams.get("checkin");
  const checkIn = checkInRaw
    ? new Date(checkInRaw + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  const isWeb3 = !!txHash;

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen text-slate-100 pb-20">
      {/* Luxury Hero Section */}
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow={isWeb3 ? "ON-CHAIN SMART CONTRACT CONFIRMED" : "VIP RESERVATION CONFIRMED"}
        title={isWeb3 ? "RESERVATION RECORDED ON BLOCKCHAIN!" : "VIP PASS CONFIRMED!"}
        subtitle={
          isWeb3
            ? "Your escrow deposit has been safely locked in the Monad Testnet smart contract with a 24-hour full refund policy."
            : "Thank you for choosing White Rock Beach Club Bali. Your luxury daybed reservation is ready."
        }
        height="tall"
      >
        <div className="mt-6 flex justify-center">
          <div className="h-16 w-16 rounded-full gold-gradient flex items-center justify-center shadow-[0_0_30px_rgba(252,211,77,0.5)]">
            <CheckCircle className="h-9 w-9 text-slate-950 stroke-[2.5]" />
          </div>
        </div>
      </PageHero>

      {/* Main Reservation Confirmation Content */}
      <main className="container mx-auto px-5 md:px-8 -mt-10 relative z-20 max-w-5xl">
        <div className="space-y-8">
          {/* Row 1: Reservation Details & On-Chain Status */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1: Reservation Details */}
            <Reveal delay={0}>
              <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 md:p-8 border border-amber-300/30 space-y-5 h-full">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-cinzel text-xl font-bold text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-300" />
                    RESERVATION DETAILS
                  </h3>
                  {isWeb3 && (
                    <span className="font-cinzel text-lg font-black text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                      #{bookingId}
                    </span>
                  )}
                </div>

                <div className="space-y-4 text-sm font-light">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                      VIP Area / Daybed Type
                    </span>
                    <p className="font-cinzel text-xl font-bold text-white tracking-wide">
                      {roomType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                        Visit Date
                      </span>
                      <p className="font-semibold text-white text-base">{checkIn}</p>
                    </div>

                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                        Escrow Status
                      </span>
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
                        {isWeb3 ? "ESCROWED" : "CONFIRMED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Card 2: On-Chain Details */}
            <Reveal delay={100}>
              <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 md:p-8 border border-amber-300/30 space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                    <h3 className="font-cinzel text-xl font-bold text-amber-300 flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-amber-300" />
                      ON-CHAIN PROOF
                    </h3>
                    <span className="text-xs font-mono text-amber-300 font-semibold px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30">
                      Monad Testnet
                    </span>
                  </div>

                  <div className="space-y-3.5 text-sm">
                    {txHash && (
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                          Transaction Hash
                        </span>
                        <a
                          href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-mono text-xs break-all group"
                        >
                          <span>{txHash.slice(0, 16)}...{txHash.slice(-10)}</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 shrink-0" />
                        </a>
                      </div>
                    )}

                    <div>
                      <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                        Escrow Smart Contract
                      </span>
                      <a
                        href={`https://testnet.monadexplorer.com/address/${CONTACT.bookingContract || "0x7FB626bcF2722f45e25EEd445385e2Da34B1077e"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 text-xs font-mono group"
                      >
                        <span>BookingEscrow (0x7FB6...077e)</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 mt-4">
                  <p className="text-amber-300 text-xs font-medium leading-relaxed flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
                    Deposit locked in escrow. 100% refund available up to 24h prior to visit.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Row 2: QR Code & Arrival Info */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* QR Code Container */}
            <Reveal delay={200}>
              <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 border border-amber-300/30 flex flex-col items-center justify-center text-center space-y-4 h-full">
                <div className="flex items-center gap-2 text-amber-300 font-cinzel text-base font-bold">
                  <QrCode className="h-5 w-5" />
                  CHECK-IN QR CODE
                </div>
                <p className="text-xs text-slate-400 font-light">
                  Show this QR code to staff upon arrival for instant check-in.
                </p>
                <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-amber-400/40">
                  <QRCodeSVG
                    value={JSON.stringify({
                      bookingId: Number(bookingId),
                      visitDate: checkIn,
                      roomType: roomType,
                    })}
                    size={160}
                    level="M"
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono font-semibold">
                  Booking #{bookingId}
                </p>
              </div>
            </Reveal>

            {/* VIP Arrival Guidelines */}
            <Reveal delay={300} className="md:col-span-2">
              <div className="glow-card glass bg-slate-950/80 rounded-3xl p-6 md:p-8 border border-white/10 space-y-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-cinzel text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-300" />
                    VIP ARRIVAL GUIDELINES
                  </h3>
                  <p className="text-slate-300 text-sm font-light leading-relaxed mb-6">
                    Present your Booking ID or QR code at the White Rock main VIP entrance upon arrival at Melasti Beach. Venue staff will verify your reservation on-chain and release your escrow deposit to the beach club treasury.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h4 className="font-cinzel text-sm font-semibold text-amber-300 uppercase tracking-wider">
                    VENUE CONTACT DETAILS
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300 font-light">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Melasti Beach, Ungasan Uluwatu Bali</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                      <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-amber-300">
                        {CONTACT.whatsapp}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Action Button Bar */}
          <Reveal delay={400}>
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="luxury"
                size="lg"
                onClick={() => navigate("/")}
                className="rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                RETURN TO HOMEPAGE
              </Button>

              <Button
                variant="hero"
                size="lg"
                onClick={() => window.print()}
                className="rounded-full border-white/30 text-slate-200 hover:text-white transition-all text-xs font-bold uppercase tracking-wider px-8 py-4"
              >
                <Printer className="h-4 w-4 mr-2 text-amber-300" /> PRINT RECEIPT
              </Button>
            </div>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
