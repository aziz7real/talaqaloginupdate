import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16 Proxy (formerly middleware). Refreshes the Supabase session on the
 * pages that use it — the dashboard and sign-in. The marketing pages are not
 * matched, so they stay static and never touch Supabase.
 */
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: ["/:locale(ar|en)/dashboard/:path*", "/:locale(ar|en)/login"],
};
