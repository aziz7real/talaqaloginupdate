import { cn } from "@/lib/utils";

/* Outline icons for the dashboard, drawn on the site's 20px grid with a lighter stroke for small sizes. */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function OverviewIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-[18px]", className)}>
      <rect x="3" y="3" width="6" height="8" rx="1.6" />
      <rect x="11" y="3" width="6" height="5" rx="1.6" />
      <rect x="3" y="13" width="6" height="4" rx="1.6" />
      <rect x="11" y="10" width="6" height="7" rx="1.6" />
    </svg>
  );
}

export function InboxIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-[18px]", className)}>
      <path d="M4 15.5V6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v5a2.5 2.5 0 0 1-2.5 2.5H8L4 16.5v-1Z" />
      <path d="M7.5 8h5M7.5 10.5h3" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-[18px]", className)}>
      <rect x="3" y="4.5" width="14" height="12" rx="2.2" />
      <path d="M3 8.5h14M7 3v3M13 3v3" />
    </svg>
  );
}

export function InsightsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-[18px]", className)}>
      <path d="M4 16V9M8 16V5M12 16v-5M16 16V7" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-[18px]", className)}>
      <path d="M4 6h7M15 6h1M4 14h1M9 14h7" />
      <circle cx="13" cy="6" r="2" />
      <circle cx="7" cy="14" r="2" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-4", className)}>
      <circle cx="9" cy="9" r="5" />
      <path d="m13 13 3.5 3.5" />
    </svg>
  );
}

/** Points back against the reading direction. */
export function BackIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-5 rtl:-scale-x-100", className)}>
      <path d="M12 4.5 6.5 10l5.5 5.5" />
    </svg>
  );
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-4 rtl:-scale-x-100", className)}>
      <path d="m8 5 5 5-5 5" />
    </svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-4", className)}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 9v4.5M10 6.5v.01" />
    </svg>
  );
}

export function ExternalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-4 rtl:-scale-x-100", className)}>
      <path d="M8 4.5H5.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V12M11 4.5h4.5V9M15.5 4.5 9 11" />
    </svg>
  );
}

export function PanelIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-[18px]", className)}>
      <rect x="3" y="4" width="14" height="12" rx="2.2" />
      <path d="M12.5 4v12" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-4", className)}>
      <rect x="4.5" y="9" width="11" height="8" rx="2" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

export function SendIcon({ className }: IconProps) {
  return (
    <svg {...base} className={cn("size-[18px] rtl:-scale-x-100", className)}>
      <path d="M4 10h9M4 4.5 16 10 4 15.5l2-5.5-2-5.5Z" />
    </svg>
  );
}
