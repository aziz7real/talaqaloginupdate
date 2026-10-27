/**
 * The client dashboard's domain model.
 *
 * Multi-tenant by design: a business is the tenant, and every record below
 * carries the `businessId` it belongs to. Nothing is ever read without a
 * TenantContext (see tenant.ts), and in Phase 2 the same column backs
 * Supabase row-level security, so isolation is enforced by the database as
 * well as by this code.
 */

export type BusinessId = string;

/** Copy the business writes itself (service names, branch names) in both languages. */
export interface Localized {
  ar: string;
  en: string;
}

export type MemberRole = "owner" | "manager" | "staff";

/** Weekday as in Date.getUTCDay(): 0 = Sunday … 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface OpeningHours {
  days: Weekday[];
  /** 24h "HH:MM", Riyadh time. */
  opens: string;
  closes: string;
}

export interface Business {
  id: BusinessId;
  name: Localized;
  category: Localized;
  timezone: "Asia/Riyadh";
  /** Shown masked. Phase 2: the number connected through the WhatsApp Business Platform. */
  whatsappNumber: string;
  whatsappConnected: boolean;
}

export interface Branch {
  id: string;
  businessId: BusinessId;
  name: Localized;
  hours: OpeningHours[];
}

export interface Member {
  id: string;
  businessId: BusinessId;
  name: Localized;
  role: MemberRole;
  /** Branches this member can see. Owners see every branch. */
  branchIds: string[] | "all";
  /** Takes appointments (barbers); managers and owners may not. */
  bookable: boolean;
  /** Days off, as weekdays. */
  daysOff: Weekday[];
}

export interface Service {
  id: string;
  businessId: BusinessId;
  name: Localized;
  durationMin: number;
  priceSar: number;
}

export interface Customer {
  id: string;
  businessId: BusinessId;
  name: string;
  /** Never the full number in the UI. */
  phoneLast4: string;
}

/* ------------------------------------------------------------------ */
/* Conversations                                                       */
/* ------------------------------------------------------------------ */

/**
 * handover — Talaqa handed it to the team and nobody has picked it up yet.
 * team     — a team member took over; Talaqa stays quiet in this chat.
 * talaqa   — Talaqa is handling it (usually waiting for the customer).
 * resolved — nothing left to do.
 */
export type ConversationStatus = "handover" | "team" | "talaqa" | "resolved";

/** What Talaqa (or the team) did, drawn apart from what was said. */
export type EventKind =
  | "found" // looked something up: a visit, an appointment
  | "checked" // checked availability or a schedule
  | "answered" // answered from the business's own information
  | "rule" // applied one of the business's rules
  | "booked"
  | "rescheduled"
  | "cancelled"
  | "handover" // handed the conversation to the team
  | "takeover"; // a team member took it over

export type ChatMessage =
  | { id: string; at: string; kind: "customer"; text: string; lang: "ar" | "en" }
  | { id: string; at: string; kind: "talaqa"; text: string; lang: "ar" | "en" }
  | { id: string; at: string; kind: "staff"; memberId: string; text: string; lang: "ar" | "en" }
  | { id: string; at: string; kind: "event"; event: EventKind; text: Localized };

export type ConversationTopic = "booking" | "reschedule" | "cancel" | "prices" | "hours" | "complaint" | "other";

export interface Conversation {
  id: string;
  businessId: BusinessId;
  branchId: string;
  customerId: string;
  channel: "whatsapp" | "web";
  status: ConversationStatus;
  topic: ConversationTopic;
  /** Why Talaqa handed over, when it did. */
  handoverReason?: Localized;
  /** Customer messages the team hasn't seen, for conversations waiting on the team. */
  unread: number;
  appointmentId?: string;
  messages: ChatMessage[];
}

/** What the inbox list needs, without every message. */
export interface ConversationSummary {
  id: string;
  branchId: string;
  status: ConversationStatus;
  topic: ConversationTopic;
  customer: Customer;
  unread: number;
  startedAt: string;
  lastAt: string;
  /** The last thing said (not an event), for the row preview. */
  preview: { kind: "customer" | "talaqa" | "staff"; text: string; lang: "ar" | "en" };
  handoverReason?: Localized;
  /** Lower-cased text of every message, so search covers whole chat histories. */
  searchText: string;
}

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

export type AppointmentStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: string;
  businessId: BusinessId;
  branchId: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  /** ISO 8601 with the +03:00 offset. */
  start: string;
  durationMin: number;
  status: AppointmentStatus;
  bookedBy: "talaqa" | "team";
  conversationId?: string;
}

export interface AppointmentRow extends Appointment {
  customer: Customer;
}

/* ------------------------------------------------------------------ */
/* What the repository hands to pages                                  */
/* ------------------------------------------------------------------ */

/** Where a tenant's data comes from: the built-in sample business, or Supabase. */
export type DataSource = "sample" | "supabase";

export interface Workspace {
  business: Business;
  branches: Branch[];
  members: Member[];
  services: Service[];
  /** The moment the data describes. Sample data is a frozen snapshot. */
  now: string;
  source: DataSource;
}

export interface ConversationDetail {
  conversation: Conversation;
  customer: Customer;
  /** The appointment this conversation made or changed, if any. */
  appointment: Appointment | null;
  /** The customer's other appointments this week, newest first. */
  visits: Appointment[];
}

export interface ActivityItem {
  id: string;
  at: string;
  event: EventKind;
  text: Localized;
  conversationId: string;
  customerName: string;
}

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

/** One day of conversation outcomes. outcomes always sum to `conversations`. */
export interface DailyStats {
  /** "YYYY-MM-DD", Riyadh. */
  date: string;
  conversations: number;
  booked: number;
  answered: number;
  handover: number;
  noReply: number;
  /** Median seconds from the customer's first message to Talaqa's first reply. */
  medianFirstReplySec: number;
  /** True for today, which is still running. */
  partial: boolean;
}
