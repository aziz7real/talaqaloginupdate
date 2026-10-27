import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsSection } from "@/components/dashboard/settings/SettingsParts";
import { Panel } from "@/components/dashboard/ui";
import { isLocale, type Locale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getWorkspace } from "@/lib/dashboard/repository";
import { getTenantContext } from "@/lib/dashboard/tenant";
import type { OpeningHours } from "@/lib/dashboard/types";
import { formatClock, formatSar, weekdayName } from "@/lib/dashboard/time";
import { fill } from "@/lib/utils";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDashboardDictionary(locale).settings;
  return { title: `${t.tabs.business} · ${t.title}` };
}

/** Sunday 2026-10-25 is weekday 0, so `2026-10-${25 + d}` names weekday d. */
const dayName = (d: number, locale: Locale) => weekdayName(`2026-10-${25 + d}`, locale);
const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));

function hoursLine(h: OpeningHours, locale: Locale) {
  const days = h.days.length > 1 ? `${dayName(h.days[0], locale)} – ${dayName(h.days[h.days.length - 1], locale)}` : dayName(h.days[0], locale);
  return { days, time: `${formatClock(toMin(h.opens), locale)} – ${formatClock(toMin(h.closes), locale)}` };
}

function Field({ label, value, aside }: { label: string; value: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.8125rem] font-medium text-mist-200">{label}</p>
      <div className="mt-2 flex h-10 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-ink-900 px-3.5 text-[0.9375rem]">
        <span className="truncate">{value}</span>
        {aside}
      </div>
    </div>
  );
}

export default async function BusinessSettingsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale).settings.business;
  const workspace = await getWorkspace(await getTenantContext());
  const { business } = workspace;
  const number = business.whatsappNumber;
  const masked = number ? `${number.slice(0, 4)} ${number.slice(4, 6)} ••• ${number.slice(-4)}` : "—";

  return (
    <>
      <p className="mb-6 text-[0.9375rem] text-mist-300">{t.lead}</p>

      <SettingsSection id="set-profile" title={t.profile} help={t.profileHelp}>
        <Panel as="div" className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label={t.name} value={business.name[locale]} />
          <Field label={t.category} value={business.category[locale]} />
          <div className="sm:col-span-2">
            <Field
              label={t.whatsapp}
              value={
                <span dir="ltr" className="tabular">
                  {masked}
                </span>
              }
              aside={
                <span className="inline-flex h-6 flex-none items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 text-[0.75rem] font-medium text-mist-300">
                  <span aria-hidden="true" className="size-1.5 rounded-full border border-mist-400" />
                  {t.notConnected}
                </span>
              }
            />
          </div>
        </Panel>
      </SettingsSection>

      <SettingsSection id="set-branches" title={t.branches} help={t.branchesHelp}>
        <div className="grid gap-4 sm:grid-cols-2">
          {workspace.branches.map((b) => (
            <Panel as="div" key={b.id} className="p-5">
              <p className="text-[0.9375rem] font-semibold">{b.name[locale]}</p>
              <dl className="mt-3 space-y-2 text-[0.875rem]">
                {b.hours.map((h) => {
                  const line = hoursLine(h, locale);
                  return (
                    <div key={line.days} className="flex justify-between gap-4">
                      <dt className="text-mist-300">{line.days}</dt>
                      <dd className="tabular text-end">{line.time}</dd>
                    </div>
                  );
                })}
              </dl>
            </Panel>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection id="set-services" title={t.services} help={t.servicesHelp}>
        <Panel as="div">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="text-[0.75rem] text-mist-400">
                <th scope="col" className="px-5 pt-4 pb-2 text-start font-normal">{t.columns.service}</th>
                <th scope="col" className="px-3 pt-4 pb-2 text-end font-normal">{t.columns.duration}</th>
                <th scope="col" className="px-5 pt-4 pb-2 text-end font-normal">{t.columns.price}</th>
              </tr>
            </thead>
            <tbody>
              {workspace.services.map((s) => (
                <tr key={s.id} className="border-t border-white/[0.05]">
                  <td className="px-5 py-3 font-medium">{s.name[locale]}</td>
                  <td className="tabular px-3 py-3 text-end text-mist-200">{fill(t.minutes, { n: String(s.durationMin) })}</td>
                  <td className="tabular px-5 py-3 text-end">{formatSar(s.priceSar, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </SettingsSection>
    </>
  );
}
