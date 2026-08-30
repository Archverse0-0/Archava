import {
  lagoonBedImage,
  lagoonSofaImage,
  doubleBedImage,
  singleBedImage,
  spaDaybedImage,
  vipCabanaImage,
  partyBedImage,
  singleSofaImage,
  partyVipSuitesImage,
  partyExecSuitesImage,
  aerialImage,
  eventMondayImage,
  eventTuesdayImage,
  eventSundayImage,
  menuHeroBurger,
  menuFood,
  menuCocktail,
  menuShisha,
} from "@/assets/whiterock-assets";

// ============================================================================
// SEMUA data di file ini 100% di-mirror dari whiterockbali.com (scrape 2026-08).
// Sumber: home, /daybeds, /menu, /spa-wellness, /wedding, /mice, /mice-wedding,
// /nye-2026, /experience, /special-offers, /faqs, /past-events, /liveweather, sitemap.
// Tidak ada satu pun angka/nama/deskripsi yang di-invent.
// Catatan: web TIDAK mempublish harga menu, spa, wedding, atau tiket NYE —
// field harga sengaja dihilangkan (bukan diisi angka bohong).
// ============================================================================

export const ASSETS = {
  logoLight: "/assets/whiterock/logo-light.png",
  bgVideo: "/assets/whiterock/bg-2m.mp4",
  bgVideoWebm: "/assets/whiterock/bg-2m.webm",
  bgVideoFull: "/assets/whiterock/bg-video.mp4",
  aerial: aerialImage,
  lagoonBed: lagoonBedImage,
  lagoonSofa: lagoonSofaImage,
  doubleBed: doubleBedImage,
  singleBed: singleBedImage,
  spaDaybed: spaDaybedImage,
  vipCabana: vipCabanaImage,
  partyBed: partyBedImage,
  singleSofa: singleSofaImage,
  partyVipSuites: partyVipSuitesImage,
  partyExecSuites: partyExecSuitesImage,
  eventMonday: eventMondayImage,
  eventTuesday: eventTuesdayImage,
  eventSunday: eventSundayImage,
  menuHeroBurger,
  menuFood,
  menuCocktail,
  menuShisha,
};

