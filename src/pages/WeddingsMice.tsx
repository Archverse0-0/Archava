import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/Reveal";
import { ASSETS } from "@/data/whiterock";
import { ArrowRight, Sparkles, Building2, Heart, Users, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const SPLIT_PANELS = [
  {
    id: "mice",
    title: "MICE",
    category: "BUSINESS & SUMMITS",
    description:
      "Discover the perfect setting for your next formal or informal business meeting at our exclusive meeting space.",
    image: "/assets/whiterock/mice-hall.jpg",
    link: "/mice",
    icon: Building2,
    badge: "Executive Summits",
  },
  {
    id: "social",
    title: "SOCIAL EVENT",
    category: "GATHERINGS & PARTIES",
    description:
      "Discover the ultimate setting for your next social event in Bali at White Rock Beach Club.",
    image: "/assets/whiterock/mice-gathering.jpg",
    link: "/contact",
    icon: Users,
    badge: "Private Celebrations",
  },
  {
    id: "wedding",
    title: "WEDDING",
    category: "OCEANFRONT SANCTUARY",
    description:
      "Wedding by the sea where the natural beauty of the sea meets the elegance of your dreams.",
    image: "/assets/whiterock/wedding-altar.jpg",
    link: "/wedding",
    icon: Heart,
    badge: "Cliffside Weddings",
  },
];

export default function WeddingsMice() {
  const navigate = useNavigate();
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);

  return (
    <div className="bg-slate-950 min-h-screen relative overflow-hidden flex flex-col pt-20">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 ambient opacity-40 pointer-events-none" />

      {/* Main 3-Split Interactive Panels Container (Full Screen 1:1) */}
      <div className="relative z-20 flex-1 w-full flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {SPLIT_PANELS.map((panel) => {
          const isHovered = hoveredPanel === panel.id;
          const Icon = panel.icon;

          return (
            <div
              key={panel.id}
              onMouseEnter={() => setHoveredPanel(panel.id)}
              onMouseLeave={() => setHoveredPanel(null)}
              onClick={() => navigate(panel.link)}
              className={cn(
                "relative flex-1 group cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10 last:border-none transition-all duration-700 ease-out flex flex-col justify-between p-8 md:p-12",
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
                      ? "bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30 opacity-90"
                      : "bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40 opacity-95"
                  )}
                />
              </div>

              {/* Glowing Panel Border Accent */}
              <div
                className={cn(
                  "absolute inset-0 border-2 transition-colors duration-500 pointer-events-none",
                  isHovered ? "border-amber-400/50 shadow-[inset_0_0_50px_rgba(252,211,77,0.15)]" : "border-transparent"
                )}
              />

              {/* Center & Bottom Panel Content */}
              <div className="relative z-20 mt-auto pt-16 space-y-4">
                <span className="text-xs font-semibold tracking-[0.3em] uppercase text-amber-300 block">
                  {panel.category}
                </span>

                <h2 className="font-cinzel text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md group-hover:text-amber-200 transition-colors duration-300">
                  {panel.title}
                </h2>

                <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-md line-clamp-3">
                  {panel.description}
                </p>

                <div className="pt-4">
                  <button
                    className={cn(
                      "px-8 py-3.5 rounded-none text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 border",
                      isHovered
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(252,211,77,0.4)] scale-105"
                        : "bg-transparent text-white border-white/40 hover:border-white"
                    )}
                  >
                    <span>DISCOVER MORE</span>
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
