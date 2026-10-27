import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/layout/LegalPage";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { terms } from "@/content/legal/terms";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const doc = terms[locale];
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/${locale}/terms`, languages: { ar: "/ar/terms", en: "/en/terms" } },
  };
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <LegalPage locale={locale} doc={terms[locale]} t={getDictionary(locale).legal} />
      <RevealObserver key={locale} />
    </>
  );
}
