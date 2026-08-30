import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LangProvider } from "@/lib/i18n";
import { useLang } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LiveKitWidget from "@/components/ai_avatar/LiveKitWidget";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

import Index from "./pages/Index";
import DaybedsSuites from "./pages/DaybedsSuites";
import Dining from "./pages/Dining";
import Experiences from "./pages/Experiences";
import WeddingsMice from "./pages/WeddingsMice";
import Mice from "./pages/Mice";
import Wedding from "./pages/Wedding";
import Events from "./pages/Events";
import Merch from "./pages/Merch";
import LiveWeather from "./pages/LiveWeather";
import Contact from "./pages/Contact";
import NYE from "./pages/NYE";
import Faq from "./pages/Faq";
import Careers from "./pages/Careers";
import SpaWellness from "./pages/SpaWellness";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import StaffCheckIn from "./pages/StaffCheckIn";
import Entertainment from "./pages/Entertainment";
import SpecialOffers from "./pages/SpecialOffers";
import Partnerships from "./pages/Partnerships";
import PastEvents from "./pages/PastEvents";
import BaliGuide from "./pages/BaliGuide";
import MediaCoverage from "./pages/MediaCoverage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/daybeds-suites" element={<Index />} />
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LangProvider>
          <GlobalLayout />
        </LangProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
