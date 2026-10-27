import type { Locale } from "@/i18n/config";

/*
 * Dates and numbers for the dashboard, formatted by hand rather than with
 * Intl so the server and the browser print exactly the same string (no
 * hydration drift between ICU versions), always in Riyadh time and with
 * Western digits, as the rest of the site writes them («6:00 م», «1,000»).
 */

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

export interface Parts {
  year: number;
  /** 0-11 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  /** 0 = Sunday */
  weekday: number;
}

export function parts(iso: string): Parts {
  const d = new Date(new Date(iso).getTime() + RIYADH_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    weekday: d.getUTCDay(),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" in Riyadh for an ISO time (or the key itself). */
export function dayKey(isoOrKey: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrKey)) return isoOrKey;
  const p = parts(isoOrKey);
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}`;
}

/** An ISO time for a Riyadh day and "HH:MM". */
export function at(day: string, time: string): string {
  return `${day}T${time}:00+03:00`;
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function addMinutes(iso: string, minutes: number): string {
  const p = parts(new Date(new Date(iso).getTime() + minutes * 60000).toISOString());
  return `${p.year}-${pad(p.month + 1)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:00+03:00`;
}

export function weekdayOf(day: string): number {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

/** Minutes since midnight, Riyadh. */
export function minuteOfDay(iso: string): number {
  const p = parts(iso);
  return p.hour * 60 + p.minute;
}

export function minutesBetween(fromIso: string, toIso: string): number {
  return Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60000);
}

const names = {
  ar: {
    weekdays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
    weekdaysShort: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    am: "ص",
    pm: "م",
    today: "اليوم",
    yesterday: "أمس",
    tomorrow: "بكرا",
  },
  en: {
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    am: "AM",
    pm: "PM",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
  },
} as const;

export function weekdayName(day: string, locale: Locale, short = false): string {
  const n = names[locale];
  return (short ? n.weekdaysShort : n.weekdays)[weekdayOf(day)];
}

/** "6:00 م" / "6:00 PM" */
export function formatTime(iso: string, locale: Locale): string {
  const { hour, minute } = parts(iso);
  return formatClock(hour * 60 + minute, locale);
}

export function formatClock(minuteOfDay: number, locale: Locale): string {
  const hour = Math.floor(minuteOfDay / 60) % 24;
  const minute = minuteOfDay % 60;
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const suffix = hour < 12 ? names[locale].am : names[locale].pm;
  return `${h12}:${pad(minute)} ${suffix}`;
}

/** "26 أكتوبر" / "26 Oct" */
export function formatDate(isoOrKey: string, locale: Locale): string {
  const [, m, d] = dayKey(isoOrKey).split("-").map(Number);
  return locale === "ar" ? `${d} ${names.ar.months[m - 1]}` : `${d} ${names.en.months[m - 1]}`;
}

/** "الاثنين 26 أكتوبر" / "Monday 26 Oct" */
export function formatLongDate(isoOrKey: string, locale: Locale): string {
  const key = dayKey(isoOrKey);
  return `${weekdayName(key, locale)} ${formatDate(key, locale)}`;
}

/** "Today", "Yesterday", "Tomorrow", or the weekday within a week, else the date. */
export function relativeDay(isoOrKey: string, now: string, locale: Locale): string {
  const key = dayKey(isoOrKey);
  const today = dayKey(now);
  if (key === today) return names[locale].today;
  if (key === addDays(today, -1)) return names[locale].yesterday;
  if (key === addDays(today, 1)) return names[locale].tomorrow;
  const diff = Math.round((new Date(`${key}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86400000);
  if (Math.abs(diff) < 7) return weekdayName(key, locale);
  return formatDate(key, locale);
}

/** A list timestamp: the time today, otherwise the day. */
export function formatStamp(iso: string, now: string, locale: Locale): string {
  return dayKey(iso) === dayKey(now) ? formatTime(iso, locale) : relativeDay(iso, now, locale);
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatSar(n: number, locale: Locale): string {
  return locale === "ar" ? `${formatNumber(n)} ر.س` : `SAR ${formatNumber(n)}`;
}

export function formatPercent(ratio: number, digits = 0): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

/** "8 ث" / "8 s", "18 د" / "18 min", "1 س 5 د" / "1 h 5 min" */
export function formatDuration(seconds: number, locale: Locale): string {
  const u = locale === "ar" ? { s: "ث", m: "د", h: "س" } : { s: "s", m: "min", h: "h" };
  if (seconds < 60) return `${Math.round(seconds)} ${u.s}`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} ${u.m}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ${u.h} ${m} ${u.m}` : `${h} ${u.h}`;
}
