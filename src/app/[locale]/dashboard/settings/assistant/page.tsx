import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SettingsSection, Switch, TonePreview } from "@/components/dashboard/settings/SettingsParts";
import { Panel } from "@/components/dashboard/ui";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDashboardDictionary(locale).settings;
  return { title: `${t.tabs.assistant} · ${t.title}` };
}

/**
 * Talaqa's configuration, shown as it will look. The values match the rules
 * the sample conversations follow (late grace, group size, handovers).
 * Phase 2+ stores them per business and feeds them to the Voiceflow agent.
 */
export default async function AssistantSettingsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale).settings.assistant;

  const handover: Array<[keyof typeof t.handoverRules, boolean]> = [
    ["complaint", true],
    ["group", true],
    ["unknown", true],
    ["human", true],
    ["payment", false],
  ];

  return (
    <>
      <p className="mb-6 text-[0.9375rem] text-mist-300">{t.lead}</p>

      <SettingsSection id="set-tone" title={t.tone} help={t.toneHelp}>
        <Panel as="div" className="p-5">
          <TonePreview locale={locale} t={t} />
        </Panel>
      </SettingsSection>

      <SettingsSection id="set-language" title={t.languages} help={t.languagesHelp}>
        <Panel as="div" className="px-5 py-4 text-[0.9375rem]">
          {t.languageValue}
        </Panel>
      </SettingsSection>

      <SettingsSection id="set-rules" title={t.rules} help={t.rulesHelp}>
        <Panel as="div">
          <dl className="divide-y divide-white/[0.05] text-[0.875rem]">
            {(
              [
                [t.minNotice, t.minNoticeValue],
                [t.lateGrace, t.lateGraceValue],
                [t.groupLimit, t.groupLimitValue],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="text-mist-200">{label}</dt>
                <dd className="tabular font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </SettingsSection>

      <SettingsSection id="set-handover" title={t.handover} help={t.handoverHelp}>
        <Panel as="div">
          <ul className="divide-y divide-white/[0.05]">
            {handover.map(([key, on]) => (
              <li key={key} className="flex items-center justify-between gap-4 px-5 py-3.5 text-[0.875rem]">
                <span className="text-mist-200">{t.handoverRules[key]}</span>
                <Switch on={on} label={t.handoverRules[key]} onLabel={t.on} offLabel={t.off} />
              </li>
            ))}
          </ul>
        </Panel>
      </SettingsSection>
    </>
  );
}
