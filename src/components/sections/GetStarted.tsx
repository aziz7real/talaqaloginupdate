import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/types";
import { delay } from "@/lib/utils";

/** The close: what happens after you get in touch, and the one action. */
export function GetStarted({ t, demoHref }: { t: Dictionary["start"]; demoHref: string }) {
  return (
    <section id="contact" aria-labelledby="start-title" className="bg-ink-900 py-20 text-paper sm:py-24 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-6">
          <h2 id="start-title" className="t-h2 max-w-[20ch] text-[clamp(2.1rem,1.4rem+2vw,3.25rem)]" data-reveal>
            {t.title}
          </h2>
          <p className="t-lead mt-5 max-w-[36ch] text-mist-200" data-reveal style={delay(60)}>
            {t.lead}
          </p>
          <div className="mt-9" data-reveal style={delay(120)}>
            <Button href={demoHref} size="lg" icon="mail">
              {t.cta}
            </Button>
            <p className="mt-4 text-[0.875rem] text-mist-400">
              {t.opensEmail}{" "}
              <a href={demoHref} dir="ltr" className="text-mist-200 underline-offset-4 transition-colors hover:text-aqua hover:underline">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
        </div>

        {/* What happens next, as three numbered steps joined node to node. */}
        <ol
          className="rounded-[28px] bg-white/[0.03] p-7 ring-1 ring-white/[0.07] sm:p-9 lg:col-span-6 xl:col-span-5 xl:col-start-8"
          data-reveal
          style={delay(100)}
        >
          {t.steps.map((step, i) => (
            <li key={step.title} className="relative ps-14 pb-8 last:pb-0">
              {i < t.steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute start-4 top-[calc(2rem+6px)] bottom-1.5 w-px -translate-x-1/2 bg-white/10 rtl:translate-x-1/2"
                >
                  <span
                    className="thread-fill-y absolute inset-0 origin-top bg-aqua/60"
                    style={{ transitionDelay: `${360 + i * 260}ms`, transitionDuration: "220ms" }}
                  />
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className="absolute start-0 top-0 grid size-8 place-items-center rounded-full bg-ink-900 text-[0.8125rem] font-semibold text-aqua tabular-nums ring-1 ring-white/15"
              >
                {i + 1}
              </span>
              <h3 className="t-h3 pt-0.5">{step.title}</h3>
              <p className="t-small mt-1.5 max-w-[40ch] text-mist-300">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
