import { Fragment } from "react";
import type { LegalBlock, LegalDoc } from "@/content/legal/types";
import { ArrowIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/layout";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

const labels: Record<Locale, { updated: string; contents: string }> = {
  en: { updated: "Last updated", contents: "On this page" },
  ar: { updated: "آخر تحديث", contents: "في هذه الصفحة" },
};

/** Renders a paragraph, swapping `{email}` for a working mail link. */
function Paragraph({ text }: { text: string }) {
  const parts = text.split("{email}");
  return (
    <p className="t-body text-ink-900/80">
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 ? (
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              dir="ltr"
              className="font-medium text-aqua-700 underline underline-offset-4"
            >
              {siteConfig.contactEmail}
            </a>
          ) : null}
        </Fragment>
      ))}
    </p>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") return <Paragraph text={block} />;
  return (
    <ul className="space-y-2.5">
      {block.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-aqua-700 ar:mt-[0.85em]" />
          <Paragraph text={item} />
        </li>
      ))}
    </ul>
  );
}

export function LegalPage({ locale, doc, t }: { locale: Locale; doc: LegalDoc; t: Dictionary["legal"] }) {
  const updated = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${doc.updated}T00:00:00Z`));

  return (
    <main id="main" className="bg-paper text-ink-900">
      <div className="bg-ink-900 pt-36 pb-16 text-paper sm:pt-44 sm:pb-20">
        <Container>
          <h1 className="t-h2">{doc.title}</h1>
          <p className="mt-4 text-[0.9375rem] text-mist-300">
            {labels[locale].updated}: <time dateTime={doc.updated}>{updated}</time>
          </p>
        </Container>
      </div>

      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-10">
        <nav aria-label={labels[locale].contents} className="hidden self-start lg:sticky lg:top-28 lg:col-span-3 lg:block">
          <p className="t-label text-dim-600">{labels[locale].contents}</p>
          <ol className="mt-4 space-y-2.5">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[0.9375rem] text-ink-900/70 transition-colors hover:text-ink-900">
                  {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-[68ch] lg:col-span-8 lg:col-start-5">
          <p className="t-lead text-ink-900">{doc.intro}</p>
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="mt-12 scroll-mt-28">
              <h2 id={`${s.id}-title`} className="t-h3">
                {s.heading}
              </h2>
              <div className="mt-4 space-y-4">
                {s.body.map((block, i) => (
                  <Block key={i} block={block} />
                ))}
              </div>
            </section>
          ))}

          <a
            href={`/${locale}`}
            className="mt-16 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink-900/70 transition-colors hover:text-ink-900"
          >
            <ArrowIcon className="-scale-x-100 rtl:scale-x-100" />
            {t.back}
          </a>
        </article>
      </Container>
    </main>
  );
}
