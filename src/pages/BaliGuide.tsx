import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { BALI_GUIDE } from "@/data/whiterock";
import { Compass } from "lucide-react";

export default function BaliGuide() {
  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        eyebrow="Bali Guide"
        title="Bali Guide"
        subtitle="Curated reads on culture, nature, food, and adventure across the Island of the Gods."
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading eyebrow="Explore" title="Stories & Guides" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BALI_GUIDE.map((g, i) => (
              <Reveal key={g} delay={(i % 6) * 50}>
                <div className="glow-card glass rounded-2xl p-6 h-full flex items-start gap-3">
                  <Compass className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
                  <span className="text-white font-medium leading-snug">{g}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
