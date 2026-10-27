import type { ReactNode } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/*
 * Talaqa's signature: the thread. Everything Talaqa *does* (as opposed to
 * what it says) sits on a thin aqua line on the reading-start side, with a
 * node per action that fills in when the action completes.
 */

type Tone = "dark" | "light";

/** Consecutive actions share one continuous thread. */
export function ActionThread({ children, tone }: { children: ReactNode; tone: Tone }) {
  return (
    <div className="relative py-0.5">
      <span
        aria-hidden="true"
        className={cn(
          "absolute start-[7px] top-3 bottom-3 w-[2px] rounded-full",
          tone === "dark" ? "bg-aqua/30" : "bg-aqua-700/25",
        )}
      />
      <div className="relative space-y-1.5">{children}</div>
    </div>
  );
}

export function ActionRow({
  text,
  detail,
  done,
  tone,
}: {
  text: string;
  detail?: string;
  done: boolean;
  tone: Tone;
}) {
  const dark = tone === "dark";
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className={cn(
          "mt-[3px] grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-[var(--dur-base)]",
          done
            ? dark
              ? "bg-aqua text-ink-900"
              : "bg-aqua-700 text-paper"
            : dark
              ? "bg-ink-850 ring-2 ring-aqua/60 ring-inset"
              : "bg-paper ring-2 ring-aqua-700/50 ring-inset",
        )}
      >
        {done ? <CheckIcon className="size-2.5" /> : null}
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "rounded-sm text-[0.8125rem] leading-snug font-medium ar:leading-relaxed",
            dark ? "text-mist-200" : "text-ink-900/80",
            !done && "working",
          )}
        >
          {text}
        </p>
        {detail ? (
          <p className={cn("tabular mt-0.5 text-[0.75rem] leading-snug", dark ? "text-mist-400" : "text-dim-500")}>
            {detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}
