import type { ActivityItem, ChatMessage, Conversation, ConversationSummary, Customer } from "./types";
import { dayKey } from "./time";

/*
 * Pure functions shared by both data sources (sample and Supabase): given the
 * same rows, the screens get the same shapes.
 */

/** The inbox row for a conversation. */
export function summarize(c: Conversation, customer: Customer): ConversationSummary {
  const said = c.messages.filter((m) => m.kind !== "event");
  const last = said[said.length - 1];
  return {
    id: c.id,
    branchId: c.branchId,
    status: c.status,
    topic: c.topic,
    customer,
    unread: c.unread,
    startedAt: c.messages[0].at,
    lastAt: c.messages[c.messages.length - 1].at,
    preview: last ? { kind: last.kind, text: last.text, lang: last.lang } : { kind: "talaqa", text: "", lang: "ar" },
    handoverReason: c.handoverReason,
    searchText: [customer.name, ...said.map((m) => m.text)].join("\n").toLowerCase(),
  };
}

/** What Talaqa did on a day (its events across these conversations), newest first. */
export function activityOn(conversations: Conversation[], customerName: (id: string) => string, day: string): ActivityItem[] {
  return conversations
    .flatMap((c) =>
      c.messages
        .filter((m): m is Extract<ChatMessage, { kind: "event" }> => m.kind === "event" && m.event !== "takeover" && dayKey(m.at) === day)
        .map((e) => ({ id: e.id, at: e.at, event: e.event, text: e.text, conversationId: c.id, customerName: customerName(c.customerId) })),
    )
    .sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id));
}
