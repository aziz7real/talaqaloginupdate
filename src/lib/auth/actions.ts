"use server";

import { redirect } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface SignInState {
  error: "invalid" | "unlinked" | "unavailable" | null;
}

const localeOf = (formData: FormData): Locale => {
  const value = String(formData.get("locale") ?? "");
  return isLocale(value) ? value : "ar";
};

/** Email and password sign-in through Supabase Auth. Only people linked to a business get in. */
export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  if (!supabaseConfigured) return { error: "unavailable" };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "invalid" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    // Wrong email or password reads the same either way; anything else is on our side (or rate limiting).
    return { error: error?.code === "invalid_credentials" || error?.status === 400 ? "invalid" : "unavailable" };
  }

  const { data: member, error: memberError } = await supabase.from("members").select("id").eq("user_id", data.user.id).limit(1).maybeSingle();
  if (memberError) {
    // A failed lookup is not the same as "no business": say so, and leave the cause in the server log.
    console.error("[signIn] membership lookup failed:", memberError);
    await supabase.auth.signOut();
    return { error: "unavailable" };
  }
  if (!member) {
    await supabase.auth.signOut();
    return { error: "unlinked" };
  }

  redirect(`/${localeOf(formData)}/dashboard`);
}

export async function signOut(formData: FormData) {
  if (supabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(`/${localeOf(formData)}/login`);
}
