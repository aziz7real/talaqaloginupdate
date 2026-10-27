"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Mark } from "@/components/brand/Mark";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import type { ConversationDetail } from "@/lib/dashboard/repository";
import type { Appointment, ChatMessage, ConversationStatus, EventKind } from "@/lib/dashboard/types";
import { matches } from "@/lib/dashboard/search";
import { dayKey, formatDate, formatSar, formatTime, relativeDay } from "@/lib/dashboard/time";
import { cn, fill } from "@/lib/utils";
import { BackIcon, LockIcon, PanelIcon, SendIcon } from "../icons";
import { actionClass, AppointmentStatusTag, Avatar, StatusPill } from "../ui";
import { Highlight, useInbox } from "./InboxFrame";

export interface ConversationLookups {
  members: Record<string, string>;
  branches: Record<string, string>;
  services: Record<string, { name: string; price: number }>;
}

type Said = Exclude<ChatMessage, { kind: "event" }>;
type Block = { key: string; day?: string; events?: Extract<ChatMessage, { kind: "event" }>[]; run?: Said[] };

/** Groups messages into day markers, runs from one speaker, and clusters of events. */
function toBlocks(messages: ChatMessage[]): Block[] {
  const blocks: Block[] = [];
  let lastDay = "";
  for (const m of messages) {
    const day = dayKey(m.at);
    if (day !== lastDay) {
      blocks.push({ key: `day-${day}`, day });
      lastDay = day;
    }
    const last = blocks[blocks.length - 1];
    if (m.kind === "event") {
      if (last.events) last.events.push(m);
      else blocks.push({ key: m.id, events: [m] });
    } else {
      const prev = last.run?.[last.run.length - 1];
      const same = prev && prev.kind === m.kind && (m.kind !== "staff" || (prev.kind === "staff" && prev.memberId === m.memberId));
      if (same) last.run!.push(m);
      else blocks.push({ key: m.id, run: [m] });
    }
  }
  return blocks;
}

