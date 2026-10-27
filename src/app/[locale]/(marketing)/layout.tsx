import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { demoHref } from "@/config/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

/** The public site: home, pricing and the legal pages share the site header and footer. */
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <SiteHeader locale={locale} nav={t.nav} common={t.common} demoHref={demoHref(t.start.mailSubject)} />
      {children}
      <SiteFooter locale={locale} t={t.footer} nav={t.nav} />
    </>
  );
}
