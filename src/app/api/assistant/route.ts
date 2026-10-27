import { NextResponse } from "next/server";

/**
 * Server-side proxy for the live demo. Talks to the Voiceflow Dialog API so
 * the API key stays on the server, and normalises traces into the shape the
 * demo engine expects. Returns 503 until VOICEFLOW_API_KEY is configured.
 */

const RUNTIME = process.env.VOICEFLOW_RUNTIME_URL ?? "https://general-runtime.voiceflow.com";

interface Trace {
  type: string;
  payload?: {
    message?: string;
    buttons?: Array<{ name: string; request: unknown }>;
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.VOICEFLOW_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "assistant not configured" }, { status: 503 });
  }

  let body: { userId?: unknown; locale?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const userId = typeof body.userId === "string" && /^[\w-]{6,64}$/.test(body.userId) ? body.userId : null;
  if (!userId || typeof body.action !== "object" || body.action === null) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const upstream = await fetch(`${RUNTIME}/state/user/${encodeURIComponent(userId)}/interact`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "content-type": "application/json",
      versionID: process.env.VOICEFLOW_VERSION_ID ?? "production",
    },
    body: JSON.stringify({
      action: body.action,
      config: { tts: false, stripSSML: true },
      state: { variables: { locale: body.locale === "en" ? "en" : "ar" } },
    }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }

  const traces = (await upstream.json()) as Trace[];
  const replies: string[] = [];
  const choices: Array<{ id: string; label: string; request: unknown }> = [];
  let done = false;

  for (const trace of traces) {
    if ((trace.type === "text" || trace.type === "speak") && trace.payload?.message) {
      replies.push(trace.payload.message);
    } else if (trace.type === "choice" && trace.payload?.buttons) {
      trace.payload.buttons.forEach((button, i) => {
        choices.push({ id: `${i}:${button.name}`, label: button.name, request: button.request });
      });
    } else if (trace.type === "end") {
      done = true;
    }
  }

  return NextResponse.json({ replies, choices, done });
}