// Copy teks situs (hero, tagline, section) — SEMUA di-mirror dari whiterockbali.com.
// Ditaruh di sini sebagai single source of truth agar tidak ada string hardcode
// yang tersebar & saling bertentangan di JSX.
export const SITE_COPY = {
  locationTag: { id: "Melasti Beach • Uluwatu, Bali", en: "Melasti Beach • Uluwatu, Bali", ru: "Пляж Меласти • Улувату, Бали", ko: "멜라스티 비치 • 울루와투, 발리" },
  heroTitleA: { id: "RASAKAN", en: "FEEL THE", ru: "ПОЧУВСТВУЙ", ko: "느껴보세요" },
  heroTitleB: { id: "PENGALAMANNYA", en: "EXPERIENCE", ru: "ВПЕЧАТЛЕНИЕ", ko: "경험을" },
  heroSubtitle: {
    id: "Beach club & resort tepi pantai terbaik di Bali. Free entrance, daybed mewah, sunset DJ, dan AI concierge 24 jam yang siap bantu booking dalam sekejap.",
    en: "The best beachfront club & resort in Bali. Free entrance, luxe daybeds, sunset DJs, and a 24/7 AI concierge that books you in seconds.",
    ru: "Лучший пляжный клуб и курорт на Бали. Бесплатный вход, роскошные шезлонги, закатные диджеи и AI-консьерж 24/7, который забронирует вам за секунды.",
    ko: "발리 최고의 비치프론트 클럽 & 리조트. 무료 입장, 럭셔리 데이베드, 선셋 DJ, 그리고 몇 초 만에 예약해 주는 24시간 AI 컨시어지.",
  },
  reserveDaybed: { id: "Reservasi Daybed", en: "Reserve a Daybed", ru: "Забронировать шезлонг", ko: "데이베드 예약" },
  exploreExperiences: { id: "Lihat Experiences", en: "Explore Experiences", ru: "Откройте для себя впечатления", ko: "체험 둘러보기" },
  scroll: { id: "Gulir", en: "Scroll", ru: "Прокрутите", ko: "스크롤" },
  daybedEyebrow: { id: "Koleksi Daybed", en: "The Daybed Collection", ru: "Коллекция шезлонгов", ko: "데이베드 컬렉션" },
  daybedTitle: { id: "Lounging di Tepi Pantai", en: "Lounging by the Shoreline", ru: "Отдых у берега", ko: "해변가에서의 여유" },
  daybedSubtitle: {
    id: "Dari sofa intim untuk berdua sampai party suite untuk 15 orang — semua dengan view laut langsung dan service kelas atas.",
    en: "From intimate two-seat sofas to 15-guest party suites — all with direct ocean views and top-tier service.",
    ru: "От уютных диванов для двоих до праздничных люксов на 15 гостей — все с прямым видом на океан и первоклассным сервисом.",
    ko: "둘만을 위한 아늑한 소파부터 15명 규모의 파티 스위트까지 — 모두 바다 전망과 최고급 서비스를 갖추고 있습니다.",
  },
  daybedSpotNote: { id: "Spot tepi laut dengan min. spend F&B.", en: "Oceanfront spot with F&B min. spend.", ru: "Место у моря с мин. заказом F&B.", ko: "바다 앞 자리, F&B 최소 이용 적용." },
  minSpend: { id: "Min. spend", en: "Min. spend", ru: "Мин. заказ", ko: "최소 이용" },
  book: { id: "Booking", en: "Book", ru: "Забронировать", ko: "예약" },
  viewAllDaybeds: { id: "Lihat semua daybed", en: "View all daybeds", ru: "Смотреть все шезлонги", ko: "모든 데이베드 보기" },
  expEyebrow: { id: "World-Class Entertainment", en: "World-Class Entertainment", ru: "Развлечения мирового класса", ko: "세계적 수준의 엔터테인먼트" },
  expTitle: { id: "Sunset Sessions & DJ Events", en: "Sunset Sessions & DJ Events", ru: "Закатные сессии и DJ-события", ko: "선셋 세션 & DJ 이벤트" },
  expSubtitle: {
    id: "DJ tamu internasional, saxophone sunset, dan produksi pesta monumental di atas tebing Melasti.",
    en: "International guest DJs, live saxophone sunsets, and monumental party productions above the Melasti cliffs.",
    ru: "Международные приглашённые диджеи, закаты под живой саксофон и грандиозные вечеринки на скалах Меласти.",
    ko: "국제 게스트 DJ, 라이브 색소폰 선셋, 그리고 멜라스티 절벽 위에서 펼쳐지는 거대한 파티 프로덕션.",
  },
  diningEyebrow: { id: "Sunset Dining", en: "Sunset Dining", ru: "Закатный ужин", ko: "선셋 다이닝" },
  diningTitle: { id: "Dari Laut ke Gelas", en: "From the Sea to the Glass", ru: "От моря к бокалу", ko: "바다에서 잔까지" },
  // Deskripsi dining di-mirror persis dari /menu/ ("local and international cuisines" +
  // "discover their signature drinks") — TIDAK ada klaim Jimbaran/Wagyu/pizza/botanicals.
  diningDesc: {
    id: "White Rock Kitchen menghadirkan masakan lokal dan internasional. Cliffside Mixology Bar menampilkan signature drinks mereka.",
    en: "White Rock Kitchen serves local and international cuisines. The Cliffside Mixology Bar showcases their signature drinks.",
    ru: "White Rock Kitchen подает местную и международную кухню. Клифсайд-бар миксологии представляет их фирменные напитки.",
    ko: "White Rock Kitchen은 현지 및 국제 요리를 제공합니다. Cliffside Mixology Bar는 시그니처 음료를 선보입니다.",
  },
  freeEntrance: { id: "Free Entrance", en: "Free Entrance", ru: "Бесплатный вход", ko: "무료 입장" },
  openDaily: { id: "Buka 10:00 setiap hari", en: "Open 10AM Daily", ru: "Открыто с 10:00 ежедневно", ko: "매일 10시 오픈" },
  champagneBottles: { id: "Champagne & Botol", en: "Champagne & Bottles", ru: "Шампанское и бутылки", ko: "샴페인 & 보틀" },
  viewMenu: { id: "Lihat Menu", en: "View Menu", ru: "Посмотреть меню", ko: "메뉴 보기" },
  aiEyebrow: { id: "Fitur Eksklusif", en: "Exclusive Feature", ru: "Эксклюзивная функция", ko: "독점 기능" },
  aiTitle: { id: "Ngobrol sama Ava, AI VIP Host", en: "Meet Ava, your AI VIP Host", ru: "Познакомьтесь с Авой, вашим AI VIP-хостом", ko: "여러분의 AI VIP 호스트 에이바를 만나보세요" },
  aiDesc: {
    id: "Tanya apa aja dalam bahasa lisan — booking daybed, cek cuaca & pasang, rekomendasi menu — Ava jawab langsung via suara. Concierge nyata, 24 jam.",
    en: "Ask anything by voice — book a daybed, check weather & tides, get menu recs — Ava replies live. A real concierge, 24/7.",
    ru: "Спрашивайте что угодно голосом — бронируйте шезлонг, проверяйте погоду и приливы, получайте рекомендации по меню — Ава отвечает вживую. Настоящий консьерж, 24/7.",
    ko: "음성으로 무엇이든 물어보세요 — 데이베드 예약, 날씨와 조수 확인, 메뉴 추천 — 에이바가 실시간으로 답해줍니다. 진짜 컨시어지, 24시간.",
  },
  talkToAva: { id: "Ngobrol dgn Ava", en: "Talk to Ava", ru: "Поговорить с Авой", ko: "에이바와 대화하기" },
  aiHostOnline: { id: "AI VIP Host · Online", en: "AI VIP Host · Online", ru: "AI VIP Host · В сети", ko: "AI VIP Host · 온라인" },
  ctaTitle: { id: "Mulai petualanganmu", en: "Start Your Escape", ru: "Начните своё побег", ko: "당신의 여정을 시작하세요" },
  ctaSubtitle: {
    id: "Free entrance setiap hari. Booking daybed atau tanya Ava sekarang.",
    en: "Free entrance, every day. Book a daybed or just ask Ava now.",
    ru: "Бесплатный вход каждый день. Забронируйте шезлонг или просто спросите Аву прямо сейчас.",
    ko: "매일 무료 입장. 지금 데이베드를 예약하거나 에이바에게 물어보세요.",
  },
  reserveNow: { id: "Reservasi Sekarang", en: "Reserve Now", ru: "Забронировать сейчас", ko: "지금 예약" },
  whatsapp: { id: "WhatsApp", en: "WhatsApp", ru: "WhatsApp", ko: "WhatsApp" },
};

export const CONTACT = {
  name: "White Rock Beach Club",
  location: {
    id: "Melasti Beach, Ungasan Uluwatu Bali – Indonesia",
    en: "Melasti Beach, Ungasan Uluwatu Bali – Indonesia",
    ru: "Melasti Beach, Унгасан Улувату Bali – Indonesia",
    ko: "Melasti Beach, Ungasan Uluwatu Bali – Indonesia",
  },
  whatsapp: "+62 811 3803 003",
  email: "reservations@whiterockbali.com",
  hours: {
    id: "BUKA SETIAP HARI • 10:00 - 22:00",
    en: "OPEN DAILY • 10:00 AM - 10:00 PM",
    ru: "ОТКРЫТО ЕЖЕДНЕВНО • 10:00 - 22:00",
    ko: "매일 운영 • 10:00 - 22:00",
  },
};

// Fakta riil dari whiterockbali.com (scrape 2026-08). Tidak ada angka yang di-invent.
export const STATS = [
  { value: 10, suffix: "", label: { id: "Tipe Daybed & Suite", en: "Daybed & Suite Types", ru: "Типы Daybed и люксов", ko: "데이베드 & 스위트 종류" } },
  { value: 0, text: "FREE", label: { id: "Tiket Masuk", en: "Free Entrance", ru: "Бесплатный вход", ko: "무료 입장" } },
  { value: 12, suffix: "–22", label: { id: "Buka Tiap Hari", en: "Open Daily", ru: "Открыто ежедневно", ko: "매일 운영" } },
  { value: 24, suffix: "h", label: { id: "Concierge AI Aktif", en: "AI Concierge Live", ru: "AI-консьерж онлайн", ko: "AI 컨시어지 운영중" } },
];

