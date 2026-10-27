import type { Appointment, AppointmentStatus, Weekday } from "../types";
import { addDays, addMinutes, at, weekdayOf } from "../time";
import { SAMPLE_BUSINESS_ID, SAMPLE_NOW, branches, members, services } from "./business";

/*
 * SAMPLE DATA. One week of appointments (Sunday 25 – Saturday 31 October 2026)
 * for the sample barbershop. The appointments that appear in the sample
 * conversations are written out by hand; the rest of the week is filled by a
 * seeded generator, so the same week appears on every build and in every browser.
 */

export const WEEK_START = "2026-10-25";

/** Deterministic PRNG (mulberry32). */
function random(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const base = { businessId: SAMPLE_BUSINESS_ID };

/** Appointments the sample conversations talk about. */
const fixed: Appointment[] = [
  { ...base, id: "ap_bandar", branchId: "br_olaya", customerId: "cu_01", serviceId: "sv_cut", staffId: "m_sultan", start: at("2026-10-25", "19:00"), durationMin: 30, status: "completed", bookedBy: "team" },
  { ...base, id: "ap_yazid", branchId: "br_olaya", customerId: "cu_11", serviceId: "sv_cut", staffId: "m_ahmed", start: at("2026-10-26", "13:00"), durationMin: 30, status: "completed", bookedBy: "talaqa" },
  { ...base, id: "ap_rakan", branchId: "br_olaya", customerId: "cu_09", serviceId: "sv_cut", staffId: "m_khalid", start: at("2026-10-26", "15:00"), durationMin: 30, status: "cancelled", bookedBy: "team", conversationId: "cv_09" },
  { ...base, id: "ap_daniel", branchId: "br_olaya", customerId: "cu_07", serviceId: "sv_beard", staffId: "m_sultan", start: at("2026-10-26", "16:30"), durationMin: 30, status: "confirmed", bookedBy: "talaqa", conversationId: "cv_07" },
  { ...base, id: "ap_salman", branchId: "br_olaya", customerId: "cu_06", serviceId: "sv_cut_beard", staffId: "m_ahmed", start: at("2026-10-27", "18:00"), durationMin: 45, status: "confirmed", bookedBy: "talaqa", conversationId: "cv_06" },
  { ...base, id: "ap_mishal", branchId: "br_yasmin", customerId: "cu_08", serviceId: "sv_cut", staffId: "m_fahad", start: at("2026-10-29", "20:00"), durationMin: 30, status: "confirmed", bookedBy: "talaqa", conversationId: "cv_08" },
];

/** Slots the conversations offer as free; the generator leaves them open. [staff, day, from, to] */
const keepFree: Array<[string, string, string, string]> = [
  ["m_khalid", "2026-10-26", "15:00", "15:30"],
  ["m_omar", "2026-10-26", "17:00", "17:30"],
  ["m_omar", "2026-10-26", "18:30", "19:00"],
  ["m_ahmed", "2026-10-27", "20:00", "20:30"],
  ["m_sultan", "2026-10-27", "19:00", "19:30"],
  ["m_khalid", "2026-10-28", "19:00", "19:30"],
  ["m_khalid", "2026-10-28", "20:30", "21:00"],
  ["m_fahad", "2026-10-28", "19:00", "19:30"],
  ["m_fahad", "2026-10-29", "16:00", "19:00"],
  ["m_omar", "2026-10-29", "16:00", "19:00"],
  ["m_fahad", "2026-10-29", "21:00", "21:30"],
];

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const serviceWeights: Array<[string, number]> = [
  ["sv_cut", 40],
  ["sv_cut_beard", 30],
  ["sv_beard", 12],
  ["sv_kids", 8],
  ["sv_facial", 7],
  ["sv_groom", 3],
];

function generate(): Appointment[] {
  const rand = random(2610);
  const pick = <T,>(items: Array<[T, number]>) => {
    const total = items.reduce((s, [, w]) => s + w, 0);
    let r = rand() * total;
    for (const [item, w] of items) {
      if ((r -= w) < 0) return item;
    }
    return items[items.length - 1][0];
  };

  const out: Appointment[] = [];
  const nowMs = new Date(SAMPLE_NOW).getTime();
  let n = 0;

  for (let d = 0; d < 7; d++) {
    const day = addDays(WEEK_START, d);
    const weekday = weekdayOf(day);
    const busy = weekday === 4 || weekday === 6 ? 0.1 : 0;

    for (const member of members.filter((m) => m.bookable)) {
      if (member.daysOff.includes(weekday as Weekday)) continue;
      const branchId = (member.branchIds as string[])[0];
      const hours = branches.find((b) => b.id === branchId)!.hours.find((h) => h.days.includes(weekday as Weekday))!;
      const open = toMin(hours.opens);
      const close = toMin(hours.closes);

      const taken: Array<[number, number]> = [
        ...fixed
          .filter((a) => a.staffId === member.id && a.start.startsWith(day))
          .map((a): [number, number] => [toMin(a.start.slice(11, 16)), toMin(a.start.slice(11, 16)) + a.durationMin]),
        ...keepFree.filter(([s, k]) => s === member.id && k === day).map(([, , f, t]): [number, number] => [toMin(f), toMin(t)]),
      ];
      const free = (from: number, to: number) => to <= close && taken.every(([a, b]) => to <= a || from >= b);

      for (let t = open; t < close - 20; t += 30) {
        const hour = t / 60;
        const p = (hour < 13 ? 0.2 : hour < 17 ? 0.3 : 0.56) + busy;
        if (rand() > p) continue;
        const serviceId = pick(serviceWeights);
        const service = services.find((s) => s.id === serviceId)!;
        const end = t + service.durationMin;
        if (!free(t, end)) continue;
        taken.push([t, end]);

        const start = at(day, toHHMM(t));
        const past = new Date(addMinutes(start, service.durationMin)).getTime() <= nowMs;
        const r = rand();
        const status: AppointmentStatus = past
          ? r < 0.04
            ? "no_show"
            : r < 0.09
              ? "cancelled"
              : "completed"
          : r < 0.04
            ? "cancelled"
            : "confirmed";

        out.push({
          ...base,
          id: `ap_g${String(++n).padStart(3, "0")}`,
          branchId,
          customerId: `cu_${String(13 + Math.floor(rand() * 28)).padStart(2, "0")}`,
          serviceId,
          staffId: member.id,
          start,
          durationMin: service.durationMin,
          status,
          bookedBy: rand() < 0.66 ? "talaqa" : "team",
        });
        // Skip ahead past a long service so the next slot starts after it.
        t = Math.ceil(end / 30) * 30 - 30;
      }
    }
  }
  return out;
}

export const appointments: Appointment[] = [...fixed, ...generate()].sort((a, b) => a.start.localeCompare(b.start));
