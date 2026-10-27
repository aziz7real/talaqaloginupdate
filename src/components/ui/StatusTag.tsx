import type { FeatureStatus } from "@/config/site";
import { cn } from "@/lib/utils";

export function StatusTag({
  status,
  label,
  tone = "dark",
  className,
}: {
  status: FeatureStatus;
  label: string;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] leading-none font-medium",
        status === "available" && (dark ? "bg-aqua/[0.12] text-aqua" : "bg-aqua-700/10 text-aqua-700"),
        status === "beta" && (dark ? "bg-white/[0.08] text-paper" : "bg-ink-900/[0.07] text-ink-900"),
        status === "soon" && (dark ? "bg-white/[0.04] text-mist-300" : "bg-ink-900/[0.04] text-dim-600"),
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          status === "available" && (dark ? "bg-aqua" : "bg-aqua-700"),
          status === "beta" && (dark ? "bg-paper/70" : "bg-ink-900/60"),
          status === "soon" && "border border-current bg-transparent",
        )}
      />
      {label}
    </span>
  );
}