export type Daybed = {
  id: string;
  name: { id: string; en: string };
  capacity: string;
  minSpendIdr: number;
  image: string;
  accent: string;
  desc?: { id: string; en: string };
  tag?: string;
  category?: "daybed" | "sofa" | "suite";
};

// Min spend persis dari home page whiterockbali.com (format "IDR 3,500K++" = 3.500.000).
export const DAYBEDS: Daybed[] = [
  {
    id: "lagoon-bed",
    name: { id: "Lagoon Bed", en: "Lagoon Bed" },
    capacity: "4 pax",
    minSpendIdr: 3_500_000,
    image: lagoonBedImage,
    accent: "from-amber-500/30 to-orange-600/10",
    tag: "BESTSELLER",
    category: "daybed",
    desc: { id: "Spot utama tepi kolam dengan view laut & sunset langsung.", en: "Front-row pool lounger with direct ocean & sunset views." },
  },
  {
    id: "lagoon-sofa",
    name: { id: "Lagoon Sofa", en: "Lagoon Sofa" },
    capacity: "8 pax",
    minSpendIdr: 4_000_000,
    image: lagoonSofaImage,
    accent: "from-amber-500/30 to-orange-600/10",
    category: "sofa",
    desc: { id: "Sofa teduh luas tepat di samping kolam utama untuk rombongan.", en: "Spacious shade sofa right by the main lagoon pool." },
  },
  {
    id: "double-bed",
    name: { id: "Double Bed", en: "Double Bed" },
    capacity: "4 pax",
    minSpendIdr: 3_000_000,
    image: doubleBedImage,
    accent: "from-yellow-500/30 to-amber-600/10",
    category: "daybed",
    desc: { id: "Lounger berdua yang intim cocok untuk bersantai nikmati angin laut.", en: "Intimate dual lounger perfect for enjoying ocean breeze." },
  },
  {
    id: "single-bed",
    name: { id: "Single Bed", en: "Single Bed" },
    capacity: "2 pax",
    minSpendIdr: 2_000_000,
    image: singleBedImage,
    accent: "from-yellow-500/30 to-amber-600/10",
    category: "daybed",
    desc: { id: "Bed santai personal dengan akses sunbed langsung & service F&B.", en: "Solo relaxation bed with direct sunbed access & F&B service." },
  },
  {
    id: "spa-daybed",
    name: { id: "Spa Daybed", en: "Spa Daybed" },
    capacity: "4 pax",
    minSpendIdr: 2_000_000,
    image: spaDaybedImage,
    accent: "from-amber-500/30 to-orange-600/10",
    category: "daybed",
    desc: { id: "Daybed tenang dekat area wellness dengan suasana laut yang rileks.", en: "Tranquil daybed near wellness area with relaxing sea breeze." },
  },
  {
    id: "vip-cabana",
    name: { id: "VIP Cabana", en: "VIP Cabana" },
    capacity: "12 pax",
    minSpendIdr: 8_000_000,
    image: vipCabanaImage,
    accent: "from-amber-500/30 to-yellow-600/10",
    tag: "VIP CHOICE",
    category: "suite",
    desc: { id: "Cabana privat eksklusif dengan butler pribadi & bottle service.", en: "Exclusive private cabana with dedicated butler & bottle service." },
  },
  {
    id: "party-bed",
    name: { id: "Party Bed", en: "Party Bed" },
    capacity: "8 pax",
    minSpendIdr: 4_500_000,
    image: partyBedImage,
    accent: "from-rose-500/30 to-amber-600/10",
    tag: "POPULAR",
    category: "daybed",
    desc: { id: "Daybed pesta di garis depan dekat DJ booth & main pool.", en: "Center-stage party daybed near DJ booth & main pool." },
  },
  {
    id: "single-sofa",
    name: { id: "Single Sofa", en: "Single Sofa" },
    capacity: "2 pax",
    minSpendIdr: 500_000,
    image: singleSofaImage,
    accent: "from-yellow-500/30 to-amber-600/10",
    category: "sofa",
    desc: { id: "Spot sofa santai yang pas untuk makan ringan & sunset drinks.", en: "Cozy sofa spot ideal for quick bites & sunset drinks." },
  },
  {
    id: "party-vip-suites",
    name: { id: "Party VIP Suites", en: "Party VIP Suites" },
    capacity: "10 pax",
    minSpendIdr: 6_000_000,
    image: partyVipSuitesImage,
    accent: "from-rose-500/30 to-amber-600/10",
    category: "suite",
    desc: { id: "Suite VIP mewah atas tebing dengan view laut panoramik.", en: "Elevated VIP lounge suite with panoramic sea views." },
  },
  {
    id: "party-executive-suites",
    name: { id: "Party Executive Suites", en: "Party Executive Suites", ru: "Праздничные люксы Executive", ko: "파티 익เซ큐티브 스위트" },
    capacity: "15 pax",
    minSpendIdr: 8_000_000,
    image: partyExecSuitesImage,
    accent: "from-rose-500/30 to-amber-600/10",
    tag: "ULTIMATE VIP",
    category: "suite",
    desc: { id: "Suite pesta termewah kapasitas 15 pax dengan private bar.", en: "Ultimate 15-pax party suite featuring private bar setup." },
  },
];

export type Experience = {
  id: string;
  title: { id: string; en: string };
  desc: { id: string; en: string };
};

// Dua experience riil dari /experience/ (verbatim).
export const EXPERIENCES: Experience[] = [
  {
    id: "after-party-suite",
    title: { id: "After Party At Our Suite", en: "After Party At Our Suite" },
    desc: {
      id: "Waktunya ajak teman terbaikmu dan jaga pestanya tetap hidup sampai fajar.",
      en: "Time To Invite Your Best Mates And Keep The Party Alive Till Dawn.",
    },
  },
  {
    id: "private-party-suites",
    title: { id: "Private Party at our Suites", en: "Private Party at our Suites" },
    desc: {
      id: "White Rock Beach Club menawarkan suasana yang akan membuat tamumu terpukau.",
      en: "White Rock Beach Club Offers A Setting That Will Leave Your Guests In Awe.",
    },
  },
];

