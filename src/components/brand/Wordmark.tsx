import { cn } from "@/lib/utils";
import { Mark } from "./Mark";

/**
 * The talaqa.ai lockup, identical on every locale: the mark in a graphite
 * tile, then "talaqa", the aqua action dot, and "ai". Always set LTR in Geist,
 * even inside the Arabic page.
 */
export function Wordmark({ className, tile = true }: { className?: string; tile?: boolean }) {
  return (
    <span dir="ltr" lang="en" translate="no" className={cn("inline-flex items-center gap-2.5 text-[1.375rem]", className)}>
      {tile ? (
        <span className="grid size-[1.5em] shrink-0 place-items-center rounded-[0.42em] bg-paper/[0.07] ring-1 ring-white/[0.08] ring-inset">
          <Mark className="h-[0.62em] w-auto text-paper" />
        </span>
      ) : null}
      <DomainName />
    </span>
  );
}

/**
 * "talaqa.ai" set as type, with the period drawn as the brand's aqua dot.
 * The dot's margins are optical, not equal: the wordmark's tight tracking pulls
 * the last "a" of "talaqa" into the dot, while "ai" starts with its own side
 * bearing — so more space before the dot and less after gives equal ink gaps.
 */
export function DomainName({ className, dimClassName = "text-mist-300" }: { className?: string; dimClassName?: string }) {
  return (
    <span dir="ltr" lang="en" translate="no" className={cn("wordmark inline-flex items-baseline whitespace-nowrap", className)}>
      talaqa
      <span aria-hidden="true" className="ms-[0.12em] me-[0.02em] inline-block size-[0.2em] translate-y-[-0.02em] rounded-full bg-aqua" />
      <span className="sr-only">.</span>
      <span className={cn("font-medium", dimClassName)}>ai</span>
    </span>
  );
}
