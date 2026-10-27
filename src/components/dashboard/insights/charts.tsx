import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
 * Small charts drawn in HTML so they follow the page's direction (time runs
 * with the reading direction in Arabic and English) and its type. Square
 * columns, three to five faint gridlines, no y-axis line, round ticks above
 * the maximum, one hue on the data that matters.
 */

/** A round top for the axis and its step, so ticks land on even values. */
export function niceScale(max: number): { top: number; step: number } {
  if (max <= 0) return { top: 4, step: 1 };
  // Three to five gridlines; take whichever puts the top closest above the maximum.
  let best = { top: Infinity, step: 1 };
  for (const ticks of [4, 5, 3]) {
    const raw = max / ticks;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s * ticks >= max) ?? 10 * mag;
    if (step * ticks < best.top && Number.isInteger(step)) best = { top: step * ticks, step };
  }
  return best;
}

export interface Column {
  key: string;
  /** Shown under the column when `showLabel` says so. */
  label: string;
  /** Bottom to top. */
  parts: Array<{ value: number; className: string }>;
  title: string;
  showLabel?: boolean;
}

export function ColumnChart({ columns, height = 200, gap = 4, axisLabel }: { columns: Column[]; height?: number; gap?: number; axisLabel?: ReactNode }) {
  const max = Math.max(...columns.map((c) => c.parts.reduce((s, p) => s + p.value, 0)));
  const { top, step } = niceScale(max);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);

  return (
    <div>
      <div className="flex">
        <div className="relative w-9 shrink-0" style={{ height }} aria-hidden="true">
          {ticks.map((v) => (
            <span key={v} className="tabular absolute start-0 -translate-y-1/2 text-[0.6875rem] text-mist-400" style={{ top: height - (v / top) * height }}>
              {v}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1" style={{ height }}>
          {ticks.map((v) => (
            <span
              key={v}
              aria-hidden="true"
              className={cn("absolute inset-x-0 h-px", v === 0 ? "bg-white/[0.16]" : "bg-white/[0.05]")}
              style={{ top: height - (v / top) * height }}
            />
          ))}
          <ul className="absolute inset-0 flex items-end" style={{ gap }}>
            {columns.map((c) => (
              <li key={c.key} title={c.title} className="flex h-full min-w-0 flex-1 flex-col-reverse">
                <span className="sr-only">{c.title}</span>
                {c.parts.map((p, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={cn("block w-full", p.className, i > 0 && "border-b-2 border-b-ink-850")}
                    style={{ height: (p.value / top) * height }}
                  />
                ))}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ms-9 mt-2 flex" style={{ gap }} aria-hidden="true">
        {columns.map((c) => (
          <span key={c.key} className="tabular min-w-0 flex-1 overflow-visible text-center text-[0.6875rem] whitespace-nowrap text-mist-400">
            {c.showLabel ? c.label : ""}
          </span>
        ))}
      </div>
      {axisLabel ? <div className="ms-9 mt-1">{axisLabel}</div> : null}
    </div>
  );
}

/** Parts of a whole as one bar with 2px seams. */
export function ShareBar({ parts }: { parts: Array<{ value: number; className: string; label: string }> }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
      {parts.map((p) => (p.value > 0 ? <span key={p.label} className={p.className} style={{ width: `${(p.value / total) * 100}%` }} /> : null))}
    </div>
  );
}

export function Swatch({ className }: { className: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-2.5 flex-none rounded-[3px]", className)} />;
}
