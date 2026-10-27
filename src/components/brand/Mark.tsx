import { cn } from "@/lib/utils";

/**
 * Temporary Talaqa mark: a loose line (conversation) that settles into a
 * straight one and ends in a point (the action done). It is a logo, so it
 * looks identical in Arabic and English — it never mirrors.
 */
export function Mark({ className, dotClassName }: { className?: string; dotClassName?: string }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2.5 12c2.1-5.6 4.3-5.6 6.4 0s4.2 5.2 6.2 0c1.5-3.4 3-3.4 4.4 0H30.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="12" r="3.3" className={cn("fill-aqua", dotClassName)} />
    </svg>
  );
}
