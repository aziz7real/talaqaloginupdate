"use client";

import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import { formatTime } from "@/lib/dashboard/time";
import { cn, fill } from "@/lib/utils";
import { actionClass, Avatar } from "../ui";
import { useInbox } from "./InboxFrame";

/** The pane beside the list before a conversation is chosen: what is waiting for the team, one click away. */
export function InboxEmpty({ locale, t, common }: { locale: Locale; t: DashboardDictionary["inbox"]; common: DashboardDictionary["common"] }) {
  const inbox = useInbox();
  const waiting = inbox.summaries.filter((s) => inbox.statusOf(s) === "handover").sort((a, b) => a.lastAt.localeCompare(b.lastAt));

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-8">
      <div className="w-full max-w-[460px]">
        <h2 className="text-[1.125rem] font-semibold">{t.select.title}</h2>
        <p className="mt-1.5 text-[0.9375rem] text-mist-300 ar:leading-relaxed">{t.select.lead}</p>

        {waiting.length ? (
          <div className="mt-6">
            <p className="text-[0.8125rem] font-medium text-wait">{t.select.waiting}</p>
            <ul className="mt-2 space-y-2">
              {waiting.map((s) => (
                <li key={s.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-ink-850 p-3">
                  <Avatar name={s.customer.name} seed={s.customer.id} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.875rem] font-medium">
                      <bdi>{s.customer.name}</bdi>
                    </p>
                    <p className="truncate text-[0.75rem] text-mist-400">
                      {fill(common.waitingFor, { time: formatTime(s.lastAt, locale) })}
                    </p>
                  </div>
                  <Link href={`/${locale}/dashboard/inbox/${s.id}`} className={cn(actionClass("secondary", "sm"))}>
                    {common.open}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
