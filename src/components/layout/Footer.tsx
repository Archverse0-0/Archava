import { Link } from "react-router-dom";
import { ASSETS, CONTACT } from "@/data/whiterock";
import { useLang } from "@/lib/i18n";
import {
  Instagram,
  Facebook,
  Youtube,
  Music2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const COLS = [
  {
    title: { id: "Jelajahi", en: "Explore", ru: "Исследуйте", ko: "둘러보기" },
    links: [
      { label: { id: "Daybed & Suites", en: "Daybed & Suites", ru: "Шезлонги и люксы", ko: "데이베드 및 스위트" }, to: "/#daybeds" },
      { label: { id: "Menu", en: "Menu", ru: "Меню", ko: "메뉴" }, to: "/dining" },
      { label: { id: "Experiences", en: "Experiences", ru: "Впечатления", ko: "체험" }, to: "/experiences" },
      { label: { id: "Book a Daybed", en: "Book a Daybed", ru: "Забронировать шезлонг", ko: "데이베드 예약" }, to: "/booking" },
      { label: { id: "My Web3 Bookings", en: "My Web3 Bookings", ru: "Мои бронирования", ko: "내 웹3 예약" }, to: "/my-bookings" },
      { label: { id: "Staff Check-In", en: "Staff Check-In", ru: "Регистрация staff", ko: "스태프 체크인" }, to: "/staff-checkin" },
    ],
  },
  {
    title: { id: "Pengalaman", en: "Experiences", ru: "Впечатления", ko: "체험" },
    links: [
      { label: { id: "Spa & Wellness", en: "Spa & Wellness", ru: "Спа и велнес", ko: "스파 및 웰니스" }, to: "/spa-wellness" },
      { label: { id: "Mice & Wedding", en: "Mice & Wedding", ru: "MICE и свадьба", ko: "MICE 및 웨딩" }, to: "/weddings-mice" },
      { label: { id: "Merchandise", en: "Merchandise", ru: "Мерч", ko: "머천다이즈" }, href: "https://shops.whiterockbali.com/" },
      { label: { id: "Entertainment", en: "Entertainment", ru: "Развлечения", ko: "엔터테인먼트" }, to: "/entertainment" },
    ],
  },
  {
    title: { id: "News", en: "News", ru: "Новости", ko: "뉴스" },
    links: [
      { label: { id: "Special Offers", en: "Special Offers", ru: "Спецпредложения", ko: "스페셜 오퍼" }, to: "/special-offers" },
      { label: { id: "Past Events", en: "Past Events", ru: "Прошедшие события", ko: "지난 이벤트" }, to: "/past-events" },
      { label: { id: "Bali Guide", en: "Bali Guide", ru: "Гид по Bali", ko: "발리 가이드" }, to: "/bali-guide" },
      { label: { id: "Media & Press", en: "Media & Press", ru: "СМИ и пресса", ko: "미디어 & 프레스" }, to: "/media-coverage" },
    ],
  },
  {
    title: { id: "Perusahaan", en: "Company", ru: "Компания", ko: "회사" },
    links: [
      { label: { id: "Live Weather & Tide", en: "Live Weather & Tide", ru: "Погода и приливы", ko: "실시간 날씨" }, to: "/live-weather" },
      { label: { id: "Contact", en: "Contact", ru: "Контакты", ko: "연락처" }, to: "/contact" },
      { label: { id: "FAQ", en: "FAQ", ru: "Часто задаваемые вопросы", ko: "자주 묻는 질문" }, to: "/faq" },
      {
        isGroup: true,
        items: [
          { label: { id: "Careers", en: "Careers", ru: "Карьера", ko: "채용" }, to: "/careers" },
          { label: { id: "NYE 2026", en: "NYE 2026", ru: "NYE 2026", ko: "NYE 2026" }, to: "/nye" },
        ]
      }
    ],
  },
];

const SOCIALS = [
  { Icon: Instagram, href: "https://instagram.com" },
  { Icon: Facebook, href: "https://facebook.com" },
  { Icon: Youtube, href: "https://youtube.com" },
  { Icon: Music2, href: "https://tiktok.com" },
];

export function Footer() {
  const { tf } = useLang();
  return (
    <footer className="relative bg-[hsl(222_47%_4%)] border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <img src={ASSETS.logoLight} alt="White Rock Bali" className="h-12 w-auto" />
            <p className="text-slate-400 font-light text-sm max-w-sm leading-relaxed">
              {tf({
                id: "Beach club & resort tepi pantai paling epik di Melasti, Uluwatu. Free entrance, vibe mewah, dan AI concierge 24 jam.",
                en: "The most epic beachfront club & resort in Melasti, Uluwatu. Free entrance, luxe vibes, and a 24/7 AI concierge.",
              })}
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 w-10 grid place-items-center rounded-full glass hover:border-amber-400/50 hover:text-amber-300 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLS.map((col) => (
            <div key={col.title.en}>
              <h4 className="font-cinzel text-amber-300/90 text-sm font-semibold tracking-wider uppercase mb-4">
                {tf(col.title)}
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-400 font-light">
                {col.links.map((l, i) => {
                  if (l.isGroup && l.items) {
                    return (
                      <li key={i} className="flex items-center gap-2">
                        <Link to={l.items[0].to} className="hover:text-white transition-colors">
                          {tf(l.items[0].label)}
                        </Link>
                        <span className="text-amber-400/40">•</span>
                        <Link to={l.items[1].to} className="hover:text-amber-300 font-semibold text-amber-400/90 transition-colors">
                          {tf(l.items[1].label)}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={(l.href || l.to) + l.label?.en}>
                      {l.href ? (
                        <a href={l.href} target="_self" className="hover:text-white transition-colors">
                          {tf(l.label)}
                        </a>
                      ) : (
                        <Link to={l.to!} className="hover:text-white transition-colors">
                          {tf(l.label)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div className="mt-12 pt-8 border-t border-white/10 grid gap-4 sm:grid-cols-3 text-sm text-slate-400">
          <a href={CONTACT.maps} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
            <MapPin className="h-4 w-4 text-amber-300" /> {tf(CONTACT.location)}
          </a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
            <Mail className="h-4 w-4 text-amber-300" /> {CONTACT.email}
          </a>
          <a href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="h-4 w-4 text-amber-300" /> WhatsApp {CONTACT.whatsapp}
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
          <p>© 2026 {CONTACT.name} · Melasti Beach, Bali. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
