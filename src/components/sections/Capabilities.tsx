import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/StatusTag";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/types";
import { delay } from "@/lib/utils";

/**
 * What Talaqa handles — a scannable list, not a grid of cards. Each item sits
 * under a hairline whose first stretch is aqua, a quiet echo of the thread.
 */
export function Capabilities({ t, statuses }: { t: Dictionary["capabilities"]; statuses: Dictionary["common"]["statuses"] }) {
  return (
    <Section id="product" tone="light" labelledBy="capabilities-title">
      <Container>
        <SectionHeader id="capabilities-title" title={t.title} lead={t.lead} tone="light" />
        <ul className="mt-10 grid gap-x-8 gap-y-6 sm:mt-12 sm:grid-cols-2 sm:gap-y-10 lg:mt-14 lg:grid-cols-4">
          {t.items.map((item, i) => {
            const status = siteConfig.capabilities[item.id];
            return (
              <li
                key={item.id}
                className="relative border-t border-ink-900/10 pt-4 sm:pt-5 before:absolute before:-top-px before:start-0 before:h-px before:w-8 before:bg-aqua-700"
                data-reveal
                style={delay((i % 4) * 50 + Math.floor(i / 4) * 80)}
              >
                <h3 className="flex flex-wrap items-center gap-2 text-[1.0625rem] leading-snug font-semibold ar:leading-relaxed">
                  {item.name}
                  {status && status !== "available" ? <StatusTag status={status} label={statuses[status]} tone="light" /> : null}
                </h3>
                <p className="t-small mt-1.5 max-w-[34ch] text-dim-600">{item.desc}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
