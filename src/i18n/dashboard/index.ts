import type { Locale } from "../config";
import ar from "./ar";
import en from "./en";

/**
 * Dashboard copy is its own dictionary so the marketing pages never ship it.
 * The shape comes from ar.ts (the source); en.ts must match it exactly.
 */
export type DashboardDictionary = typeof ar;

const dictionaries: Record<Locale, DashboardDictionary> = { ar, en };

export function getDashboardDictionary(locale: Locale): DashboardDictionary {
  return dictionaries[locale];
}
