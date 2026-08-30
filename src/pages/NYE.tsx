import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
import { useLang } from "@/lib/i18n";
import { NYE as NYE_DATA, ASSETS } from "@/data/whiterock";
import { Sparkles, Music, Wine, ArrowRight, CalendarDays, Clock } from "lucide-react";

export default function NYE() {
  const { tf, onRequest } = useLang();
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        bgImage={ASSETS.aerial}
        eyebrow={tf(NYE_DATA.title)}
        title={tf({ id: "31 Desember 2026", en: "December 31, 2026", ru: "31 декабря 2026", ko: "2026년 12월 31일" })}
        subtitle={tf({
          id: "Pesta pergantian tahun paling epik di Bali — di atas tebing Melasti dengan fireworks, DJ internasional, dan laut di bawah kaki kamu.",
          en: "Bali's most epic New Year's party — above the Melasti cliffs with fireworks, international DJs, and the ocean at your feet.",
          ru: "Самая эпичная новогодняя вечеринка на Bali — над скалами Melasti с фейерверком, международными DJ и океаном у ваших ног.",
          ko: "Bali에서 가장 화려한 새해 파티 — Melasti 절벽 위에서 불꽃놀이, 인터내셔널 DJ, 그리고 발아래 펼쳐진 바다와 함께.",
        })}
      />

      {/* Highlights */}
      <section className="py-16 px-5 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(190_95%_20%/0.2)] via-transparent to-[hsl(45_90%_30%/0.18)]" />
        <div className="relative container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Music, t: { id: "8 Set DJ", en: "8 DJ Sets", ru: "8 DJ-сетов", ko: "8 DJ 셋" } },
              { icon: Sparkles, t: { id: "Fireworks Pantai", en: "Beachside Fireworks", ru: "Фейерверк у пляжа", ko: "해변 불꽃놀이" } },
              { icon: Wine, t: { id: "Open Bar & Bottle", en: "Open Bar & Bottle", ru: "Открытый бар и бутылки", ko: "오픈 바 및 보틀" } },
              { icon: CalendarDays, t: { id: "Midnight Countdown", en: "Midnight Countdown", ru: "Обратный отсчёт", ko: "미드나잇 카운트다운" } },
            ].map((h, i) => {
              const Icon = h.icon;
              return (
                <Reveal key={i} delay={i * 60}>
                  <div className="glow-card glass rounded-2xl p-6 text-center h-full">
                    <Icon className="h-9 w-9 text-amber-300 mx-auto mb-3" />
                    <div className="font-semibold text-white text-sm">{tf(h.t)}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detail */}
      <section className="py-20 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={tf({ id: "Detil Event", en: "Event Details", ru: "Детали события", ko: "이벤트 상세" })}
            title={tf(NYE_DATA.title)}
          />
          <div className="grid md:grid-cols-2 gap-6">
            <Reveal>
              <Card className="glow-card glass rounded-3xl h-full">
                <CardContent className="p-7 space-y-4">
                  <div className="flex items-center gap-3 text-slate-200">
                    <Clock className="h-5 w-5 text-amber-300" />
                    <span className="text-lg font-semibold text-white">{tf(NYE_DATA.gates)}</span>
                  </div>
                  <div>
                    <h4 className="font-cinzel text-lg font-bold text-amber-300 mb-2">{tf({ id: "Lineup", en: "Lineup", ru: "Лайнап", ko: "라인업" })}</h4>
                    <p className="text-sm text-slate-300/80 font-light">{tf(NYE_DATA.lineup)}</p>
                  </div>
                  <div>
                    <h4 className="font-cinzel text-lg font-bold text-amber-300 mb-2">{tf({ id: "Musik", en: "Music", ru: "Музыка", ko: "음악" })}</h4>
                    <p className="text-sm text-slate-300/80 font-light">{tf(NYE_DATA.music)}</p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={120}>
              <Card className="glow-card glass rounded-3xl h-full">
                <CardContent className="p-7 space-y-4">
                  <div>
                    <h4 className="font-cinzel text-lg font-bold text-amber-300 mb-2">{tf({ id: "Fireworks", en: "Fireworks", ru: "Фейерверк", ko: "불꽃놀이" })}</h4>
                    <p className="text-sm text-slate-300/80 font-light">{tf(NYE_DATA.fireworks)}</p>
                  </div>
                  <div>
                    <h4 className="font-cinzel text-lg font-bold text-amber-300 mb-2">{tf({ id: "Seating", en: "Seating", ru: "Рассадка", ko: "좌석" })}</h4>
                    <p className="text-sm text-slate-300/80 font-light">{tf(NYE_DATA.seating)}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{tf({ id: "Tiket", en: "Tickets", ru: "Билеты", ko: "티켓" })}</span>
                      <span className="font-medium text-amber-300">{onRequest()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
          <div className="mt-10 text-center">
            <Button variant="luxury" size="lg" onClick={() => navigate("/contact")}>
              {tf({ id: "Tanya Ava soal Tiket", en: "Ask Ava About Tickets", ru: "Спросите Аву о билетах", ko: "티켓은 에이바에게 문의" })} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
