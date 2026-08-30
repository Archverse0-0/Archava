import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, PartyPopper, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPERIENCE_PANELS = [
  {
    id: "after-party",
    title: "AFTER PARTY AT OUR SUITE",
    description: "Time To Invite Your Best Mates And Keep The Party Alive Till Dawn.",
    image: "/assets/whiterock/exp-afterparty.jpg",
    link: "/contact",
    tag: "Late Night VIP Suites",
    icon: PartyPopper,
  },
  {
    id: "private-party",
    title: "PRIVATE PARTY AT OUR SUITES",
    description: "White Rock Beach Club Offers A Setting That Will Leave Your Guests In Awe.",
    image: "/assets/whiterock/exp-privateparty.jpg",
    link: "/contact",
    tag: "Bespoke Celebrations",
    icon: Users,
  },
];

export default function Experiences() {
  const navigate = useNavigate();
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  return (
    <div className="bg-slate-950 min-h-screen relative overflow-hidden flex flex-col pt-20">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 ambient opacity-40 pointer-events-none" />

      {/* Main 2-Split Interactive Panels Container (Full Screen 1:1) */}
      <div className="relative z-20 flex-1 w-full flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {EXPERIENCE_PANELS.map((panel) => {
          const isHovered = hoveredPanel === panel.id;
          const Icon = panel.icon;

          return (
            <div
              key={panel.id}
              onMouseEnter={() => setHoveredPanel(panel.id)}
              onMouseLeave={() => setHoveredPanel(null)}
              onClick={() => navigate(panel.link)}
              className={cn(
                "relative flex-1 group cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 last:border-none transition-all duration-700 ease-out flex flex-col justify-center items-center text-center p-8 md:p-16",
                hoveredPanel && !isHovered ? "lg:flex-[0.85] opacity-80" : "lg:flex-[1.15] opacity-100"
              )}
            >
              {/* High-res Background Image with Hardware Acceleration */}
              <div className="absolute inset-0 overflow-hidden transform-gpu">
                <img
                  src={panel.image}
                  alt={panel.title}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-1000 ease-out will-change-transform transform-gpu",
                    isHovered ? "scale-110" : "scale-105"
                  )}
                  style={{ backfaceVisibility: "hidden" }}
                />
                {/* Multi-stage Glass Dark Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    isHovered
                      ? "bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20 opacity-85"
                      : "bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/30 opacity-95"
                  )}
                />
              </div>

              {/* Glowing Panel Border Accent */}
              <div
                className={cn(
                  "absolute inset-0 border-2 transition-colors duration-500 pointer-events-none",
                  isHovered ? "border-amber-400/50 shadow-[inset_0_0_60px_rgba(252,211,77,0.2)]" : "border-transparent"
                )}
              />

              {/* Center Panel Content */}
              <div className="relative z-20 max-w-xl space-y-5 my-auto">
                <h2 className="font-cinzel text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg group-hover:text-amber-200 transition-colors duration-300 uppercase leading-tight">
                  {panel.title}
                </h2>

                <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-md mx-auto">
                  {panel.description}
                </p>

                <div className="pt-6 flex justify-center">
                  <button
                    className={cn(
                      "px-9 py-3.5 rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 border",
                      isHovered
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(252,211,77,0.4)] scale-105"
                        : "bg-transparent text-white border-white/40 hover:border-white"
                    )}
                  >
                    <span>SEE DETAILS</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
