"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import { cn } from "@/lib/utils";
import { Mark } from "@/components/brand/Mark";
import { Segmented } from "../ui";

/** One view per settings area, as underline tabs on a full-width rule. */
export function SettingsTabs({ locale, t }: { locale: Locale; t: DashboardDictionary["settings"] }) {
  const pathname = usePathname();
  const base = `/${locale}/dashboard/settings`;
  const tabs = [
    { href: base, label: t.tabs.business },
    { href: `${base}/team`, label: t.tabs.team },
    { href: `${base}/assistant`, label: t.tabs.assistant },
  ];
  return (
    <nav aria-label={t.tabsLabel} className="mb-6 border-b border-white/[0.08]">
      <ul className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 items-center border-b-2 text-[0.875rem] font-medium whitespace-nowrap transition-colors",
                  active ? "border-paper text-paper" : "border-transparent text-mist-300 hover:text-paper",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A switch that shows its state but can't be changed in the preview. */
export function Switch({ on, label, onLabel, offLabel }: { on: boolean; label: string; onLabel: string; offLabel: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="text-[0.75rem] text-mist-400">{on ? onLabel : offLabel}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled
        className={cn("relative h-5 w-9 flex-none cursor-not-allowed rounded-full transition-colors", on ? "bg-paper/85" : "bg-white/[0.12]")}
      >
        <span className={cn("absolute top-0.5 size-4 rounded-full transition-[inset-inline-start]", on ? "start-[18px] bg-ink-900" : "start-0.5 bg-mist-300")} />
      </button>
    </span>
  );
}

/** The tone choice and what it produces: the same reply in each voice. */
export function TonePreview({ locale, t }: { locale: Locale; t: DashboardDictionary["settings"]["assistant"] }) {
  const [tone, setTone] = useState<"friendly" | "formal">("friendly");
  return (
    <div>
      <Segmented
        label={t.tone}
        value={tone}
        onChange={setTone}
        options={[
          { value: "friendly", label: t.toneOptions.friendly },
          { value: "formal", label: t.toneOptions.formal },
        ]}
      />
      <p className="mt-4 text-[0.75rem] text-mist-400">{t.tonePreviewLabel}</p>
      <div className="mt-2 flex flex-col items-end gap-1">
        <p className="flex items-center gap-1.5 px-1 text-[0.75rem] font-medium text-mist-300">
          <Mark className="h-2 w-auto text-aqua" />
          {locale === "ar" ? "طلاقة" : "Talaqa"}
        </p>
        <div lang="ar" dir="rtl" aria-live="polite" className="max-w-[90%] rounded-2xl rounded-se-md border border-aqua/20 bg-aqua/[0.08] px-3.5 py-2 text-[0.9375rem] leading-[1.75]">
          {t.toneSamples[tone]}
        </div>
        {t.toneGlosses[tone] ? <p className="max-w-[90%] px-1 text-[0.8125rem] text-mist-400">{t.toneGlosses[tone]}</p> : null}
      </div>
    </div>
  );
}

/** A settings area: what it is on one side, the values on the other. Stacks on phones. */
export function SettingsSection({ title, help, children, id }: { title: string; help?: string; children: ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="grid gap-4 border-t border-white/[0.07] py-7 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 id={id} className="text-[0.9375rem] font-semibold">
          {title}
        </h2>
        {help ? <p className="mt-1 text-[0.875rem] text-mist-300 ar:leading-relaxed">{help}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
