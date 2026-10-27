import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/layout/LegalPage";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { privacy } from "@/content/legal/privacy";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const doc = privacy[locale];
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/${locale}/privacy`, languages: { ar: "/ar/privacy", en: "/en/privacy" } },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <LegalPage locale={locale} doc={privacy[locale]} t={getDictionary(locale).legal} />
      <RevealObserver key={locale} />
    </>
  );
}
