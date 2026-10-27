import type { Conversation, ConversationTopic, DailyStats } from "../types";
import { addDays, dayKey } from "../time";
import { SAMPLE_BUSINESS_ID, SAMPLE_NOW } from "./business";
import { conversations } from "./conversations";

/*
 * SAMPLE DATA. Eight weeks of daily conversation outcomes for the sample
 * barbershop, from a seeded generator. Today's row is not generated: it is
 * counted from today's sample conversations, so Insights, the Overview and
 * the Inbox agree.
 */

export const HISTORY_DAYS = 56;

function random(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Thursday and Saturday evenings are the busy ones; Friday opens late. */
const weekdayFactor = [1.0, 0.95, 0.92, 1.02, 1.32, 0.78, 1.22];

function generatedDay(day: string, index: number, rand: () => number): DailyStats {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  const trend = 1 + index * 0.004;
  const conversations = Math.round(28 * weekdayFactor[weekday] * trend * (0.86 + rand() * 0.28));
  const booked = Math.round(conversations * (0.4 + rand() * 0.08));
  const handover = Math.round(conversations * (0.04 + rand() * 0.05));
  const noReply = Math.round(conversations * (0.08 + rand() * 0.06));
  return {
    date: day,
    conversations,
    booked,
    handover,
    noReply,
    answered: conversations - booked - handover - noReply,
    medianFirstReplySec: Math.round(5 + rand() * 6),
    partial: false,
  };
}

function hasEvent(c: Conversation, kind: string, day: string) {
  return c.messages.some((m) => m.kind === "event" && m.event === kind && dayKey(m.at) === day);
}

/** Today so far, counted from the conversation rows. */
function today(): DailyStats {
  const day = dayKey(SAMPLE_NOW);
  const rows = conversations.filter((c) => c.businessId === SAMPLE_BUSINESS_ID && c.messages.some((m) => dayKey(m.at) === day));
  const booked = rows.filter((c) => hasEvent(c, "booked", day)).length;
  const handover = rows.filter((c) => hasEvent(c, "handover", day)).length;
  const waiting = rows.filter((c) => c.status === "talaqa").length;
  return {
    date: day,
    conversations: rows.length,
    booked,
    handover,
    // Still open conversations are not "no reply" yet; today is shown as partial and left out of the totals.
    noReply: waiting,
    answered: rows.length - booked - handover - waiting,
    medianFirstReplySec: 7,
    partial: true,
  };
}

export const dailyStats: DailyStats[] = (() => {
  const rand = random(4471);
  const todayKey = dayKey(SAMPLE_NOW);
  const rows: DailyStats[] = [];
  for (let i = HISTORY_DAYS; i >= 1; i--) {
    rows.push(generatedDay(addDays(todayKey, -i), HISTORY_DAYS - i, rand));
  }
  rows.push(today());
  return rows;
})();

/** When customers write, by hour (Riyadh). Late nights count: Talaqa answers them. */
export const hourWeights = [3, 2, 1, 0.5, 0.3, 0.3, 0.5, 1, 2, 3, 4, 4.5, 5, 5, 4.5, 4.5, 5, 6, 7, 8, 8, 7, 6, 4.5];

/** What conversations were mainly about. */
export const topicWeights: Array<[ConversationTopic, number]> = [
  ["booking", 46],
  ["prices", 15],
  ["reschedule", 11],
  ["hours", 10],
  ["cancel", 7],
  ["complaint", 2],
  ["other", 9],
];
