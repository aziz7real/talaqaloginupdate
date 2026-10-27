import { Container, Section, SectionHeader } from "@/components/ui/layout";
import type { Dictionary } from "@/i18n/types";
import { delay } from "@/lib/utils";
import { BusinessSwitcher } from "./BusinessSwitcher";

export function Personalization({ t }: { t: Dictionary["personalization"] }) {
  return (
    <Section id="personalization" tone="light" labelledBy="personalization-title">
      <Container>
        <SectionHeader id="personalization-title" title={t.title} lead={t.lead} tone="light" />
        <div className="mt-12 lg:mt-14" data-reveal style={delay(100)}>
          <BusinessSwitcher t={t} />
        </div>
      </Container>
    </Section>
  );
}
