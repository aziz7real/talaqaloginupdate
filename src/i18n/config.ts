export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

/** Talaqa is Arabic-first. */
export const defaultLocale: Locale = "ar";

export const localeDir: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};

export const ogLocale: Record<Locale, string> = {
  ar: "ar_SA",
  en: "en_US",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}