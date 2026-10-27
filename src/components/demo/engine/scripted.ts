import type { DemoScript } from "@/i18n/types";
import { fill } from "@/lib/utils";
import type { ChatMessage, ConversationEngine, EngineInput, EngineTurn } from "./types";

/** Plays a branching script from the dictionary. No network; the visitor picks replies. */
export function createScriptedEngine(script: DemoScript): ConversationEngine {
  let node = script.start;
  let vars = { ...script.vars };
  let seq = 0;
  const id = () => `m${++seq}`;

  const turnFor = (nodeId: string, customerText?: string): EngineTurn => {
    const def = script.nodes[nodeId];
    const replies: ChatMessage[] = def.assistant.map((text) => ({ id: id(), role: "assistant", text: fill(text, vars) }));
    if (def.card) {
      replies.push({
        id: id(),
        role: "assistant",
        text: "",
        card: {
          title: script.card.title,
          system: script.card.system,
          rows: script.card.rows.map((row) => ({ label: row.label, value: fill(row.value, vars) })),
        },
      });
    }
    return {
      customer: customerText ? { id: id(), role: "customer", text: customerText } : undefined,
      activity: def.activity.map((text) => ({ id: id(), text: fill(text, vars) })),
      replies,
      choices: def.choices.map((c) => ({ id: c.id, label: c.label })),
      done: def.choices.length === 0,
    };
  };

  return {
    async start() {
      node = script.start;
      vars = { ...script.vars };
      return turnFor(node, script.opening);
    },
    async send(input: EngineInput) {
      const choice = input.type === "choice" ? script.nodes[node].choices.find((c) => c.id === input.id) : undefined;
      if (!choice) return turnFor(node);
      vars = { ...vars, ...choice.set };
      node = choice.next;
      return turnFor(node, choice.say ?? choice.label);
    },
    reset() {
      node = script.start;
      vars = { ...script.vars };
    },
  };
}
