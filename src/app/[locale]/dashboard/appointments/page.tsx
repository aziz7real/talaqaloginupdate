import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppointmentsView } from "@/components/dashboard/appointments/AppointmentsView";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getScheduleWeek, getWorkspace, listAppointments } from "@/lib/dashboard/repository";
import { getTenantContext } from "@/lib/dashboard/tenant";
import { addDays, dayKey } from "@/lib/dashboard/time";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ day?: string; ap?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDashboardDictionary(locale).appointments.title };
}

export default async function AppointmentsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { day, ap } = await searchParams;
  const t = getDashboardDictionary(locale);
  const ctx = await getTenantContext();
  const [workspace, weekStart] = await Promise.all([getWorkspace(ctx), getScheduleWeek(ctx)]);
  const weekEnd = addDays(weekStart, 6);
  const appointments = await listAppointments(ctx, { from: weekStart, to: weekEnd });

  // ?day= and ?ap= come from links in the inbox; anything outside the sample week falls back to today.
  const initialDay = day && /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= weekStart && day <= weekEnd ? day : dayKey(workspace.now);
  const initialSelected = ap && appointments.some((a) => a.id === ap) ? ap : null;

  return (
    <AppointmentsView
      locale={locale}
      t={t.appointments}
      common={t.common}
      appointments={appointments}
      staff={workspace.members
        .filter((m) => m.bookable)
        .map((m) => ({ id: m.id, name: m.name[locale], branchId: (m.branchIds as string[])[0], daysOff: m.daysOff }))}
      branches={workspace.branches.map((b) => ({ id: b.id, name: b.name[locale], hours: b.hours }))}
      services={Object.fromEntries(workspace.services.map((s) => [s.id, { name: s.name[locale], price: s.priceSar }]))}
      weekStart={weekStart}
      now={workspace.now}
      initialDay={initialDay}
      initialSelected={initialSelected}
    />
  );
}
