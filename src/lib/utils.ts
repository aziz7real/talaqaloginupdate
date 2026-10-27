import type { CSSProperties } from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Stagger helper for the CSS motion system (`.rise`, `[data-reveal]`). */
export function delay(ms: number): CSSProperties {
  return { "--d": ms } as CSSProperties;
}

export function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
