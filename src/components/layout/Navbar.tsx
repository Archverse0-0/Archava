import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ASSETS, CONTACT } from "@/data/whiterock";
import { useLang, Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Menu,
  X,
  ChevronDown,
  Globe,
  MessageCircle,
  Bed,
  Utensils,
  Sparkles,
  Music,
  Shirt,
  Waves,
  CalendarHeart,
  CloudSun,
  ListChecks,
  QrCode,
  Handshake,
  Camera,
  Mountain,
  Heart,
  Building2,
  Users,
} from "lucide-react";

// Mirror persis top-nav whiterockbali.com (scrape 2026-08):
// Entertainment, Daybed & Suites, Menu, Mice & Wedding, Spa & Wellness,
// Merchandise, Experiences, News (dropdown), NYE 2026, Eng (dropdown).
const NAV: {
  label: { id: string; en: string; ru?: string; ko?: string };
  to?: string;
  href?: string;
  children?: { label: { id: string; en: string; ru?: string; ko?: string }; to?: string; href?: string; icon?: any }[];
}[] = [
  { label: { id: "Entertainment", en: "Entertainment", ru: "Развлечения", ko: "엔터테인먼트" }, to: "/entertainment" },
  { label: { id: "Daybed & Suite", en: "Daybed & Suites", ru: "Шезлонги и люксы", ko: "데이베드 및 스위트" }, to: "/#daybeds" },
  { label: { id: "Menu", en: "Menu", ru: "Меню", ko: "메뉴" }, to: "/dining" },
  { label: { id: "Mice & Wedding", en: "Mice & Wedding", ru: "MICE и свадьба", ko: "MICE 및 웨딩" }, to: "/weddings-mice" },
  { label: { id: "Spa & Wellness", en: "Spa & Wellness", ru: "Спа и велнес", ko: "스па и велнес" }, to: "/spa-wellness" },
  { label: { id: "Merchandise", en: "Merchandise", ru: "Мерч", ko: "머천дайз" }, href: "https://shops.whiterockbali.com/" },
  { label: { id: "Experiences", en: "Experiences", ru: "Впечатления", ko: "체험" }, to: "/experiences" },
  {
    label: { id: "News", en: "News", ru: "Новости", ko: "뉴스" },
    children: [
      { label: { id: "Special Offers", en: "Special Offers", ru: "Спецпредложения", ko: "스페셜 오퍼" }, to: "/special-offers", icon: Sparkles },
      { label: { id: "Partnerships", en: "Partnerships", ru: "Партнерства", ko: "파트너십" }, to: "/partnerships", icon: Handshake },
      { label: { id: "Media & Press", en: "Media & Press", ru: "СМИ и пресса", ko: "미디어 & 프레스" }, to: "/media-coverage", icon: Camera },
      { label: { id: "Past Events", en: "Past Events", ru: "Прошедшие события", ko: "지난 이벤트" }, to: "/past-events", icon: Music },
      { label: { id: "Bali Guide", en: "Bali Guide", ru: "Гид по Bali", ko: "발리 가이드" }, to: "/bali-guide", icon: Mountain },
      { label: { id: "Live Weather & Tide Chart", en: "Live Weather & Tide Chart", ru: "Погода и приливы в реальном времени", ko: "실시간 날씨 및 조수" }, to: "/live-weather", icon: CloudSun },
      { label: { id: "My Web3 Bookings", en: "My Web3 Bookings", ru: "Мои бронирования", ko: "내 웹3 예약" }, to: "/my-bookings", icon: ListChecks },
      { label: { id: "Staff Check-In", en: "Staff Check-In", ru: "Чек-ин персонала", ko: "직원 체크인" }, to: "/staff-checkin", icon: QrCode },
    ],
  },
];

const LANGS: { code: Lang; label: string }[] = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "ko", label: "KO" },
];

