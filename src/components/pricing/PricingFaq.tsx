import { Container, Section } from "@/components/ui/layout";
import type { Dictionary } from "@/i18n/types";
import { FaqList } from "./FaqList";

/** Title + the accordion (native <details>, enhanced in FaqList). */
export function PricingFaq({ t }: { t: Dictionary["pricing"] }) {
  return (
    <Section id="faq" tone="light2" labelledBy="faq-title">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <h2 id="faq-title" className="t-h2 self-start lg:sticky lg:top-32 lg:col-span-4" data-reveal>
          {t.faqTitle}
        </h2>
        <FaqList faqs={t.faqs} />
      </Container>
    </Section>
  );
}
