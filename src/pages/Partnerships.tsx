import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { PARTNERS } from "@/data/whiterock";
import { Handshake } from "lucide-react";

export default function Partnerships() {
  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        eyebrow="Partnerships"
        title="Partnerships"
        subtitle="White Rock Beach Club is proud to partner with leading banks, airlines, and brands across the region."
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <SectionHeading eyebrow="Our Partners" title="Trusted Together" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {PARTNERS.map((p, i) => (
              <Reveal key={p} delay={(i % 6) * 50}>
                <div className="glow-card glass rounded-2xl p-6 flex items-center gap-3">
                  <Handshake className="h-5 w-5 text-amber-300 shrink-0" />
                  <span className="text-white font-medium">{p}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
