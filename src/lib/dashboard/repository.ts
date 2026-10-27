import "server-only";
import type { ActivityItem, AppointmentRow, ConversationDetail, ConversationSummary, ConversationTopic, DailyStats, DataSource, Workspace } from "./types";
import type { TenantContext } from "./tenant";
import { sampleStore } from "./sample/store";
import { supabaseStore } from "./db/store";

export type { ActivityItem, AppointmentRow, ConversationDetail, Workspace } from "./types";

/*
 * The only door to dashboard data. Pages call these functions with a
 * TenantContext and get plain objects back (safe to hand to client
 * components). The tenant decides the source: the signed-in member's business
 * in Supabase (read as that user, so row-level security applies), or the
 * built-in sample business for everyone else. Both stores honour one contract.
 */

interface DashboardStore {
  getWorkspace(ctx: TenantContext): Promise<Workspace>;
  /** Newest activity first. */
  listConversations(ctx: TenantContext): Promise<ConversationSummary[]>;
  getConversation(ctx: TenantContext, id: string): Promise<ConversationDetail | null>;
  /** What Talaqa did on a day, newest first. */
  listActivity(ctx: TenantContext, day: string): Promise<ActivityItem[]>;
  /** The Sunday the appointment screen's week starts on. */
  getScheduleWeek(ctx: TenantContext): Promise<string>;
  /** Appointments whose start falls on the given Riyadh days (inclusive). */
  listAppointments(ctx: TenantContext, range: { from: string; to: string }): Promise<AppointmentRow[]>;
  listDailyStats(ctx: TenantContext): Promise<DailyStats[]>;
  /** How conversations spread over the hours of the day and over topics, as weights. */
  getDistributions(ctx: TenantContext): Promise<{ hours: number[]; topics: Array<[ConversationTopic, number]> }>;
}

const stores: Record<DataSource, DashboardStore> = { sample: sampleStore, supabase: supabaseStore };
const store = (ctx: TenantContext) => stores[ctx.source];

export const getWorkspace = (ctx: TenantContext) => store(ctx).getWorkspace(ctx);
export const listConversations = (ctx: TenantContext) => store(ctx).listConversations(ctx);
export const getConversation = (ctx: TenantContext, id: string) => store(ctx).getConversation(ctx, id);
export const listActivity = (ctx: TenantContext, day: string) => store(ctx).listActivity(ctx, day);
export const getScheduleWeek = (ctx: TenantContext) => store(ctx).getScheduleWeek(ctx);
export const listAppointments = (ctx: TenantContext, range: { from: string; to: string }) => store(ctx).listAppointments(ctx, range);
export const listDailyStats = (ctx: TenantContext) => store(ctx).listDailyStats(ctx);
export const getDistributions = (ctx: TenantContext) => store(ctx).getDistributions(ctx);
