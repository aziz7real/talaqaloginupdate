import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InboxEmpty } from "@/components/dashboard/inbox/InboxEmpty";
import { isLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getDashboardDictionary(locale).inbox.title };
}

export default async function InboxPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDashboardDictionary(locale);
  return <InboxEmpty locale={locale} t={t.inbox} common={t.common} />;
}
