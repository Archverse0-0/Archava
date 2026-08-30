import { useNavigate } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { ENTERTAINMENT_DJS } from "@/data/whiterock";
import { Clock, ArrowRight } from "lucide-react";

export default function Entertainment() {
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen">
      <PageHero
        eyebrow="LIVE EVENT CALENDAR"
        title="ENTERTAINMENT & DJ LINEUP"
        subtitle="Doors open daily from 10:00 AM — Rolling up to good times at White Rock Beach Club ✨"
      />

      <section className="py-12 px-5 md:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* 8 Cards Grid (2x4 on Desktop, 0 Empty Slots) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {ENTERTAINMENT_DJS.map((event, i) => (
              <Reveal key={event.date + i} delay={i * 60}>
                <div
                  onClick={() => navigate("/booking")}
                  className="glow-card glass rounded-3xl overflow-hidden group cursor-pointer border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between h-[420px]"
                >
                  {/* Real Photography Image Container with scale zoom */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out transform-gpu"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Subpixel anti-aliasing seam patch */}
                    <div className="absolute -bottom-1 inset-x-0 h-2 bg-slate-950 z-10 pointer-events-none" />

                    {/* Date Badge */}
                    <div className="absolute top-3.5 left-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg z-20">
                      {event.date}
                    </div>

                    {/* Time Tag Badge */}
                    <div className="absolute top-3.5 right-3.5 glass-strong rounded-full px-2.5 py-1 text-[11px] font-semibold text-amber-300 border border-amber-300/30 flex items-center gap-1 shadow-md z-20">
                      <Clock className="h-3 w-3" /> {event.time}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 -mt-px relative z-20 bg-slate-950 flex flex-col justify-between flex-1">
                    <div>
                      <div className="text-amber-400/90 text-xs font-bold uppercase tracking-wider mb-1">
                        {event.title}
                      </div>
                      <h3 className="font-cinzel text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                        {event.djs}
                      </h3>
                      <p className="text-xs text-slate-400 font-light mt-2 italic leading-relaxed">
                        {event.tagline}
                      </p>
                    </div>

                    {/* Card Action Hint */}
                    <div className="pt-4 border-t border-white/10 mt-auto flex items-center justify-between text-xs font-bold text-amber-300 uppercase tracking-wider group-hover:text-amber-200 transition-colors">
                      <span>RSVP & BOOK DAYBED</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
