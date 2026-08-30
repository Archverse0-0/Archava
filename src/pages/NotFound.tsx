import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { ASSETS } from "@/data/whiterock";

const NotFound = () => {
  const location = useLocation();
  const { tf } = useLang();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222_47%_9%)] ambient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222_47%_6%/0.6)] to-[hsl(222_47%_9%)]" />
      <div className="relative z-10 text-center px-6">
        <p className="font-cinzel text-8xl md:text-9xl font-bold text-glow-gold mb-2">404</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">
          {tf({ id: "Halaman tidak ditemukan", en: "Page not found", ru: "Страница не найдена", ko: "페이지를 찾을 수 없습니다" })}
        </h1>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          {tf({ id: "Sepertinya kamu tersesat di tebing Melasti. Ayo balik ke pantai.", en: "Looks like you wandered off the Melasti cliffs. Let's get you back to the beach.", ru: "Кажется, вы заблудились на скалах Melasti. Давайте вернёмся на пляж.", ko: "Melasti 절벽에서 길을 잃으신 것 같네요. 다시 해변으로 돌아가 볼까요." })}
        </p>
        <Button variant="luxury" size="lg" onClick={() => (window.location.href = "/")} className="rounded-full px-8">
          {tf({ id: "Kembali ke Home", en: "Return to Home", ru: "Вернуться на главную", ko: "홈으로 돌아가기" })}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
