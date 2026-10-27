"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import type { ConversationStatus, ConversationSummary } from "@/lib/dashboard/types";
import { matches, searchPattern, snippet, splitMatches } from "@/lib/dashboard/search";
import { formatStamp } from "@/lib/dashboard/time";
import { cn, fill } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/icons";
import { SearchIcon } from "../icons";
import { Avatar, StatusDot } from "../ui";

/*
 * The inbox: a list of every WhatsApp conversation beside the open one.
 * This frame lives in the inbox layout, so the search and the filter survive
 * moving between conversations. Status changes made here (take over, hand
 * back, resolve) are local to the preview and are never sent anywhere.
 */

type Filter = "all" | ConversationStatus;

/** What the person did in this preview, per conversation. */
export interface LocalChange {
  status: ConversationStatus;
  notes: Array<{ id: string; text: string }>;
}

interface InboxState {
  query: string;
  pattern: RegExp | null;
  statusOf: (c: { id: string; status: ConversationStatus }) => ConversationStatus;
  changes: Record<string, LocalChange>;
  change: (id: string, status: ConversationStatus, note: string) => void;
  summaries: ConversationSummary[];
}

const InboxContext = createContext<InboxState | null>(null);

export function useInbox() {
  const value = useContext(InboxContext);
  if (!value) throw new Error("useInbox must be used inside InboxFrame");
  return value;
}

/** Waiting conversations first (longest wait on top), then everything else, newest first. */
function order(list: ConversationSummary[], statusOf: InboxState["statusOf"]) {
  return [...list].sort((a, b) => {
    const wa = statusOf(a) === "handover";
    const wb = statusOf(b) === "handover";
    if (wa !== wb) return wa ? -1 : 1;
    if (wa && wb) return a.lastAt.localeCompare(b.lastAt);
    return b.lastAt.localeCompare(a.lastAt);
  });
}

export function InboxFrame({
  locale,
  t,
  common,
  summaries,
  branchNames,
  now,
  children,
}: {
  locale: Locale;
  t: DashboardDictionary["inbox"];
  common: DashboardDictionary["common"];
  summaries: ConversationSummary[];
  branchNames: Record<string, string>;
  now: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const selected = pathname.match(/\/inbox\/([^/]+)$/)?.[1] ?? null;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [changes, setChanges] = useState<Record<string, LocalChange>>({});

  const pattern = useMemo(() => searchPattern(query), [query]);

  const state = useMemo<InboxState>(() => {
    const statusOf = (c: { id: string; status: ConversationStatus }) => changes[c.id]?.status ?? c.status;
    return {
      query,
      pattern,
      statusOf,
      changes,
      summaries,
      change: (id, status, note) =>
        setChanges((prev) => ({
          ...prev,
          [id]: { status, notes: [...(prev[id]?.notes ?? []), { id: `${id}-${(prev[id]?.notes.length ?? 0) + 1}`, text: note }] },
        })),
    };
  }, [query, pattern, changes, summaries]);

  const searched = pattern ? summaries.filter((s) => matches(s.searchText, pattern)) : summaries;
  const counts: Record<Filter, number> = { all: searched.length, handover: 0, team: 0, talaqa: 0, resolved: 0 };
  for (const s of searched) counts[state.statusOf(s)] += 1;
  const visible = order(
    filter === "all" ? searched : searched.filter((s) => state.statusOf(s) === filter),
    state.statusOf,
  );
  const filters: Filter[] = ["all", "handover", "team", "talaqa", "resolved"];
  const base = `/${locale}/dashboard/inbox`;
  // The open conversation carries the h1 when there is one.
  const ListTitle = selected ? "h2" : "h1";

  return (
    <InboxContext.Provider value={state}>
      <div className="flex min-h-0 flex-1">
        {/* List */}
        <section
          aria-labelledby="inbox-title"
          className={cn("flex min-h-0 w-full flex-col border-white/[0.07] lg:w-[380px] lg:shrink-0 lg:border-e", selected && "max-lg:hidden")}
        >
          <div className="shrink-0 px-4 pt-5 pb-3 sm:px-5">
            <div className="flex items-baseline justify-between gap-3">
              <ListTitle id="inbox-title" className="text-[1.5rem] leading-tight font-semibold tracking-[-0.02em] ar:tracking-normal">
                {t.title}
              </ListTitle>
              <p className="tabular text-[0.8125rem] text-mist-400">{fill(t.count, { n: String(summaries.length) })}</p>
            </div>

            <div className="relative mt-4">
              <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-mist-400" />
              <label htmlFor="inbox-search" className="sr-only">
                {t.searchLabel}
              </label>
              <input
                id="inbox-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                autoComplete="off"
                className="h-10 w-full rounded-full border border-white/[0.09] bg-ink-850 ps-10 pe-10 text-[0.875rem] text-paper placeholder:text-mist-400 focus:border-white/20 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua [&::-webkit-search-cancel-button]:hidden"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t.clearSearch}
                  className="absolute end-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-mist-300 hover:bg-white/[0.08] hover:text-paper"
                >
                  <CloseIcon className="size-4" />
                </button>
              ) : null}
            </div>

            <div role="radiogroup" aria-label={t.filterLabel} className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-[var(--dur-quick)]",
                    filter === f ? "bg-paper text-ink-900" : "bg-white/[0.05] text-mist-200 hover:bg-white/[0.09] hover:text-paper",
                  )}
                >
                  {t.filters[f]}
                  <span className={cn("tabular", filter === f ? "text-ink-900/60" : f === "handover" && counts.handover > 0 ? "text-wait" : "text-mist-400")}>
                    {counts[f]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <ul aria-live="polite" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
            {visible.length === 0 ? (
              <li className="mx-2 mt-2 rounded-xl border border-dashed border-white/[0.1] px-4 py-3 text-[0.875rem] text-mist-300">
                {pattern ? fill(t.noMatches, { q: query.trim() }) : t.noResults}
              </li>
            ) : (
              visible.map((s) => (
                <ConversationRow
                  key={s.id}
                  summary={s}
                  status={state.statusOf(s)}
                  href={`${base}/${s.id}`}
                  active={selected === s.id}
                  branch={branchNames[s.branchId]}
                  stamp={formatStamp(s.lastAt, now, locale)}
                  t={t}
                  common={common}
                  pattern={pattern}
                />
              ))
            )}
          </ul>
        </section>

        {/* Open conversation */}
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", !selected && "max-lg:hidden")}>{children}</div>
      </div>
    </InboxContext.Provider>
  );
}