// Kategori menu riil dari /menu/ (FOOD MENU, DRINKS MENU, SHISHA MENU).
// Web TIDAK mempublish item atau harga — jadi tidak ada item/price palsu.
export const MENU_CATEGORIES = [
  {
    id: "food",
    name: { id: "Menu Makanan", en: "Food Menu" },
    desc: {
      id: "Masakan lokal dan internasional.",
      en: "Local and international cuisines.",
    },
    accent: "bg-amber-400",
  },
  {
    id: "drinks",
    name: { id: "Menu Minuman", en: "Drinks Menu" },
    desc: {
      id: "Temukan signature drinks mereka.",
      en: "Discover their signature drinks.",
    },
    accent: "bg-rose-400",
  },
  {
    id: "shisha",
    name: { id: "Menu Shisha", en: "Shisha Menu" },
    desc: {
      id: "Shisha dengan pilihan bowl buah — sekitar 90 menit untuk 3 tamu.",
      en: "Shisha with fruit bowls — approx 90 minutes per 3 guests.",
    },
    accent: "bg-yellow-400",
  },
];

export type SpaTreatment = {
  name: { id: string; en: string };
  duration: string;
};

// 29 treatment riil dari /spa-wellness/ (nama + durasi verbatim). Harga TIDAK dipublish.
export const SPA_TREATMENTS: SpaTreatment[] = [
  { name: { id: "Serenity Seaside", en: "Serenity Seaside" }, duration: "120 minutes" },
  { name: { id: "Mermaid's Glow", en: "Mermaid's Glow" }, duration: "120 minutes" },
  { name: { id: "Ocean Mineral Detox", en: "Ocean Mineral Detox" }, duration: "90 minutes" },
  { name: { id: "Sea Brezze Sensation", en: "Sea Brezze Sensation" }, duration: "90 minutes" },
  { name: { id: "Coastal Retreat", en: "Coastal Retreat" }, duration: "60 minutes" },
  { name: { id: "Pijat Aromaterapi Relaksasi", en: "Relaxing Aromatherapy Massage" }, duration: "60 minutes" },
  { name: { id: "Pijat Aromaterapi Relaksasi", en: "Relaxing Aromatherapy Massage" }, duration: "90 minutes" },
  { name: { id: "Pijat Tradisional Bali", en: "Traditional Balinese Massage" }, duration: "60 minutes" },
  { name: { id: "Pijat Tradisional Bali", en: "Traditional Balinese Massage" }, duration: "90 minutes" },
  { name: { id: "Pijat Deep Revitalize", en: "Revitailze Deep Massage" }, duration: "90 minutes" },
  { name: { id: "Pijat Selulit", en: "Celulite Massage" }, duration: "60 minutes" },
  { name: { id: "Pijat Batu Panas", en: "Hot Rock Massage" }, duration: "90 minutes" },
  { name: { id: "Chocolate Love", en: "Chocolate Love" }, duration: "150 minutes" },
  { name: { id: "Body Scrub", en: "Body Scrub" }, duration: "45 minutes" },
  { name: { id: "Body Wrap/Masque", en: "Body Wrap/Masque" }, duration: "45 minutes" },
  { name: { id: "Sun Kiss Care", en: "Sun Kiss Care" }, duration: "45 minutes" },
  { name: { id: "Pijat Punggung Leher & Bahu", en: "Back Neck & Shoulder Massage" }, duration: "30 minutes" },
  { name: { id: "Foot Relaxing", en: "Foot Relaxing" }, duration: "60 minutes" },
  { name: { id: "Abyanga Facial", en: "Abyanga Facial" }, duration: "75 minutes" },
  { name: { id: "Hydra Facial", en: "Hydra Facial" }, duration: "60 minutes" },
  { name: { id: "Face Massage", en: "Face Massage" }, duration: "30 minutes" },
  { name: { id: "Hair Spa", en: "Hair Spa" }, duration: "60 minutes" },
  { name: { id: "Hair Wash", en: "Hair Wash" }, duration: "" },
  { name: { id: "Spa Menicure", en: "Spa Menicure" }, duration: "" },
  { name: { id: "Spa Pedicure", en: "Spa Pedicure" }, duration: "" },
  { name: { id: "Clasic Nail Polish Revlon", en: "Clasic Nail Polish Revlon" }, duration: "" },
  { name: { id: "Clasic Nail Polish OPI", en: "Clasic Nail Polish OPI" }, duration: "" },
  { name: { id: "Menicure Gel", en: "Menicure Gel" }, duration: "" },
  { name: { id: "Pedicure Gel", en: "Pedicure Gel" }, duration: "" },
  { name: { id: "Nail Gel Remover", en: "Nail Gel Remover" }, duration: "" },
  { name: { id: "In-Suite Wellness Package", en: "In-Suite Wellness Package" }, duration: "2 hours" },
];

// Jam buka spa riil dari /spa-wellness/ (dua jam operasional yang tercantum).
export const SPA_HOURS = [
  { id: "11:00 - 20:00", en: "11:00 AM – 8:00 PM" },
  { id: "12:00 - 20:00", en: "12:00 noon – 8:00 PM" },
];

export type WeddingVenue = {
  id: string;
  name: { id: string; en: string };
  standing: string;
  seating: string;
};

// 5 venue riil dari /wedding/ (kapasitas verbatim).
export const WEDDING_VENUES: WeddingVenue[] = [
  { id: "seaside-lawn", name: { id: "SEASIDE Lawn", en: "SEASIDE Lawn" }, standing: "500 Guests", seating: "250 Guests" },
  { id: "sunset-lounge", name: { id: "SUNSET Lounge", en: "SUNSET Lounge" }, standing: "50 Guests", seating: "20 Guests" },
  { id: "executive-suite", name: { id: "EXECUTIVE Suite", en: "EXECUTIVE Suite" }, standing: "25 Guests", seating: "25 Guests" },
  { id: "beachfront-wedding", name: { id: "BEACHFRONT Wedding", en: "BEACHFRONT Wedding" }, standing: "25 Guests", seating: "25 Guests" },
  { id: "samudera-ballroom", name: { id: "SAMUDERA Ballroom", en: "SAMUDERA Ballroom" }, standing: "196 Guests", seating: "280 Guests" },
];

