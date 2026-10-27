import { cn } from "@/lib/utils";

type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Points forward in the reading direction. */
export function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} className={cn("size-4 rtl:-scale-x-100", className)}>
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} strokeWidth={2.2} className={cn("size-4", className)}>
      <path d="m5 10.5 3.2 3.2L15 6.8" />
    </svg>
  );
}

export function ReplayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} className={cn("size-4", className)}>
      <path d="M4 10a6 6 0 1 0 1.8-4.3M4 4v3.5h3.5" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} className={cn("size-5", className)}>
      <path d="M3 7h14M3 13h14" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} className={cn("size-5", className)}>
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

/** Marks links that open an email, so the label never over-promises. */
export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} className={cn("size-4", className)}>
      <rect x="3" y="4.5" width="14" height="11" rx="2.5" />
      <path d="m4 6.5 6 4.5 6-4.5" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} className={cn("size-5", className)}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

/** The microphone messaging apps show in an empty composer. */
export function MicIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" {...base} className={cn("size-5", className)}>
      <rect x="7.25" y="2.75" width="5.5" height="9.5" rx="2.75" fill="currentColor" stroke="none" />
      <path d="M4.75 9.5a5.25 5.25 0 0 0 10.5 0M10 14.75v2.5" />
    </svg>
  );
}
