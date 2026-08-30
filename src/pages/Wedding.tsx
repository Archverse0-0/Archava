import { useNavigate } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/data/whiterock";
import {
  Heart,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  Sun,
  Camera,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

const WEDDING_HIGHLIGHTS = [
  {
    title: "OCEANFRONT ALTAR & CEREMONY",
    tag: "Cliffside Altar",
    desc: "Exchange vows overlooking the Indian Ocean on Melasti's majestic white limestone cliffside.",
    image: "/assets/whiterock/wedding-altar.jpg",
  },
  {
    title: "SUNSET RECEPTION & GALA DINNER",
    tag: "Romantic Sunset",
    desc: "Celebrate under the stars with bespoke fine dining, champagne towers, & fireworks by the sea.",
    image: "/assets/whiterock/wedding-reception.jpg",
  },
  {
    title: "BRIDAL SUITE & VIP PREPARATION",
    tag: "Luxury Suite",
    desc: "Private air-conditioned bridal preparation suites with direct ocean vistas & dedicated butler service.",
    image: "/assets/whiterock/wedding-setup.jpg",
  },
];

export default function Wedding() {
  const { tf } = useLang();
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen">
      {/* 1:1 Page Hero for Wedding */}
      <PageHero
        bgImage="/assets/whiterock/wedding-altar.jpg"
        eyebrow="CLIFFSIDE WEDDING SANCTUARY"
        title="WHERE FOREVER BEGINS AT MELASTI"
        subtitle="Craft your dream oceanfront wedding amidst monumental cliffs and legendary Bali sunsets."
        height="tall"
      >
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
          <Button
            variant="hero"
            size="md"
            onClick={() => navigate("/weddings-mice")}
            className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300"
          >
            OVERVIEW & ALL VENUES
          </Button>
          <Button
            variant="luxury"
            size="md"
            onClick={() => navigate("/wedding")}
            className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Heart className="h-4 w-4 mr-2 text-rose-600 fill-rose-600" /> WEDDINGS SANCTUARY
          </Button>
          <Button
            variant="hero"
            size="md"
            onClick={() => navigate("/mice")}
            className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300"
          >
            CORPORATE MICE
          </Button>
        </div>
      </PageHero>

      {/* Wedding Showcase Section */}
      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold block mb-2">
              UNFORGETTABLE CELEBRATIONS
            </span>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-white">
              BALI'S MOST ICONIC CLIFFSIDE ALTAR
            </h2>
            <p className="text-slate-400 text-sm font-light mt-3">
              Immerse your guests in pure luxury with tailored wedding concepts, oceanfront dining, & world-class hospitality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {WEDDING_HIGHLIGHTS.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="glow-card glass rounded-3xl overflow-hidden group cursor-pointer border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between h-[450px]">
                  <div className="relative h-60 overflow-hidden rounded-t-3xl transform-gpu">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out will-change-transform transform-gpu"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg z-20 uppercase tracking-wider">
                      {item.tag}
                    </div>
                  </div>

                  <div className="p-6 -mt-px relative z-20 bg-slate-950 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-light mt-2.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div
                      onClick={() => navigate("/contact")}
                      className="pt-4 border-t border-white/10 mt-auto flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider group-hover:text-amber-200 transition-colors"
                    >
                      <span>INQUIRE WEDDING PACKAGE</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Reservation Contact Strip */}
          <Reveal className="mt-16">
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <a
                href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="glow-card glass rounded-2xl p-6 flex items-center gap-4 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="h-12 w-12 rounded-full glass-strong grid place-items-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">WEDDING PLANNER INQUIRY</div>
                  <div className="text-white font-bold text-base mt-0.5 group-hover:text-amber-300 transition-colors">
                    {CONTACT.whatsapp}
                  </div>
                </div>
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="glow-card glass rounded-2xl p-6 flex items-center gap-4 border border-white/10 hover:border-amber-400/40 transition-all group"
              >
                <div className="h-12 w-12 rounded-full glass-strong grid place-items-center text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">EMAIL WEDDING TEAM</div>
                  <div className="text-white font-bold text-base mt-0.5 group-hover:text-amber-300 transition-colors">
                    {CONTACT.email}
                  </div>
                </div>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