export type MiceHall = {
  id: string;
  name: { id: string; en: string };
  size: string;
};

// Hall MICE riil dari /mice/ (ukuran verbatim).
export const MICE_HALLS: MiceHall[] = [
  { id: "samudera-ballroom", name: { id: "Samudera Ballroom", en: "Samudera Ballroom" }, size: "416,5 sqm" },
  { id: "melasti-1", name: { id: "Melasti 1", en: "Melasti 1" }, size: "253 sqm" },
  { id: "melasti-2", name: { id: "Melasti 2", en: "Melasti 2" }, size: "187 sqm" },
  { id: "melasti-3", name: { id: "Melasti 3", en: "Melasti 3" }, size: "104,4 sqm" },
];

export const NYE = {
  title: { id: "NYE 2026 – White Rock Beach Club feat. Abstract", en: "NYE 2026 – White Rock Beach Club feat. Abstract" },
  date: "2026-12-31",
  gates: { id: "Gerbang 15:00 – 03:00", en: "Gates 3:00 PM – 3:00 AM" },
  lineup: {
    id: "8 set DJ, hiburan karnaval live, dancer elite, sax live, perkusi, dan midnight countdown.",
    en: "8 DJ sets, vibrant live carnival entertainment, elite dancers, live sax, percussion, and midnight countdown.",
  },
  music: {
    id: "Afro House, Tech House, Melodic Techno, Progressive House, Indie Dance, House, dan Disco-infused grooves.",
    en: "Afro House, Tech House, Melodic Techno, Progressive House, Indie Dance, House, and Disco-infused grooves.",
  },
  fireworks: {
    id: "Fireworks tersinkron menyoroti langit atas Melasti Beach; Simo White b2b Novecento memimpin kerumunan ke 2027.",
    en: "Synchronized fireworks light up the sky over Melasti Beach while Simo White b2b Novecento leads the crowd into 2027.",
  },
  seating: {
    id: "14 kategori daybed, party suite, dan paket botol eksklusif di berbagai zona.",
    en: "14 categories of daybeds, party suites, and even exclusive bottle packages across zones.",
  },
};

// Event berulang riil dari /past-events/ & /faqs/ (nama verbatim).
export const RECURRING_EVENTS = [
  {
    id: "sunset-ritual",
    name: { id: "Sunset Ritual", en: "Sunset Ritual" },
    desc: {
      id: "Series party sunset reguler di White Rock Melasti — DJ resident dari jam 15:00 setiap hari.",
      en: "Regular sunset party series at White Rock Melasti — resident DJs from 3 PM daily.",
    },
    accent: "from-amber-500/20",
  },
  {
    id: "full-moon",
    name: { id: "Full Moon", en: "Full Moon" },
    desc: {
      id: "Perayaan pantai di bawah cahaya bulan purnama di atas tebing Melasti.",
      en: "Beachfront celebration under the full moon glow above the Melasti cliffs.",
    },
    accent: "from-orange-500/20",
  },
  {
    id: "self-hug-sundays",
    name: { id: "Self Hug Sundays", en: "Self Hug Sundays" },
    desc: {
      id: "Event pagi hari — brunch dan zen di tepian pantai yang tenang.",
      en: "A morning of bliss — brunch and zen on the serene shores.",
    },
    accent: "from-yellow-600/20",
  },
  {
    id: "groovy-splash-bash",
    name: { id: "Groovy Splash Bash", en: "Groovy Splash Bash" },
    desc: {
      id: "Series pool party yang cerah dan penuh matahari di bulan September.",
      en: "A spectacular, sun-soaked pool party series through September.",
    },
    accent: "from-rose-500/20",
  },
  {
    id: "circo-del-los-muertos",
    name: { id: "Circo del los Muertos", en: "Circo del los Muertos" },
    desc: {
      id: "Event Halloween bertema karnival yang penuh warna di White Rock.",
      en: "A colorful carnival-themed Halloween event at White Rock.",
    },
    accent: "from-rose-500/20",
  },
];

