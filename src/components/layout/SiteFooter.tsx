import Link from "next/link";
import { DomainName, Wordmark } from "@/components/brand/Wordmark";
import { Container } from "@/components/ui/layout";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export function SiteFooter({ locale, t, nav }: { locale: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  const home = `/${locale}`;
  const groups = [
    {
      title: t.groups.product,
      links: [
        { href: `${home}#product`, label: nav.product },
        { href: `${home}#demo`, label: nav.demo },
        { href: `${home}#how`, label: nav.how },
        { href: `${home}/pricing`, label: nav.pricing },
      ],
    },
    {
      title: t.groups.company,
      links: [
        { href: `mailto:${siteConfig.contactEmail}`, label: t.links.contact },
        ...siteConfig.social.map((s) => ({ href: s.href, label: s.label })),
      ],
    },
    {
      title: t.groups.legal,
      links: [
        { href: `${home}/privacy`, label: t.links.privacy },
        { href: `${home}/terms`, label: t.links.terms },
      ],
    },
  ];

  return (
    <footer className="overflow-hidden bg-ink-950 pt-20 pb-8 text-paper sm:pt-24">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href={`/${locale}`} className="inline-block text-paper" aria-label={siteConfig.domain}>
              <Wordmark />
            </a>
            <p className="t-h3 mt-7 max-w-[22ch] text-paper">{t.tagline}</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            {groups.map((group) => (
              <div key={group.title}>
                <h2 className="text-[0.875rem] font-medium text-mist-400">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-[0.9688rem] text-mist-200 transition-colors hover:text-paper">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 text-[0.875rem] text-mist-400 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {t.rights}
          </p>
          <nav aria-label={t.languages} className="flex items-center gap-1">
            {(["ar", "en"] as const).map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                hrefLang={l}
                lang={l}
                aria-current={locale === l ? "page" : undefined}
                className="rounded-full px-3 py-1.5 transition-colors hover:text-paper aria-[current=page]:bg-white/[0.06] aria-[current=page]:text-paper"
              >
                {l === "ar" ? "العربية" : "English"}
              </Link>
            ))}
          </nav>
        </div>
      </Container>

      <div aria-hidden="true" className="mt-14 select-none sm:mt-20">
        <Container>
          <div className="flex leading-none text-ink-800">
            <DomainName className="text-[clamp(4.5rem,19.5vw,19.5rem)] leading-[0.8]" dimClassName="text-ink-700" />
          </div>
        </Container>
      </div>
    </footer>
  );
}
