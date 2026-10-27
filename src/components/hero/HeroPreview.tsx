"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { m, useInView } from "motion/react";
import { Mark } from "@/components/brand/Mark";
import { ActionRow, ActionThread } from "@/components/flow/Action";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { CheckIcon, ReplayIcon } from "@/components/ui/icons";
import type { Dictionary, PreviewStep } from "@/i18n/types";
import { cn } from "@/lib/utils";

type T = Dictionary["hero"]["preview"];

/** How long each beat takes before it "settles" (typed, completed, delivered). */
function beat(step: PreviewStep) {
  if (step.kind === "customer") return Math.min(1300, 280 + step.text.length * 55);
  if (step.kind === "action") return 680;
  if (step.kind === "talaqa") return 760;
  return 0;
}

/**
 * The hero's example workflow. Plays once when it first scrolls into view,
 * then rests on the finished booking. Clearly labelled as an example.
 */
export function HeroPreview({ t }: { t: T }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { amount: 0.4, once: true });
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  const [settled, setSettled] = useState(0);
  const [cycle, setCycle] = useState(0);
  const total = t.steps.length;
  const hasGloss = t.steps.some((s) => s.kind === "customer" && s.gloss);

  useEffect(() => {
    if (reduce || !seen) return;
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => {
        setShown(0);
        setSettled(0);
      }, 0),
    ];
    let at = 450;
    t.steps.forEach((step, i) => {
      timers.push(setTimeout(() => setShown(i + 1), at));
      at += beat(step);
      timers.push(setTimeout(() => setSettled(i + 1), at));
      at += 300;
    });
    return () => timers.forEach(clearTimeout);
  }, [seen, cycle, reduce, t.steps]);

  const visible = reduce ? total : shown;
  const done = reduce ? total : settled;
  const finished = done === total;

  // Consecutive actions are grouped so they share one thread.
  const blocks: Array<{ key: string; actions?: number[]; index?: number }> = [];
  t.steps.slice(0, visible).forEach((step, i) => {
    const last = blocks[blocks.length - 1];
    if (step.kind === "action" && last?.actions) last.actions.push(i);
    else blocks.push(step.kind === "action" ? { key: `a${i}`, actions: [i] } : { key: `s${i}`, index: i });
  });

  return (
    <figure ref={ref} className="relative">
      <figcaption className="sr-only">{t.caption}</figcaption>
      <div aria-hidden="true" className="overflow-hidden rounded-[26px] bg-ink-850 ring-1 ring-white/[0.06]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper">
              <Mark className="h-2.5 w-auto text-ink-900" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[0.875rem] font-semibold text-paper">{t.business}</p>
              <p className="text-[0.75rem] text-mist-400">{t.channel}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[0.75rem] text-mist-300">{t.label}</span>
        </div>

        {/* Fixed height, anchored to the bottom like a real chat, so nothing shifts as it plays. */}
        <div
          className={cn(
            "relative flex flex-col justify-end gap-2.5 overflow-hidden bg-ink-900/60 px-4 pt-5 pb-5 sm:px-5 [&>*]:shrink-0",
            hasGloss ? "h-[31rem] sm:h-[29rem]" : "h-[28rem] sm:h-[26.5rem]",
          )}
        >
          {blocks.map((block) => {
            if (block.actions) {
              return (
                <Enter key={block.key}>
                  <ActionThread tone="dark">
                    {block.actions.map((i) => {
                      const step = t.steps[i] as Extract<PreviewStep, { kind: "action" }>;
                      return <ActionRow key={i} text={step.text} detail={step.detail} done={i < done} tone="dark" />;
                    })}
                  </ActionThread>
                </Enter>
              );
            }
            const i = block.index!;
            const step = t.steps[i];
            const ready = i < done;
            return <Fragment key={block.key}>{renderStep(step, ready)}</Fragment>;
          })}
        </div>
      </div>

      {/* Pulled out by its own padding so the label lines up with the card edge. */}
      <div className="-me-3 mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setCycle((c) => c + 1)}
          disabled={!finished}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] text-mist-300 transition-[color,background-color,opacity] duration-[var(--dur-quick)] hover:bg-white/[0.06] hover:text-paper disabled:opacity-0"
        >
          <ReplayIcon className="size-3.5" />
          {t.replay}
        </button>
      </div>
    </figure>
  );
}

function renderStep(step: PreviewStep, ready: boolean) {
  if (step.kind === "customer") {
    return (
      <Enter className="flex flex-col items-end">
        <p className="max-w-[85%] rounded-[18px] rounded-ee-[5px] bg-ink-600/80 px-3.5 py-2 text-[0.9375rem] leading-relaxed text-paper">
          <span lang="ar" dir="rtl" className="block">
            {ready ? step.text : <Typed text={step.text} />}
          </span>
        </p>
        {step.gloss ? <p className="mt-1 text-[0.75rem] text-mist-400">{step.gloss}</p> : null}
      </Enter>
    );
  }
  if (step.kind === "talaqa") {
    return (
      <Enter className="flex justify-start">
        {ready ? (
          <p className="max-w-[88%] rounded-[18px] rounded-es-[5px] bg-aqua/[0.09] px-3.5 py-2 text-[0.9375rem] leading-relaxed text-paper ring-1 ring-aqua/20 ar:leading-[1.8]">
            {step.text}
          </p>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-[18px] rounded-es-[5px] bg-aqua/[0.09] px-3.5 py-3 ring-1 ring-aqua/20">
            {[0, 150, 300].map((d) => (
              <span key={d} className="typing-dot size-1.5 rounded-full bg-aqua/70" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        )}
      </Enter>
    );
  }
  if (step.kind === "booked") {
    return (
      <Enter className="max-w-[92%] rounded-[18px] bg-paper p-4 text-ink-900">
        <div className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-aqua">
            <CheckIcon className="size-3 text-ink-900" />
          </span>
          <p className="text-[0.9375rem] font-semibold">{step.title}</p>
        </div>
        <p className="tabular mt-2 text-[1rem] font-semibold tracking-[-0.015em] ar:tracking-normal">{step.detail}</p>
        <p className="mt-1 text-[0.8125rem] text-dim-600">{step.system}</p>
      </Enter>
    );
  }
  return null;
}

function Enter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </m.div>
  );
}

function Typed({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((n) => {
        if (n >= text.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 50);
    return () => clearInterval(id);
  }, [text]);
  return (
    <>
      {text.slice(0, count)}
      <span className="caret" />
    </>
  );
}
