import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
import { useLang } from "@/lib/i18n";
import { FAQS } from "@/data/whiterock";
import { HelpCircle } from "lucide-react";

export default function Faq() {
  const { tf } = useLang();

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        height="short"
        eyebrow={tf({ id: "FAQ", en: "FAQ", ru: "FAQ", ko: "FAQ" })}
        title={tf({ id: "Pertanyaan Umum", en: "Frequently Asked", ru: "Часто задаваемые вопросы", ko: "자주 묻는 질문" })}
        subtitle={tf({
          id: "Yang sering ditanya tamu. Butuh lebih? Tanya Ava kapan aja.",
          en: "What guests ask most. Need more? Ask Ava anytime.",
          ru: "То, что гости спрашивают чаще всего. Нужно больше? Спросите Аву в любое время.",
          ko: "게스트들이 가장 자주 묻는 질문. 더 궁금하신가요? 언제든 에이바에게 물어보세요.",
        })}
      />
      <section className="py-20 px-5 md:px-8">
        <div className="container mx-auto max-w-3xl space-y-4">
          {FAQS.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <Card className="glow-card glass rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-white mb-2">{tf(f.q)}</h3>
                      <p className="text-sm text-slate-400 font-light leading-relaxed">{tf(f.a)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
