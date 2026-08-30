import { ReactNode } from "react";
import { clsx } from "clsx";

type CategoryHeaderProps = {
  accent: string;
  icon: ReactNode;
  /** tailwind height class, default h-44 */
  height?: string;
  label?: ReactNode;
};

/**
 * Polished gradient header for category/feature cards.
 * The icon sits inside a ringed gold badge with a soft glow so the header
 * reads as an intentional "category" panel rather than an empty placeholder.
 */
export function CategoryHeader({ accent, icon, height = "h-44", label }: CategoryHeaderProps) {
  return (
    <div
      className={clsx(
        "relative grid place-items-center overflow-hidden",
        height,
        "bg-gradient-to-br",
        accent
      )}
    >
      {/* depth + vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,hsl(222_47%_22%/0.45),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />

      {/* ringed gold badge */}
      <div className="relative grid place-items-center h-[4.5rem] w-[4.5rem] rounded-2xl glass-strong border border-amber-300/30 shadow-[0_0_30px_-6px_hsl(45_90%_55%/0.45)]">
        <span className="text-amber-300 drop-shadow-[0_0_10px_hsl(45_90%_55%/0.5)]">{icon}</span>
      </div>

      {label && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-200/90">
          {label}
        </span>
      )}
    </div>
  );
}
