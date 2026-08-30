import { useNavigate } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/button";
import { CONTACT } from "@/data/whiterock";
import { Utensils, Wine, Cigarette, Phone, Mail, ExternalLink } from "lucide-react";
import { useLang } from "@/lib/i18n";

const MENU_CATEGORIES = [
  {
    id: "food",
    name: "FOOD MENU",
    subtitle: "Local & International Culinary Masterpieces",
    desc: "Meticulously crafted by our talented Chefs using only the freshest, locally and ethically sourced ingredients.",
    icon: Utensils,
    image: "/assets/whiterock/menu-food.jpg",
    link: "https://whiterockbali.com/foodmenu/",
  },
  {
    id: "drinks",
    name: "DRINKS MENU",
    subtitle: "Balinese Botanical Cocktails & Signature Mixology",
    desc: "Take a journey through our menu. Explore Bartender favorites, signature cocktails, and premium botanical spirits.",
    icon: Wine,
    image: "/assets/whiterock/menu-cocktail.jpg",
    link: "https://whiterockbali.com/beveragemenu/",
  },
  {
    id: "shisha",
    name: "SHISHA MENU",
    subtitle: "Golden Spritz Shisha & Artisanal Flavors",
    desc: "Savor premium artisanal shisha with breathtaking cliffside Melasti sunset views from our VIP lounges.",
    icon: Cigarette,
    image: "/assets/whiterock/menu-shisha.jpg",
    link: "https://drive.google.com/file/d/1JIbexloaQW6ibx9DqVvg7Y_2EF8pC42G/view?usp=drive_link",
  },
];

export default function Dining() {
  const { tf } = useLang();
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen">
      {/* 1:1 Page Hero Matching whiterockbali.com/menu/ with official gourmet burger photo */}
      <PageHero
        bgImage="/assets/whiterock/menu-hero-burger.jpg"
        eyebrow="MENU & DINING EXPERIENCE"
        title="DISCOVER GLOBAL CULINARY TREASURE"
        subtitle="Savor the flavors with our diverse menu of local and international cuisines at White Rock Beach Club ✨"
        height="tall"
      >
        {/* Top 3 Quick Links Bar - 100% Uniform Luxury Gold Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
          <a href="https://whiterockbali.com/foodmenu/" target="_blank" rel="noreferrer">
            <Button variant="luxury" size="md" className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all duration-300">
              <Utensils className="h-4 w-4 mr-2" /> FOOD MENU <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-75" />
            </Button>
          </a>
          <a href="https://whiterockbali.com/beveragemenu/" target="_blank" rel="noreferrer">
            <Button variant="luxury" size="md" className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all duration-300">
              <Wine className="h-4 w-4 mr-2" /> DRINKS MENU <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-75" />
            </Button>
          </a>
          <a href="https://drive.google.com/file/d/1JIbexloaQW6ibx9DqVvg7Y_2EF8pC42G/view?usp=drive_link" target="_blank" rel="noreferrer">
            <Button variant="luxury" size="md" className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all duration-300">
              <Cigarette className="h-4 w-4 mr-2" /> SHISHA MENU <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-75" />
            </Button>
          </a>
        </div>
      </PageHero>

      {/* Clean 3 Menu Cards Grid */}
      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {MENU_CATEGORIES.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.id} delay={i * 80}>
                  <a
                    id={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="glow-card glass rounded-3xl overflow-hidden group cursor-pointer border border-white/10 hover:border-amber-400/40 transition-all duration-500 flex flex-col justify-between h-[440px]"
                  >
                    {/* Real Photography Image Container */}
                    <div className="relative h-60 overflow-hidden rounded-t-3xl transform-gpu">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out will-change-transform transform-gpu"
                        style={{ backfaceVisibility: "hidden" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      {/* Subpixel anti-aliasing seam patch */}
                      <div className="absolute -bottom-1 inset-x-0 h-2 bg-slate-950 z-10 pointer-events-none" />

                      {/* Icon Badge */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black p-2.5 rounded-full shadow-lg z-20">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 -mt-px relative z-20 bg-slate-950 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-cinzel text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                          {item.name}
                        </h3>
                        <div className="text-amber-400/90 text-xs font-semibold mt-1">
                          {item.subtitle}
                        </div>
                        <p className="text-xs text-slate-400 font-light mt-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* Card Action Hint */}
                      <div className="pt-4 border-t border-white/10 mt-auto flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider group-hover:text-amber-200 transition-colors">
                        <span>VIEW PDF MENU</span>
                        <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </a>
                </Reveal>
              );
            })}
          </div>

          {/* Reservation by Phone & Email Strip */}
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
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">RESERVATION BY PHONE</div>
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
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">RESERVATION BY EMAIL</div>
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
