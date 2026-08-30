import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PAST_EVENTS } from "@/data/whiterock";
import { CalendarDays } from "lucide-react";

export default function PastEvents() {
  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        eyebrow="Past Events"
        title="Past Events"
        subtitle="A look back at the unforgettable moments, celebrations, and gatherings hosted at White Rock Beach Club."
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading eyebrow="Memories" title="Highlights" />
          <div className="space-y-4">
            {PAST_EVENTS.map((e, i) => (
              <Reveal key={e.title} delay={(i % 6) * 50}>
                <div className="glow-card glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 text-amber-300 text-xs mb-2">
                    <CalendarDays className="h-4 w-4" />
                    {e.date}
                  </div>
                  <h3 className="text-white font-semibold leading-snug mb-1.5">{e.title}</h3>
                  <p className="text-slate-400 font-light text-sm">{e.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
