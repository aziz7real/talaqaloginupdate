import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, IBM_Plex_Sans_Arabic } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { siteConfig } from "@/config/site";
import { isLocale, localeDir, locales, ogLocale, otherLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

// The generated metric fallbacks are local Arial faces with no unicode-range,
// so they would capture Arabic glyphs before Plex Arabic. We ask for them to be
// disabled, but Turbopack emits them anyway — globals.css (--font-sans) names
// the real families first so each covers only its own script.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  adjustFontFallback: false,
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  adjustFontFallback: false,
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#111315",
  colorScheme: "dark light",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t.meta.title, template: `%s — ${locale === "ar" ? "طلاقة" : "Talaqa"}` },
    description: t.meta.description,
    applicationName: "Talaqa",
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en", "x-default": "/ar" },
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: "Talaqa",
      title: t.meta.title,
      description: t.meta.description,
      locale: ogLocale[locale],
      alternateLocale: [ogLocale[otherLocale(locale)]],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
    icons: { icon: "/icon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      dir={localeDir[locale]}
      className={`${geist.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks the page as scripted so reveal animations may hide content first. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {/* The chrome lives in the route groups: (marketing) has the site header and footer, the dashboard its own shell. */}
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
