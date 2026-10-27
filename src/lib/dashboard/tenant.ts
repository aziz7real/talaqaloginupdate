import "server-only";
import { cache } from "react";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { BusinessId, DataSource, MemberRole } from "./types";
import { SAMPLE_BUSINESS_ID } from "./sample/business";

/**
 * Who is asking, and for which business. Every repository call takes one, so
 * no query can run without a tenant.
 *
 * - Signed in, with a membership: that member's business, read from Supabase
 *   as the user, so row-level security enforces the same business_id again.
 * - Signed out, or Supabase not configured: the built-in sample business,
 *   clearly labelled as sample data.
 */
export interface TenantContext {
  businessId: BusinessId;
  memberId: string;
  role: MemberRole;
  /** Branches this member may see. */
  branchIds: string[] | "all";
  source: DataSource;
}

const SAMPLE_TENANT: TenantContext = {
  businessId: SAMPLE_BUSINESS_ID,
  memberId: "m_abdullah",
  role: "owner",
  branchIds: "all",
  source: "sample",
};

/** Resolved once per request, however many components ask. */
export const getTenantContext = cache(async (): Promise<TenantContext> => {
  if (!supabaseConfigured) return SAMPLE_TENANT;

  const supabase = await createClient();
  // getClaims() verifies the session token; a cookie alone is never trusted.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return SAMPLE_TENANT;

  const { data: member, error } = await supabase
    .from("members")
    .select("id, business_id, role, branch_ids")
    .eq("user_id", userId)
    .order("created_at")
    .limit(1)
    .maybeSingle<{ id: string; business_id: string; role: MemberRole; branch_ids: string[] | null }>();
  if (error) console.error("[getTenantContext] membership lookup failed:", error);

  // Sign-in refuses accounts without a business, so this only happens if a membership was removed mid-session.
  if (!member) return SAMPLE_TENANT;

  return {
    businessId: member.business_id,
    memberId: member.id,
    role: member.role,
    branchIds: member.branch_ids ?? "all",
    source: "supabase",
  };
});

/** Rows the member may see: their business, and only their branches. */
export function inScope<T extends { businessId: BusinessId; branchId?: string }>(ctx: TenantContext, row: T): boolean {
  if (row.businessId !== ctx.businessId) return false;
  if (ctx.branchIds === "all" || row.branchId === undefined) return true;
  return ctx.branchIds.includes(row.branchId);
}