export const Navbar = () => {
  const { lang, setLang, tf } = useLang();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isItemActive = (item: (typeof NAV)[0]) => {
    if (item.to) {
      if (item.to.includes("#")) {
        const [path, hash] = item.to.split("#");
        const matchPath = path === "" || path === "/";
        return (matchPath && location.pathname === "/") && location.hash === `#${hash}`;
      }
      if (item.to === "/dining" || item.to === "/menu") {
        return location.pathname === "/dining" || location.pathname === "/menu";
      }
      return location.pathname === item.to || location.pathname.startsWith(item.to + "/");
    }
    if (item.children) {
      return item.children.some((c) => c.to && (location.pathname === c.to || location.pathname.startsWith(c.to + "/")));
    }
    return false;
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-slate-950/85 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl"
          : "bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/assets/whiterock/logo-light.png"
              alt="White Rock Beach Club"
              className="h-9 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV.map((item) => {
              const hasChild = !!(item.children && item.children.length);
              const isActive = isItemActive(item);

              if (hasChild) {
                return (
                  <div
                    key={item.label.en}
                    className="relative group/parent"
                    onMouseEnter={() => setActiveMenu(item.label.en)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <button
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative",
                        isActive || activeMenu === item.label.en ? "text-amber-300 font-bold" : "text-slate-200/80 hover:text-white"
                      )}
                    >
                      <span className="relative">
                        {tf(item.label)}
                        <span
                          className={cn(
                            "absolute left-0 -bottom-1 h-[2.5px] bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)] transition-all duration-300 ease-out rounded-full",
                            isActive ? "w-full" : activeMenu === item.label.en ? "w-full" : "w-0 group-hover/parent:w-full"
                          )}
                        />
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </button>
                    {activeMenu === item.label.en && (
                      <div className="absolute left-3.5 top-full pt-2 min-w-[240px]">
                        <div className="py-2 space-y-2.5 glass-dropdown rounded-2xl p-4 border border-white/10 shadow-2xl">
                          {item.children!.map((c) => {
                            const Icon = c.icon;
                            const isChildActive = c.to && (location.pathname === c.to || location.pathname.startsWith(c.to + "/"));
                            return (
                              <div key={c.label.en} className="relative group/nested">
                                {c.href ? (
                                  <a
                                    href={c.href}
                                    target="_self"
                                    className="flex items-center gap-2.5 py-1 text-sm text-slate-200/90 hover:text-amber-300 transition-colors w-fit"
                                  >
                                    {Icon && <Icon className="h-4 w-4 text-amber-300/80 group-hover/nested:text-amber-300 transition-colors" />}
                                    <span className="relative drop-shadow">
                                      {tf(c.label)}
                                      <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-amber-300 transition-all duration-300 ease-out group-hover/nested:w-full" />
                                    </span>
                                  </a>
                                ) : (
                                  <Link
                                    to={c.to!}
                                    className={cn(
                                      "flex items-center gap-2.5 py-1 text-sm transition-colors w-fit",
                                      isChildActive ? "text-amber-300 font-bold" : "text-slate-200/90 hover:text-amber-300"
                                    )}
                                  >
                                    {Icon && <Icon className="h-4 w-4 text-amber-300/80 group-hover/nested:text-amber-300 transition-colors" />}
                                    <span className="relative drop-shadow">
                                      {tf(c.label)}
                                      <span
                                        className={cn(
                                          "absolute left-0 -bottom-0.5 h-[2px] bg-amber-300 transition-all duration-300 ease-out",
                                          isChildActive ? "w-full" : "w-0 group-hover/nested:w-full"
                                        )}
                                      />
                                    </span>
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div key={item.label.en} className="relative group/leaf">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_self"
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative",
                        isActive ? "text-amber-300 font-bold" : "text-slate-200/80 hover:text-white"
                      )}
                    >
                      <span className="relative">
                        {tf(item.label)}
                        <span
                          className={cn(
                            "absolute left-0 -bottom-1 h-[2.5px] bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)] transition-all duration-300 ease-out rounded-full",
                            isActive ? "w-full" : "w-0 group-hover/leaf:w-full"
                          )}
                        />
                      </span>
                    </a>
                  ) : (
                    <Link
                      to={item.to!}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative",
                        isActive ? "text-amber-300 font-bold" : "text-slate-200/80 hover:text-white"
                      )}
                    >
                      <span className="relative">
                        {tf(item.label)}
                        <span
                          className={cn(
                            "absolute left-0 -bottom-1 h-[2.5px] bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)] transition-all duration-300 ease-out rounded-full",
                            isActive ? "w-full" : "w-0 group-hover/leaf:w-full"
                          )}
                        />
                      </span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right controls: Web3 Connect Wallet Button + Lang */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* RainbowKit Connect Button */}
            <div className="hidden sm:block">
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>

            {/* Language dropdown */}
            <div className="hidden md:block relative group">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:text-amber-300 transition-colors relative group/lang"
                aria-label="Select language"
              >
                <span className="relative">
                  {LANGS.find((l) => l.code === lang)?.label ?? "EN"}
                  <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-amber-300 transition-all duration-300 group-hover/lang:w-full" />
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-amber-300/70" />
              </button>
              <div className="absolute left-0 top-full pt-2 min-w-[70px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1 space-y-1 glass-dropdown rounded-xl p-2 border border-white/10 shadow-xl">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={cn(
                        "w-full flex items-center justify-between py-1 px-2 text-xs font-semibold transition-colors relative group/item",
                        lang === l.code ? "text-amber-300 font-bold" : "text-slate-300 hover:text-white"
                      )}
                    >
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="lg:hidden text-white p-2"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden glass-dropdown border-t border-white/10 max-h-[80vh] overflow-y-auto">
          <div className="container mx-auto px-5 py-4 space-y-3">
            {/* Mobile Wallet Connect */}
            <div className="pb-2 flex justify-center">
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>

            {NAV.map((item) => (
              <div key={item.label.en}>
                {item.children ? (
                  <div className="space-y-1">
                    <div className="text-xs uppercase tracking-wider text-amber-300 font-bold px-2 pt-2">
                      {tf(item.label)}
                    </div>
                    {item.children.map((c) => (
                      <Link
                        key={c.label.en}
                        to={c.to ?? "#"}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-300 hover:text-amber-300"
                      >
                        {tf(c.label)}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    to={item.to ?? "#"}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-2 text-sm font-semibold text-slate-200 hover:text-amber-300"
                  >
                    {tf(item.label)}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
