"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { Mark } from "@/components/brand/Mark";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { CheckIcon, MicIcon, PlusIcon, ReplayIcon } from "@/components/ui/icons";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";
import type { ChatChoice, ChatMessage, EngineInput } from "./engine/types";

/*
 * A WhatsApp Business conversation (look only — no WhatsApp branding).
 * The visitor plays the customer: their messages are the outgoing green
 * bubbles; the business replies in white. Talaqa's actions appear as
 * centred notices, the way WhatsApp shows system messages, so what is done
 * stays visibly separate from what is said. The visitor answers with the
 * quick replies above the composer; the composer itself is display-only.
 */
const WA = {
  header: "bg-[#008069] text-white",
  wallpaper: "bg-[#EFEAE2]",
  outgoing: "bg-[#D9FDD3]",
  incoming: "bg-white",
  ink: "text-[#111B21]",
  meta: "text-[#667781]",
  accent: "text-[#008069]",
  bar: "bg-[#F0F2F5]",
  shadow: "shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]",
};

const ease = [0.22, 1, 0.36, 1] as const;

const enter = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease },
};

/** Bubbles grow out of their own corner, the way messaging apps pop them in. */
const pop = {
  initial: { opacity: 0, y: 8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, transition: { duration: 0.12 } },
  transition: { duration: 0.3, ease },
};

/** How close to the bottom (px) still counts as "following the conversation". */
const FOLLOW_SLACK = 72;

type Block = { key: string; actions?: ChatMessage[]; message?: ChatMessage; index: number };

/** WhatsApp spacing: tight within one sender's run, wider when the speaker changes. */
function gapBefore(block: Block, prev: Block | undefined) {
  if (!prev) return "mt-3";
  if (block.actions || prev.actions) return "mt-3";
  return block.message!.role === prev.message!.role ? "mt-0.5" : "mt-2.5";
}

