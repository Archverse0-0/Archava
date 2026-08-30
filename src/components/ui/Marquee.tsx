import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
};

/** Infinite horizontal scroll strip. Duplicates children for a seamless loop. */
export function Marquee({ children, className, reverse }: MarqueeProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee gap-12 will-change-transform"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        <div className="flex gap-12 items-center">{children}</div>
        <div className="flex gap-12 items-center" aria-hidden>
          {children}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[hsl(222_47%_9%)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[hsl(222_47%_9%)] to-transparent" />
    </div>
  );
}
