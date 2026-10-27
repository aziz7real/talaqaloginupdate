import type { ReactNode } from "react";
import type { AppointmentStatus, ConversationStatus } from "@/lib/dashboard/types";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/*
 * Dashboard building blocks. Same tokens as the site (graphite, mist, aqua),
 * set for a screen people work in: one ground, panels one tone step up with a
 * faint edge, 14px body, colour only on status and on what Talaqa did.
 */

/** Page canvas: the gutter and the title row every screen shares. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1360px] px-4 pt-6 pb-10 sm:px-6 lg:px-8 lg:pt-8", className)}>{children}</div>;
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] ar:leading-snug ar:tracking-normal">{title}</h1>
        {sub ? <p className="mt-1.5 text-[0.9375rem] text-mist-300 ar:leading-relaxed">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({ children, className, as: Tag = "section", labelledBy }: { children: ReactNode; className?: string; as?: "section" | "div"; labelledBy?: string }) {
  return (
    <Tag aria-labelledby={labelledBy} className={cn("min-w-0 rounded-2xl border border-white/[0.07] bg-ink-850", className)}>
      {children}
    </Tag>
  );
}

export function PanelHeader({ id, title, aside, className }: { id?: string; title: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-12 items-center justify-between gap-4 px-5 pt-4 pb-2", className)}>
      <h2 id={id} className="text-[0.9375rem] font-semibold">
        {title}
      </h2>
      {aside ? <div className="flex shrink-0 items-center gap-3 text-[0.8125rem] text-mist-300">{aside}</div> : null}
    </div>
  );
}

const statusStyle: Record<ConversationStatus, { pill: string; dot: string }> = {
  handover: { pill: "bg-wait/[0.12] text-wait", dot: "bg-wait" },
  team: { pill: "bg-white/[0.08] text-paper", dot: "bg-paper/80" },
  talaqa: { pill: "bg-aqua/[0.1] text-aqua", dot: "bg-aqua" },
  resolved: { pill: "bg-white/[0.04] text-mist-300", dot: "border border-mist-400 bg-transparent" },
};

export function StatusPill({ status, label, className }: { status: ConversationStatus; label: string; className?: string }) {
  const s = statusStyle[status];
  return (
    <span className={cn("inline-flex h-6 flex-none items-center gap-1.5 rounded-full px-2.5 text-[0.75rem] leading-none font-medium whitespace-nowrap", s.pill, className)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", s.dot)} />
      {label}
    </span>
  );
}

export function StatusDot({ status, className }: { status: ConversationStatus; className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2 flex-none rounded-full", statusStyle[status].dot, className)} />;
}

export function AppointmentStatusTag({ status, label }: { status: AppointmentStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 flex-none items-center rounded-full px-2.5 text-[0.75rem] leading-none font-medium whitespace-nowrap",
        status === "confirmed" && "bg-white/[0.07] text-paper",
        status === "completed" && "text-mist-300",
        status === "cancelled" && "text-mist-400 line-through decoration-mist-400/60",
        status === "no_show" && "bg-alert/[0.12] text-alert",
      )}
    >
      {label}
    </span>
  );
}

/**
 * A person as themselves: a stable initial on a pale tint of their own hue.
 * Hues are spread around the wheel and skip aqua (Talaqa's) and violet.
 */
const hues = [32, 205, 350, 95, 15, 180, 55, 225, 130, 330];

export function Avatar({ name, seed, size = "md", className }: { name: string; seed: string; size?: "sm" | "md" | "lg"; className?: string }) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = hues[h % hues.length];
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid flex-none place-items-center rounded-full font-semibold",
        size === "sm" && "size-7 text-[0.75rem]",
        size === "md" && "size-9 text-[0.875rem]",
        size === "lg" && "size-12 text-[1.05rem]",
        className,
      )}
      style={{ backgroundColor: `hsl(${hue} 32% 20%)`, color: `hsl(${hue} 70% 80%)` }}
    >
      {initial}
    </span>
  );
}

/** Headline figures as one divided strip: label over value, no tiles, no icons. */
export function KpiStrip({ items, className }: { items: Array<{ label: string; value: ReactNode; detail?: ReactNode; tone?: "wait" }>; className?: string }) {
  return (
    <Panel as="div" className={cn("grid grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "min-w-0 px-5 py-4",
            // Dividers: between columns, and between the two rows on phones.
            i % 2 === 1 && "border-s border-white/[0.07]",
            i >= 2 && "border-t border-white/[0.07] lg:border-t-0",
            i === 2 && "lg:border-s",
          )}
        >
          <p className="text-[0.8125rem] text-mist-300">{item.label}</p>
          <p className={cn("tabular mt-1.5 text-[1.625rem] leading-none font-medium tracking-[-0.02em]", item.tone === "wait" && "text-wait")}>
            {item.value}
          </p>
          {item.detail ? <p className="mt-2 text-[0.8125rem] text-mist-400">{item.detail}</p> : null}
        </div>
      ))}
    </Panel>
  );
}

/** The dashboard's one filled action, and its quiet siblings. Buttons, not links. */
export function actionClass(variant: "primary" | "secondary" | "ghost" = "secondary", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap",
    "transition-[background-color,color,transform] duration-[var(--dur-quick)] ease-out active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
    size === "sm" ? "h-8 px-3.5 text-[0.8125rem]" : "h-9 px-4 text-[0.875rem]",
    variant === "primary" && "bg-paper text-ink-900 hover:bg-white",
    variant === "secondary" && "bg-white/[0.07] text-paper hover:bg-white/[0.12]",
    variant === "ghost" && "text-mist-200 hover:bg-white/[0.06] hover:text-paper",
  );
}

/** A segmented control: one track, the active option filled. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: Array<{ value: T; label: ReactNode }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex h-9 items-center rounded-full bg-white/[0.05] p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-7 rounded-full px-3 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-[var(--dur-quick)]",
            o.value === value ? "bg-ink-600 text-paper" : "text-mist-300 hover:text-paper",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** The thread, sized for lists: what Talaqa did, on the aqua line. */
export function ActionNode({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("grid size-4 flex-none place-items-center rounded-full bg-aqua text-ink-900", className)}>
      <CheckIcon className="size-2.5" />
    </span>
  );
}

export function SampleTag({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 flex-none items-center rounded-full border border-white/[0.12] px-2 text-[0.6875rem] leading-none font-medium whitespace-nowrap text-mist-200", className)}>
      {label}
    </span>
  );
}
