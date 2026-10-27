import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import type { Dictionary } from "@/i18n/types";
import { delay } from "@/lib/utils";
import { HeroPreview } from "./HeroPreview";

/** What Talaqa is (left) and what it does (right, as an example workflow). */
export function Hero({ t, common, demoHref }: { t: Dictionary["hero"]; common: Dictionary["common"]; demoHref: string }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="bg-ink-900 pt-28 pb-20 sm:pt-36 lg:pt-40 lg:pb-28">
      <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 xl:pe-6">
          <h1 id="hero-title" className="t-display text-[clamp(2.5rem,1.4rem+3.6vw,4.6rem)] text-paper ar:text-[clamp(2.3rem,1.3rem+3.3vw,4.3rem)]">
            <span className="rise block" style={delay(0)}>
              {t.titleLines[0]}
            </span>
            <span className="rise block" style={delay(90)}>
              {t.titleLines[1]}
            </span>
          </h1>
          <p className="rise t-lead mt-6 max-w-[34ch] text-mist-200" style={delay(180)}>
            {t.lead}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={delay(260)}>
            <Button href="#demo" size="lg" icon="arrow">
              {t.tryDemo}
            </Button>
            <Button href={demoHref} size="lg" variant="secondary" icon="mail">
              {common.requestDemo}
            </Button>
          </div>
        </div>
        <div className="rise lg:col-span-5" style={delay(320)}>
          <HeroPreview t={t.preview} />
        </div>
      </Container>
    </section>
  );
}
