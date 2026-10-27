import { Mark } from "@/components/brand/Mark";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/StatusTag";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/types";
import { cn, delay } from "@/lib/utils";

/** Connector i fills just after node i lights (node-light: 300ms + n·260ms), reaching node i+1 as it lights. */
const segment = (i: number) => ({ transitionDelay: `${360 + i * 260}ms`, transitionDuration: "220ms" });

/**
 * Where Talaqa sits in the business: customer → Talaqa → your systems → your
 * team. Answers the trust questions (rules, systems, hand-over) in one place.
 */
export function Workflow({ t, statuses }: { t: Dictionary["workflow"]; statuses: Dictionary["common"]["statuses"] }) {
  return (
    <Section id="how" tone="light2" labelledBy="workflow-title">
      <Container>
        <SectionHeader id="workflow-title" title={t.title} lead={t.lead} tone="light" />

        {/*
          The thread runs node to node: one connector per stage, from just past
          its circle to just before the next one, so it starts and ends on a node.
          --gap mirrors the grid gap so each connector can reach across it.
        */}
        <ol
          className="mt-14 grid gap-10 [--gap:2.5rem] md:grid-cols-4 md:gap-6 md:[--gap:1.5rem] lg:mt-16 lg:gap-8 lg:[--gap:2rem]"
          data-reveal
          style={delay(80)}
        >
          {t.stages.map((stage, i) => {
            const isTalaqa = stage.id === "talaqa";
            const last = i === t.stages.length - 1;
            return (
              <li key={stage.id} className="relative ps-16 md:ps-0">
                {!last ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute start-[1.25rem] top-[calc(2.5rem+6px)] bottom-[calc(6px-var(--gap))] w-px -translate-x-1/2 bg-ink-900/12 md:hidden rtl:translate-x-1/2"
                    >
                      <span className="thread-fill-y absolute inset-0 origin-top bg-aqua-700/70" style={segment(i)} />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute start-[calc(2.5rem+6px)] end-[calc(6px-var(--gap))] top-[1.25rem] hidden h-px bg-ink-900/12 md:block"
                    >
                      <span className="thread-fill absolute inset-0 origin-left bg-aqua-700/70 rtl:origin-right" style={segment(i)} />
                    </span>
                  </>
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute start-0 top-0 grid size-10 place-items-center rounded-full md:relative",
                    isTalaqa ? "bg-ink-900 ring-4 ring-ink-900/[0.06]" : "bg-paper ring-1 ring-ink-900/12",
                  )}
                >
                  {isTalaqa ? (
                    <Mark className="h-3 w-auto text-paper" />
                  ) : (
                    <span className="node-light size-2 rounded-full ring-1 ring-aqua-700/40" style={{ ["--n" as string]: i }} />
                  )}
                </span>
                <h3 className="t-h3 pt-1.5 md:mt-6 md:pt-0">{stage.name}</h3>
                <p className="t-small mt-2 max-w-[30ch] text-dim-600">{stage.body}</p>
              </li>
            );
          })}
        </ol>

        <div
          className="mt-14 grid gap-6 rounded-[24px] bg-paper p-6 sm:p-7 lg:mt-16 lg:grid-cols-12 lg:items-center lg:gap-10"
          data-reveal
        >
          <div className="lg:col-span-5">
            <p className="t-label text-dim-600">{t.channelsTitle}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
              {t.channels.map((c) => {
                const status = siteConfig.channels[c.id];
                return (
                  <li key={c.id} className="flex items-center gap-2 text-[0.9688rem] font-medium">
                    {c.name}
                    <StatusTag status={status} label={statuses[status]} tone="light" />
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="t-small text-dim-600 lg:col-span-7">{t.systemsNote}</p>
        </div>
      </Container>
    </Section>
  );
}
