"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useInView } from "motion/react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { Button } from "@/components/ui/Button";
import { ChatWidget } from "./ChatWidget";
import { createScriptedEngine } from "./engine/scripted";
import { createVoiceflowEngine } from "./engine/voiceflow";
import { useConversation } from "./use-conversation";

const USE_LIVE_ENGINE = process.env.NEXT_PUBLIC_DEMO_ENGINE === "voiceflow";

export function LiveDemo({ t, locale, intro }: { t: Dictionary["demo"]; locale: Locale; intro: ReactNode }) {
  const engine = useMemo(
    () => (USE_LIVE_ENGINE ? createVoiceflowEngine({ locale }) : createScriptedEngine(t.script)),
    [locale, t.script],
  );
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const convo = useConversation(engine, inView);

  return (
    <div ref={ref} className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-5">
        {intro}
        {/* How to read the conversation: what's said vs. what's done. */}
        <ul className="mt-9 space-y-3.5" data-reveal>
          {/* Swatches mirror the chat: a WhatsApp bubble, and a system event between hairlines. */}
          <li className="flex items-center gap-3 text-[0.9375rem] text-mist-200">
            <span aria-hidden="true" className="h-4 w-7 shrink-0 rounded-[6px] rounded-se-none bg-[#D9FDD3]" />
            {t.legendChat}
          </li>
          <li className="flex items-center gap-3 text-[0.9375rem] text-mist-200">
            <span aria-hidden="true" className="flex h-4 w-7 shrink-0 items-center gap-1">
              <span className="h-px flex-1 bg-mist-400/50" />
              <span className="size-1.5 rounded-full bg-aqua" />
              <span className="h-px flex-1 bg-mist-400/50" />
            </span>
            {t.legendActions}
          </li>
        </ul>
        <p className="t-small mt-8 max-w-[42ch] text-mist-400" data-reveal>
          {t.note}
        </p>
        <DashboardTeaser t={t} locale={locale} className="mt-10 max-lg:hidden" />
      </div>

      <div className="lg:col-span-7">
        {/* Sits on the container's end edge, like the hero example above it. */}
        <div className="mx-auto max-w-[470px] lg:me-0">

          <ChatWidget
            t={t}
            messages={convo.messages}
            choices={convo.choices}
            typing={convo.typing}
            busy={convo.busy}
            done={convo.done}
            onSend={convo.send}
            onRestart={convo.restart}
          />
        </div>
        {/* On phones it follows the chat: try the customer's side first, then see the team's. */}
        <DashboardTeaser t={t} locale={locale} className="mt-10 lg:hidden" />
      </div>
    </div>
  );
}

/** The other side of the same sample business: the dashboard, clearly marked as sample data. */
function DashboardTeaser({ t, locale, className }: { t: Dictionary["demo"]; locale: Locale; className?: string }) {
  return (
    <div className={className} data-reveal>
      <p className="t-small max-w-[40ch] text-mist-200">{t.dashboardLead}</p>
      <Button href={`/${locale}/dashboard`} variant="secondary" icon="arrow" className="mt-4">
        {t.dashboardCta}
      </Button>
    </div>
  );
}
