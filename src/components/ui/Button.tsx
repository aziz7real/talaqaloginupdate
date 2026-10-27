import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowIcon, MailIcon } from "./icons";

type Variant = "primary" | "secondary";
type Tone = "dark" | "light";

const styles: Record<Variant, Record<Tone, string>> = {
  primary: {
    dark: "bg-aqua text-ink-900 hover:bg-aqua-300",
    light: "bg-ink-900 text-paper hover:bg-ink-700",
  },
  secondary: {
    dark: "bg-white/[0.07] text-paper hover:bg-white/[0.12]",
    light: "bg-ink-900/[0.06] text-ink-900 hover:bg-ink-900/[0.1]",
  },
};

/**
 * `icon="mail"` is required for mailto links so visitors know a click opens
 * their email app; `icon="arrow"` is for in-page or on-site navigation.
 */
export function Button({
  href,
  children,
  variant = "primary",
  tone = "dark",
  size = "md",
  icon,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  icon?: "arrow" | "mail";
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap",
        "transition-[background-color,transform] duration-[var(--dur-quick)] ease-out active:scale-[0.98]",
        size === "sm" && "h-9 px-4 text-[0.875rem]",
        size === "md" && "h-12 px-6 text-[0.9688rem]",
        size === "lg" && "h-[3.25rem] px-7 text-[1rem]",
        styles[variant][tone],
        className,
      )}
    >
      {icon === "mail" ? <MailIcon className="opacity-80" /> : null}
      {children}
      {icon === "arrow" ? (
        <ArrowIcon className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-quint)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      ) : null}
    </a>
  );
}
