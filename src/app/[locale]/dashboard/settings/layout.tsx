import { notFound } from "next/navigation";
import { InfoIcon } from "@/components/dashboard/icons";
import { SettingsTabs } from "@/components/dashboard/settings/SettingsParts";
import { Page, PageHeader } from "@/components/dashboard/ui";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";

export default async function SettingsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale).settings;

  return (
    <Page className="max-w-[1120px]">
      <PageHeader
        title={t.title}
        sub={
          <span className="inline-flex items-start gap-1.5">
            <InfoIcon className="mt-[3px] size-3.5 flex-none" />
            {t.readOnly}
          </span>
        }
      />
      <SettingsTabs locale={locale} t={t} />
      {children}
    </Page>
  );
}
