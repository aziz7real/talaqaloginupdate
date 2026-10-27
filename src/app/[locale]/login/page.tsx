import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { InfoIcon } from "@/components/dashboard/icons";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { actionClass } from "@/components/dashboard/ui";
import { ArrowIcon, MailIcon } from "@/components/ui/icons";
import { demoHref, siteConfig } from "@/config/site";
import { isLocale, otherLocale } from "@/i18n/config";
import { getDashboardDictionary } from "@/i18n/dashboard";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTenantContext } from "@/lib/dashboard/tenant";
import { supabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getDashboardDictionary(locale).meta.loginTitle,
    robots: { index: false, follow: false },
    alternates: { canonical: null, languages: {} },
  };
}

/**
 * The sign-in screen. With Supabase configured it signs clients in (Supabase
 * Auth, email and password) and sends them to their own dashboard; without it,
 * it keeps the same layout and says sign-in isn't live. Either way, prospects
 * can open the sample dashboard from here.
 */
export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Already signed in to a business: straight to the dashboard.
  if (supabaseConfigured && (await getTenantContext()).source === "supabase") redirect(`/${locale}/dashboard`);
  const t = getDashboardDictionary(locale);
  const l = t.login;
  const other = otherLocale(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-ink-900 text-paper">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <Link href={`/${locale}`} aria-label={l.backToSite} className="-mx-1 inline-flex rounded-md px-1">
          <Wordmark className="text-[1.2rem]" />
        </Link>
        <Link
          href={`/${other}/login`}
          hrefLang={other}
          lang={other}
          aria-label={t.shell.switchLabel}
          className="inline-flex h-9 min-w-11 items-center justify-center rounded-full px-3 text-[0.875rem] font-medium text-mist-200 hover:bg-white/[0.06] hover:text-paper"
        >
          {t.shell.switchShort}
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[400px]">
          <h1 className="text-[1.75rem] leading-tight font-semibold tracking-[-0.025em] ar:leading-snug ar:tracking-normal">{l.title}</h1>
          <p className="mt-2 text-[0.9375rem] text-mist-300 ar:leading-relaxed">{l.lead}</p>

          {supabaseConfigured ? null : (
            <p id="login-status" className="mt-6 flex gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[0.875rem] text-mist-200 ar:leading-relaxed">
              <InfoIcon className="mt-[3px] size-4 flex-none text-mist-300" />
              {l.notLive}
            </p>
          )}

          <LoginForm
            locale={locale}
            t={l}
            live={supabaseConfigured}
            forgotHref={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(l.forgotSubject)}`}
          />

          {/* Prospects can always look around; once sign-in is live, signing in is the main action. */}
          <Link href={`/${locale}/dashboard`} className={cn(actionClass(supabaseConfigured ? "secondary" : "primary"), "group mt-3 h-11 w-full")}>
            {l.sample}
            <ArrowIcon className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-quint)] group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </Link>

          <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-mist-300">
            {l.noAccount}
            <a href={demoHref(getDictionary(locale).start.mailSubject)} className="inline-flex items-center gap-1.5 font-medium text-paper underline-offset-4 hover:underline">
              <MailIcon className="size-3.5 opacity-80" />
              {l.requestDemo}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
