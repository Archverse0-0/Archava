import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { MEDIA_COVERAGE, PRESS_RELEASES } from "@/data/whiterock";
import { Newspaper, Megaphone } from "lucide-react";

export default function MediaPress() {
  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        eyebrow="Media & Press"
        title="Media & Press"
        subtitle="White Rock Beach Club in the press — features, spotlights, announcements, and stories from leading publications."
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading eyebrow="In The News" title="Media Coverage" />
          <div className="space-y-3">
            {MEDIA_COVERAGE.map((m, i) => (
              <Reveal key={m.title} delay={(i % 6) * 40}>
                <div className="glow-card glass rounded-2xl p-5 flex items-start gap-4">
                  <Newspaper className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-amber-300/80 text-xs font-semibold uppercase tracking-wider">{m.outlet}</div>
                    <h3 className="text-white font-medium leading-snug mt-0.5">{m.title}</h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16">
            <SectionHeading eyebrow="Announcements" title="Press Releases" />
            <div className="space-y-4">
              {PRESS_RELEASES.map((p, i) => (
                <Reveal key={p.title} delay={(i % 6) * 50}>
                  <div className="glow-card glass rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-amber-300 text-xs mb-2">
                      <Megaphone className="h-4 w-4" />
                      {p.date}
                    </div>
                    <h3 className="text-white font-semibold leading-snug mb-1.5">{p.title}</h3>
                    <p className="text-slate-400 font-light text-sm">{p.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
