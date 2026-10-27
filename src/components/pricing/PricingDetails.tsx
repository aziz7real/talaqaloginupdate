import { Mark } from "@/components/brand/Mark";
import { CheckIcon } from "@/components/ui/icons";
import { Container, Section } from "@/components/ui/layout";
import type { Dictionary } from "@/i18n/types";
import { delay } from "@/lib/utils";

export function PricingDetails({ t }: { t: Dictionary["pricing"] }) {
  return (
    <Section id="included" tone="light" labelledBy="included-title">
      <Container className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 id="included-title" className="t-h2" data-reveal>
            {t.includedTitle}
          </h2>
          <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {t.included.map((item, i) => (
              <li key={item} className="flex items-start gap-3.5" data-reveal style={delay(80 + i * 60)}>
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-ink-900 text-aqua ar:mt-1.5">
                  <CheckIcon className="size-3.5" />
                </span>
                <span className="t-body text-ink-900">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5" data-reveal style={delay(120)}>
          <div className="flex h-full flex-col rounded-[28px] bg-ink-900 p-7 text-paper sm:p-9">
            <Mark className="h-5 w-auto self-start text-paper" />
            <h3 className="t-h3 mt-8">{t.setupTitle}</h3>
            <p className="t-body mt-3 text-mist-300">{t.setupBody}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
