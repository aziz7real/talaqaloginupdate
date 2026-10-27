import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/StatusTag";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/types";
import { cn, delay } from "@/lib/utils";

const formatPrice = (value: number) => new Intl.NumberFormat("en-US").format(value);

export function Plans({
  t,
  statuses,
  demoHref,
}: {
  t: Dictionary["pricing"];
  statuses: Dictionary["common"]["statuses"];
  demoHref: string;
}) {
  return (
    <section aria-labelledby="pricing-title" className="bg-ink-900 pt-32 pb-20 text-paper sm:pt-36 lg:pt-40 lg:pb-28">
      <Container>
        <h1
          id="pricing-title"
          className="rise t-display max-w-[16ch] text-[clamp(2.3rem,1.4rem+2.8vw,4rem)] ar:text-[clamp(2.15rem,1.35rem+2.5vw,3.7rem)]"
        >
          {t.title}
        </h1>
        <p className="rise t-lead mt-6 max-w-[46ch] text-mist-200" style={delay(90)}>
          {t.lead}
        </p>

        <ul className="mt-14 grid gap-3 lg:mt-16 lg:grid-cols-3">
          {t.plans.map((plan, i) => {
            const config = siteConfig.pricing[plan.id];
            const featured = !!config.recommended;
            const custom = config.monthly === null;
            return (
              <li
                key={plan.id}
                className={cn(
                  "rise flex flex-col rounded-[30px] p-6 sm:p-8",
                  featured ? "bg-paper text-ink-900" : "bg-ink-850 ring-1 ring-white/[0.06]",
                )}
                style={delay(160 + i * 70)}
              >
                <div className="flex min-h-8 items-center justify-between gap-3">
                  <h2 className="t-h3">{plan.name}</h2>
                  {featured ? (
                    <span className="rounded-full bg-aqua px-3 py-1 text-[0.8125rem] font-medium text-ink-900">
                      {t.recommended}
                    </span>
                  ) : null}
                </div>
                <p className={cn("t-body mt-3 min-h-[3.2em]", featured ? "text-dim-600" : "text-mist-300")}>{plan.desc}</p>

                <div className="mt-8 min-h-[5.5rem]">
                  {custom ? (
                    <>
                      <p className="text-[2.6rem] leading-none font-semibold tracking-[-0.04em] ar:tracking-normal ar:leading-tight">
                        {t.custom}
                      </p>
                      <p className={cn("t-small mt-3", featured ? "text-dim-600" : "text-mist-400")}>{t.customNote}</p>
                    </>
                  ) : (
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="tabular text-[3.4rem] leading-none font-semibold tracking-[-0.05em]">
                        {formatPrice(config.monthly!)}
                      </span>
                      <span className={cn("text-[1rem] font-medium", featured ? "text-ink-900" : "text-paper")}>{t.currency}</span>
                      {/* Always on its own line, so every plan's price block has the same shape. */}
                      <span className={cn("w-full text-[0.9375rem]", featured ? "text-dim-600" : "text-mist-400")}>{t.perMonth}</span>
                    </p>
                  )}
                </div>

                <Button
                  href={demoHref}
                  size="lg"
                  icon="mail"
                  variant={featured ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  {custom ? t.ctaCustom : t.cta}
                </Button>

                <ul className="mt-9 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ar:mt-1",
                          featured ? "bg-aqua-700/10 text-aqua-700" : "bg-aqua/[0.12] text-aqua",
                        )}
                      >
                        <CheckIcon className="size-3" />
                      </span>
                      <span className="flex flex-wrap items-center gap-2 text-[0.9688rem] leading-snug ar:leading-relaxed">
                        {feature.text}
                        {feature.status && feature.status !== "available" ? (
                          <StatusTag status={feature.status} label={statuses[feature.status]} tone={featured ? "light" : "dark"} />
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
