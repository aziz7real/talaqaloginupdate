import type { ChatChoice, ChatMessage, ConversationEngine, EngineInput, EngineTurn } from "./types";

/**
 * Live engine backed by the /api/assistant route, which proxies a Voiceflow
 * project server-side (the API key never reaches the browser).
 *
 * Enable with NEXT_PUBLIC_DEMO_ENGINE=voiceflow plus VOICEFLOW_API_KEY on the
 * server. Untested against a live project — verify the trace mapping in
 * src/app/api/assistant/route.ts against your Voiceflow agent before launch.
 */

interface AssistantResponse {
  replies: string[];
  choices: Array<{ id: string; label: string; request: unknown }>;
  done: boolean;
}

export function createVoiceflowEngine({ locale }: { locale: string }): ConversationEngine {
  let userId = makeUserId();
  let requests = new Map<string, { label: string; request: unknown }>();
  let seq = 0;
  const id = () => `v${++seq}`;

  async function interact(action: unknown, customerText?: string): Promise<EngineTurn> {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, locale, action }),
    });
    if (!res.ok) throw new Error(`assistant ${res.status}`);
    const data = (await res.json()) as AssistantResponse;
    requests = new Map(data.choices.map((c) => [c.id, { label: c.label, request: c.request }]));
    const replies: ChatMessage[] = data.replies.map((text) => ({ id: id(), role: "assistant", text }));
    const choices: ChatChoice[] = data.choices.map((c) => ({ id: c.id, label: c.label }));
    return {
      customer: customerText ? { id: id(), role: "customer", text: customerText } : undefined,
      activity: [],
      replies,
      choices,
      done: data.done,
    };
  }

  return {
    start: () => interact({ type: "launch" }),
    send(input: EngineInput) {
      if (input.type === "text") return interact({ type: "text", payload: input.text }, input.text);
      const choice = requests.get(input.id);
      if (!choice) return interact({ type: "text", payload: input.id }, input.id);
      return interact(choice.request, choice.label);
    },
    reset() {
      userId = makeUserId();
      requests = new Map();
    },
  };
}

function makeUserId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
