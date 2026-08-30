import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryHeader } from "@/components/ui/CategoryHeader";
import { PageHero } from "@/components/layout/PageHero";
import { useLang } from "@/lib/i18n";
import { RECURRING_EVENTS, ASSETS } from "@/data/whiterock";
import { Calendar, MapPin, Music, ArrowRight, Ticket } from "lucide-react";

export default function Events() {
  const { tf } = useLang();
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        bgImage={ASSETS.partyBed}
        eyebrow={tf({ id: "DJ & Events", en: "DJ & Events", ru: "DJ и мероприятия", ko: "DJ & 이벤트" })}
        title={tf({ id: "Nights to Remember", en: "Nights to Remember", ru: "Ночи, которые стоит помнить", ko: "잊지 못할 밤들" })}
        subtitle={tf({
          id: "Dari sunset sessions setiap hari sampai NYE gala tahunan — White Rock adalah panggungnya.",
          en: "From daily sunset sessions to the annual NYE gala — White Rock is the stage.",
          ru: "От ежедневных sunset-сессий до ежегодного NYE-гала — White Rock это сцена.",
          ko: "매일의 석양 세션부터 연례 NYE 갈라까지 — White Rock이 무대입니다.",
        })}
      />

      <section className="py-20 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <SectionHeading
            align="left"
            eyebrow={tf({ id: "Lineup", en: "Lineup", ru: "Лайн-ап", ko: "라인업" })}
            title={tf({ id: "Jadwal Pesta", en: "The Party Calendar", ru: "Календарь вечеринок", ko: "파티 일정" })}
          />
          <div className="grid md:grid-cols-2 gap-6">
            {RECURRING_EVENTS.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <Card className="glow-card glass rounded-3xl overflow-hidden h-full">
                  <CategoryHeader accent={e.accent} icon={<Music className="h-7 w-7" />} height="h-36" />
                  <CardContent className="p-6">
                    <h3 className="font-cinzel text-xl font-bold text-white mb-2">{tf(e.name)}</h3>
                    <p className="text-sm text-slate-300/80 font-light mb-4">{tf(e.desc)}</p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="h-3 w-3 text-amber-300" /> {tf({ id: "Melasti Beach", en: "Melasti Beach", ru: "Melasti Beach", ko: "Melasti Beach" })}</span>
                      <Button variant="ghost" size="sm" className="text-amber-300 p-0 ml-auto" onClick={() => navigate("/booking")}>
                        {tf({ id: "Detail", en: "Details", ru: "Подробнее", ko: "자세히" })} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* NYE spotlight */}
      <section className="py-16 px-5 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(190_95%_20%/0.25)] via-transparent to-[hsl(45_90%_30%/0.2)]" />
        <div className="relative container mx-auto max-w-5xl">
          <Reveal>
            <div className="glass-strong rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-amber-400/20">
              <div className="flex-1">
                <Calendar className="h-10 w-10 text-amber-300 mb-4" />
                <h3 className="font-cinzel text-3xl md:text-4xl font-bold text-white text-glow-gold mb-2">{tf({ id: "NYE 2026", en: "NYE 2026", ru: "NYE 2026", ko: "NYE 2026" })}</h3>
                <p className="text-slate-300/80 font-light">{tf({ id: "Tiket early bird sudah dibuka. Lineup DJ internasional + fireworks di atas tebing.", en: "Early-bird tickets are open. International DJ lineup + cliffside fireworks.", ru: "Открыты билеты по ранней птице. Международный лайн-ап DJ + фейерверки на скалах.", ko: "얼리버드 티켓 오픈. 해외 DJ 라인업 + 절벽 위 불꽃놀이." })}</p>
              </div>
              <Button variant="luxury" size="lg" onClick={() => navigate("/nye")}>
                <Ticket className="h-5 w-5" /> {tf({ id: "Beli Tiket", en: "Get Tickets", ru: "Купить билеты", ko: "티켓 구매" })}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
