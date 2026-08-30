import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { useLang } from "@/lib/i18n";
import { CONTACT, SPA_TREATMENTS } from "@/data/whiterock";
import {
  Clock,
  Sparkles,
  Phone,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const SPA_SLIDES = [
  { id: 1, src: "/assets/whiterock/spa-1.jpg", alt: "White Rock Spa Essential Oils" },
  { id: 2, src: "/assets/whiterock/spa-2.jpg", alt: "White Rock Spa Suite Bed" },
  { id: 3, src: "/assets/whiterock/spa-3.jpg", alt: "White Rock Spa Amenities & Slippers" },
  { id: 4, src: "/assets/whiterock/spa-4.jpg", alt: "White Rock Spa Salt Bowl Therapy" },
  { id: 5, src: "/assets/whiterock/spa-5.jpg", alt: "White Rock Spa Treatment Room" },
  { id: 6, src: "/assets/whiterock/spa-6.jpg", alt: "White Rock Spa Botanical Bath" },
  { id: 7, src: "/assets/whiterock/spa-hero.jpg", alt: "White Rock Spa Cliffside Suite" },
  { id: 8, src: "/assets/whiterock/spa-room.jpg", alt: "White Rock Spa Inner Sanctuary" },
  { id: 9, src: "/assets/whiterock/spa-treatment.jpg", alt: "White Rock Signature Spa Therapy" },
  { id: 10, src: "/assets/whiterock/spa-daybed.jpg", alt: "White Rock Spa Relaxing Daybed" },
];

export default function SpaWellness() {
  const { tf, onRequest } = useLang();
  const navigate = useNavigate();

  // Carousel Index State & Hover Control
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nationality: "Indonesia",
    phone: "",
    totalGuests: "1",
    treatmentDate: "",
    treatmentTime: "11:00",
    treatmentChoice: "",
    orderNotes: "",
  });

  // Autoplay carousel slider every 3 seconds (Infinite Seamless Loop)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SPA_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SPA_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SPA_SLIDES.length) % SPA_SLIDES.length);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.phone) {
      toast.error("Please fill in your name and phone number");
      return;
    }
    toast.success("Spa reservation submitted! Redirecting to WhatsApp...");
    const msg = `Hi White Rock Spa, I'd like to book a treatment:\nName: ${formData.firstName} ${formData.lastName}\nPhone: ${formData.phone}\nGuests: ${formData.totalGuests}\nDate: ${formData.treatmentDate}\nTime: ${formData.treatmentTime}\nTreatment: ${formData.treatmentChoice || "General Inquiry"}\nNotes: ${formData.orderNotes}`;
    window.open(`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Create an extended array for infinite visual buffer (3x duplication)
  const EXTENDED_SLIDES = [...SPA_SLIDES, ...SPA_SLIDES, ...SPA_SLIDES];

  return (
    <div className="bg-[hsl(222_47%_9%)] min-h-screen text-slate-100">
      {/* 1:1 Page Hero for Spa & Wellness */}
      <PageHero
        bgImage="/assets/whiterock/spa-1.jpg"
        eyebrow="WELLNESS & REJUVENATION"
        title="WHITE ROCK SPA & WELLNESS"
        subtitle="Perched gracefully at the cliff's edge with sweeping views over the magnificent expanse of Melasti Beach, White Rock Spa & Wellness provides an exquisite sanctuary for deep rejuvenation. Let the ocean's gentle cadence soothe your senses as you embark on an unparalleled journey toward absolute tranquility, transformative beauty, and perfect mind-body harmony."
        height="tall"
      >
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6">
          <a href="#spareservation">
            <Button
              variant="luxury"
              size="md"
              className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-2" /> BOOK YOUR TREATMENT
            </Button>
          </a>
          <a
            href="https://whiterockbali.com/spamenu/"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              variant="hero"
              size="md"
              className="rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider border-amber-400/30 text-amber-300 hover:bg-amber-400 hover:text-slate-950 transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 mr-2" /> SPA MENUS <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
            </Button>
          </a>
        </div>
      </PageHero>

      {/* 1:1 Infinite Carousel Photo Slider */}
      <section
        className="py-12 px-0 bg-slate-950 relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative max-w-[1400px] mx-auto px-4">
          {/* Carousel Arrows */}
          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 focus:outline-none"
          >
            <ChevronLeft className="h-6 w-6 stroke-[3]" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 h-12 w-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 focus:outline-none"
          >
            <ChevronRight className="h-6 w-6 stroke-[3]" />
          </button>

          {/* Slider Content Track with Infinite Extended Buffer */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentSlide * (100 / (window.innerWidth >= 1024 ? 3.2 : 1.1))}%)`,
              }}
            >
              {EXTENDED_SLIDES.map((slide, idx) => (
                <div
                  key={`${slide.id}-${idx}`}
                  className="w-full lg:w-1/3 shrink-0 px-2.5"
                >
                  <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden group shadow-lg border border-white/10">
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform transform-gpu"
                      style={{ backfaceVisibility: "hidden" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 1:1 BOOK Your Treatment Form Section */}
      <section className="py-20 px-5 md:px-8 bg-slate-900/40 border-t border-white/10" id="spareservation">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-4xl md:text-5xl tracking-wide">
              <span className="font-bold text-white">BOOK </span>
              <span className="italic font-normal text-amber-300 font-serif">Your Treatment</span>
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-[0.25em] mt-3">
              DAILY 11:00 AM – 20:00 PM • CLIFFSIDE MELASTI BEACH SANCTUARY
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Row 1: Name */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Contact & Guests */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nationality <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                >
                  <option value="Indonesia">Indonesia</option>
                  <option value="Australia">Australia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Other">Other International</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Phone / WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+62 812-xxxx-xxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Row 3: Date, Time & Treatment */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Total Guest <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.totalGuests}
                  onChange={(e) => setFormData({ ...formData, totalGuests: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Treatment Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.treatmentDate}
                  onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Treatment Time <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.treatmentTime}
                  onChange={(e) => setFormData({ ...formData, treatmentTime: e.target.value })}
                  className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
                >
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">13:00 PM</option>
                  <option value="14:00">14:00 PM</option>
                  <option value="15:00">15:00 PM</option>
                  <option value="16:00">16:00 PM</option>
                  <option value="17:00">17:00 PM</option>
                  <option value="18:00">18:00 PM</option>
                  <option value="19:00">19:00 PM</option>
                </select>
              </div>
            </div>

            {/* Row 4: Treatment Choice */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                What is your treatment choice?
              </label>
              <select
                value={formData.treatmentChoice}
                onChange={(e) => setFormData({ ...formData, treatmentChoice: e.target.value })}
                className="w-full bg-slate-950/80 border-b border-white/20 focus:border-amber-400 text-white px-4 py-3 text-sm focus:outline-none transition-colors"
              >
                <option value="">-- Select Treatment --</option>
                {SPA_TREATMENTS.map((t, idx) => (
                  <option key={idx} value={t.name.en}>
                    {t.name.en} ({t.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 5: Total Price & Order Notes */}
            <div className="pt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Total Treatment Price</div>
                <div className="text-xl font-bold font-cinzel text-amber-300">IDR0.00</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Order Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Special requests or health considerations..."
                  value={formData.orderNotes}
                  onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/20 rounded-lg focus:border-amber-400 text-white p-3 text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Bar with 1:1 Blue Submit Button & Consent Disclaimer */}
            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <button
                type="submit"
                className="bg-[#2f80ed] hover:bg-[#1a66cc] text-white font-semibold text-sm px-8 py-3 rounded-md shadow-lg transition-colors duration-200 shrink-0"
              >
                Submit
              </button>

              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                By submitting this form, you consent to share your personal information with us to service your request and for communication purposes. We do not sell your data to third parties.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
