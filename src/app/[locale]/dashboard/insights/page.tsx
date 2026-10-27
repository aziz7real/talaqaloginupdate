import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightsView } from "@/components/dashboard/insights/InsightsView";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getDistributions, listDailyStats } from "@/lib/dashboard/repository";
import { getTenantContext } from "@/lib/dashboard/tenant";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDashboardDictionary(locale).insights.title };
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale);
  const ctx = await getTenantContext();
  const [stats, distributions] = await Promise.all([listDailyStats(ctx), getDistributions(ctx)]);

  return (
    <InsightsView
      locale={locale}
      t={t.insights}
      common={t.common}
      stats={stats}
      hourWeights={distributions.hours}
      topicWeights={distributions.topics}
    />
  );
}
