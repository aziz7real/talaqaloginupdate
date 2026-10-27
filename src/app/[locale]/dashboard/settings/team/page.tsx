import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsSection } from "@/components/dashboard/settings/SettingsParts";
import { actionClass, Avatar, Panel } from "@/components/dashboard/ui";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getWorkspace } from "@/lib/dashboard/repository";
import { getTenantContext } from "@/lib/dashboard/tenant";
import type { MemberRole } from "@/lib/dashboard/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDashboardDictionary(locale).settings;
  return { title: `${t.tabs.team} · ${t.title}` };
}

export default async function TeamSettingsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDashboardDictionary(locale);
  const t = d.settings.team;
  const workspace = await getWorkspace(await getTenantContext());
  const branchName = Object.fromEntries(workspace.branches.map((b) => [b.id, b.name[locale]]));
  const roles: MemberRole[] = ["owner", "manager", "staff"];

  return (
    <>
      <p className="mb-6 text-[0.9375rem] text-mist-300">{t.lead}</p>

      <SettingsSection id="set-members" title={t.members} help={t.membersHelp}>
        <Panel as="div">
          <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-2">
            <p className="text-[0.8125rem] text-mist-400">{t.inviteNote}</p>
            <button type="button" disabled className={actionClass("secondary", "sm")}>
              {t.invite}
            </button>
          </div>
          <table className="w-full text-[0.875rem]">
            <thead className="max-sm:sr-only">
              <tr className="text-[0.75rem] text-mist-400">
                <th scope="col" className="px-5 py-2 text-start font-normal">{t.columns.name}</th>
                <th scope="col" className="px-3 py-2 text-start font-normal">{t.columns.role}</th>
                <th scope="col" className="px-3 py-2 text-start font-normal">{t.columns.branches}</th>
                <th scope="col" className="px-5 py-2 text-end font-normal">{t.columns.bookable}</th>
              </tr>
            </thead>
            <tbody>
              {workspace.members.map((m) => (
                <tr key={m.id} className="border-t border-white/[0.05] max-sm:flex max-sm:flex-wrap max-sm:items-center max-sm:gap-x-3 max-sm:px-5 max-sm:py-3">
                  <td className="px-5 py-3 max-sm:p-0">
                    <span className="flex items-center gap-3">
                      <Avatar name={m.name[locale]} seed={m.id} size="sm" />
                      <span className="font-medium">{m.name[locale]}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-mist-200 max-sm:p-0">{d.common.roles[m.role]}</td>
                  <td className="px-3 py-3 text-mist-300 max-sm:w-full max-sm:p-0 max-sm:ps-10 max-sm:text-[0.8125rem]">
                    {m.branchIds === "all" ? d.common.allBranches : m.branchIds.map((id) => branchName[id]).join("، ")}
                  </td>
                  <td className="px-5 py-3 text-end text-mist-300 max-sm:hidden">{m.bookable ? t.yes : t.no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </SettingsSection>

      <SettingsSection id="set-roles" title={t.roles} help={t.rolesHelp}>
        <Panel as="div" className="divide-y divide-white/[0.05]">
          {roles.map((r) => (
            <div key={r} className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <p className="text-[0.875rem] font-semibold">{d.common.roles[r]}</p>
              <p className="text-[0.875rem] text-mist-200 ar:leading-relaxed">{t.roleDescriptions[r]}</p>
            </div>
          ))}
        </Panel>
      </SettingsSection>
    </>
  );
}
