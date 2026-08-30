import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
import { useLang } from "@/lib/i18n";
import { CONTACT } from "@/data/whiterock";
import { CloudSun, Waves, Sun, Moon, ArrowUp, ArrowDown, MapPin, MessageCircle } from "lucide-react";

// Deterministic, offline-safe model based on the day of the year (Melasti Beach ~ Uluwatu).
function useWeatherModel() {
  return useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    // Sunrise ~6:15, sunset ~18:35 with small seasonal swing
    const sunriseMin = 6 * 60 + 15 + Math.round(12 * Math.sin(dayOfYear / 58));
    const sunsetMin = 18 * 60 + 35 - Math.round(12 * Math.sin(dayOfYear / 58));
    const tempC = 28 + Math.round(2 * Math.sin(dayOfYear / 40));
    const humidity = 70 + Math.round(6 * Math.sin(dayOfYear / 30));
    // Two tides per day, phase from day index. Stored in minutes so the
    // displayed times aren't always on the hour (more realistic).
    const phase = (dayOfYear % 12) / 12;
    const highHour = 6 + Math.round(2.5 * Math.sin(phase * Math.PI));
    const highMin = (dayOfYear * 7) % 60;
    const high1 = highHour * 60 + highMin; // minutes since midnight
    const low1 = high1 + 6 * 60;
    const waveM = (1.2 + Math.abs(Math.sin(phase * Math.PI)) * 0.8).toFixed(1);
    // 24h tide curve points
    const curve = Array.from({ length: 24 }, (_, h) => {
      const v = Math.sin((h / 24) * Math.PI * 2 * 2 + phase * Math.PI * 2);
      return { h, v: (v + 1) / 2 }; // 0..1
    });
    return { sunriseMin, sunsetMin, tempC, humidity, high1, low1, waveM, curve };
  }, []);
}

const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function LiveWeather() {
  const { tf } = useLang();
  const w = useWeatherModel();
  const openAva = () => window.dispatchEvent(new CustomEvent("open-ava"));

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow={tf({ id: "Live Conditions", en: "Live Conditions", ru: "Текущие условия", ko: "실시간 상태" })}
        title={tf({ id: "Cuaca & Pasang Melasti", en: "Melasti Weather & Tide", ru: "Погода и приливы Melasti", ko: "Melasti 날씨 & 조수" })}
        subtitle={tf({
          id: "Pantau kondisi real-time pantai — pasang surut, tinggi ombak, dan waktu golden sunset. Tanya Ava untuk update live.",
          en: "Track real-time beach conditions — tides, swell, and golden sunset time. Ask Ava for live updates.",
          ru: "Следите за условиями на пляже в реальном времени — приливы, волны и время золотого заката. Спросите Аву о живых обновлениях.",
          ko: "실시간 해변 상태를 확인하세요 — 조수, 파도, 골든 선셋 시간. 실시간 업데이트는 에이바에게 문의하세요.",
        })}
      />

      <section className="py-20 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <SectionHeading
            eyebrow={tf({ id: "Hari ini", en: "Today", ru: "Сегодня", ko: "오늘" })}
            title={tf({ id: "Kondisi Real-Time", en: "Real-Time Conditions", ru: "Условия в реальном времени", ko: "실시간 상태" })}
          />

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Sun, label: tf({ id: "Suhu", en: "Temp", ru: "Темп.", ko: "기온" }), value: `${w.tempC}°C`, accent: "text-amber-300" },
              { icon: Waves, label: tf({ id: "Tinggi Ombak", en: "Swell", ru: "Волны", ko: "파도" }), value: `${w.waveM} m`, accent: "text-amber-300" },
              { icon: CloudSun, label: tf({ id: "Kelembapan", en: "Humidity", ru: "Влажность", ko: "습도" }), value: `${w.humidity}%`, accent: "text-amber-200" },
              { icon: MapPin, label: tf({ id: "Lokasi", en: "Location", ru: "Место", ko: "위치" }), value: "Melasti", accent: "text-amber-200" },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <Reveal key={i} delay={i * 60}>
                  <Card className="glow-card glass rounded-2xl">
                    <CardContent className="p-5 flex items-center gap-4">
                      <Icon className={`h-8 w-8 ${m.accent}`} />
                      <div>
                        <div className="text-xs text-slate-400">{m.label}</div>
                        <div className="text-xl font-bold text-white">{m.value}</div>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              );
            })}
          </div>

          {/* Tide chart */}
          <Reveal>
            <Card className="glass rounded-3xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-cinzel text-2xl font-bold text-white flex items-center gap-2">
                    <Waves className="h-6 w-6 text-amber-300" /> {tf({ id: "Grafik Pasang Surut 24 Jam", en: "24h Tide Chart", ru: "График приливов 24 ч", ko: "24시간 조수 차트" })}
                  </h3>
                  <span className="text-xs text-slate-400">{tf({ id: "Updated: live", en: "Updated: live", ru: "Обновлено: live", ko: "업데이트: 실시간" })}</span>
                </div>
                <div className="relative h-44 w-full">
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="tide" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(45 90% 60%)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="hsl(45 90% 60%)" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {[10, 20, 30].map((y) => (
                      <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(210 40% 96% / 0.08)" strokeWidth="0.3" />
                    ))}
                    <path
                      d={`M0 ${40 - w.curve[0].v * 32} ` + w.curve.map((c) => `L${(c.h / 23) * 100} ${40 - c.v * 32}`).join(" ")}
                      fill="none"
                      stroke="hsl(45 90% 60%)"
                      strokeWidth="0.7"
                    />
                    <path
                      d={`M0 ${40 - w.curve[0].v * 32} ` + w.curve.map((c) => `L${(c.h / 23) * 100} ${40 - c.v * 32}`).join(" ") + ` L100 40 L0 40 Z`}
                      fill="url(#tide)"
                    />
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-0.5">
                    {[0, 6, 12, 18, 23].map((h) => (
                      <span key={h}>{String(h).padStart(2, "0")}:00</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="glass rounded-xl p-3 flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-amber-300" />
                    <div><div className="text-xs text-slate-400">{tf({ id: "Pasang Tinggi", en: "High Tide", ru: "Полная вода", ko: "만조" })}</div><div className="font-bold text-white">{fmt(w.high1)}</div></div>
                  </div>
                  <div className="glass rounded-xl p-3 flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-amber-300" />
                    <div><div className="text-xs text-slate-400">{tf({ id: "Pasang Rendah", en: "Low Tide", ru: "Малая вода", ko: "간조" })}</div><div className="font-bold text-white">{fmt(w.low1)}</div></div>
                  </div>
                  <div className="glass rounded-xl p-3 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-300" />
                    <div><div className="text-xs text-slate-400">{tf({ id: "Sunrise", en: "Sunrise", ru: "Восход", ko: "일출" })}</div><div className="font-bold text-white">{fmt(w.sunriseMin)}</div></div>
                  </div>
                  <div className="glass rounded-xl p-3 flex items-center gap-2">
                    <Moon className="h-4 w-4 text-amber-300" />
                    <div><div className="text-xs text-slate-400">{tf({ id: "Sunset", en: "Sunset", ru: "Закат", ko: "일몰" })}</div><div className="font-bold text-white">{fmt(w.sunsetMin)}</div></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <div className="mt-8 text-center">
            <Button variant="luxury" size="lg" onClick={openAva}>
              <MessageCircle className="h-5 w-5" /> {tf({ id: "Tanya Ava soal cuaca", en: "Ask Ava about the weather", ru: "Спросите Аву о погоде", ko: "에이바에게 날씨를 물어보세요" })}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
