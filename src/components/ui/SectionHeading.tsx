import { ReactNode } from "react";
import { clsx } from "clsx";
import { Reveal } from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  light,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={clsx(
        "mb-12 md:mb-16",
        align === "center" ? "text-center mx-auto max-w-3xl" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <span
          className={clsx(
            "inline-block text-xs font-semibold uppercase tracking-[0.3em] mb-4",
            light ? "text-amber-300/90" : "text-amber-200/90"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={clsx(
          "font-cinzel font-bold tracking-wide leading-tight",
          "text-3xl md:text-5xl",
          light ? "text-white" : "text-slate-50"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={clsx(
            "mt-5 text-base md:text-lg font-light leading-relaxed",
            light ? "text-slate-200/80" : "text-slate-300/80"
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
