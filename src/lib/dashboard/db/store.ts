import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Appointment,
  AppointmentRow,
  AppointmentStatus,
  Branch,
  ChatMessage,
  Conversation,
  ConversationDetail,
  ConversationStatus,
  ConversationTopic,
  Customer,
  DailyStats,
  EventKind,
  MemberRole,
  OpeningHours,
  Weekday,
  Workspace,
} from "../types";
import { activityOn, summarize } from "../derive";
import type { TenantContext } from "../tenant";
import { addDays, at, dayKey, parts, weekdayOf } from "../time";

/*
 * A real business, read from Supabase as the signed-in user. Each query names
 * the tenant's business (and branches) explicitly, and row-level security
 * enforces the same rule again in the database. Rows are mapped to the same
 * domain types as the sample data, so the screens don't know the difference.
 */

/** Conversations the inbox loads, newest first. Search covers these; older ones move to server search later. */
const INBOX_LIMIT = 200;
/** Insights compares up to 28 days with the 28 before them. */
const HISTORY_DAYS = 56;
const TOPICS: ConversationTopic[] = ["booking", "prices", "reschedule", "hours", "cancel", "complaint", "other"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* Row shapes, as the tables in supabase/migrations/0001_init.sql define them. */
interface ConversationDbRow {
  id: string;
  business_id: string;
  branch_id: string;
  customer_id: string;
  channel: "whatsapp" | "web";
  status: ConversationStatus;
  topic: ConversationTopic;
  handover_reason_ar: string | null;
  handover_reason_en: string | null;
  unread: number;
  appointment_id: string | null;
}
interface MessageDbRow {
  id: string;
  conversation_id: string;
  at: string;
  kind: "customer" | "talaqa" | "staff" | "event";
  body: string | null;
  lang: "ar" | "en" | null;
  member_id: string | null;
  event: EventKind | null;
  event_text_ar: string | null;
  event_text_en: string | null;
}
interface CustomerDbRow {
  id: string;
  business_id: string;
  name: string;
  phone_last4: string;
}
interface AppointmentDbRow {
  id: string;
  business_id: string;
  branch_id: string;
  customer_id: string;
  service_id: string;
  staff_id: string;
  starts_at: string;
  duration_min: number;
  status: AppointmentStatus;
  booked_by: "talaqa" | "team";
  conversation_id: string | null;
}
interface StatsDbRow {
  started_at: string;
  first_reply_at: string | null;
  outcome: "booked" | "answered" | "handover" | "no_reply" | null;
  topic: ConversationTopic;
}

type Result<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

/** Reads every page of a query (the API returns at most 1,000 rows per request). */
async function readAll<T>(page: (from: number, to: number) => Result<T>): Promise<T[]> {
  const size = 1000;
  const rows: T[] = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await page(from, from + size - 1);
    if (error) throw new Error(`Supabase: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < size) return rows;
  }
}

function must<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase: ${result.error.message}`);
  if (result.data === null) throw new Error("Supabase: no data");
  return result.data;
}

const toCustomer = (r: CustomerDbRow): Customer => ({ id: r.id, businessId: r.business_id, name: r.name, phoneLast4: r.phone_last4 });

function toMessage(m: MessageDbRow): ChatMessage {
  if (m.kind === "event") {
    return { id: m.id, at: m.at, kind: "event", event: m.event!, text: { ar: m.event_text_ar ?? "", en: m.event_text_en ?? "" } };
  }
  const said = { id: m.id, at: m.at, text: m.body ?? "", lang: m.lang ?? "ar" };
  return m.kind === "staff" ? { ...said, kind: "staff", memberId: m.member_id! } : { ...said, kind: m.kind };
}

function toConversation(r: ConversationDbRow, messages: MessageDbRow[]): Conversation {
  return {
    id: r.id,
    businessId: r.business_id,
    branchId: r.branch_id,
    customerId: r.customer_id,
    channel: r.channel,
    status: r.status,
    topic: r.topic,
    handoverReason: r.handover_reason_ar && r.handover_reason_en ? { ar: r.handover_reason_ar, en: r.handover_reason_en } : undefined,
    unread: r.unread,
    appointmentId: r.appointment_id ?? undefined,
    messages: messages.map(toMessage),
  };
}

const toAppointment = (r: AppointmentDbRow): Appointment => ({
  id: r.id,
  businessId: r.business_id,
  branchId: r.branch_id,
  customerId: r.customer_id,
  serviceId: r.service_id,
  staffId: r.staff_id,
  start: r.starts_at,
  durationMin: r.duration_min,
  status: r.status,
  bookedBy: r.booked_by,
  conversationId: r.conversation_id ?? undefined,
});

const CONVERSATION_COLUMNS = "id, business_id, branch_id, customer_id, channel, status, topic, handover_reason_ar, handover_reason_en, unread, appointment_id";
const MESSAGE_COLUMNS = "id, conversation_id, at, kind, body, lang, member_id, event, event_text_ar, event_text_en";
const APPOINTMENT_COLUMNS = "id, business_id, branch_id, customer_id, service_id, staff_id, starts_at, duration_min, status, booked_by, conversation_id";

/** The current week (Sunday first) in Riyadh time. */
function currentWeek(now: string) {
  const today = dayKey(now);
  return addDays(today, -weekdayOf(today));
}

async function customersById(ctx: TenantContext, ids: string[]): Promise<Map<string, Customer>> {
  if (!ids.length) return new Map();
  const supabase = await createClient();
  const rows = await readAll<CustomerDbRow>((from, to) =>
    supabase.from("customers").select("id, business_id, name, phone_last4").eq("business_id", ctx.businessId).in("id", ids).range(from, to),
  );
  return new Map(rows.map((r) => [r.id, toCustomer(r)]));
}

/** The latest conversations with their messages and customers; shared by the inbox, the overview and the shell. */
const loadInbox = cache(async (ctx: TenantContext) => {
  const supabase = await createClient();
  let query = supabase.from("conversations").select(CONVERSATION_COLUMNS).eq("business_id", ctx.businessId);
  if (ctx.branchIds !== "all") query = query.in("branch_id", ctx.branchIds);
  const rows = must(await query.order("last_message_at", { ascending: false }).limit(INBOX_LIMIT)) as ConversationDbRow[];

  const ids = rows.map((r) => r.id);
  const messages = ids.length
    ? await readAll<MessageDbRow>((from, to) =>
        supabase.from("messages").select(MESSAGE_COLUMNS).eq("business_id", ctx.businessId).in("conversation_id", ids).order("at").order("id").range(from, to),
      )
    : [];
  const byConversation = groupBy(messages, (m) => m.conversation_id);
  const customers = await customersById(ctx, [...new Set(rows.map((r) => r.customer_id))]);

  const conversations = rows
    .filter((r) => byConversation.has(r.id) && customers.has(r.customer_id))
    .map((r) => toConversation(r, byConversation.get(r.id)!));
  return { conversations, customers };
});

/** One row per conversation started in the history window: enough for every chart on Insights. */
const loadStatsRows = cache(async (ctx: TenantContext, today: string) => {
  const supabase = await createClient();
  const since = at(addDays(today, -HISTORY_DAYS), "00:00");
  return readAll<StatsDbRow>((from, to) => {
    let query = supabase.from("conversations").select("started_at, first_reply_at, outcome, topic").eq("business_id", ctx.businessId).gte("started_at", since);
    if (ctx.branchIds !== "all") query = query.in("branch_id", ctx.branchIds);
    return query.order("started_at").range(from, to);
  });
});

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(key(item));
    if (group) group.push(item);
    else groups.set(key(item), [item]);
  }
  return groups;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export const supabaseStore = {
  async getWorkspace(ctx: TenantContext): Promise<Workspace> {
    const supabase = await createClient();
    const [business, branches, members, services] = await Promise.all([
      supabase.from("businesses").select("id, name_ar, name_en, category_ar, category_en, whatsapp_number, whatsapp_connected").eq("id", ctx.businessId).single(),
      supabase.from("branches").select("id, business_id, name_ar, name_en, hours").eq("business_id", ctx.businessId).order("created_at"),
      supabase.from("members").select("id, business_id, name_ar, name_en, role, branch_ids, bookable, days_off").eq("business_id", ctx.businessId).order("created_at"),
      supabase.from("services").select("id, business_id, name_ar, name_en, duration_min, price_sar").eq("business_id", ctx.businessId).order("created_at"),
    ]);
    const b = must(business);
    return {
      business: {
        id: b.id,
        name: { ar: b.name_ar, en: b.name_en },
        category: { ar: b.category_ar, en: b.category_en },
        timezone: "Asia/Riyadh",
        whatsappNumber: b.whatsapp_number ?? "",
        whatsappConnected: b.whatsapp_connected,
      },
      branches: must(branches)
        .filter((r) => ctx.branchIds === "all" || ctx.branchIds.includes(r.id))
        .map(
          (r): Branch => ({ id: r.id, businessId: r.business_id, name: { ar: r.name_ar, en: r.name_en }, hours: r.hours as OpeningHours[] }),
        ),
      members: must(members).map((r) => ({
        id: r.id,
        businessId: r.business_id,
        name: { ar: r.name_ar, en: r.name_en },
        role: r.role as MemberRole,
        branchIds: (r.branch_ids as string[] | null) ?? "all",
        bookable: r.bookable,
        daysOff: r.days_off as Weekday[],
      })),
      services: must(services).map((r) => ({
        id: r.id,
        businessId: r.business_id,
        name: { ar: r.name_ar, en: r.name_en },
        durationMin: r.duration_min,
        priceSar: Number(r.price_sar),
      })),
      now: new Date().toISOString(),
      source: "supabase",
    };
  },

  async listConversations(ctx: TenantContext) {
    const { conversations, customers } = await loadInbox(ctx);
    return conversations.map((c) => summarize(c, customers.get(c.customerId)!));
  },

  async getConversation(ctx: TenantContext, id: string): Promise<ConversationDetail | null> {
    if (!UUID.test(id)) return null;
    const supabase = await createClient();
    const row = (await supabase.from("conversations").select(CONVERSATION_COLUMNS).eq("business_id", ctx.businessId).eq("id", id).maybeSingle()).data as ConversationDbRow | null;
    if (!row || (ctx.branchIds !== "all" && !ctx.branchIds.includes(row.branch_id))) return null;

    const week = currentWeek(new Date().toISOString());
    const [messages, customers, appointments] = await Promise.all([
      readAll<MessageDbRow>((from, to) =>
        supabase.from("messages").select(MESSAGE_COLUMNS).eq("business_id", ctx.businessId).eq("conversation_id", id).order("at").order("id").range(from, to),
      ),
      customersById(ctx, [row.customer_id]),
      supabase
        .from("appointments")
        .select(APPOINTMENT_COLUMNS)
        .eq("business_id", ctx.businessId)
        .eq("customer_id", row.customer_id)
        .gte("starts_at", at(week, "00:00"))
        .lt("starts_at", at(addDays(week, 7), "00:00"))
        .order("starts_at", { ascending: false }),
    ]);
    const customer = customers.get(row.customer_id);
    if (!messages.length || !customer) return null;

    const mine = (must(appointments) as AppointmentDbRow[]).map(toAppointment);
    let appointment = mine.find((a) => a.id === row.appointment_id) ?? null;
    if (row.appointment_id && !appointment) {
      // The appointment this conversation made may fall outside this week.
      const linked = (await supabase.from("appointments").select(APPOINTMENT_COLUMNS).eq("business_id", ctx.businessId).eq("id", row.appointment_id).maybeSingle())
        .data as AppointmentDbRow | null;
      appointment = linked ? toAppointment(linked) : null;
    }
    return {
      conversation: toConversation(row, messages),
      customer,
      appointment,
      visits: mine.filter((a) => a.id !== row.appointment_id),
    };
  },

  async listActivity(ctx: TenantContext, day: string) {
    const { conversations, customers } = await loadInbox(ctx);
    return activityOn(conversations, (id) => customers.get(id)?.name ?? "", day);
  },

  async getScheduleWeek(): Promise<string> {
    return currentWeek(new Date().toISOString());
  },

  async listAppointments(ctx: TenantContext, range: { from: string; to: string }): Promise<AppointmentRow[]> {
    const supabase = await createClient();
    const rows = await readAll<AppointmentDbRow>((from, to) => {
      let query = supabase
        .from("appointments")
        .select(APPOINTMENT_COLUMNS)
        .eq("business_id", ctx.businessId)
        .gte("starts_at", at(range.from, "00:00"))
        .lt("starts_at", at(addDays(range.to, 1), "00:00"));
      if (ctx.branchIds !== "all") query = query.in("branch_id", ctx.branchIds);
      return query.order("starts_at").range(from, to);
    });
    const customers = await customersById(ctx, [...new Set(rows.map((r) => r.customer_id))]);
    return rows.filter((r) => customers.has(r.customer_id)).map((r) => ({ ...toAppointment(r), customer: customers.get(r.customer_id)! }));
  },

  async listDailyStats(ctx: TenantContext): Promise<DailyStats[]> {
    const now = new Date().toISOString();
    const rows = await loadStatsRows(ctx, dayKey(now));
    const byDay = groupBy(rows, (r) => dayKey(r.started_at));
    const today = dayKey(now);
    return Array.from({ length: HISTORY_DAYS + 1 }, (_, i) => {
      const date = addDays(today, i - HISTORY_DAYS);
      const day = byDay.get(date) ?? [];
      const count = (o: StatsDbRow["outcome"]) => day.filter((r) => r.outcome === o).length;
      return {
        date,
        conversations: day.length,
        booked: count("booked"),
        answered: count("answered"),
        handover: count("handover"),
        // Conversations still open count here until they end, as today's do on the sample.
        noReply: count("no_reply") + count(null),
        medianFirstReplySec: median(
          day.filter((r) => r.first_reply_at).map((r) => (new Date(r.first_reply_at!).getTime() - new Date(r.started_at).getTime()) / 1000),
        ),
        partial: date === today,
      };
    });
  },

  async getDistributions(ctx: TenantContext): Promise<{ hours: number[]; topics: Array<[ConversationTopic, number]> }> {
    const rows = await loadStatsRows(ctx, dayKey(new Date().toISOString()));
    const hours = Array<number>(24).fill(0);
    for (const r of rows) hours[parts(r.started_at).hour] += 1;
    return { hours, topics: TOPICS.map((t) => [t, rows.filter((r) => r.topic === t).length]) };
  },
};
