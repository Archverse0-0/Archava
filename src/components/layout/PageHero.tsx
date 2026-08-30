import { ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import { ASSETS } from "@/data/whiterock";
import { cn } from "@/lib/utils";
import { BgVideo } from "@/components/layout/BgVideo";

type PageHeroProps = {
  eyebrow?: { id: string; en: string; ru?: string; ko?: string };
  title: { id: string; en: string; ru?: string; ko?: string };
  subtitle?: { id: string; en: string; ru?: string; ko?: string };
  children?: ReactNode;
  bgImage?: string;
  /** Use the brand bg-video instead of a static image */
  video?: boolean;
  align?: "center" | "left";
  height?: "tall" | "short";
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  bgImage,
  video = true,
  align = "center",
  height = "short",
  className,
}: PageHeroProps) {
  const { tf } = useLang();
  const isCenter = align === "center";

  const renderText = (val?: string | { id: string; en: string; ru?: string; ko?: string }) => {
    if (!val) return null;
    if (typeof val === "string") return val;
    return tf(val);
  };

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden flex items-center pt-28 pb-14 ambient",
        height === "tall" ? "min-h-[42vh]" : "min-h-[30vh]",
        className
      )}
    >
      {/* Background layer */}
      {bgImage ? (
        <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      ) : video ? (
        <BgVideo className="opacity-50" poster={ASSETS.aerial} />
      ) : null}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222_47%_9%/0.65)] via-[hsl(222_47%_9%/0.40)] to-[hsl(222_47%_9%)]" />

      <div
        className={cn(
          "relative z-10 container mx-auto px-5 md:px-8",
          isCenter ? "text-center mx-auto max-w-4xl" : "text-left max-w-3xl"
        )}
      >
        {eyebrow && (
          <span
            className={cn(
              "inline-block text-xs font-semibold uppercase tracking-[0.35em] mb-3",
              "text-amber-300/90"
            )}
          >
            {renderText(eyebrow)}
          </span>
        )}
        <h1
          className={cn(
            "font-cinzel font-bold tracking-wide leading-[1.05]",
            "text-3xl sm:text-5xl md:text-6xl",
            "text-slate-50 text-glow-gold"
          )}
        >
          {renderText(title)}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "mt-4 text-sm md:text-lg font-light leading-relaxed text-slate-200/85",
              isCenter ? "mx-auto max-w-2xl" : ""
            )}
          >
            {renderText(subtitle)}
          </p>
        )}
        {children && <div className={cn("mt-6", isCenter ? "flex justify-center" : "")}>{children}</div>}
      </div>
    </section>
  );
}
