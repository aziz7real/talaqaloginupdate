"use client";

import { useActionState } from "react";
import { MailIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import type { DashboardDictionary } from "@/i18n/dashboard";
import { signIn, type SignInState } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { actionClass } from "./ui";

const field =
  "mt-2 h-11 w-full rounded-xl border border-white/[0.1] bg-ink-850 px-3.5 text-[0.9375rem] text-paper placeholder:text-mist-400 focus:border-white/25 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua";

/**
 * Email and password sign-in. `live` is false until Supabase is configured:
 * the form then keeps its layout but can't be submitted, and the page says why.
 */
export function LoginForm({ locale, t, live, forgotHref }: { locale: Locale; t: DashboardDictionary["login"]; live: boolean; forgotHref: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, { error: null });

  return (
    <form action={action} className="mt-6" aria-describedby={live ? (state.error ? "login-error" : undefined) : "login-status"}>
      <input type="hidden" name="locale" value={locale} />

      <label htmlFor="email" className="block text-[0.8125rem] font-medium text-mist-200">
        {t.email}
      </label>
      <input id="email" name="email" type="email" required={live} autoComplete="email" dir="ltr" className={cn(field, "text-start")} />

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <label htmlFor="password" className="block text-[0.8125rem] font-medium text-mist-200">
          {t.password}
        </label>
        {live ? (
          <a href={forgotHref} className="inline-flex items-center gap-1.5 text-[0.8125rem] text-mist-300 hover:text-paper">
            <MailIcon className="size-3.5 opacity-80" />
            {t.forgot}
          </a>
        ) : (
          <span className="text-[0.8125rem] text-mist-400">{t.forgot}</span>
        )}
      </div>
      <input id="password" name="password" type="password" required={live} autoComplete="current-password" dir="ltr" className={field} />

      {state.error ? (
        <p id="login-error" role="alert" className="mt-4 rounded-xl border border-alert/30 bg-alert/[0.08] px-4 py-3 text-[0.875rem] text-alert ar:leading-relaxed">
          {t.errors[state.error]}
        </p>
      ) : null}

      <button type="submit" disabled={!live || pending} className={cn(actionClass(live ? "primary" : "secondary"), "mt-6 h-11 w-full")}>
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
