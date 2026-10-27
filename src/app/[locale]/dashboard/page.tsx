import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionNode, actionClass, Avatar, KpiStrip, Page, PageHeader, Panel, PanelHeader, StatusPill } from "@/components/dashboard/ui";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getTenantContext } from "@/lib/dashboard/tenant";
import { getWorkspace, listActivity, listAppointments, listConversations, listDailyStats } from "@/lib/dashboard/repository";
import { dayKey, formatLongDate, formatStamp, formatTime } from "@/lib/dashboard/time";
import { cn, fill } from "@/lib/utils";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDashboardDictionary(locale).overview.title };
}

/** The question: what needs me today? Answered first by what is waiting for the team. */
export default async function OverviewPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale);
  const ctx = await getTenantContext();
  const workspace = await getWorkspace(ctx);
  const today = dayKey(workspace.now);
  const [summaries, appointments, activity, stats] = await Promise.all([
    listConversations(ctx),
    listAppointments(ctx, { from: today, to: today }),
    listActivity(ctx, today),
    listDailyStats(ctx),
  ]);

  const o = t.overview;
  const members = Object.fromEntries(workspace.members.map((m) => [m.id, m.name[locale]]));
  const services = Object.fromEntries(workspace.services.map((s) => [s.id, s.name[locale]]));
  const branches = Object.fromEntries(workspace.branches.map((b) => [b.id, b.name[locale]]));
  const base = `/${locale}/dashboard`;

  const todayStats = stats.find((s) => s.date === today)!;
  const waiting = summaries.filter((s) => s.status === "handover").sort((a, b) => a.lastAt.localeCompare(b.lastAt));
  const rescheduled = activity.filter((a) => a.event === "rescheduled").length;
  const cancelled = activity.filter((a) => a.event === "cancelled").length;
  const live = appointments.filter((a) => a.status !== "cancelled");
  const nowMs = new Date(workspace.now).getTime();
  const upcoming = live.filter((a) => a.status === "confirmed" && new Date(a.start).getTime() > nowMs);
  const recent = summaries.filter((s) => s.status !== "handover").slice(0, 5);

  const finding = waiting.length === 0 ? o.findingNone : waiting.length === 1 ? o.findingOne : fill(o.finding, { n: String(waiting.length) });

  return (
    <Page>
      <PageHeader
        title={o.title}
        sub={
          <>
            <span className={cn(waiting.length > 0 && "font-medium text-wait")}>{finding}</span>
            <span className="text-mist-400"> · {formatLongDate(today, locale)}</span>
          </>
        }
        actions={
          waiting.length > 0 ? (
            <Link href={`${base}/inbox/${waiting[0].id}`} className={actionClass("primary")}>
              {o.waiting.reply}
            </Link>
          ) : null
        }
      />

      <KpiStrip
        items={[
          { label: o.kpis.waiting, value: waiting.length, tone: waiting.length ? "wait" : undefined, detail: fill(o.asOf, { time: formatTime(workspace.now, locale) }) },
          { label: o.kpis.conversations, value: todayStats.conversations, detail: fill(o.asOf, { time: formatTime(workspace.now, locale) }) },
          { label: o.kpis.booked, value: todayStats.booked, detail: fill(o.kpis.bookedDetail, { r: String(rescheduled), c: String(cancelled) }) },
          { label: o.kpis.appointments, value: live.length, detail: fill(o.kpis.appointmentsLeft, { n: String(upcoming.length) }) },
        ]}
      />

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          {/* Waiting for the team: the one job that can't wait. */}
          <Panel labelledBy="ov-waiting">
            <PanelHeader id="ov-waiting" title={o.waiting.title} aside={<span className="tabular font-medium text-wait">{waiting.length}</span>} />
            {waiting.length ? (
              <ul className="px-2 pb-2">
                {waiting.map((s) => (
                  <li key={s.id} className="flex items-start gap-3 rounded-xl px-3 py-3">
                    <Avatar name={s.customer.name} seed={s.customer.id} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-[0.9375rem] font-semibold">
                          <bdi>{s.customer.name}</bdi>
                        </p>
                        <p className="tabular text-[0.75rem] text-wait">
                          {fill(t.common.waitingFor, { time: formatTime(s.lastAt, locale) })} · {branches[s.branchId]}
                        </p>
                      </div>
                      {s.handoverReason ? <p className="mt-1 text-[0.875rem] text-mist-200 ar:leading-relaxed">{s.handoverReason[locale]}</p> : null}
                    </div>
                    <Link href={`${base}/inbox/${s.id}`} className={actionClass("secondary", "sm")}>
                      {o.waiting.reply}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mx-5 mb-5 rounded-xl border border-dashed border-white/[0.1] px-4 py-3 text-[0.875rem] text-mist-300">{o.waiting.empty}</p>
            )}
          </Panel>

          {/* The thread: what Talaqa did today, newest first. */}
          <Panel labelledBy="ov-activity" className="flex-1">
            <PanelHeader id="ov-activity" title={o.activity.title} aside={<span className="tabular">{activity.length}</span>} />
            {activity.length ? (
              <ol className="relative mx-5 mb-4">
                <span aria-hidden="true" className="absolute start-[7px] top-2 bottom-2 w-[2px] rounded-full bg-aqua/25" />
                {activity.slice(0, 8).map((a) => (
                  <li key={a.id} className="relative flex items-start gap-3 py-1.5">
                    {a.event === "handover" ? (
                      <span aria-hidden="true" className="mt-[3px] size-4 flex-none rounded-full border-2 border-wait bg-ink-850" />
                    ) : (
                      <ActionNode className="mt-[3px]" />
                    )}
                    <Link href={`${base}/inbox/${a.conversationId}`} className="group min-w-0 flex-1">
                      <p className={cn("text-[0.8125rem] leading-snug ar:leading-relaxed group-hover:text-paper", a.event === "handover" ? "text-wait" : "text-mist-200")}>
                        {a.text[locale]}
                      </p>
                      <p className="tabular mt-0.5 text-[0.75rem] text-mist-400">
                        <span><bdi>{a.customerName}</bdi></span> · {formatTime(a.at, locale)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mx-5 mb-5 text-[0.875rem] text-mist-300">{o.activity.empty}</p>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <Panel labelledBy="ov-upcoming">
            <PanelHeader
              id="ov-upcoming"
              title={o.upcoming.title}
              aside={
                <Link href={`${base}/appointments`} className="font-medium text-mist-200 hover:text-paper">
                  {t.common.viewAll}
                </Link>
              }
            />
            {upcoming.length ? (
              <ul className="px-5 pb-3">
                {upcoming.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 border-t border-white/[0.05] py-2.5 first:border-t-0">
                    <span className="tabular w-[4.5rem] shrink-0 text-[0.875rem] font-medium">{formatTime(a.start, locale)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.875rem]">
                        <bdi>{a.customer.name}</bdi>
                      </p>
                      <p className="truncate text-[0.75rem] text-mist-400">
                        {services[a.serviceId]} · {members[a.staffId]} · {branches[a.branchId]}
                      </p>
                    </div>
                    {a.bookedBy === "talaqa" ? (
                      <span title={t.appointments.legend.talaqa}>
                        <ActionNode className="size-3.5" />
                        <span className="sr-only">{t.appointments.legend.talaqa}</span>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mx-5 mb-5 text-[0.875rem] text-mist-300">{o.upcoming.empty}</p>
            )}
          </Panel>

          <Panel labelledBy="ov-recent" className="flex-1">
            <PanelHeader
              id="ov-recent"
              title={o.recent.title}
              aside={
                <Link href={`${base}/inbox`} className="font-medium text-mist-200 hover:text-paper">
                  {t.common.viewAll}
                </Link>
              }
            />
            <ul className="px-2 pb-2">
              {recent.map((s) => (
                <li key={s.id}>
                  <Link href={`${base}/inbox/${s.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.035]">
                    <Avatar name={s.customer.name} seed={s.customer.id} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.875rem] font-medium">
                        <bdi>{s.customer.name}</bdi>
                      </p>
                      <p className="flex min-w-0 text-[0.8125rem] text-mist-400">
                        <span className="truncate" lang={s.preview.lang} dir={s.preview.lang === "ar" ? "rtl" : "ltr"}>
                          {s.preview.text}
                        </span>
                      </p>
                    </div>
                    <StatusPill status={s.status} label={t.common.statuses[s.status]} className="max-sm:hidden" />
                    <span className="tabular w-16 shrink-0 text-end text-[0.75rem] text-mist-400">{formatStamp(s.lastAt, workspace.now, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </Page>
  );
}
