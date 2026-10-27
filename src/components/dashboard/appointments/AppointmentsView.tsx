"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CloseIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import type { AppointmentRow } from "@/lib/dashboard/repository";
import type { AppointmentStatus, OpeningHours, Weekday } from "@/lib/dashboard/types";
import { addDays, dayKey, formatClock, formatDate, formatLongDate, formatSar, formatTime, minuteOfDay, weekdayName, weekdayOf } from "@/lib/dashboard/time";
import { cn, fill } from "@/lib/utils";
import { ActionNode, actionClass, AppointmentStatusTag, Page, PageHeader, Panel, Segmented } from "../ui";

export interface StaffColumn {
  id: string;
  name: string;
  branchId: string;
  daysOff: number[];
}

type View = "schedule" | "list";

/** Pixels per hour in the schedule. 30 minutes = 32px, enough for a name and a time. */
const HOUR = 64;

export function AppointmentsView({
  locale,
  t,
  common,
  appointments,
  staff,
  branches,
  services,
  weekStart,
  now,
  initialDay,
  initialSelected,
}: {
  locale: Locale;
  t: DashboardDictionary["appointments"];
  common: DashboardDictionary["common"];
  appointments: AppointmentRow[];
  staff: StaffColumn[];
  branches: Array<{ id: string; name: string; hours: OpeningHours[] }>;
  services: Record<string, { name: string; price: number }>;
  weekStart: string;
  now: string;
  initialDay: string;
  initialSelected: string | null;
}) {
  const [day, setDay] = useState(initialDay);
  const [branch, setBranch] = useState<string>("all");
  const [view, setView] = useState<View>("schedule");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelected);

  const today = dayKey(now);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const inBranch = (branchId: string) => branch === "all" || branchId === branch;

  const forDay = useMemo(
    () => appointments.filter((a) => dayKey(a.start) === day && inBranch(a.branchId)).sort((a, b) => a.start.localeCompare(b.start) || a.staffId.localeCompare(b.staffId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, day, branch],
  );
  const live = forDay.filter((a) => a.status !== "cancelled");
  const viaTalaqa = live.filter((a) => a.bookedBy === "talaqa").length;
  const selected = appointments.find((a) => a.id === selectedId) ?? null;
  const columns = staff.filter((s) => inBranch(s.branchId));
  const weekday = weekdayOf(day);

  // Escape closes the details.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const hours = branches.flatMap((b) => b.hours.filter((h) => h.days.includes(weekday as Weekday)));
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const open = Math.min(...hours.map((h) => toMin(h.opens)));
  const close = Math.max(...hours.map((h) => toMin(h.closes)));

  return (
    <Page className="max-w-[1480px]">
      <PageHeader
        title={t.title}
        sub={
          <>
            <span className="text-paper">{formatLongDate(day, locale)}</span>
            <span className="tabular"> · {live.length ? fill(t.summary, { n: String(live.length), t: String(viaTalaqa) }) : t.summaryNone}</span>
          </>
        }
        actions={
          <>
            <label className="sr-only" htmlFor="branch-filter">
              {t.branchLabel}
            </label>
            <select
              id="branch-filter"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-9 rounded-full border border-white/[0.12] bg-ink-850 ps-3.5 pe-8 text-[0.8125rem] text-paper"
            >
              <option value="all">{common.allBranches}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Segmented
              label={t.viewLabel}
              className="max-lg:hidden"
              value={view}
              onChange={setView}
              options={[
                { value: "schedule", label: t.views.schedule },
                { value: "list", label: t.views.list },
              ]}
            />
          </>
        }
      />

      {/* The week, with each day's count. */}
      <div role="radiogroup" aria-label={t.weekLabel} className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-7 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {days.map((d) => {
          const count = appointments.filter((a) => dayKey(a.start) === d && a.status !== "cancelled" && inBranch(a.branchId)).length;
          const active = d === day;
          return (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setDay(d)}
              className={cn(
                "flex min-w-[4.75rem] shrink-0 flex-col items-start rounded-xl border px-3 py-2.5 text-start transition-colors duration-[var(--dur-quick)]",
                active ? "border-white/[0.16] bg-white/[0.07]" : "border-white/[0.06] hover:bg-white/[0.035]",
              )}
            >
              <span className={cn("flex items-center gap-1.5 text-[0.75rem]", d === today ? "font-semibold text-aqua" : "text-mist-300")}>
                {weekdayName(d, locale, true)}
                {d === today ? <span aria-hidden="true" className="size-1 rounded-full bg-aqua" /> : null}
              </span>
              <span className="tabular mt-0.5 text-[0.9375rem] font-medium">{formatDate(d, locale)}</span>
              <span className="tabular mt-1 text-[0.75rem] text-mist-400">{fill(t.count, { n: String(count) })}</span>
            </button>
          );
        })}
      </div>

      {/* Schedule (desktop, by choice; tablets and phones get the list) */}
      {view === "schedule" ? (
        <Panel as="div" className="overflow-hidden max-lg:hidden">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.07] px-5 py-3 text-[0.75rem] text-mist-300">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-3.5 w-5 rounded-[4px] border-s-[3px] border-aqua bg-aqua/[0.1]" />
              {t.legend.talaqa}
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-3.5 w-5 rounded-[4px] bg-ink-700" />
              {t.legend.team}
            </span>
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="h-3.5 w-5 rounded-[4px] border border-dashed border-mist-400/60" />
              {t.legend.cancelled}
            </span>
          </div>
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[760px]"
              style={{ gridTemplateColumns: `4.5rem repeat(${columns.length}, minmax(140px, 1fr))` }}
            >
              {/* Column heads */}
              <div className="sticky top-0 z-10 border-b border-white/[0.07] bg-ink-850" />
              {columns.map((s) => {
                const off = s.daysOff.includes(weekday);
                const n = forDay.filter((a) => a.staffId === s.id && a.status !== "cancelled").length;
                return (
                  <div key={s.id} className="sticky top-0 z-10 border-s border-b border-white/[0.07] bg-ink-850 px-3 py-2.5">
                    <p className="truncate text-[0.875rem] font-medium">{s.name}</p>
                    <p className="truncate text-[0.75rem] text-mist-400">
                      {branches.find((b) => b.id === s.branchId)?.name} · <span className="tabular">{off ? t.dayOff : fill(t.count, { n: String(n) })}</span>
                    </p>
                  </div>
                );
              })}

              {/* Time axis */}
              <div className="relative" style={{ height: ((close - open) / 60) * HOUR }}>
                {Array.from({ length: (close - open) / 60 }, (_, i) => (
                  <span key={i} className="tabular absolute start-3 -translate-y-1/2 text-[0.6875rem] text-mist-400" style={{ top: i * HOUR + (i === 0 ? 8 : 0) }}>
                    {formatClock(open + i * 60, locale)}
                  </span>
                ))}
              </div>

              {columns.map((s) => {
                const off = s.daysOff.includes(weekday);
                return (
                  <div
                    key={s.id}
                    className={cn("relative border-s border-white/[0.07]", off && "bg-[repeating-linear-gradient(135deg,transparent_0_8px,rgba(255,255,255,0.025)_8px_9px)]")}
                    style={{ height: ((close - open) / 60) * HOUR }}
                  >
                    {Array.from({ length: (close - open) / 60 }, (_, i) => (
                      <span key={i} aria-hidden="true" className="absolute inset-x-0 border-t border-white/[0.045]" style={{ top: i * HOUR }} />
                    ))}
                    {off ? <p className="absolute inset-x-0 top-4 text-center text-[0.75rem] text-mist-400">{t.dayOff}</p> : null}
                    {forDay
                      .filter((a) => a.staffId === s.id)
                      .map((a) => {
                        const top = ((minuteOfDay(a.start) - open) / 60) * HOUR;
                        const height = (a.durationMin / 60) * HOUR - 3;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setSelectedId(a.id)}
                            aria-label={`${formatTime(a.start, locale)} · ${a.customer.name} · ${services[a.serviceId].name} · ${common.appointmentStatuses[a.status]}`}
                            className={cn(
                              "absolute inset-x-1.5 overflow-hidden rounded-md px-2 py-1 text-start transition-[filter] hover:brightness-125",
                              blockStyle(a.status, a.bookedBy),
                              selectedId === a.id && "ring-2 ring-paper/80",
                            )}
                            style={{ top: top + 1.5, height }}
                          >
                            <span className={cn("flex items-baseline gap-1.5 text-[0.75rem] leading-tight", a.status === "cancelled" && "line-through")}>
                              <span className="tabular shrink-0 font-semibold">{formatTime(a.start, locale)}</span>
                              <span className="truncate"><bdi>{a.customer.name}</bdi></span>
                            </span>
                            {height > 34 ? <span className="mt-0.5 block truncate text-[0.6875rem] leading-tight opacity-75">{services[a.serviceId].name}</span> : null}
                          </button>
                        );
                      })}
                    {day === today && minuteOfDay(now) >= open && minuteOfDay(now) <= close ? (
                      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-[1] h-px bg-aqua" style={{ top: ((minuteOfDay(now) - open) / 60) * HOUR }} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      ) : null}

      {/* List: always on phones, by choice on desktop. */}
      <Panel as="div" className={cn(view === "schedule" && "lg:hidden")}>
        {forDay.length === 0 ? (
          <p className="m-5 rounded-xl border border-dashed border-white/[0.1] px-4 py-3 text-[0.875rem] text-mist-300">{t.empty}</p>
        ) : (
          <table className="w-full text-[0.875rem]">
            <thead className="max-md:sr-only">
              <tr className="text-start text-[0.75rem] text-mist-400">
                <th scope="col" className="px-5 py-3 text-start font-normal">{t.columns.time}</th>
                <th scope="col" className="px-3 py-3 text-start font-normal">{t.columns.customer}</th>
                <th scope="col" className="px-3 py-3 text-start font-normal">{t.columns.service}</th>
                <th scope="col" className="px-3 py-3 text-start font-normal">{t.columns.staff}</th>
                <th scope="col" className="px-3 py-3 text-start font-normal">{t.columns.bookedBy}</th>
                <th scope="col" className="px-3 py-3 text-start font-normal">{t.columns.status}</th>
                <th scope="col" className="px-5 py-3 text-end font-normal">{t.columns.price}</th>
              </tr>
            </thead>
            <tbody>
              {forDay.map((a) => {
                const past = new Date(a.start).getTime() < new Date(now).getTime();
                return (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className={cn("cursor-pointer border-t border-white/[0.05] transition-colors hover:bg-white/[0.03] max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:px-4 max-md:py-3", selectedId === a.id && "bg-white/[0.06]")}
                  >
                    <td className={cn("tabular px-5 py-3 font-medium whitespace-nowrap max-md:w-16 max-md:p-0", past && day === today && "text-mist-300")}>{formatTime(a.start, locale)}</td>
                    <td className="px-3 py-3 max-md:flex-1 max-md:p-0">
                      <button type="button" onClick={() => setSelectedId(a.id)} className={cn("text-start font-medium hover:text-aqua", a.status === "cancelled" && "text-mist-400 line-through")}>
                        <bdi>{a.customer.name}</bdi>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-mist-200 max-md:order-last max-md:w-full max-md:ps-[4.75rem] max-md:pt-0.5 max-md:pb-0 max-md:text-[0.8125rem] max-md:text-mist-400">
                      {services[a.serviceId].name}
                      <span className="md:hidden"> · {staff.find((s) => s.id === a.staffId)?.name}</span>
                    </td>
                    <td className="px-3 py-3 text-mist-200 max-md:hidden">{staff.find((s) => s.id === a.staffId)?.name}</td>
                    <td className="px-3 py-3 max-md:hidden">
                      <span className="inline-flex items-center gap-2 text-mist-300">
                        {a.bookedBy === "talaqa" ? <ActionNode className="size-3.5" /> : <span aria-hidden="true" className="size-3.5 rounded-full border border-mist-400/50" />}
                        {common.bookedBy[a.bookedBy]}
                      </span>
                    </td>
                    <td className="px-3 py-3 max-md:p-0">
                      <AppointmentStatusTag status={a.status} label={common.appointmentStatuses[a.status]} />
                    </td>
                    <td className="tabular px-5 py-3 text-end text-mist-200 max-md:hidden">{formatSar(services[a.serviceId].price, locale)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      {/* Details */}
      {selected ? (
        <>
          <button type="button" tabIndex={-1} aria-label={t.detail.close} onClick={() => setSelectedId(null)} className="fixed inset-0 z-40 bg-ink-950/50" />
          <aside
            role="dialog"
            aria-labelledby="appointment-title"
            className="fixed inset-y-0 end-0 z-50 flex w-[min(380px,100%)] flex-col overflow-y-auto border-s border-white/[0.08] bg-ink-850 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="appointment-title" className="text-[1.0625rem] font-semibold">
                {t.detail.title}
              </h2>
              <button type="button" onClick={() => setSelectedId(null)} aria-label={t.detail.close} autoFocus className="-me-2 -mt-1 grid size-9 place-items-center rounded-full text-mist-300 hover:bg-white/[0.06] hover:text-paper">
                <CloseIcon className="size-4" />
              </button>
            </div>
            <p className="mt-5 text-[1.25rem] font-semibold">
              <bdi>{selected.customer.name}</bdi>
            </p>
            <p className="mt-1 text-[0.8125rem] text-mist-400">
              {common.whatsapp} · <span dir="ltr" className="tabular">•• {selected.customer.phoneLast4}</span>
            </p>
            <dl className="mt-6 space-y-3 text-[0.875rem]">
              {(
                [
                  [t.detail.when, `${formatLongDate(selected.start, locale)} · ${formatTime(selected.start, locale)}`],
                  [t.columns.service, `${services[selected.serviceId].name} · ${fill(t.detail.duration, { n: String(selected.durationMin) })}`],
                  [t.columns.staff, staff.find((s) => s.id === selected.staffId)?.name ?? "—"],
                  [t.columns.branch, branches.find((b) => b.id === selected.branchId)?.name ?? "—"],
                  [t.columns.price, formatSar(services[selected.serviceId].price, locale)],
                  [t.columns.bookedBy, common.bookedBy[selected.bookedBy]],
                ] as Array<[string, string]>
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-mist-400">{label}</dt>
                  <dd className="tabular text-end">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-mist-400">{t.columns.status}</dt>
                <dd>
                  <AppointmentStatusTag status={selected.status} label={common.appointmentStatuses[selected.status]} />
                </dd>
              </div>
            </dl>
            {selected.conversationId ? (
              <Link href={`/${locale}/dashboard/inbox/${selected.conversationId}`} className={cn(actionClass("secondary"), "mt-8")}>
                {t.detail.openConversation}
              </Link>
            ) : null}
          </aside>
        </>
      ) : null}
    </Page>
  );
}

function blockStyle(status: AppointmentStatus, bookedBy: "talaqa" | "team") {
  if (status === "cancelled") return "border border-dashed border-mist-400/50 bg-transparent text-mist-400";
  if (status === "no_show") return "border border-alert/50 bg-alert/[0.08] text-alert";
  const base = bookedBy === "talaqa" ? "border-s-[3px] border-aqua bg-aqua/[0.1] text-paper" : "bg-ink-700 text-paper";
  return status === "completed" ? `${base} opacity-55` : base;
}
