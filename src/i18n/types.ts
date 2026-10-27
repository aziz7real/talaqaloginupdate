import type { CapabilityId, ChannelId, FeatureStatus, PlanId } from "@/config/site";

/**
 * Customer messages are shown in Arabic on every locale (that is the point:
 * Talaqa understands Gulf Arabic as people actually type it). `gloss` is the
 * English translation shown underneath on the English site; empty on Arabic.
 */
export interface Utterance {
  text: string;
  gloss: string;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface DemoChoiceDef {
  id: string;
  label: string;
  /** What the customer bubble shows, if different from the chip label. */
  say?: string;
  next: string;
  set?: Record<string, string>;
}

export interface DemoNodeDef {
  assistant: string[];
  /** Actions Talaqa performs before replying (shown inline as action rows). */
  activity: string[];
  card?: boolean;
  choices: DemoChoiceDef[];
}

export interface DemoScript {
  opening: string;
  start: string;
  vars: Record<string, string>;
  nodes: Record<string, DemoNodeDef>;
  card: { title: string; system: string; rows: LabelValue[] };
}

/** One beat of the hero's example workflow. */
export type PreviewStep =
  | { kind: "customer"; text: string; gloss: string }
  | { kind: "action"; text: string; detail?: string }
  | { kind: "talaqa"; text: string }
  | { kind: "booked"; title: string; detail: string; system: string };

export interface Dictionary {
  meta: { title: string; description: string };
  common: {
    skip: string;
    /** Opens an email — the label must say so. */
    requestDemo: string;
    menu: string;
    close: string;
    switchShort: string;
    switchLabel: string;
    statuses: Record<FeatureStatus, string>;
  };
  nav: {
    label: string;
    product: string;
    demo: string;
    how: string;
    pricing: string;
    /** Quiet link to the client sign-in page; never the primary action. */
    clientLogin: string;
  };
  hero: {
    titleLines: [string, string];
    lead: string;
    /** Scrolls to the interactive demo. */
    tryDemo: string;
    preview: {
      label: string;
      caption: string;
      business: string;
      channel: string;
      replay: string;
      steps: PreviewStep[];
    };
  };
  capabilities: {
    title: string;
    lead: string;
    items: { id: CapabilityId; name: string; desc: string }[];
  };
  demo: {
    title: string;
    lead: string;
    note: string;
    businessName: string;
    sampleBadge: string;
    channel: string;
    replyAs: string;
    /** Shown in the (display-only) WhatsApp composer. */
    inputPlaceholder: string;
    restart: string;
    typing: string;
    /** WhatsApp-style header status while Talaqa is replying. */
    typingShort: string;
    today: string;
    /** Suffix for the demo's clock, e.g. "م" or "PM". */
    pmSuffix: string;
    widgetLabel: string;
    legendChat: string;
    legendActions: string;
    /** After the customer's side: the same sample business in the dashboard. */
    dashboardLead: string;
    /** Opens the dashboard with sample data — the label must say "sample". */
    dashboardCta: string;
    script: DemoScript;
  };
  personalization: {
    title: string;
    lead: string;
    same: string;
    tablistLabel: string;
    messageLabel: string;
    replyLabel: string;
    ruleLabel: string;
    /** Each business gets its own customer message, rule and reply. */
    businesses: { id: string; name: string; profile: string; message: Utterance; rule: string; reply: string }[];
  };
  workflow: {
    title: string;
    lead: string;
    stages: { id: "customer" | "talaqa" | "systems" | "team"; name: string; body: string }[];
    channelsTitle: string;
    channels: { id: ChannelId; name: string }[];
    systemsNote: string;
  };
  start: {
    title: string;
    lead: string;
    steps: { title: string; body: string }[];
    cta: string;
    opensEmail: string;
    mailSubject: string;
  };
  footer: {
    tagline: string;
    groups: { product: string; company: string; legal: string };
    links: { contact: string; privacy: string; terms: string };
    rights: string;
    languages: string;
  };
  pricing: {
    metaTitle: string;
    metaDescription: string;
    title: string;
    lead: string;
    currency: string;
    perMonth: string;
    custom: string;
    customNote: string;
    recommended: string;
    cta: string;
    ctaCustom: string;
    plans: {
      id: PlanId;
      name: string;
      desc: string;
      features: { text: string; status?: FeatureStatus }[];
    }[];
    includedTitle: string;
    included: string[];
    setupTitle: string;
    setupBody: string;
    faqTitle: string;
    faqs: { q: string; a: string }[];
  };
  legal: { back: string };
}
