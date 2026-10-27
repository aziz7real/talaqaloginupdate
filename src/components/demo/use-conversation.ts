"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wait } from "@/lib/utils";
import type { ChatChoice, ChatMessage, ConversationEngine, EngineInput, EngineTurn } from "./engine/types";

/** Presentation pacing, whichever engine answers. */
const PACE = {
  beforeActions: 320,
  actionRunning: 640,
  betweenActions: 140,
  beforeReply: 220,
  typing: (message: ChatMessage) => (message.card ? 0 : Math.min(1400, 520 + message.text.length * 11)),
};

/**
 * Drives the demo conversation: shows the customer's message, then each
 * action Talaqa takes (running → done) inline, then Talaqa's reply.
 */
export function useConversation(engine: ConversationEngine, active: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [choices, setChoices] = useState<ChatChoice[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const session = useRef(0);
  const started = useRef(false);

  const play = useCallback(async (load: () => Promise<EngineTurn>, firstDelay: number) => {
    const token = session.current;
    const live = () => token === session.current;
    await wait(firstDelay);
    if (!live()) return;
    setBusy(true);
    setChoices([]);
    try {
      const turn = await load();
      if (!live()) return;
      if (turn.customer) setMessages((list) => [...list, turn.customer!]);
      if (turn.activity.length) await wait(PACE.beforeActions);
      for (const item of turn.activity) {
        if (!live()) return;
        setMessages((list) => [...list, { id: item.id, role: "action", text: item.text, done: false }]);
        await wait(PACE.actionRunning);
        if (!live()) return;
        setMessages((list) => list.map((m) => (m.id === item.id ? { ...m, done: true } : m)));
        await wait(PACE.betweenActions);
      }
      for (const reply of turn.replies) {
        await wait(PACE.beforeReply);
        if (!live()) return;
        const typingFor = PACE.typing(reply);
        if (typingFor) {
          setTyping(true);
          await wait(typingFor);
          if (!live()) return;
          setTyping(false);
        }
        setMessages((list) => [...list, reply]);
      }
      setChoices(turn.choices);
      setDone(turn.done);
    } catch {
      if (live()) setDone(true);
    } finally {
      if (live()) {
        setTyping(false);
        setBusy(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    void play(() => engine.start(), 400);
  }, [active, engine, play]);

  const send = useCallback(
    (input: EngineInput) => {
      if (busy) return;
      void play(() => engine.send(input), 0);
    },
    [busy, engine, play],
  );

  const restart = useCallback(() => {
    session.current += 1;
    engine.reset();
    setMessages([]);
    setChoices([]);
    setTyping(false);
    setBusy(false);
    setDone(false);
    void play(() => engine.start(), 300);
  }, [engine, play]);

  return { messages, choices, typing, busy, done, send, restart };
}
