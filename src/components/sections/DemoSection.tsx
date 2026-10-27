import { LiveDemo } from "@/components/demo/LiveDemo";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

export function DemoSection({ t, locale }: { t: Dictionary["demo"]; locale: Locale }) {
  return (
    <Section id="demo" tone="dark" labelledBy="demo-title" className="overflow-hidden">
      <Container>
        <LiveDemo t={t} locale={locale} intro={<SectionHeader id="demo-title" title={t.title} lead={t.lead} tone="dark" />} />
      </Container>
    </Section>
  );
}