export function ChatWidget({
  t,
  messages,
  choices,
  typing,
  busy,
  done,
  onSend,
  onRestart,
}: {
  t: Dictionary["demo"];
  messages: ChatMessage[];
  choices: ChatChoice[];
  typing: boolean;
  busy: boolean;
  done: boolean;
  onSend: (input: EngineInput) => void;
  onRestart: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const reduced = usePrefersReducedMotion();

  // Follow the conversation as it grows (new messages, the quick replies
  // resizing the viewport) — unless the visitor has scrolled up to reread.
  useEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) return;
    const follow = () => {
      if (following.current) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    };
    const observer = new ResizeObserver(follow);
    observer.observe(el);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [reduced]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) following.current = el.scrollHeight - el.scrollTop - el.clientHeight < FOLLOW_SLACK;
  };

  // Answering means the visitor wants to see what happens next.
  const answer = (input: EngineInput) => {
    following.current = true;
    onSend(input);
  };
  const restart = () => {
    following.current = true;
    onRestart();
  };

  // Consecutive actions are grouped into one block of system events.
  const blocks: Block[] = [];
  messages.forEach((message, index) => {
    const last = blocks[blocks.length - 1];
    if (message.role === "action") {
      if (last?.actions) last.actions.push(message);
      else blocks.push({ key: message.id, actions: [message], index });
    } else {
      blocks.push({ key: message.id, message, index });
    }
  });
  const lastBlock = blocks[blocks.length - 1];
  const typingContinues = lastBlock?.message?.role === "assistant";

  return (
    <div
      role="region"
      aria-label={t.widgetLabel}
      data-ui
      className="flex h-[640px] max-h-[82svh] w-full flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_40px_90px_-50px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
    >
      {/* Header */}
      <div className={cn("flex items-center gap-3 px-4 py-3", WA.header)}>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-900 ring-2 ring-white/20">
          <Mark className="h-3 w-auto text-paper" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[0.9688rem] font-semibold">{t.businessName}</p>
          <p className="mt-0.5 truncate text-[0.8125rem] text-white/80" aria-hidden="true">
            {typing ? t.typingShort : t.sampleBadge}
          </p>
        </div>
        <button
          type="button"
          onClick={restart}
          disabled={messages.length === 0}
          aria-label={t.restart}
          title={t.restart}
          className="grid size-9 shrink-0 place-items-center rounded-full text-white/90 transition-colors duration-[var(--dur-quick)] hover:bg-white/10 disabled:opacity-40"
        >
          <ReplayIcon />
        </button>
      </div>

      {/* Conversation */}
      <div
        ref={scroller}
        onScroll={onScroll}
        className={cn(
          // Scrolls like a phone chat: no desktop scrollbar track.
          "flex flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          WA.wallpaper,
        )}
      >
        {/* mt-auto anchors a short conversation to the bottom, next to the replies, like a real chat. */}
        <div ref={content} aria-live="polite" className="mt-auto flex flex-col [&>*]:shrink-0">
          <Notice className="self-center">{t.today}</Notice>

          {blocks.map((block, i) => {
            const gap = gapBefore(block, blocks[i - 1]);
            if (block.actions) {
              return (
                <m.ul key={block.key} {...enter} className={cn("flex flex-col gap-1", gap)}>
                  {block.actions.map((a) => (
                    <SystemEvent key={a.id} text={a.text} done={!!a.done} />
                  ))}
                </m.ul>
              );
            }
            return (
              <Bubble
                key={block.key}
                message={block.message!}
                time={clock(block.index, t.pmSuffix)}
                tail={!gap.endsWith("0.5")}
                className={gap}
              />
            );
          })}

          <AnimatePresence>
            {typing ? (
              <m.div
                key="typing"
                {...pop}
                className={cn("flex origin-bottom-left justify-start rtl:origin-bottom-right", typingContinues ? "mt-0.5" : "mt-2.5")}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3.5 py-3",
                    !typingContinues && "rounded-ss-none",
                    WA.incoming,
                    WA.shadow,
                  )}
                >
                  <span className="sr-only">{t.typing}</span>
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      aria-hidden="true"
                      className="typing-dot size-1.5 rounded-full bg-[#8696A0]"
                      style={{ animationDelay: `${d * 150}ms` }}
                    />
                  ))}
                </span>
              </m.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick replies sit right above the composer; tapping one sends it as the customer. */}
      <div className={cn("relative", WA.wallpaper)}>
        <AnimatePresence initial={false} mode="popLayout">
          {choices.length ? (
            <m.div
              key={choices.map((c) => c.id).join()}
              {...enter}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex flex-wrap justify-center gap-1.5 px-3 pt-1 pb-2.5"
            >
              <span className="sr-only">{t.replyAs}</span>
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  disabled={busy}
                  onClick={() => answer({ type: "choice", id: choice.id })}
                  className={cn(
                    "min-h-9 rounded-full px-4 py-1.5 text-[0.9063rem] font-medium transition-colors duration-[var(--dur-quick)] hover:bg-[#F5F6F6] disabled:opacity-50",
                    WA.incoming,
                    WA.accent,
                    WA.shadow,
                  )}
                >
                  {choice.label}
                </button>
              ))}
            </m.div>
          ) : done && !busy ? (
            <m.div key="restart" {...enter} className="flex justify-center px-3 pt-1 pb-2.5">
              <button
                type="button"
                onClick={restart}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[0.875rem] font-medium transition-colors hover:bg-[#F5F6F6]",
                  WA.accent,
                  WA.shadow,
                )}
              >
                <ReplayIcon className="size-3.5" />
                {t.restart}
              </button>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* WhatsApp's composer, for the look only: the visitor answers with the quick replies above. */}
      <div aria-hidden="true" className={cn("flex items-center gap-1.5 px-2 py-2 select-none sm:px-3", WA.bar)}>
        <span className="grid size-10 shrink-0 place-items-center text-[#54656F]">
          <PlusIcon className="size-6" />
        </span>
        <span className={cn("flex h-11 min-w-0 flex-1 items-center truncate rounded-full bg-white px-4 text-[0.9375rem]", WA.meta)}>
          {t.inputPlaceholder}
        </span>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#00A884] text-white">
          <MicIcon />
        </span>
      </div>
    </div>
  );
}

/** Demo timestamps: 9:41 PM onward, one minute per exchange. */
function clock(index: number, suffix: string) {
  const minute = Math.min(59, 41 + Math.floor(index / 3));
  return `9:${String(minute).padStart(2, "0")} ${suffix}`;
}

