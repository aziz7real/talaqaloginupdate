import "server-only";
import type { AppointmentRow, ConversationDetail, ConversationSummary, ConversationTopic, Customer, DailyStats, Workspace } from "../types";
import { activityOn, summarize } from "../derive";
import { inScope, type TenantContext } from "../tenant";
import { dayKey } from "../time";
import { SAMPLE_NOW, branches, business, customers, members, services } from "./business";
import { conversations } from "./conversations";
import { WEEK_START, appointments } from "./appointments";
import { dailyStats, hourWeights, topicWeights } from "./insights";

/** The sample business, read from the tables in this folder. Same contract as the Supabase store. */

function customerFor(ctx: TenantContext, customerId: string): Customer {
  const found = customers.find((c) => c.id === customerId && c.businessId === ctx.businessId);
  if (!found) throw new Error(`Customer ${customerId} is not in this tenant`);
  return found;
}

export const sampleStore = {
  async getWorkspace(ctx: TenantContext): Promise<Workspace> {
    if (business.id !== ctx.businessId) throw new Error("No business for this tenant");
    return {
      business,
      branches: branches.filter((b) => inScope(ctx, { businessId: b.businessId, branchId: b.id })),
      members: members.filter((m) => m.businessId === ctx.businessId),
      services: services.filter((s) => s.businessId === ctx.businessId),
      now: SAMPLE_NOW,
      source: "sample",
    };
  },

  async listConversations(ctx: TenantContext): Promise<ConversationSummary[]> {
    return conversations
      .filter((c) => inScope(ctx, c))
      .map((c) => summarize(c, customerFor(ctx, c.customerId)))
      .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  },

  async getConversation(ctx: TenantContext, id: string): Promise<ConversationDetail | null> {
    const conversation = conversations.find((c) => c.id === id && inScope(ctx, c));
    if (!conversation) return null;
    const mine = appointments.filter((a) => inScope(ctx, a) && a.customerId === conversation.customerId);
    return {
      conversation,
      customer: customerFor(ctx, conversation.customerId),
      appointment: mine.find((a) => a.id === conversation.appointmentId) ?? null,
      visits: mine.filter((a) => a.id !== conversation.appointmentId).sort((a, b) => b.start.localeCompare(a.start)),
    };
  },

  async listActivity(ctx: TenantContext, day: string) {
    return activityOn(
      conversations.filter((c) => inScope(ctx, c)),
      (id) => customerFor(ctx, id).name,
      day,
    );
  },

  async getScheduleWeek(): Promise<string> {
    return WEEK_START;
  },

  async listAppointments(ctx: TenantContext, range: { from: string; to: string }): Promise<AppointmentRow[]> {
    return appointments
      .filter((a) => inScope(ctx, a))
      .filter((a) => {
        const day = dayKey(a.start);
        return day >= range.from && day <= range.to;
      })
      .map((a) => ({ ...a, customer: customerFor(ctx, a.customerId) }));
  },

  async listDailyStats(ctx: TenantContext): Promise<DailyStats[]> {
    return ctx.businessId === business.id ? dailyStats : [];
  },

  async getDistributions(ctx: TenantContext): Promise<{ hours: number[]; topics: Array<[ConversationTopic, number]> }> {
    return ctx.businessId === business.id ? { hours: hourWeights, topics: topicWeights } : { hours: Array(24).fill(0), topics: [] };
  },
};
