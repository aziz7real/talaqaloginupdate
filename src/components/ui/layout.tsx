import type { ReactNode } from "react";
import { cn, delay } from "@/lib/utils";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

export type SectionTone = "dark" | "darker" | "light" | "light2";

const toneClass: Record<SectionTone, string> = {
  dark: "bg-ink-900 text-paper",
  darker: "bg-ink-950 text-paper",
  light: "bg-paper text-ink-900",
  light2: "bg-paper-2 text-ink-900",
};

/** Every section shares one vertical rhythm: 80 / 96 / 112px. */
export function Section({
  id,
  tone,
  labelledBy,
  children,
  className,
}: {
  id: string;
  tone: SectionTone;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("relative py-20 sm:py-24 lg:py-28", toneClass[tone], className)}>
      {children}
    </section>
  );
}

/** Section title + one supporting line, with the same spacing everywhere. */
export function SectionHeader({
  id,
  title,
  lead,
  tone,
  className,
}: {
  id: string;
  title: string;
  lead?: string;
  tone: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("max-w-[40rem]", className)}>
      <h2 id={id} className="t-h2" data-reveal>
        {title}
      </h2>
      {lead ? (
        <p
          className={cn("t-lead mt-4", tone === "dark" ? "text-mist-200" : "text-ink-900/70")}
          data-reveal
          style={delay(60)}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
