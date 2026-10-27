"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { otherLocale, type Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import { cn, fill } from "@/lib/utils";
import { CalendarIcon, ExternalIcon, InboxIcon, InfoIcon, InsightsIcon, OverviewIcon, SettingsIcon } from "./icons";
import { signOut } from "@/lib/auth/actions";
import { actionClass, Avatar, SampleTag } from "./ui";

type NavKey = keyof DashboardDictionary["shell"]["nav"];

const navIcons: Record<NavKey, typeof OverviewIcon> = {
  overview: OverviewIcon,
  inbox: InboxIcon,
  appointments: CalendarIcon,
  insights: InsightsIcon,
  settings: SettingsIcon,
};

/**
 * The dashboard frame. Desktop: a labelled sidebar on the page ground (the
 * product, the business, the screens, the account). Phone: a slim top bar and
 * a bottom bar of the five screens; inside a conversation both step aside so
 * the chat gets the whole screen.
 */
export function DashboardShell({
  locale,
  t,
  businessName,
  scope,
  waiting,
  sample,
  account,
  children,
}: {
  locale: Locale;
  t: DashboardDictionary["shell"];
  businessName: string;
  /** The branches this person sees: "All branches", or their branch names. */
  scope: string;
  waiting: number;
  /** The sample business says so on every screen. */
  sample: boolean;
  /** The signed-in member; null on the sample business. */
  account: { id: string; name: string; role: string } | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const root = `/${locale}/dashboard`;
  const other = otherLocale(locale);
  const switchHref = `/${other}${pathname.replace(/^\/(ar|en)(?=\/|$)/, "")}`;
  // A conversation is open on a phone: the chat takes the full screen.
  const inThread = /\/dashboard\/inbox\/[^/]+$/.test(pathname);

  const items: Array<{ key: NavKey; href: string }> = [
    { key: "overview", href: root },
    { key: "inbox", href: `${root}/inbox` },
    { key: "appointments", href: `${root}/appointments` },
    { key: "insights", href: `${root}/insights` },
    { key: "settings", href: `${root}/settings` },
  ];
  const isActive = (href: string) => (href === root ? pathname === root : pathname === href || pathname.startsWith(`${href}/`));
  const waitingLabel = fill(t.waitingBadge, { n: String(waiting) });

  return (
    <div className="flex h-dvh flex-col bg-ink-900 text-paper lg:flex-row">
      <a href="#main" className="skip-link">
        {t.skip}
      </a>

      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col border-e border-white/[0.07] lg:flex">
        <div className="px-5 pt-5 pb-4">
          <Link href={root} className="-mx-1 inline-flex rounded-md px-1" aria-label={`talaqa.ai — ${t.navLabel}`}>
            <Wordmark className="text-[1.2rem]" />
          </Link>
        </div>

        <div className="mx-3 rounded-xl bg-white/[0.04] px-3 py-2.5">
          <p className="truncate text-[0.875rem] font-medium">{businessName}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-[0.75rem] text-mist-300">{scope}</p>
            {sample ? <SampleTag label={t.sample.tag} /> : null}
          </div>
        </div>

        <nav aria-label={t.navLabel} className="mt-4 flex-1 px-3">
          <ul className="space-y-0.5">
            {items.slice(0, 4).map((item) => (
              <NavItem key={item.key} item={item} label={t.nav[item.key]} active={isActive(item.href)} badge={item.key === "inbox" ? waiting : 0} badgeLabel={waitingLabel} />
            ))}
          </ul>
          <ul className="mt-6 space-y-0.5">
            <NavItem item={items[4]} label={t.nav.settings} active={isActive(items[4].href)} />
          </ul>
        </nav>

        <div className="space-y-1 border-t border-white/[0.07] p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={account?.name ?? t.account} seed={account?.id ?? "m_abdullah"} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-medium">{account?.name ?? t.account}</p>
              <p className="truncate text-[0.75rem] text-mist-400">{account?.role ?? t.accountNote}</p>
            </div>
          </div>
          {sample ? null : <SignOutButton locale={locale} label={t.signOut} className="w-full justify-start px-2.5" />}
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/${locale}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] text-mist-300 transition-colors hover:bg-white/[0.06] hover:text-paper"
            >
              <ExternalIcon className="size-3.5" />
              {t.backToSite}
            </Link>
            <Link
              href={switchHref}
              hrefLang={other}
              lang={other}
              aria-label={t.switchLabel}
              className="inline-flex h-8 min-w-10 items-center justify-center rounded-full px-3 text-[0.8125rem] font-medium text-mist-200 transition-colors hover:bg-white/[0.06] hover:text-paper"
            >
              {t.switchShort}
            </Link>
          </div>
        </div>
      </aside>

      {/* Top bar (phone and tablet) */}
      <header className={cn("flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-4 lg:hidden", inThread && "max-lg:hidden")}>
        <Link href={root} className="-mx-1 inline-flex rounded-md px-1" aria-label={`talaqa.ai — ${t.navLabel}`}>
          <Wordmark className="text-[1.05rem]" />
        </Link>
        <div className="flex items-center gap-1">
          {sample ? <SampleTag label={t.sample.tag} /> : <SignOutButton locale={locale} label={t.signOut} />}
          <Link
            href={switchHref}
            hrefLang={other}
            lang={other}
            aria-label={t.switchLabel}
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-[0.875rem] font-medium text-mist-200 hover:bg-white/[0.06]"
          >
            {t.switchShort}
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {sample ? (
          <p className={cn("flex shrink-0 items-start gap-2 border-b border-white/[0.07] px-4 py-2 text-[0.8125rem] text-mist-300 sm:px-6 lg:items-center lg:px-8", inThread && "max-lg:hidden")}>
            <InfoIcon className="mt-0.5 size-3.5 flex-none lg:mt-0" />
            <span className="ar:leading-relaxed">{t.sample.notice}</span>
          </p>
        ) : null}
        <main id="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain outline-none">
          {children}
        </main>
      </div>

      {/* Bottom bar (phone and tablet) */}
      <nav aria-label={t.navLabel} className={cn("shrink-0 border-t border-white/[0.07] bg-ink-900 pb-[env(safe-area-inset-bottom)] lg:hidden", inThread && "max-lg:hidden")}>
        <ul className="grid grid-cols-5">
          {items.map((item) => {
            const Icon = navIcons[item.key];
            const active = isActive(item.href);
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] leading-none font-medium transition-colors",
                    active ? "text-paper" : "text-mist-400 hover:text-mist-200",
                  )}
                >
                  <span className="relative">
                    <Icon className={cn("size-5", active && "text-aqua")} />
                    {item.key === "inbox" && waiting > 0 ? (
                      <span className="tabular absolute -end-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-wait px-1 text-[0.6875rem] leading-none font-semibold text-ink-900">
                        <span aria-hidden="true">{waiting}</span>
                        <span className="sr-only">{waitingLabel}</span>
                      </span>
                    ) : null}
                  </span>
                  <span className="max-w-full truncate px-0.5">{t.nav[item.key]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Ends the Supabase session on the server, then lands on the sign-in page. */
function SignOutButton({ locale, label, className }: { locale: Locale; label: string; className?: string }) {
  return (
    <form action={signOut}>
      <input type="hidden" name="locale" value={locale} />
      <button type="submit" className={cn(actionClass("ghost", "sm"), className)}>
        {label}
      </button>
    </form>
  );
}

function NavItem({
  item,
  label,
  active,
  badge = 0,
  badgeLabel,
}: {
  item: { key: NavKey; href: string };
  label: string;
  active: boolean;
  badge?: number;
  badgeLabel?: string;
}) {
  const Icon = navIcons[item.key];
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-9 items-center gap-3 rounded-lg px-2.5 text-[0.875rem] transition-colors duration-[var(--dur-quick)]",
          active ? "bg-white/[0.07] font-medium text-paper" : "text-mist-300 hover:bg-white/[0.04] hover:text-paper",
        )}
      >
        <Icon className={active ? "text-paper" : "text-mist-400"} />
        <span className="flex-1 truncate">{label}</span>
        {badge > 0 ? (
          <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-wait/[0.14] px-1.5 text-[0.75rem] leading-none font-semibold text-wait">
            <span aria-hidden="true">{badge}</span>
            <span className="sr-only">{badgeLabel}</span>
          </span>
        ) : null}
      </Link>
    </li>
  );
}
