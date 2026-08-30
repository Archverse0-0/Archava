import { PageHero } from "@/components/layout/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { SPECIAL_OFFERS } from "@/data/whiterock";
import { Ticket } from "lucide-react";

export default function SpecialOffers() {
  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        eyebrow="Special Offers"
        title="Special Offers"
        subtitle="Exclusive deals across daybeds, dining, spa, and unforgettable experiences at White Rock Beach Club."
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto">
          <SectionHeading eyebrow="Promos" title="All Offers" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPECIAL_OFFERS.map((offer, i) => (
              <Reveal key={offer} delay={(i % 6) * 50}>
                <div className="glow-card glass rounded-2xl p-6 h-full flex flex-col">
                  <Ticket className="h-6 w-6 text-amber-300 mb-3" />
                  <h3 className="text-white font-medium leading-snug">{offer}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