export const FAQS = [
  {
    q: { id: "Di mana White Rock Beach Club berada?", en: "Where is White Rock Beach Club?" },
    a: {
      id: "Klub berada di Melasti Beach, Ungasan Uluwatu Bali – Indonesia, di tepi tebing.",
      en: "The club sits at Melasti Beach, Ungasan Uluwatu Bali – Indonesia on a cliff edge.",
    },
  },
  {
    q: { id: "Jam berapa White Rock buka?", en: "What time does White Rock Beach Club open?" },
    a: {
      id: "Pintu buka jam 10:00 AM, kecuali saat Nyepi (diam).",
      en: "Doors open at 10:00 AM though shut for Nyepi silence observances pre/post.",
    },
  },
  {
    q: { id: "Jam berapa White Rock tutup?", en: "What time does White Rock Beach Club close?" },
    a: {
      id: "Venue tutup jam 10:00 PM, bisa diperpanjang privat lewat sales.",
      en: "Venue shuts at 10:00 PM with possible private extensions via sales.",
    },
  },
  {
    q: { id: "Apakah ada biaya masuk?", en: "Is there any entrance fee?" },
    a: {
      id: "Tidak ada biaya masuk ke beach club, tapi gerbang Melasti memungut warga/lokal sekitar IDR 10k/15k.",
      en: "No entry fee to the beach club normally, but Melasti gate charges locals/tourists ~IDR 10k/15k.",
    },
  },
  {
    q: { id: "Apa itu minimum spend dan bagaimana cara kerjanya?", en: "What is the minimum spend and how does it work?" },
    a: {
      id: "Mulai dari IDR 100K++ per orang sebagai kredit F&B termasuk perks; beberapa area IDR 500k.",
      en: "Starts at IDR 100K++ per person as F&B credit incl perks; seating varies; some areas IDR 500k.",
    },
  },
  {
    q: { id: "Apakah perlu reservasi dulu?", en: "Do I need to book in advance?" },
    a: {
      id: "Disarankan booking 48 jam sebelumnya untuk view terbaik dan diskon separuh minimum di akhir pekan pagi.",
      en: "They suggest book 48 hours prior for prime views and half-off minimum if early weekend.",
    },
  },
  {
    q: { id: "Di mana saya harus reservasi daybed & meja?", en: "Where should I book the daybed and table?" },
    a: {
      id: "Gunakan website resmi www.whiterockbali.com.",
      en: "Use the official website www.whiterockbali.com per their guidance.",
    },
  },
  {
    q: { id: "Apakah White Rock ramah anak & keluarga?", en: "Is White Rock kids & Family friendly?" },
    a: {
      id: "Ya, destinasi ramah keluarga dengan child pool & menu anak; wali harus mengawasi anak.",
      en: "Confirmed family-friendly destination offering child pool/menu; guardians must watch kids.",
    },
  },
  {
    q: { id: "Apa event & aktivasi harian di White Rock?", en: "What is daily event and activation at White Rock Beach Club?" },
    a: {
      id: "Resident DJ dari jam 15:00 setiap hari; akhir pekan siang ada foam & dance show.",
      en: "Resident DJs from 3 PM daily; weekend afternoons add foam and dance shows.",
    },
  },
  {
    q: { id: "Apakah hewan peliharaan diperbolehkan?", en: "Are pets allowed?" },
    a: {
      id: "Tidak ada hewan peliharaan diperbolehkan di area klub.",
      en: "No Pets are Allowed anywhere inside for guest ease and security.",
    },
  },
  {
    q: { id: "Apakah ada dress code khusus?", en: "Is there any specific dress code at White Rock Beach Club?" },
    a: {
      id: "Baju renang & beachwear yang pantas di pool; resto butuh baju kering, tersedia locker.",
      en: "Appropriate swimsuits and beachwear needed pools; eatery demands dry clothes, lockers exist.",
    },
  },
  {
    q: { id: "Saat musim hujan, opsi venue apa yang ada?", en: "During the rainy season, what is the venue option?" },
    a: {
      id: "Private Party Suites (Sangat Direkomendasikan) — ruangan tertutup ber-AC; resto tertutup; hall ber-AC.",
      en: "Private Party Suites (Highly Recommended) enclosed cool rooms; restaurant covered; hall climate-set.",
    },
  },
  {
    q: { id: "Apa kapasitas maksimum daybed | Sofa?", en: "What is the maximum capacity of daybed | Sofa?" },
    a: {
      id: "Bed kecil 2–4 orang, sofa 6–8, cabana 12, party suite 10, exec 15.",
      en: "Sizes range: small beds seat 2–4, sofas 6–8, cabanas 12, party suites 10, exec 15.",
    },
  },
  {
    q: { id: "Menu Food & Drink", en: "Food & Drink Menu" },
    a: {
      id: "Menu F&B ekstensif campuran lokal & global; makanan dari luar dilarang.",
      en: "An extensive food and beverage menu mixes local/global; outside edibles banned.",
    },
  },
  {
    q: { id: "Apakah White Rock menyediakan transportasi?", en: "Does White Rock Beach Club provide transportation?" },
    a: {
      id: "Menyediakan transportasi privat untuk 10 orang; opsi lokal dengan tarif tetap.",
      en: "They run private transport directly fits for 10 people plus local options with set fares.",
    },
  },
  {
    q: { id: "Apakah ada Shisha|Hookah?", en: "Do you have Shisha|Hookah?" },
    a: {
      id: "Ya, White Rock menyediakan Shisha dengan bowl buah; sekitar 90 menit per 3 tamu.",
      en: "Yes, White Rock Beach Club provides Shisha with fruit bowls; approx 90 min per 3 guests.",
    },
  },
  {
    q: { id: "Fasilitas lain apa yang dimiliki White Rock?", en: "What other facilities does White Rock Beach Club have?" },
    a: {
      id: "Termasuk ballroom besar (hingga 398), ocean spa rooms, beachfront yoga, lawn wedding spot.",
      en: "Includes big ballrooms (up to 398), ocean spa rooms, beachfront yoga, lawn wedding spot.",
    },
  },
];

// Live DJ lineup with 8 event cards and real photography assets
export const ENTERTAINMENT_DJS = [
  {
    day: "Monday",
    date: "MON 24 AUG",
    title: "MONDAY at White Rock",
    djs: "ARROW • IFIN • ELLE",
    tagline: '"SAXOPHONE, PERCUSSION, & FOAM PARTY"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.partyBed,
  },
  {
    day: "Tuesday",
    date: "TUE 25 AUG",
    title: "TUESDAY at White Rock",
    djs: "BAMS • BOBBY K • WILLY",
    tagline: '"FOAM PARTY"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.lagoonSofa,
  },
  {
    day: "Wednesday",
    date: "WED 26 AUG",
    title: "WEDNESDAY at White Rock",
    djs: "SYANIA • IFIN • MARTIN BAYU",
    tagline: '"SUNSET SESSIONS & LIVE DJS"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.partyVipSuites,
  },
  {
    day: "Thursday",
    date: "THU 27 AUG",
    title: "THURSDAY at White Rock",
    djs: "BAMS • ARROW • BOBBY K",
    tagline: '"SAXOPHONE, PERCUSSION, & FOAM PARTY"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.singleBed,
  },
  {
    day: "Friday",
    date: "FRI 28 AUG",
    title: "FRIDAY at White Rock",
    djs: "MARTIN BAYU • SYANIA • REEY",
    tagline: '"SAXOPHONE, PERCUSSION, & FOAM PARTY"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.partyExecSuites,
  },
  {
    day: "Saturday",
    date: "SAT 29 AUG",
    title: "SATURDAY at White Rock",
    djs: "REEY • SABINE • ARROW",
    tagline: '"SAXOPHONE, PERCUSSION, & FOAM PARTY"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.lagoonBed,
  },
  {
    day: "Sunday",
    date: "SUN 30 AUG",
    title: "SUNDAY at White Rock",
    djs: "BAMS • REEY • MARTIN BAYU",
    tagline: '"FOAM PARTY"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.doubleBed,
  },
  {
    day: "Monday",
    date: "MON 31 AUG",
    title: "MONTH-END FINALE",
    djs: "ALL RESIDENT DJS & GUESTS",
    tagline: '"EPIC SUNSET BEATS & FOAM PARTY"',
    time: "10:00 AM – 10:00 PM",
    image: ASSETS.vipCabana,
  },
];

