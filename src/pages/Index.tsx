import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BgVideo } from "@/components/layout/BgVideo";
import { useLang } from "@/lib/i18n";
import {
  ASSETS,
  STATS,
  DAYBEDS,
  EXPERIENCES,
  MENU_CATEGORIES,
  CONTACT,
  SITE_COPY,
} from "@/data/whiterock";
import {
  Waves,
  Sparkles,
  ArrowRight,
  MessageCircle,
  MapPin,
  Volume2,
} from "lucide-react";

export default function Index() {
  const { tf, formatPrice } = useLang();
  const navigate = useNavigate();
  const openAva = () => {
    const ev = new CustomEvent("open-ava");
    window.dispatchEvent(ev);
  };

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      {/* ---------- HERO ---------- */}
      <section className="relative min-h-screen flex items-center overflow-hidden ambient">
        <BgVideo
          className="opacity-75"
          poster={ASSETS.aerial}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222_47%_9%/0.4)] via-transparent to-[hsl(222_47%_9%/0.5)]" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_35%,transparent_60%,rgba(0,0,0,0.2))]" />

        <div className="relative z-10 container mx-auto px-5 md:px-8 text-center">
          <Reveal>
            <span className="inline-block text-xs md:text-sm font-semibold uppercase tracking-[0.4em] text-amber-300/90 mb-6">
              {tf(SITE_COPY.locationTag)}
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-cinzel font-bold tracking-wide leading-[0.95] text-slate-50 text-glow-gold text-5xl sm:text-7xl md:text-8xl">
              {tf(SITE_COPY.heroTitleA)}
              <br />
              <span className="text-gold">{tf(SITE_COPY.heroTitleB)}</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-7 text-base md:text-xl font-light text-slate-200/85 max-w-2xl mx-auto">
              {tf(SITE_COPY.heroSubtitle)}
            </p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="luxury" size="xl" onClick={() => navigate("/booking")} className="group">
                {tf(SITE_COPY.reserveDaybed)}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="hero" size="xl" onClick={() => navigate("/experiences")}>
                {tf(SITE_COPY.exploreExperiences)}
              </Button>
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[hsl(222_47%_9%)] to-transparent pointer-events-none z-10" />

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-slate-300/60">
          <span className="text-[10px] uppercase tracking-[0.3em]">{tf(SITE_COPY.scroll)}</span>
          <div className="h-12 w-px bg-gradient-to-b from-amber-300/60 to-transparent" />
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="py-14 border-b border-white/10 bg-[hsl(222_47%_9%)] relative z-20">
        <div className="container mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="font-cinzel text-3xl md:text-4xl font-bold text-gold">
                {s.text ? s.text : <CountUp end={s.value} suffix={s.suffix} decimals={s.value % 1 !== 0 ? 1 : 0} />}
              </div>
              <div className="text-xs md:text-sm text-slate-400 mt-1">{tf(s.label)}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- 3 FEATURED HIGHLIGHT CARDS ---------- */}
      <section className="py-12 md:py-14 px-5 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: { id: "BARS & DINING", en: "BARS & DINING" },
                button: { id: "VIEW OUR BARS & DINING", en: "VIEW OUR BARS & DINING" },
                link: "/dining",
                image: ASSETS.lagoonBed,
                desc: { id: "Kuliner lokal & internasional dengan mixology cocktail khas tepi tebing Melasti.", en: "Local & international cuisines with signature cliffside cocktails." }
              },
              {
                title: { id: "MULTIFUNCTION HALL", en: "MULTIFUNCTION HALL" },
                button: { id: "VIEW MORE", en: "VIEW MORE" },
                link: "/weddings-mice",
                image: ASSETS.partyExecSuites,
                desc: { id: "Ruang serbaguna megah & private suites untuk event, gathering & pesta eksklusif.", en: "Grand multifunctional hall & private suites for exclusive gatherings." }
              },
              {
                title: { id: "WEDDING VENUE", en: "WEDDING VENUE" },
                button: { id: "PLAN YOUR WEDDING", en: "PLAN YOUR WEDDING" },
                link: "/weddings-mice",
                image: ASSETS.aerial,
                desc: { id: "Lokasi pernikahan mewah berlatar samudra Hindia di atas tebing Melasti.", en: "Luxe cliffside wedding venue overlooking the Indian Ocean." }
              },
            ].map((card, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="glow-card glass rounded-3xl overflow-hidden group relative flex flex-col justify-end h-96 border border-white/10 hover:border-amber-400/40 transition-all duration-500">
                  <img src={card.image} alt={tf(card.title)} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />
                  <div className="relative z-10 p-8 flex flex-col justify-end">
                    <h3 className="font-cinzel text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{tf(card.title)}</h3>
                    <p className="text-xs text-slate-300 font-light mb-6 leading-relaxed">{tf(card.desc)}</p>
                    <div>
                      <Button variant="luxury" onClick={() => navigate(card.link)} className="group/btn rounded-full text-xs font-bold uppercase tracking-wider py-2.5 px-6">
                        {tf(card.button)} <ArrowRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- DAYBEDS SHOWCASE ---------- */}
      <section id="daybeds" className="py-12 md:py-14 px-5 md:px-8 border-t border-white/5">
        <div className="container mx-auto max-w-7xl">
          <SectionHeading
            eyebrow={tf(SITE_COPY.daybedEyebrow)}
            title={tf(SITE_COPY.daybedTitle)}
            subtitle={tf(SITE_COPY.daybedSubtitle)}
          />

          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-7 mt-12">
            {DAYBEDS.map((d, i) => (
              <Reveal key={d.id} delay={i * 100} className="h-full">
                <Card onClick={() => navigate("/booking")} className="glow-card cursor-pointer overflow-hidden bg-slate-950 rounded-3xl h-full flex flex-col justify-between border border-white/10 hover:border-amber-400/40 hover:shadow-[0_12px_35px_rgba(245,158,11,0.15)] transition-all duration-500 group relative">
                  <div className={`relative h-44 bg-slate-950 overflow-hidden`}>
                    <img
                      src={d.image}
                      alt={tf(d.name)}
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700 ease-out [backface-visibility:hidden] [transform:translateZ(0)]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30 pointer-events-none" />
                    
                    {/* Seam patch: overlaps bottom edge to prevent subpixel GPU render lines */}
                    <div className="absolute -bottom-1 inset-x-0 h-2 bg-slate-950 z-10 pointer-events-none" />

                    {d.tag && (
                      <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md tracking-wider uppercase z-20">
                        {d.tag}
                      </div>
                    )}
                    <div className="absolute top-2.5 right-2.5 glass-strong rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-300/30 shadow-md z-20">
                      {d.capacity}
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col justify-between flex-1 bg-slate-950 relative z-20 -mt-px">
                    <div>
                      <h3 className="font-cinzel text-lg font-bold text-white mb-1.5 leading-snug group-hover:text-amber-300 transition-colors">{tf(d.name)}</h3>
                      <p className="text-xs text-slate-400 font-light mb-3 leading-relaxed">
                        {tf(d.desc ?? SITE_COPY.daybedSpotNote)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                      <span className="text-xs text-slate-400">
                        {tf(SITE_COPY.minSpend)}:
                      </span>
                      <span className="text-amber-300 font-bold text-xs">
                        {formatPrice(d.minSpendIdr)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- BOOK & SAVE NOW ---------- */}
      <section className="py-12 md:py-14 px-5 md:px-8 border-t border-white/10 bg-[hsl(222_47%_8%)]">
        <div className="container mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.4em] text-amber-300 font-semibold mb-3 block">
              EXCLUSIVE BENEFITS
            </span>
            <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-white text-glow-gold mb-5">
              BOOK & SAVE NOW
            </h2>
            <p className="text-sm md:text-lg text-slate-300/90 font-light leading-relaxed max-w-2xl mx-auto mb-8">
              {tf({
                id: "Amankan daybed & suite impianmu dan nikmati berbagai benefit eksklusif: minimum spend makanan & minuman, welcome drinks, handuk, serta amenities.",
                en: "Secure your daybed and suite and indulge in exclusive benefits: minimum spend on food & beverages, welcome drinks, towels, and amenities."
              })}
            </p>
            <Button variant="luxury" size="xl" onClick={() => navigate("/booking")} className="group rounded-full px-10 font-bold uppercase tracking-wider text-sm">
              CHOOSE DAYBED & SUITES <ArrowRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
