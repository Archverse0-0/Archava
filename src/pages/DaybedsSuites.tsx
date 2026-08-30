import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
import { useLang } from "@/lib/i18n";
import { DAYBEDS, ASSETS } from "@/data/whiterock";
import { Users, ArrowRight, Sparkles } from "lucide-react";

export default function DaybedsSuites() {
  const { tf, formatPrice } = useLang();
  const navigate = useNavigate();

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        bgImage={ASSETS.lagoonBed}
        eyebrow={tf({ id: "Daybeds & Suites", en: "Daybeds & Suites", ru: "Шезлонги и люксы", ko: "데이베드 & 스위트" })}
        title={tf({ id: "Lounging Mewah", en: "Luxe Lounging", ru: "Роскошный отдых", ko: "럭셔리 라운징" })}
        subtitle={tf({
          id: "Setiap spot dirancang untuk kenyamanan maksimal dengan view laut langsung. Pilih daybed atau suite, lalu biarkan Ava urus sisanya.",
          en: "Every spot is designed for maximum comfort with direct ocean views. Pick a daybed or suite, then let Ava handle the rest.",
          ru: "Каждое место создано для максимального комфорта с прямым видом на океан. Выберите шезлонг или люкс, а остальное доверьте Аве.",
          ko: "모든 공간은 바다 전망을 갖춘 최상의 편안함을 위해 설계됐습니다. 데이베드나 스위트를 고르고 나머지는 에이바에게 맡기세요.",
        })}
      />

      <section className="py-20 px-5 md:px-8">
        <div className="container mx-auto max-w-7xl">
          <SectionHeading
            align="left"
            eyebrow={tf({ id: "Koleksi", en: "The Collection", ru: "Коллекция", ko: "컬렉션" })}
            title={tf({ id: "Pilih Spotmu", en: "Pick Your Spot", ru: "Выберите своё место", ko: "원하는 자리 선택" })}
          />
          <div className="grid lg:grid-cols-2 gap-8">
            {DAYBEDS.map((d, i) => (
              <Reveal key={d.id} delay={i * 80} id={d.id === "vip-cabana" ? "vip" : undefined}>
                <Card className="glow-card glass rounded-3xl overflow-hidden h-full">
                  <div className={`relative h-56 bg-gradient-to-br ${d.accent}`}>
                    <img src={d.image} alt={tf(d.name)} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex items-center gap-2">
                      <Users className="h-4 w-4 text-white" />
                      <span className="text-white font-semibold text-sm">{d.capacity}</span>
                    </div>
                  </div>
                  <CardContent className="p-7">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-cinzel text-2xl font-bold text-white">{tf(d.name)}</h3>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">{tf({ id: "Min. spend", en: "Min. spend", ru: "Мин. расход", ko: "최소 이용" })}</div>
                        <div className="text-amber-300 font-bold">{formatPrice(d.minSpendIdr)}</div>
                      </div>
                    </div>
                    <p className="text-slate-300/80 font-light mt-3 mb-5 leading-relaxed">
                      {tf({
                        id: "Min. spend berlaku untuk F&B — tanya Ava untuk penawaran rombongan & availability.",
                        en: "Min. spend applies to F&B — ask Ava for group deals & availability.",
                        ru: "Мин. расход действует для F&B — спросите Аву о групповых предложениях и наличии.",
                        ko: "최소 이용은 F&B에 적용됩니다 — 단체 할인과 예약 가능 여부는 에이바에게 문의하세요.",
                      })}
                    </p>
                    <Button variant="luxury" className="w-full" onClick={() => navigate("/booking")}>
                      {tf({ id: "Reservasi Sekarang", en: "Reserve Now", ru: "Забронировать сейчас", ko: "지금 예약" })} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Save promo */}
      <section className="py-16 px-5 md:px-8">
        <div className="container mx-auto max-w-5xl">
          <Reveal>
            <div className="glass-strong rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-amber-300/20">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-amber-300 font-semibold mb-3">
                  <Sparkles className="h-4 w-4" /> {tf({ id: "Promo", en: "Promo", ru: "Акция", ko: "프로모" })}
                </span>
                <h3 className="font-cinzel text-2xl md:text-3xl font-bold text-white mb-2">
                  {tf({ id: "Hemat di Min. Spend F&B", en: "Save on F&B Min. Spend", ru: "Сэкономьте на мин. расходе F&B", ko: "F&B 최소 이용 할인" })}
                </h3>
                <p className="text-slate-300/80 font-light">
                  {tf({
                    id: "Dapat welcome drink & handuk premium untuk setiap reservasi daybed. Tanya Ava untuk penawaran rombongan.",
                    en: "Get a welcome drink & premium towels with every daybed booking. Ask Ava for group deals.",
                    ru: "Получите welcome-напиток и премиальные полотенца при каждом бронировании шезлонга. Спросите Аву о групповых предложениях.",
                    ko: "데이베드 예약마다 웰컴 음료와 프리미엄 타월을 받으세요. 단체 할인은 에이바에게 문의하세요.",
                  })}
                </p>
                <p className="text-xs text-amber-400/80 mt-2 font-mono">
                  ⛓️ {tf({ id: "Pembayaran via Monad Testnet escrow smart contract", en: "Payment via Monad Testnet escrow smart contract", ru: "Оплата через смарт-контракт Monad Testnet escrow", ko: "Monad 테스트넷 에스크로 스마트 컨트랙트를 통한 결제" })}
                </p>
              </div>
              <Button variant="luxury" size="lg" onClick={() => navigate("/booking")}>
                {tf({ id: "Cek Ketersediaan", en: "Check Availability", ru: "Проверить наличие", ko: "예약 가능 확인" })}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