function Notice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("rounded-lg bg-white px-3 py-1 text-[0.75rem] font-medium", WA.meta, WA.shadow, className)}>
      {children}
    </span>
  );
}

/**
 * One step of Talaqa's internal workflow (running, then done). Drawn as a
 * system event between hairlines — no bubble, no shadow — so it never reads
 * as another person in the chat.
 */
function SystemEvent({ text, done }: { text: string; done: boolean }) {
  return (
    <li className={cn("flex items-center gap-2.5 text-[0.75rem] leading-snug", WA.meta)}>
      <span aria-hidden="true" className="h-px min-w-3 flex-1 bg-[#667781]/20" />
      <span className="flex max-w-[82%] items-center gap-1.5 text-center">
        <span aria-hidden="true" className="grid size-3.5 shrink-0 place-items-center">
          {done ? (
            <CheckIcon className="size-3.5 text-aqua-700" />
          ) : (
            <span className="size-2 rounded-full ring-[1.5px] ring-aqua-700/60" />
          )}
        </span>
        <span className={cn("rounded-sm", !done && "working")}>{text}</span>
      </span>
      <span aria-hidden="true" className="h-px min-w-3 flex-1 bg-[#667781]/20" />
    </li>
  );
}

function ReadTicks() {
  return (
    <svg viewBox="0 0 16 11" aria-hidden="true" className="h-[11px] w-4 text-[#53BDEB]">
      <path d="M11.1 0.6 4.9 7.8 2.3 5.2 1.3 6.2l3.6 3.6 7.2-8.3z" fill="currentColor" />
      <path d="M15.1 0.6 8.9 7.8 8.2 7.1 7.2 8.2l1.7 1.6 7.2-8.3z" fill="currentColor" />
    </svg>
  );
}

/** A message. Only the first in a run from the same sender gets WhatsApp's tail corner. */
function Bubble({ message, time, tail, className }: { message: ChatMessage; time: string; tail: boolean; className?: string }) {
  const outgoing = message.role === "customer";
  const origin = outgoing ? "origin-bottom-right rtl:origin-bottom-left" : "origin-bottom-left rtl:origin-bottom-right";
  const meta = (
    <span className={cn("ms-3 inline-flex translate-y-1 items-center gap-1 align-bottom text-[0.6875rem] whitespace-nowrap", WA.meta)}>
      {time}
      {outgoing ? <ReadTicks /> : null}
    </span>
  );

  if (message.card) {
    const card = message.card;
    return (
      <m.div {...pop} className={cn("flex justify-start", origin, className)}>
        <div className={cn("w-[82%] rounded-lg p-2.5", tail && "rounded-ss-none", WA.incoming, WA.shadow, WA.ink)}>
          <div className="flex items-center gap-2 px-1 pt-0.5">
            <span className="grid size-5 place-items-center rounded-full bg-aqua">
              <CheckIcon className="size-3 text-ink-900" />
            </span>
            <p className="text-[0.9375rem] font-semibold">{card.title}</p>
          </div>
          <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-md bg-[#F7F8FA] px-3 py-2.5 text-[0.875rem]">
            {card.rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className={WA.meta}>{row.label}</dt>
                <dd className="tabular font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 flex items-center justify-between gap-3 px-1 text-[0.8125rem]">
            <span className="inline-flex items-center gap-1.5 font-medium text-aqua-700">
              <CheckIcon className="size-3.5" />
              {card.system}
            </span>
            <span className={cn("text-[0.6875rem]", WA.meta)}>{time}</span>
          </p>
        </div>
      </m.div>
    );
  }

  return (
    <m.div {...pop} className={cn("flex", outgoing ? "justify-end" : "justify-start", origin, className)}>
      <p
        className={cn(
          "max-w-[82%] rounded-lg px-2.5 pt-1.5 pb-2 text-[0.9375rem] leading-snug whitespace-pre-line ar:leading-[1.7]",
          WA.shadow,
          WA.ink,
          outgoing ? WA.outgoing : WA.incoming,
          tail && (outgoing ? "rounded-se-none" : "rounded-ss-none"),
        )}
      >
        {message.text}
        {meta}
      </p>
    </m.div>
  );
}
