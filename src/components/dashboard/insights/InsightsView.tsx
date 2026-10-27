"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import type { ConversationTopic, DailyStats } from "@/lib/dashboard/types";
import { apportion } from "@/lib/dashboard/apportion";
import { formatClock, formatDate, formatDuration, formatNumber, formatPercent, weekdayName } from "@/lib/dashboard/time";
import { cn, fill } from "@/lib/utils";
import { Page, PageHeader, Panel, PanelHeader, Segmented } from "../ui";
import { ColumnChart, ShareBar, Swatch } from "./charts";

type Range = "7" | "14" | "28";

/** Opening hours used to split the hour chart. Both sample branches share them (Friday opens later). */
const OPENS = 10;
const CLOSES = 23;

function sum(rows: DailyStats[], key: keyof Omit<DailyStats, "date" | "partial">) {
  return rows.reduce((s, r) => s + r[key], 0);
}

/** First-reply time across days, weighted by how many conversations each day had. */
function avgReply(rows: DailyStats[]) {
  const n = sum(rows, "conversations");
  return n ? rows.reduce((s, r) => s + r.medianFirstReplySec * r.conversations, 0) / n : 0;
}

export function InsightsView({
  locale,
  t,
  common,
  stats,
  hourWeights,
  topicWeights,
}: {
  locale: Locale;
  t: DashboardDictionary["insights"];
  common: DashboardDictionary["common"];
  stats: DailyStats[];
  hourWeights: number[];
  topicWeights: Array<[ConversationTopic, number]>;
}) {
  const [range, setRange] = useState<Range>("14");
  const n = Number(range);
  const full = stats.filter((s) => !s.partial);
  const today = stats.find((s) => s.partial);
  const current = full.slice(-n);
  const prior = full.slice(-2 * n, -n);

  const conv = sum(current, "conversations");
  const booked = sum(current, "booked");
  const handover = sum(current, "handover");
  const answered = sum(current, "answered");
  const noReply = sum(current, "noReply");
  const reply = avgReply(current);

  const priorConv = sum(prior, "conversations");
  const priorBooked = sum(prior, "booked");
  const priorHandoverRate = sum(prior, "handover") / (priorConv || 1);
  const priorReply = avgReply(prior);

  /** A change in words, coloured only when it is good or bad news. */
  const change = (now: number, before: number, goodWhen: "up" | "down" | "neutral", asPoints = false) => {
    const diff = asPoints ? (now - before) * 100 : before ? ((now - before) / before) * 100 : 0;
    const rounded = Math.round(diff);
    const text = `${rounded > 0 ? "+" : rounded < 0 ? "−" : "±"}${Math.abs(rounded)}${asPoints ? (locale === "ar" ? " نقطة" : " pts") : "%"}`;
    const good = goodWhen === "neutral" || rounded === 0 ? null : (rounded > 0) === (goodWhen === "up");
    return <span className={cn("tabular", good === true && "text-aqua", good === false && "text-alert")}>{text}</span>;
  };

  const vsPrior = fill(t.vsPrior, { n: range });
  const columns = [...current, ...(today ? [today] : [])].map((d, i, all) => ({
    key: d.date,
    label: n <= 14 ? formatDate(d.date, locale).split(" ")[0] : formatDate(d.date, locale),
    showLabel: n <= 7 || i % (n <= 14 ? 2 : 7) === (all.length - 1) % (n <= 14 ? 2 : 7),
    title: `${d.partial ? t.perDay.today : `${weekdayName(d.date, locale)} ${formatDate(d.date, locale)}`}: ${d.conversations} ${t.kpis.conversations} · ${d.booked} ${t.perDay.booked}`,
    parts: d.partial
      ? [
          { value: d.booked, className: "border border-dashed border-aqua/70" },
          { value: d.conversations - d.booked, className: "border border-dashed border-mist-400/60" },
        ]
      : [
          { value: d.booked, className: "bg-aqua" },
          { value: d.conversations - d.booked, className: "bg-ink-500" },
        ],
  }));

  const perHour = apportion(conv, hourWeights);
  const outside = perHour.reduce((s, v, h) => s + (h < OPENS || h >= CLOSES ? v : 0), 0);
  const topics = topicWeights.map(([k]) => k);
  const perTopic = apportion(conv, topicWeights.map(([, w]) => w))
    .map((value, i) => ({ key: topics[i], value }))
    .sort((a, b) => b.value - a.value);
  const topTopic = perTopic[0]?.value || 1;

  const outcomes = [
    { key: "booked", label: t.outcomes.booked, value: booked, className: "bg-aqua" },
    { key: "answered", label: t.outcomes.answered, value: answered, className: "bg-mist-300" },
    { key: "handover", label: t.outcomes.handover, value: handover, className: "bg-wait" },
    { key: "noReply", label: t.outcomes.noReply, value: noReply, className: "bg-ink-500" },
  ];

  return (
    <Page>
      <PageHeader
        title={t.title}
        sub={<span className="tabular">{fill(t.range, { n: range, from: formatDate(current[0].date, locale), to: formatDate(current[current.length - 1].date, locale) })}</span>}
        actions={
          <Segmented
            label={t.rangeLabel}
            value={range}
            onChange={setRange}
            options={(["7", "14", "28"] as const).map((r) => ({ value: r, label: t.ranges[r] }))}
          />
        }
      />

      <Panel as="div" className="grid grid-cols-2 lg:grid-cols-4">
        {[
          { label: t.kpis.conversations, value: formatNumber(conv), delta: change(conv, priorConv, "neutral") },
          { label: t.kpis.booked, value: formatNumber(booked), delta: change(booked, priorBooked, "up"), lead: true },
          {
            label: t.kpis.handover,
            value: formatNumber(handover),
            sub: fill(t.ofConversations, { p: formatPercent(handover / (conv || 1)) }),
            delta: change(handover / (conv || 1), priorHandoverRate, "down", true),
          },
          { label: t.kpis.firstReply, value: formatDuration(reply, locale), delta: change(reply, priorReply, "down") },
        ].map((k, i) => (
          <div
            key={k.label}
            className={cn(
              "min-w-0 px-5 py-4",
              i % 2 === 1 && "border-s border-white/[0.07]",
              i >= 2 && "border-t border-white/[0.07] lg:border-t-0",
              i === 2 && "lg:border-s",
            )}
          >
            <p className="text-[0.8125rem] text-mist-300">{k.label}</p>
            <p className={cn("tabular mt-1.5 text-[1.625rem] leading-none font-medium tracking-[-0.02em]", k.lead && "text-aqua")}>{k.value}</p>
            <p className="mt-2 text-[0.8125rem] text-mist-400">
              {k.sub ? <span className="text-mist-300">{k.sub} · </span> : null}
              {k.delta} <span>{vsPrior}</span>
            </p>
          </div>
        ))}
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <Panel labelledBy="in-per-day" className="lg:col-span-8">
          <PanelHeader
            id="in-per-day"
            title={t.perDay.title}
            aside={
              <>
                <span className="flex items-center gap-1.5">
                  <Swatch className="bg-aqua" />
                  {t.perDay.booked}
                </span>
                <span className="flex items-center gap-1.5 max-sm:hidden">
                  <Swatch className="bg-ink-500" />
                  {t.perDay.other}
                </span>
                {today ? (
                  <span className="flex items-center gap-1.5 max-md:hidden">
                    <Swatch className="border border-dashed border-mist-400/70" />
                    {t.perDay.today}
                  </span>
                ) : null}
              </>
            }
          />
          <div className="px-5 pt-2 pb-5">
            <ColumnChart columns={columns} height={176} gap={n > 14 ? 3 : 6} />
          </div>
        </Panel>

        <Panel labelledBy="in-outcomes" className="lg:col-span-4">
          <PanelHeader id="in-outcomes" title={t.outcomes.title} aside={<span className="tabular">{formatNumber(conv)}</span>} />
          <div className="px-5 pt-2 pb-5">
            <ShareBar parts={outcomes} />
            <ul className="mt-4">
              {outcomes.map((o) => (
                <li key={o.key} className="flex items-center gap-3 border-t border-white/[0.05] py-2.5 text-[0.875rem] first:border-t-0">
                  <Swatch className={o.className} />
                  <span className="min-w-0 flex-1 text-mist-200">{o.label}</span>
                  <span className="tabular w-12 text-end font-medium">{formatNumber(o.value)}</span>
                  <span className="tabular w-12 text-end text-mist-400">{formatPercent(o.value / (conv || 1))}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel labelledBy="in-hours" className="lg:col-span-8">
          <PanelHeader
            id="in-hours"
            title={t.hours.title}
            aside={
              <span className="flex items-center gap-1.5">
                <Swatch className="bg-aqua" />
                {t.hours.outside}
              </span>
            }
          />
          <p className="px-5 text-[0.875rem] text-mist-200 ar:leading-relaxed">{fill(t.hours.lead, { p: formatPercent(outside / (conv || 1)) })}</p>
          <div className="px-5 pt-4 pb-5">
            <ColumnChart
              height={196}
              gap={3}
              columns={perHour.map((v, h) => ({
                key: String(h),
                label: formatClock(h * 60, locale).replace(":00", ""),
                showLabel: h % 4 === 0,
                title: `${formatClock(h * 60, locale)}: ${v}`,
                parts: [{ value: v, className: h < OPENS || h >= CLOSES ? "bg-aqua" : "bg-ink-500" }],
              }))}
            />
          </div>
        </Panel>

        <Panel labelledBy="in-topics" className="lg:col-span-4">
          <PanelHeader id="in-topics" title={t.topics.title} />
          <ul className="px-5 pt-1 pb-4">
            {perTopic.map((tp, i) => (
              <li key={tp.key} className="py-1.5">
                <div className="flex items-baseline justify-between gap-3 text-[0.875rem]">
                  <span className="text-mist-200">{common.topics[tp.key]}</span>
                  <span className="tabular font-medium">{formatNumber(tp.value)}</span>
                </div>
                <span aria-hidden="true" className="mt-1.5 block h-[3px] rounded-full bg-white/[0.04]">
                  <span className={cn("block h-full rounded-full", i === 0 ? "bg-paper" : "bg-mist-400/60")} style={{ width: `${(tp.value / topTopic) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </Page>
  );
}
