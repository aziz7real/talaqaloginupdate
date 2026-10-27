"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { ActionRow, ActionThread } from "@/components/flow/Action";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";

export function BusinessSwitcher({ t }: { t: Dictionary["personalization"] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const business = t.businesses[active];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const n = t.businesses.length;
    const rtl = document.documentElement.dir === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const back = rtl ? "ArrowRight" : "ArrowLeft";
    let next = active;
    if (event.key === forward) next = (active + 1) % n;
    else if (event.key === back) next = (active - 1 + n) % n;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div data-ui className="rounded-[32px] bg-paper-white p-2 ring-1 ring-ink-900/[0.06]">
      <div className="flex flex-col gap-4 px-4 pt-4 pb-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="text-[1.0625rem] font-semibold tracking-[-0.015em] ar:tracking-normal">{t.same}</p>
        <div
          role="tablist"
          aria-label={t.tablistLabel}
          className="-mx-1 flex gap-1 overflow-x-auto rounded-full bg-ink-900/[0.05] p-1 [scrollbar-width:none]"
        >
          {t.businesses.map((b, i) => {
            const selected = i === active;
            return (
              <button
                key={b.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                id={`biz-tab-${b.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="biz-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={onKeyDown}
                className={cn(
                  "relative min-h-10 shrink-0 rounded-full px-4 py-2 text-[0.9063rem] font-medium whitespace-nowrap transition-colors duration-[var(--dur-base)]",
                  selected ? "text-paper" : "text-ink-900/70 hover:text-ink-900",
                )}
              >
                {selected ? (
                  <m.span
                    layoutId="biz-pill"
                    className="absolute inset-0 rounded-full bg-ink-900"
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
                <span className="relative">{b.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="biz-panel"
        role="tabpanel"
        aria-labelledby={`biz-tab-${business.id}`}
        className="grid gap-2 md:grid-cols-[0.85fr_1.15fr]"
      >
        {/* What this business's customer would write. */}
        <div className="rounded-[24px] bg-paper p-5 sm:p-6">
          <p className="t-label text-dim-600">{t.messageLabel}</p>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={business.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mt-3 inline-block max-w-full rounded-[18px] rounded-ss-[6px] bg-ink-900/[0.07] px-4 py-2.5">
                <span lang="ar" dir="rtl" className="block text-[1.1875rem] leading-[1.7] font-medium">
                  {business.message.text}
                </span>
              </div>
              {business.message.gloss ? (
                <p className="mt-2 text-[0.875rem] text-dim-600">{business.message.gloss}</p>
              ) : null}
              <p className="t-small mt-6 text-dim-600">{business.profile}</p>
            </m.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col rounded-[24px] bg-paper p-5 sm:p-6">
          <p className="t-label text-dim-600">{t.replyLabel}</p>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={business.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 space-y-3"
            >
              {/* The business rule is something Talaqa applies — so it sits on the thread. */}
              <ActionThread tone="light">
                <ActionRow text={business.rule} detail={t.ruleLabel} done tone="light" />
              </ActionThread>
              <p className="rounded-[18px] rounded-es-[6px] bg-ink-900 px-4 py-3.5 text-[1rem] leading-relaxed text-paper ar:leading-[1.9]">
                {business.reply}
              </p>
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