export function ConversationView({
  locale,
  t,
  common,
  detail,
  lookups,
  now,
}: {
  locale: Locale;
  t: DashboardDictionary["inbox"];
  common: DashboardDictionary["common"];
  detail: ConversationDetail;
  lookups: ConversationLookups;
  now: string;
}) {
  const { conversation: c, customer } = detail;
  const inbox = useInbox();
  const status = inbox.statusOf(c);
  const notes = inbox.changes[c.id]?.notes ?? [];
  const pattern = inbox.pattern;
  const [showDetails, setShowDetails] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const hits = pattern ? c.messages.filter((m) => m.kind !== "event" && matches(m.text, pattern)).length : 0;

  // Open at the latest message, or at the first search hit.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const mark = el.querySelector("mark");
    if (mark) mark.scrollIntoView({ block: "center" });
    else el.scrollTop = el.scrollHeight;
  }, [c.id, pattern, notes.length]);

  const blocks = toBlocks(c.messages);
  const base = `/${locale}/dashboard`;

  const takeOver = () => inbox.change(c.id, "team", t.thread.tookOver);
  const handBack = () => inbox.change(c.id, "talaqa", t.thread.handedBack);
  const resolve = () => inbox.change(c.id, "resolved", t.thread.resolvedNote);

  const actions: ReactNode =
    status === "handover" || status === "talaqa" ? (
      // On phones the composer carries this button, close to the thumb.
      <button type="button" onClick={takeOver} className={cn(actionClass(status === "handover" ? "primary" : "secondary", "sm"), "max-sm:hidden")}>
        {t.thread.takeOver}
      </button>
    ) : status === "team" ? (
      <>
        <button type="button" onClick={resolve} className={cn(actionClass("ghost", "sm"), "max-sm:hidden")}>
          {t.thread.resolve}
        </button>
        <button type="button" onClick={handBack} className={actionClass("secondary", "sm")}>
          {t.thread.handBack}
        </button>
      </>
    ) : null;

  return (
    <div className="relative flex min-h-0 flex-1">
      <section aria-label={fill(t.thread.label, { name: customer.name })} className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Conversation header */}
        <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] px-3 py-3 sm:px-5">
          <Link href={`${base}/inbox`} aria-label={common.back} className="grid size-9 shrink-0 place-items-center rounded-full text-mist-200 hover:bg-white/[0.06] lg:hidden">
            <BackIcon />
          </Link>
          <Avatar name={customer.name} seed={customer.id} />
          <div className="min-w-0 flex-1">
            {/* The conversation is the page's subject; on phones it is all that is shown. */}
            <h1 className="truncate text-[0.9375rem] font-semibold">
              <bdi>{customer.name}</bdi>
            </h1>
            <p className="truncate text-[0.75rem] text-mist-400">
              {common.whatsapp} · <span dir="ltr" className="tabular">•• {customer.phoneLast4}</span> · {lookups.branches[c.branchId]}
            </p>
          </div>
          {/* Wide screens show the status in the details column; phones in the composer. */}
          <StatusPill status={status} label={common.statuses[status]} className="max-md:hidden xl:hidden" />
          <div className="flex items-center gap-1.5">{actions}</div>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            aria-expanded={showDetails}
            aria-controls="conversation-details"
            aria-label={t.details.show}
            title={t.details.show}
            className="grid size-9 shrink-0 place-items-center rounded-full text-mist-300 hover:bg-white/[0.06] hover:text-paper xl:hidden"
          >
            <PanelIcon />
          </button>
        </header>

        {/* Messages */}
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-6">
          <div className="mx-auto flex max-w-[720px] flex-col">
            {pattern ? (
              <p className="mb-3 self-center rounded-full bg-wait/[0.1] px-3 py-1 text-[0.75rem] font-medium text-wait">
                {fill(t.thread.matches, { n: String(hits), q: inbox.query.trim() })}
              </p>
            ) : null}

            {c.handoverReason && (status === "handover" || status === "team") ? (
              <div className="mb-4 rounded-xl border border-wait/25 bg-wait/[0.06] px-4 py-3">
                <p className="text-[0.8125rem] font-semibold text-wait">{t.thread.handoverTitle}</p>
                <p className="mt-0.5 text-[0.875rem] text-mist-200 ar:leading-relaxed">{c.handoverReason[locale]}</p>
              </div>
            ) : null}

            {blocks.map((block, i) => {
              if (block.day) {
                const label = relativeDay(block.day, now, locale);
                return (
                  <p key={block.key} className={cn("self-center rounded-full bg-white/[0.05] px-3 py-1 text-[0.75rem] font-medium text-mist-300", i > 0 && "mt-5")}>
                    {label === formatDate(block.day, locale) ? label : `${label} · ${formatDate(block.day, locale)}`}
                  </p>
                );
              }
              if (block.events) {
                return (
                  <ul key={block.key} className="mt-3 flex flex-col gap-1.5">
                    {block.events.map((e) => (
                      <EventLine key={e.id} kind={e.event} text={e.text[locale]} time={formatTime(e.at, locale)} />
                    ))}
                  </ul>
                );
              }
              return (
                <Run
                  key={block.key}
                  run={block.run!}
                  locale={locale}
                  t={t}
                  memberName={block.run![0].kind === "staff" ? lookups.members[(block.run![0] as Extract<Said, { kind: "staff" }>).memberId] : ""}
                />
              );
            })}

            {notes.length ? (
              <ul className="mt-3 flex flex-col gap-1.5">
                {notes.map((n) => (
                  <EventLine key={n.id} kind="takeover" text={n.text} />
                ))}
                <li className="mt-1 text-center text-[0.75rem] text-mist-400">{t.thread.previewOnly}</li>
              </ul>
            ) : null}

            <p className="mt-6 text-center text-[0.75rem] text-mist-400">{t.thread.legend}</p>
          </div>
        </div>

        {/* Composer: who replies depends on the status. */}
        <div className="shrink-0 border-t border-white/[0.07] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="mx-auto max-w-[720px]">
            {status === "team" ? (
              <>
                <div className="flex items-center gap-2">
                  <label htmlFor="reply" className="sr-only">
                    {t.thread.composerPlaceholder}
                  </label>
                  <input
                    id="reply"
                    disabled
                    placeholder={t.thread.composerPlaceholder}
                    aria-describedby="reply-note"
                    className="h-11 min-w-0 flex-1 cursor-not-allowed rounded-full border border-white/[0.09] bg-ink-850 px-4 text-[0.9375rem] text-paper placeholder:text-mist-400"
                  />
                  <button type="button" disabled aria-label={t.thread.send} className="grid size-11 shrink-0 cursor-not-allowed place-items-center rounded-full bg-white/[0.07] text-mist-300">
                    <SendIcon />
                  </button>
                </div>
                <p id="reply-note" className="mt-2 flex items-center gap-1.5 text-[0.75rem] text-mist-400">
                  <LockIcon className="size-3.5 flex-none" />
                  {t.thread.composerTeam}
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="flex min-w-0 items-center gap-2 text-[0.8125rem] text-mist-300 ar:leading-relaxed">
                  {status === "resolved" ? (
                    <CheckIcon className="size-4 flex-none text-mist-400" />
                  ) : (
                    <span className="grid size-6 flex-none place-items-center rounded-full bg-ink-800">
                      <Mark className="h-2 w-auto text-paper" />
                    </span>
                  )}
                  {status === "resolved" ? t.thread.composerResolved : t.thread.composerTalaqa}
                </p>
                {status !== "resolved" ? (
                  <button type="button" onClick={takeOver} className={cn(actionClass(status === "handover" ? "primary" : "secondary", "sm"), "sm:hidden")}>
                    {t.thread.takeOver}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Details: a column on wide screens, a sheet elsewhere. */}
      {showDetails ? (
        <button type="button" aria-label={t.details.show} tabIndex={-1} onClick={() => setShowDetails(false)} className="absolute inset-0 z-10 bg-ink-950/60 xl:hidden" />
      ) : null}
      <aside
        id="conversation-details"
        aria-label={t.details.title}
        className={cn(
          "w-[300px] shrink-0 overflow-y-auto border-s border-white/[0.07] bg-ink-900",
          "max-xl:absolute max-xl:inset-y-0 max-xl:end-0 max-xl:z-20 max-xl:w-[min(320px,88%)] max-xl:shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
          !showDetails && "max-xl:hidden",
        )}
      >
        <Details locale={locale} t={t} common={common} detail={detail} status={status} lookups={lookups} now={now} onClose={() => setShowDetails(false)} />
      </aside>
    </div>
  );
}

function Run({ run, locale, t, memberName }: { run: Said[]; locale: Locale; t: DashboardDictionary["inbox"]; memberName: string }) {
  const { pattern } = useInbox();
  const kind = run[0].kind;
  const fromBusiness = kind !== "customer";
  return (
    <div className={cn("mt-4 flex flex-col gap-1", fromBusiness ? "items-end" : "items-start")}>
      {fromBusiness ? (
        <p className="flex items-center gap-1.5 px-1 text-[0.75rem] font-medium text-mist-300">
          {kind === "talaqa" ? (
            <>
              <Mark className="h-2 w-auto text-aqua" dotClassName="fill-aqua" />
              {t.thread.talaqa}
            </>
          ) : (
            memberName
          )}
        </p>
      ) : null}
      {run.map((m, i) => (
        <div
          key={m.id}
          lang={m.lang}
          dir="auto"
          className={cn(
            "max-w-[min(82%,560px)] rounded-2xl px-3.5 pt-2 pb-1.5 text-[0.9375rem] leading-snug whitespace-pre-line",
            "ar:leading-[1.75]",
            kind === "customer" && "bg-ink-800 text-paper",
            kind === "talaqa" && "border border-aqua/20 bg-aqua/[0.08] text-paper",
            kind === "staff" && "bg-paper text-ink-900",
            i === 0 && (fromBusiness ? "rounded-se-md" : "rounded-ss-md"),
          )}
        >
          <Highlight text={m.text} pattern={pattern} />
          {/* The margin sits on a wrapper in the bubble's direction; the time keeps the UI's. */}
          <span className="ms-3 inline-block translate-y-0.5 align-bottom">
            <span className={cn("tabular text-[0.6875rem] whitespace-nowrap", kind === "staff" ? "text-dim-600" : "text-mist-400")} dir={locale === "ar" ? "rtl" : "ltr"}>
              {formatTime(m.at, locale)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** What happened, drawn apart from what was said: Talaqa's actions on the aqua node, handovers in the waiting colour. */
function EventLine({ kind, text, time }: { kind: EventKind; text: string; time?: string }) {
  const handover = kind === "handover";
  const person = kind === "takeover";
  return (
    <li className="flex items-center gap-3 text-[0.75rem] leading-snug">
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-white/[0.08]" />
      <span className={cn("flex max-w-[86%] items-start gap-2 text-center", handover ? "text-wait" : "text-mist-300")}>
        {handover ? (
          <span aria-hidden="true" className="mt-[3px] size-3 flex-none rounded-full border-2 border-wait" />
        ) : person ? (
          <span aria-hidden="true" className="mt-[3px] size-3 flex-none rounded-full bg-paper/80" />
        ) : (
          <span aria-hidden="true" className="mt-[1px] grid size-3.5 flex-none place-items-center rounded-full bg-aqua text-ink-900">
            <CheckIcon className="size-2.5" />
          </span>
        )}
        <span className="ar:leading-relaxed">
          {text}
          {time ? <span className="tabular ms-2 inline-block text-mist-400">{time}</span> : null}
        </span>
      </span>
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-white/[0.08]" />
    </li>
  );
}

function Details({
  locale,
  t,
  common,
  detail,
  status,
  lookups,
  now,
  onClose,
}: {
  locale: Locale;
  t: DashboardDictionary["inbox"];
  common: DashboardDictionary["common"];
  detail: ConversationDetail;
  status: ConversationStatus;
  lookups: ConversationLookups;
  now: string;
  onClose: () => void;
}) {
  const { conversation: c, customer, appointment, visits } = detail;
  const rows: Array<[string, ReactNode]> = [
    [t.details.phone, <span key="p" dir="ltr" className="tabular">•• {customer.phoneLast4}</span>],
    [t.details.channel, common.whatsapp],
    [t.details.branch, lookups.branches[c.branchId]],
    [t.details.topic, common.topics[c.topic]],
    [t.details.started, `${relativeDay(c.messages[0].at, now, locale)} · ${formatTime(c.messages[0].at, locale)}`],
  ];

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold">{t.details.title}</h2>
        <button type="button" onClick={onClose} aria-label={common.back} className="-me-2 -mt-1.5 grid size-8 place-items-center rounded-full text-mist-300 hover:bg-white/[0.06] xl:hidden">
          <CloseIcon className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Avatar name={customer.name} seed={customer.id} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-[1rem] font-semibold">
            <bdi>{customer.name}</bdi>
          </p>
          <StatusPill status={status} label={common.statuses[status]} className="mt-1" />
        </div>
      </div>

      <dl className="mt-5 space-y-2.5 text-[0.8125rem]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-mist-400">{label}</dt>
            <dd className="text-end text-mist-200">{value}</dd>
          </div>
        ))}
      </dl>

      {appointment ? (
        <div className="mt-6">
          <h3 className="text-[0.8125rem] font-semibold">{t.details.appointment}</h3>
          <AppointmentCard appointment={appointment} locale={locale} common={common} lookups={lookups} now={now} highlight />
        </div>
      ) : null}

      <div className="mt-6">
        <h3 className="text-[0.8125rem] font-semibold">{t.details.visits}</h3>
        {visits.length ? (
          visits.map((v) => <AppointmentCard key={v.id} appointment={v} locale={locale} common={common} lookups={lookups} now={now} />)
        ) : (
          <p className="mt-2 text-[0.8125rem] text-mist-400">{t.details.noVisits}</p>
        )}
      </div>

      <Link
        href={`/${locale}/dashboard/appointments?day=${dayKey((appointment ?? visits[0])?.start ?? now)}${appointment ? `&ap=${appointment.id}` : ""}`}
        className={cn(actionClass("secondary", "sm"), "mt-6 w-full")}
      >
        {t.details.openSchedule}
      </Link>
    </div>
  );
}

function AppointmentCard({
  appointment: a,
  locale,
  common,
  lookups,
  now,
  highlight = false,
}: {
  appointment: Appointment;
  locale: Locale;
  common: DashboardDictionary["common"];
  lookups: ConversationLookups;
  now: string;
  highlight?: boolean;
}) {
  const service = lookups.services[a.serviceId];
  return (
    <div className={cn("mt-2 rounded-xl px-3.5 py-3", highlight ? "border border-aqua/20 bg-aqua/[0.05]" : "bg-white/[0.04]")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.875rem] font-medium">{service.name}</p>
        <AppointmentStatusTag status={a.status} label={common.appointmentStatuses[a.status]} />
      </div>
      <p className="tabular mt-1 text-[0.8125rem] text-mist-300">
        {relativeDay(a.start, now, locale)} · {formatTime(a.start, locale)} · {lookups.members[a.staffId]}
      </p>
      <p className="tabular mt-0.5 text-[0.75rem] text-mist-400">{formatSar(service.price, locale)}</p>
    </div>
  );
}
