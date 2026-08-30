import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
import { useLang } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { Users, Heart, Briefcase, ArrowRight, MapPin } from "lucide-react";

export default function Careers() {
  const { tf } = useLang();
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow={tf({ id: "Careers", en: "Careers", ru: "Карьера", ko: "채용" })}
        title={tf({ id: "Bergabung dengan Kami", en: "Join the Crew", ru: "Присоединяйтесь к нам", ko: "크루에 합류하세요" })}
        subtitle={tf({
          id: "Kami membangun pengalaman pantai paling magis di Bali. Kalau kamu pencinta hospitality & inovasi, mari gabung.",
          en: "We're building Bali's most magical beach experience. If you love hospitality & innovation, come join us.",
          ru: "Мы создаём самый волшебный пляжный опыт на Bali. Если вы любите гостеприимство и инновации, присоединяйтесь.",
          ko: "우리는 Bali에서 가장 마법 같은 해변 경험을 만들고 있습니다. 호스피탈리티와 혁신을 사랑한다면 함께하세요.",
        })}
      />

      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
            {[
              { icon: Users, t: { id: "Tim di Melasti", en: "Crew at Melasti", ru: "Команда в Melasti", ko: "Melasti 크루" } },
              { icon: Heart, t: { id: "Budaya Inklusif", en: "Inclusive Culture", ru: "Инклюзивная культура", ko: "포용적인 문화" } },
              { icon: Briefcase, t: { id: "Growth Path", en: "Growth Path", ru: "Путь развития", ko: "성장 경로" } },
            ].map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={i} delay={i * 60}>
                  <div className="glow-card glass rounded-2xl p-5 text-center">
                    <Icon className="h-7 w-7 text-amber-300 mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">{tf(v.t)}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <SectionHeading eyebrow={tf({ id: "Open Roles", en: "Open Roles", ru: "Открытые вакансии", ko: "열린 채용" })} title={tf({ id: "Posisi Terbuka", en: "Open Positions", ru: "Доступные позиции", ko: "열린 포지션" })} />
          <Card className="glow-card glass rounded-3xl max-w-2xl mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <MapPin className="h-10 w-10 text-amber-300 mx-auto" />
              <h3 className="font-cinzel text-2xl font-bold text-white">{tf({ id: "White Rock Beach Club, Melasti", en: "White Rock Beach Club, Melasti", ru: "White Rock Beach Club, Melasti", ko: "White Rock Beach Club, Melasti" })}</h3>
              <p className="text-slate-400 font-light">
                {tf({ id: "Lowongan terbaru kami dipublikasikan di kanal resmi. Kirim CV & motivasi kamu, tim HR kami akan hubungi untuk role yang cocok.", en: "Our latest openings are shared on our official channels. Send your CV & cover note and our team will reach out about the right fit.", ru: "Наши последние вакансии публикуются на официальных каналах. Пришлите резюме и сопроводительное письмо — наша команда свяжется по подходящей роли.", ko: "최신 채용 공고는 공식 채널에서 확인하세요. 이력서와 자기소개서를 보내주시면 적합한 포지션에 대해 팀이 연락드립니다." })}
              </p>
              <Button variant="luxury" size="lg" onClick={() => navigate("/contact")} className="flex items-center gap-2 mx-auto mt-2">
                {tf({ id: "Kirim Lamaran", en: "Send Application", ru: "Отправить отклик", ko: "지원 보내기" })} <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
