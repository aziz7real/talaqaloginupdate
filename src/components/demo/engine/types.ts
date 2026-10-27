/**
 * The live demo talks to a ConversationEngine and nothing else. Today it is a
 * scripted engine; a Voiceflow-backed engine (or any other runtime) can be
 * swapped in without touching the UI.
 */

export interface BookingCard {
  title: string;
  /** Where the booking was recorded, e.g. "Added to the booking system". */
  system: string;
  rows: { label: string; value: string }[];
}

/**
 * The conversation stream. `action` entries are things Talaqa did (checked
 * availability, recorded a booking) — the UI draws them apart from what was said.
 */
export interface ChatMessage {
  id: string;
  role: "customer" | "assistant" | "action";
  text: string;
  card?: BookingCard;
  /** Actions only: false while running, true once complete. */
  done?: boolean;
}

export interface ChatChoice {
  id: string;
  label: string;
}

export interface ActivityItem {
  id: string;
  text: string;
}

/** One exchange: what the customer said, what happened, what Talaqa replied. */
export interface EngineTurn {
  customer?: ChatMessage;
  activity: ActivityItem[];
  replies: ChatMessage[];
  choices: ChatChoice[];
  done: boolean;
}

export type EngineInput = { type: "choice"; id: string } | { type: "text"; text: string };

export interface ConversationEngine {
  start(): Promise<EngineTurn>;
  send(input: EngineInput): Promise<EngineTurn>;
  reset(): void;
}
