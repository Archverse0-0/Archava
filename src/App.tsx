import { useEffect, useState, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LangProvider } from "@/lib/i18n";
import { useLang } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LiveKitWidget from "@/components/ai_avatar/LiveKitWidget";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const DaybedsSuites = lazy(() => import("./pages/DaybedsSuites"));
const Dining = lazy(() => import("./pages/Dining"));
const Experiences = lazy(() => import("./pages/Experiences"));
const WeddingsMice = lazy(() => import("./pages/WeddingsMice"));
const Mice = lazy(() => import("./pages/Mice"));
const Wedding = lazy(() => import("./pages/Wedding"));
const Events = lazy(() => import("./pages/Events"));
const Merch = lazy(() => import("./pages/Merch"));
const LiveWeather = lazy(() => import("./pages/LiveWeather"));
const Contact = lazy(() => import("./pages/Contact"));
const NYE = lazy(() => import("./pages/NYE"));
const Faq = lazy(() => import("./pages/Faq"));
const Careers = lazy(() => import("./pages/Careers"));
const SpaWellness = lazy(() => import("./pages/SpaWellness"));
const Booking = lazy(() => import("./pages/Booking"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const StaffCheckIn = lazy(() => import("./pages/StaffCheckIn"));
const Entertainment = lazy(() => import("./pages/Entertainment"));
const SpecialOffers = lazy(() => import("./pages/SpecialOffers"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const PastEvents = lazy(() => import("./pages/PastEvents"));
const BaliGuide = lazy(() => import("./pages/BaliGuide"));
const MediaCoverage = lazy(() => import("./pages/MediaCoverage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-slate-400">
      <div className="h-12 w-12 border-4 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
      <p className="font-cinzel text-sm uppercase tracking-wider">Loading...</p>
    </div>
  </div>
);

const FloatingConcierge = ({ onOpen }: { onOpen: () => void }) => {
  const { tf } = useLang();
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        variant="luxury"
        size="lg"
        onClick={onOpen}
        className="rounded-full shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-3 px-6 py-4 gold-gradient text-[hsl(222_47%_8%)] font-bold border border-amber-300/40"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-semibold tracking-wide text-xs sm:text-sm">
          {tf({ id: "Ngobrol sama Ava", en: "Talk to Ava", ru: "Поговорить с Авой", ko: "에이바와 대화하기" })}
        </span>
      </Button>
    </div>
  );
};

const GlobalLayout = () => {
  const [showSupport, setShowSupport] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const open = () => setShowSupport(true);
    window.addEventListener("open-ava", open as EventListener);
    return () => window.removeEventListener("open-ava", open as EventListener);
  }, []);

  // Scroll to hash target on route/hash change (React Router v6 doesn't auto-scroll)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      // wait a frame for the target page to mount
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-[hsl(222_47%_9%)] relative">
      {/* Global Luxury Film Grain Noise Overlay (3.5% Opacity) */}
      <div
        className="fixed inset-0 pointer-events-none z-30 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <Navbar />

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/daybeds-suites" element={<DaybedsSuites />} />
            <Route path="/dining" element={<Dining />} />
            <Route path="/menu" element={<Dining />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/spa-wellness" element={<SpaWellness />} />
            <Route path="/weddings-mice" element={<WeddingsMice />} />
            <Route path="/mice-wedding" element={<WeddingsMice />} />
            <Route path="/mice" element={<Mice />} />
            <Route path="/wedding" element={<Wedding />} />
            <Route path="/events" element={<Events />} />
            <Route path="/merch" element={<Merch />} />
            <Route path="/live-weather" element={<LiveWeather />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/nye" element={<NYE />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/entertainment" element={<Entertainment />} />
            <Route path="/special-offers" element={<SpecialOffers />} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/past-events" element={<PastEvents />} />
            <Route path="/bali-guide" element={<BaliGuide />} />
            <Route path="/media-coverage" element={<MediaCoverage />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/bookingconfirmation" element={<BookingConfirmation />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/staff-checkin" element={<StaffCheckIn />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <FloatingConcierge onOpen={() => setShowSupport(true)} />

      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 md:p-6 pointer-events-none">
          <div className="pointer-events-auto">
            <LiveKitWidget setShowSupport={setShowSupport} />
          </div>
        </div>
      )}
    </div>
  );
};

// NOTE: there is deliberately no QueryClientProvider here. `main.tsx` already
// creates the QueryClient and wraps <App /> in one, so a second provider in
// this file would create a second, isolated cache: two components asking for
// the same query would each get their own copy, and a mutation invalidating
// one cache would not refetch the other. Providers belong at the entry point.
const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <LangProvider>
        <GlobalLayout />
      </LangProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
