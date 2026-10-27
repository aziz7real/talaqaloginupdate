import { notFound } from "next/navigation";
import { Hero } from "@/components/hero/Hero";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { Capabilities } from "@/components/sections/Capabilities";
import { DemoSection } from "@/components/sections/DemoSection";
import { GetStarted } from "@/components/sections/GetStarted";
import { Personalization } from "@/components/sections/Personalization";
import { Workflow } from "@/components/sections/Workflow";
import { demoHref, siteConfig } from "@/config/site";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const href = demoHref(t.start.mailSubject);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${siteConfig.url}/#org`, name: "Talaqa", alternateName: "طلاقة", url: siteConfig.url },
      {
        "@type": "WebSite",
        name: "Talaqa",
        url: `${siteConfig.url}/${locale}`,
        inLanguage: locale,
        description: t.meta.description,
        publisher: { "@id": `${siteConfig.url}/#org` },
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* One idea per section: what it is → what it handles → try it → it adapts → how it fits → how to start. */}
      <Hero t={t.hero} common={t.common} demoHref={href} />
      <Capabilities t={t.capabilities} statuses={t.common.statuses} />
      <DemoSection t={t.demo} locale={locale} />
      <Personalization t={t.personalization} />
      <Workflow t={t.workflow} statuses={t.common.statuses} />
      <GetStarted t={t.start} demoHref={href} />
      <RevealObserver key={locale} />
    </main>
  );
}
