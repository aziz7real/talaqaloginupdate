import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { Plans } from "@/components/pricing/Plans";
import { PricingDetails } from "@/components/pricing/PricingDetails";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { GetStarted } from "@/components/sections/GetStarted";
import { demoHref } from "@/config/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).pricing;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: `/${locale}/pricing`, languages: { ar: "/ar/pricing", en: "/en/pricing" } },
    openGraph: { url: `/${locale}/pricing`, title: t.metaTitle, description: t.metaDescription },
  };
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const href = demoHref(t.start.mailSubject);

  return (
    <main id="main">
      <Plans t={t.pricing} statuses={t.common.statuses} demoHref={href} />
      <PricingDetails t={t.pricing} />
      <PricingFaq t={t.pricing} />
      <GetStarted t={t.start} demoHref={href} />
      <RevealObserver key={locale} />
    </main>
  );
}
