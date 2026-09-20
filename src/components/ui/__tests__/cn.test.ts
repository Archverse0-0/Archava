import { cn } from "@/lib/utils";
import { describe, it, expect } from "vitest";

describe("cn (className utility)", () => {
  it("joins class names with spaces", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("handles conditional classes", () => {
    const trueCondition = true;
    const falseCondition = false;
    expect(cn("base", trueCondition && "conditional")).toBe("base conditional");
    expect(cn("base", falseCondition && "conditional")).toBe("base");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("merges tailwind classes correctly (twMerge behavior)", () => {
    // Later classes should override earlier ones for conflicting utilities
    expect(cn("p-2 p-4")).toBe("p-4");
    expect(cn("text-red-500 text-blue-500")).toBe("text-blue-500");
  });

  it("handles objects with boolean values", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });

  it("handles arrays", () => {
    expect(cn(["a", "b", "c"])).toBe("a b c");
  });
});