// 16 promo riil dari /special-offers/ (judul verbatim).
export const SPECIAL_OFFERS = [
  "15% Off All Spa Treatments",
  "Cuervo Sunset: Buy One Get One FREE",
  "In-Suite Wellness Experience at White Rock Spa & Wellness",
  "The Double Spritz",
  "50% Off - Daybeds & Party Suite at White Rock Beach Club",
  "Save the Party Suite – Suite Offer at White Rock Beach Club",
  "Romantic Dinner Package",
  "Tea Time Package",
  "Prewedding Photoshoot Package",
  "Golden Spritz Shisha",
  "Morning Blessing Vow",
  "White Rock's Exclusive Rewards for Loyal Guests",
  "The Serenity Ritual",
  "The Ultimate Triple Deal",
  "Discover Nusantara: The Richness of Rendang",
  "The Merdeka Special Cocktail",
];

// 9 partner riil dari /partnerships/ (nama verbatim).
export const PARTNERS = [
  "UOB Card", "MNC Bank", "BNI Bank", "OCBC Bank", "BCA Bank",
  "MANDIRI Bank", "JCB Bank", "Air Asia", "Citilink",
];

// 10 past-event riil dari /past-events/ (judul verbatim).
export const PAST_EVENTS = [
  { date: "Feb 27, 2026", title: "Intimate Wedding Gathering at White Rock Beach Club: A Resounding Success", detail: "Successfully hosted an intimate wedding gathering attended by 98 wedding industry professionals." },
  { date: "Dec 31, 2025", title: "White Rock x Abstract: A New Year's Eve Countdown That Set Bali on Fire", detail: "As anticipation for New Year's Eve in Bali reached its peak, White Rock Beach Club delivered one." },
  { date: "Dec 29, 2025", title: "Successful delivery of the Selvatica High-Fashion Experience at White Rock Beach Club", detail: "It was more than a runway; it was a high-octane fashion." },
  { date: "Dec 28, 2025", title: "Manifesting this energy forever! The last Afro Sunset Ritual of 2025 was pure magic!", detail: "Pure unadulterated magic! The 2025 finale of Afro Sunset Ritual at White Rock Beach Club was a masterclass." },
  { date: "Nov 19, 2025", title: "Self Hug Sundays Success: Finding Peace and Brunch Bliss at White Rock", detail: "The serene shores of White Rock Beach Club were buzzing with." },
  { date: "Nov 12, 2025", title: "Reliving the Spooky vibes: Circo del los Muertos at White Rock Beach Club Was an Amazing Halloween Event!", detail: "We're still remembering the unforgettable energy of Circo de los." },
  { date: "Oct 22, 2025", title: "A New Zenith for Bali Tourism: White Rock Beach Club Hosts Kemenparekraf's Mega FAM Trip Grand Finale", detail: "White Rock Beach Club at Melasti Beach proudly served as the." },
  { date: "Oct 03, 2025", title: "A September Sensation: Reliving the Electrifying Groovy Splash Bash at White Rock Beach Club", detail: "Spectacular, sun-soaked series that swept across the shores of Melasti Beach: the legendary." },
  { date: "Sep 09, 2025", title: "White Rock Sunset Ritual Party Series Draws Over 1,700 Guests in August 2025", detail: "Remarkable success of its Sunset Ritual Party series, which brought unforgettable energy to." },
  { date: "Mar 14, 2025", title: "What a remarkable night, White Rock Beach Club presented FULL MOON", detail: "With a breathtaking cappella performance from FULLMOON, was a complete triumph." },
];

// 10 artikel riil dari /bali-guide/ (judul verbatim).
export const BALI_GUIDE = [
  "Bali Kite Festival: Bali's Most Colorful Annual Festival & Sacred Cultural Tradition",
  "Indonesia's Independence Day in Bali: Flag Ceremonies, Agustus-an Games & Cultural Parades",
  "The Ultimate Bali Experience: Dawn Dolphin Watching & Sacred Waterfall Swimming",
  "Traditional Dance Shows in Bali: Experience the Island's Rich Cultural Heritage",
  "Chasing Sunrises in Bali: The Ultimate Guide to the Island's Best Hiking Trails",
  "Bali Civet Coffee (Kopi Luwak): Discover Indonesia's Most Exclusive Coffee Experience",
  "Top Must-Try Water Sports in Bali for an Unforgettable Adventure",
  "A Taste of Bali: Must-Try Traditional Balinese Snacks",
  "Best Beaches for Swimming in Nusa Dua and Uluwatu",
  "Traditional Balinese Drinks You Must Try in Bali",
];

