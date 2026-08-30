import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/layout/PageHero";
import { useLang } from "@/lib/i18n";
import { CONTACT } from "@/data/whiterock";
import { MapPin, Mail, Phone, Clock, Send, MessageCircle } from "lucide-react";

export default function Contact() {
  const { tf } = useLang();
  const [sent, setSent] = useState(false);
  const openAva = () => window.dispatchEvent(new CustomEvent("open-ava"));

  return (
    <div className="bg-[hsl(222_47%_9%)]">
      <PageHero
        bgImage="/assets/whiterock/aerial.jpg"
        eyebrow={tf({ id: "Contact", en: "Contact", ru: "Контакт", ko: "문의" })}
        title={tf({ id: "Hubungi Kami", en: "Get in Touch", ru: "Свяжитесь с нами", ko: "연락하기" })}
        subtitle={tf({
          id: "Tim concierge kami siap bantu reservasi, event, dan pertanyaan apa pun. Atau langsung ngobrol sama Ava.",
          en: "Our concierge team is ready to help with bookings, events, and any question. Or just talk to Ava.",
          ru: "Наша команда консьержей готова помочь с бронированием, мероприятиями и любым вопросом. Или просто поговорите с Авой.",
          ko: "컨시어지 팀이 예약, 이벤트, 그리고 모든 문의를 도와드립니다. 또는 에이바와 바로 대화하세요.",
        })}
      />

      <section className="py-20 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-10">
          {/* Info */}
          <Reveal>
            <div className="space-y-6">
              <SectionHeading align="left" eyebrow={tf({ id: "Info", en: "Info", ru: "Инфо", ko: "정보" })} title={tf({ id: "Kunjungi & Hubungi", en: "Visit & Reach Us", ru: "Приезжайте и свяжитесь с нами", ko: "방문 및 연락" })} className="mb-6" />
              <div className="space-y-4">
                <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="glow-card glass rounded-2xl p-5 flex items-center gap-4 block">
                  <MapPin className="h-6 w-6 text-amber-300" />
                  <div><div className="font-semibold text-white">{tf({ id: "Lokasi", en: "Location", ru: "Расположение", ko: "위치" })}</div><div className="text-sm text-slate-400 font-light">{tf(CONTACT.location)}</div></div>
                </a>
                <a href={`mailto:${CONTACT.email}`} className="glow-card glass rounded-2xl p-5 flex items-center gap-4 block">
                  <Mail className="h-6 w-6 text-amber-300" />
                  <div><div className="font-semibold text-white">{tf({ id: "Email", en: "Email", ru: "Эл. почта", ko: "이메일" })}</div><div className="text-sm text-slate-400 font-light">{CONTACT.email}</div></div>
                </a>
                <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="glow-card glass rounded-2xl p-5 flex items-center gap-4 block">
                  <Phone className="h-6 w-6 text-amber-300" />
                  <div><div className="font-semibold text-white">{tf({ id: "WhatsApp", en: "WhatsApp", ru: "WhatsApp", ko: "WhatsApp" })}</div><div className="text-sm text-slate-400 font-light">{CONTACT.whatsapp}</div></div>
                </a>
                <div className="glow-card glass rounded-2xl p-5 flex items-center gap-4">
                  <Clock className="h-6 w-6 text-amber-300" />
                  <div><div className="font-semibold text-white">{tf({ id: "Jam Buka", en: "Hours", ru: "Часы работы", ko: "영업 시간" })}</div><div className="text-sm text-slate-400 font-light">{tf(CONTACT.hours)}</div></div>
                </div>
              </div>
              <Button variant="luxury" size="lg" onClick={openAva} className="w-full sm:w-auto">
                <MessageCircle className="h-5 w-5" /> {tf({ id: "Ngobrol dgn Ava", en: "Talk to Ava", ru: "Поговорить с Авой", ko: "에이바와 대화" })}
              </Button>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={120}>
            <Card className="glass-strong rounded-3xl">
              <CardContent className="p-7">
                <h3 className="font-cinzel text-2xl font-bold text-white mb-5">{tf({ id: "Kirim Pesan", en: "Send a Message", ru: "Отправить сообщение", ko: "메시지 보내기" })}</h3>
                {sent ? (
                  <div className="text-center py-10">
                    <div className="mx-auto h-14 w-14 rounded-full gold-gradient grid place-items-center mb-4"><Send className="h-6 w-6 text-[hsl(222_47%_8%)]" /></div>
                    <p className="text-white font-semibold">{tf({ id: "Pesan terkirim!", en: "Message sent!", ru: "Сообщение отправлено!", ko: "메시지가 전송되었습니다!" })}</p>
                    <p className="text-sm text-slate-400 mt-1">{tf({ id: "Tim kami akan balas secepatnya.", en: "Our team will reply shortly.", ru: "Наша команда ответит в ближайшее время.", ko: "팀이 곧 답변드리겠습니다." })}</p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input placeholder={tf({ id: "Nama", en: "Name", ru: "Имя", ko: "이름" })} className="glass border-white/10 text-white" />
                      <Input placeholder={tf({ id: "Email", en: "Email", ru: "Эл. почта", ko: "이메일" })} type="email" className="glass border-white/10 text-white" />
                    </div>
                    <Input placeholder={tf({ id: "Subjek", en: "Subject", ru: "Тема", ko: "제목" })} className="glass border-white/10 text-white" />
                    <Textarea placeholder={tf({ id: "Pesan", en: "Message", ru: "Сообщение", ko: "메시지" })} rows={5} className="glass border-white/10 text-white" />
                    <Button type="submit" variant="luxury" className="w-full">
                      {tf({ id: "Kirim", en: "Send", ru: "Отправить", ko: "보내기" })} <Send className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
