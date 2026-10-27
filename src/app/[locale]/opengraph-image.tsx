import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "talaqa.ai — Your AI receptionist, built around your business";

const HEADLINE = "Your AI receptionist, built around your business.";

/** Fetches a Geist subset as TTF (the OG renderer can't read woff2). */
async function loadGeist(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/* Latin-only artwork: the OG renderer has no Arabic shaping, and the logo is Latin on both sites. */
export default async function OpengraphImage() {
  const chars = `talaqai${HEADLINE}`;
  const [semibold, medium] = await Promise.all([loadGeist(600, chars), loadGeist(500, "ai")]);
  const fonts = [
    ...(semibold ? [{ name: "Geist", data: semibold, weight: 600 as const, style: "normal" as const }] : []),
    ...(medium ? [{ name: "Geist", data: medium, weight: 500 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#111315",
          color: "#F5F6F4",
          padding: "72px 80px",
          fontFamily: fonts.length ? "Geist" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 22,
              background: "#1E2124",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <svg width="48" height="29" viewBox="0 0 40 24" fill="none">
              <path
                d="M2.5 12c2.1-5.6 4.3-5.6 6.4 0s4.2 5.2 6.2 0c1.5-3.4 3-3.4 4.4 0H30.5"
                stroke="#F5F6F4"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="35" cy="12" r="3.3" fill="#42E8C8" />
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 54, fontWeight: 600, letterSpacing: "-0.055em", lineHeight: 1 }}>
            <span>talaqa</span>
            <div style={{ width: 11, height: 11, borderRadius: 999, background: "#42E8C8", margin: "0 4px 6px" }} />
            <span style={{ color: "#A7ADB2", fontWeight: 500 }}>ai</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.05em", maxWidth: 1000 }}>
          {HEADLINE}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