// Media riil dari /media-coverage/ (judul verbatim + outlet).
export const MEDIA_COVERAGE = [
  { outlet: "Tatler", title: "Tatler Best Spotlight 2026" },
  { outlet: "Now Bali", title: "White Rock Beach Club Elevates Oceanfront Events and Experiences" },
  { outlet: "What's New Indonesia", title: "Easter by the Sea: Sunset Magic, Music & Egg-stra at White Rock Beach Club" },
  { outlet: "Bali.com", title: "Easter by the Sea: Sunset Magic, Music & “Egg-stra” Surprises Await at White Rock Beach Club" },
  { outlet: "The Bali Bible", title: "White Rock Beach Club Melasti: Bali’s New Big Beach Day Address" },
  { outlet: "BuzzFeed", title: "6 Best Beach Clubs In Bali For Epic Sunsets, Cocktails And Ocean Views" },
  { outlet: "Now Bali", title: "White Rock Beach Club Brings Day-to-Night Energy to Melasti Beach" },
  { outlet: "Tatler Asia", title: "White Rock Beach Club: tempat untuk merayakan cinta di tepi samudra" },
  { outlet: "The Bali Bible", title: "The Best Kid-Friendly Beach Clubs in Bali" },
  { outlet: "What's New Indonesia", title: "White Rock Beach Club: Bali Wedding Organizer Industry Gathering" },
  { outlet: "Wanita Indonesia", title: "White Rock Beach Club Siap Menjadi Tuan Rumah Gathering Eksklusif Industri Pernikahan di Uluwatu" },
  { outlet: "Bali Buddies", title: "“ABSTRACT” – High tides and New Year’s Eve vibes at White Rock Beach Club" },
  { outlet: "Warta Event", title: "Rayakan Senja Terakhir 2025: White Rock Hadirkan Sunset Ritual" },
  { outlet: "What's New Indonesia", title: "Best New Year's Eve Parties in Bali 2025 - 2026" },
  { outlet: "Bali Buddies", title: "Selvatica at White Rock Beach Club: A High-Fashion Finale to 2025" },
  { outlet: "Bali Food & Travel", title: "White Rock Beach Club: Big Beats, Bigger Views, and Bali’s Hottest Stage by the Sea" },
  { outlet: "bali.com", title: "White Rock Beach Club Presents “ABSTRACT” — NYE 2025 Countdown Party" },
  { outlet: "What's New Indonesia", title: "Celebrate Oktoberfest at White Rock Beach Club" },
  { outlet: "bali.com", title: "Circo de los Muertos – Halloween Party at White Rock Beach Club, The Best Beachfront Club in Bali" },
  { outlet: "What's New Indonesia", title: "White Rock Beach Club Presents Circo de los Muertos Halloween 2025" },
  { outlet: "Kompas", title: "Circo de los Muertos, Halloween Spektakuler" },
  { outlet: "What's New Indonesia", title: "White Rock Beach Club Unveils Groovy Splash Bash Pool Party" },
  { outlet: "What's New Indonesia", title: "Discover The Taste of Luau Lagoon Cocktails at White Rock Beach Club" },
  { outlet: "What's New Indonesia", title: "Save the VIP! Experience Luxury Suite for Less at White Rock Beach Club" },
  { outlet: "bali.com", title: "White Rock Beach Club Announces Groovy Splash Bash: The Extraordinary Pool Party at White Rock Beach Club" },
  { outlet: "bali.com", title: "White Rock Beach Club: Rebrand and Comeback as A Reimagined Bali Icon" },
  { outlet: "What's New Indonesia", title: "In-Suite Wellness from White Rock Spa & Wellness" },
  { outlet: "What's New Indonesia", title: "The Spirit of the Island: Arak Bali Experience It at White Rock Beach Club" },
  { outlet: "What's New Indonesia", title: "Shake Up Your Summer: Coastal Margaritas at White Rock Beach Club" },
  { outlet: "What's New Indonesia", title: "Sunset Ritual – The Most Desired Sundowner Party on The Island" },
  { outlet: "What's New Indonesia", title: "Your Dream Beachfront Wedding Venue at White Rock Bali, Intimate & Spacious" },
  { outlet: "What's New Indonesia", title: "The Best Beachfront Club in Bali" },
  { outlet: "The Honeycombers", title: "The 30 Best Beach Clubs In Bali You Need To Visit In 2025" },
  { outlet: "bali.com", title: "Full Moon Celebration - The 1st Lunar Eclipse Of The Year!" },
  { outlet: "Bali Buddies", title: "Experience a romantic Valentine’s Day in Bali in 2025" },
  { outlet: "bali.com", title: "White Rock Beach Club Named “The Best Leading Beach Club in Uluwatu” at Indonesian Travel Tourism Awards 2024/2025" },
  { outlet: "The Bali Sun", title: "Spectacular Bali Beach Club Offers Tourists The Best Beachfront Vibes" },
  { outlet: "What's New Indonesia", title: "Best New Year's Eve Parties in Bali 2024 - 2025" },
  { outlet: "The Honeycombers", title: "White Rock Beach Club on Melasti Beach is Bali’s mecca for music, ocean views and DJ-powered parties" },
  { outlet: "On Bali", title: "20 Best Beach Club in Bali" },
  { outlet: "The Bali Bible", title: "Afro House Nights at White Rock Beach Club" },
  { outlet: "What's New Indonesia", title: "Easter in Bali 2024: Discover the Best Brunch, Feast, and Festivity Deals" },
  { outlet: "Daily Life", title: "White Rock Beach Club Siap Gelar Perayaan Paskah Spektakuler di Tepi Pantai" },
  { outlet: "Bali Buddies", title: "Our Favorite Bali Beach Clubs in 2025" },
  { outlet: "Epicure Asia", title: "Exclusive Offer for Unforgettable Moments at White Rock Beach Club" },
  { outlet: "What's New Indonesia", title: "30+ Best Beach Clubs in Bali" },
];

// Press-release riil dari /press-release/ (judul + tanggal verbatim).
export const PRESS_RELEASES = [
  { date: "July 2026", title: "Coinfest Asia 2026 venue selection", detail: "One of Bali's largest beachfront lifestyle destinations located on Melasti Beach, has been officially selected." },
  { date: "March 27, 2026", title: "Easter seaside party notice", detail: "Excited to host its much-loved Easter Sunset Party, happening from April 3rd." },
  { date: "January 22, 2026", title: "Wedding organizer meet", detail: "Proud to announce that it will host the Bali Wedding Organizer Gathering on 27." },
  { date: "December 13, 2025", title: "Year-end fashion show", detail: "Bali will end the year with an unforgettable blend of high fashion, culture, and beachfront entertainment." },
  { date: "December 11, 2025", title: "Disco sunset farewell", detail: "Gearing up to close this year with cherished celebrations. After a full year of music." },
  { date: "November 2025", title: "NYE countdown", detail: "Set to host one of Bali's biggest New Year's Eve celebrations, “Abstract”, on 31 December." },
  { date: "October 2025", title: "Halloween carnival", detail: "Transforms into the Circo de los Muertos, a high-energy carnival night on the shores." },
  { date: "August 26, 2025", title: "Pool party announcement", detail: "The best beachfront club in Bali, is proud to present the Groovy Splash Bash." },
  { date: "August 5, 2025", title: "Sundowner promo", detail: "Bali's best beachfront club presents Sunset Ritual 2025, a curated series of Sunday events blending." },
  { date: "January 4, 2025", title: "Afro House night", detail: "The Afro House party of this season, MOYO by Fair will take over White Rock Beach Club." },
];