function ConversationRow({
  summary: s,
  status,
  href,
  active,
  branch,
  stamp,
  t,
  common,
  pattern,
}: {
  summary: ConversationSummary;
  status: ConversationStatus;
  href: string;
  active: boolean;
  branch: string;
  stamp: string;
  t: DashboardDictionary["inbox"];
  common: DashboardDictionary["common"];
  pattern: RegExp | null;
}) {
  // When the search hits a message (not the name), show where.
  const nameHit = pattern ? matches(s.customer.name, pattern) : false;
  const line = pattern && !nameHit ? s.searchText.split("\n").find((l) => matches(l, pattern)) : undefined;
  const found = line && pattern ? snippet(line, pattern) : null;
  const prefix = s.preview.kind === "talaqa" ? `${common.talaqa}: ` : "";

  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex gap-3 rounded-xl px-3 py-3 transition-colors duration-[var(--dur-quick)]",
          active ? "bg-white/[0.07]" : "hover:bg-white/[0.035]",
        )}
      >
        <Avatar name={s.customer.name} seed={s.customer.id} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className={cn("truncate text-[0.9375rem]", status === "handover" ? "font-semibold" : "font-medium")}>
              <bdi><Highlight text={s.customer.name} pattern={pattern} /></bdi>
            </p>
            <span className={cn("tabular shrink-0 text-[0.75rem]", status === "handover" ? "text-wait" : "text-mist-400")}>{stamp}</span>
          </div>

          {found ? (
            <p className="mt-0.5 line-clamp-2 text-[0.8125rem] text-mist-300 ar:leading-relaxed">
              <span className="sr-only">{t.inMessages}: </span>
              <Highlight text={found} pattern={pattern} />
            </p>
          ) : (
            // The preview keeps its own direction, so an Arabic line truncates at its end in the English UI too.
            <p className="mt-0.5 flex min-w-0 gap-1 text-[0.8125rem] text-mist-300">
              {prefix ? <span className="shrink-0 text-mist-400">{prefix}</span> : null}
              <span className="truncate" lang={s.preview.lang} dir={s.preview.lang === "ar" ? "rtl" : "ltr"}>
                {s.preview.text}
              </span>
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-2 text-[0.75rem] text-mist-400">
            <StatusDot status={status} className="size-1.5" />
            <span className={cn("truncate", status === "handover" && "text-wait", status === "talaqa" && "text-aqua/90")}>{common.statuses[status]}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{branch}</span>
            {s.unread > 0 && status === "handover" ? (
              <span className="tabular ms-auto grid h-5 min-w-5 place-items-center rounded-full bg-wait px-1.5 text-[0.6875rem] font-semibold text-ink-900">
                {s.unread}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function Highlight({ text, pattern }: { text: string; pattern: RegExp | null }) {
  return (
    <>
      {splitMatches(text, pattern).map((part, i) =>
        part.hit ? (
          <mark key={i} className="rounded-[3px] bg-wait/25 px-0.5 text-paper">
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
