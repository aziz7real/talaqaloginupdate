/**
 * Product and company facts that change over time live here, not in copy.
 * Flip a status or add a verified integration and the page updates itself.
 */

export type FeatureStatus = "available" | "beta" | "soon";

export type ChannelId = "web" | "whatsapp" | "phone";

export type CapabilityId =
  | "answer"
  | "availability"
  | "book"
  | "reschedule"
  | "cancel"
  | "handoff"
  | "followups"
  | "branches";

export type PlanId = "starter" | "growth" | "scale";

export interface SocialLink {
  label: string;
  href: string;
}

export interface PlanConfig {
  /** Monthly price in SAR. `null` shows the "tailored" price instead. */
  monthly: number | null;
  recommended?: boolean;
}

export const siteConfig = {
  name: "Talaqa",
  domain: "talaqa.ai",
  url: "https://talaqa.ai",

  // TODO(launch): confirm the inbox that receives demo requests.
  contactEmail: "hello@talaqa.ai",

  /** Channel availability, shown in "How it fits into your business". WhatsApp is primary. */
  channels: {
    whatsapp: "available",
    web: "available",
    phone: "soon",
  } satisfies Record<ChannelId, FeatureStatus>,

  /** Capabilities default to "available"; list only the exceptions. */
  capabilities: {
    followups: "beta",
  } as Partial<Record<CapabilityId, FeatureStatus>>,

  // TODO(launch): placeholder prices — replace with the real plan prices.
  pricing: {
    starter: { monthly: 899 },
    growth: { monthly: 1490, recommended: true },
    scale: { monthly: null },
  } satisfies Record<PlanId, PlanConfig> as Record<PlanId, PlanConfig>,

  /** Rendered in the footer only when non-empty. */
  social: [] as SocialLink[],
};

export function demoHref(subject: string) {
  return `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(subject)}`;
}
