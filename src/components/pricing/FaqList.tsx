"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import { delay } from "@/lib/utils";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const OPEN_MS = 360;
const CLOSE_MS = 280;

/**
 * Native <details>, so the FAQ works without JavaScript (and `name` keeps it
 * to one open answer there too). With JavaScript, each answer's height eases
 * open and closed, and opening one closes whichever was open before.
 */
export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  const items = useRef<(HTMLDetailsElement | null)[]>([]);
  const motion = useRef(new Map<HTMLDetailsElement, Animation>());
  const reduced = usePrefersReducedMotion();

  // The native exclusive group would close the previous answer instantly; animate it instead.
  useEffect(() => {
    items.current.forEach((d) => d?.removeAttribute("name"));
  }, []);

  const isExpanded = (d: HTMLDetailsElement) => d.dataset.expanded === "true";

  const setExpanded = (d: HTMLDetailsElement, expand: boolean) => {
    if (isExpanded(d) === expand) return;
    d.dataset.expanded = String(expand);
    const body = d.querySelector<HTMLElement>("[data-faq-body]");
    // Start from wherever it is now, so a reversal mid-way doesn't jump.
    const from = d.open && body ? body.getBoundingClientRect().height : 0;
    motion.current.get(d)?.cancel();
    motion.current.delete(d);

    if (expand) d.open = true;
    if (!body || reduced) {
      d.open = expand;
      return;
    }
    const to = expand ? body.scrollHeight : 0;
    const animation = body.animate(
      [
        { height: `${from}px`, opacity: expand ? 0 : 1 },
        { height: `${to}px`, opacity: expand ? 1 : 0 },
      ],
      { duration: expand ? OPEN_MS : CLOSE_MS, easing: EASE, fill: "forwards" },
    );
    motion.current.set(d, animation);
    animation.onfinish = () => {
      if (!expand) d.open = false;
      animation.cancel(); // back to natural height
      motion.current.delete(d);
    };
  };

  const toggle = (event: MouseEvent, index: number) => {
    event.preventDefault();
    const d = items.current[index];
    if (!d) return;
    const expand = !isExpanded(d);
    if (expand) items.current.forEach((other) => other && other !== d && setExpanded(other, false));
    setExpanded(d, expand);
  };

  return (
    <div className="space-y-2 lg:col-span-8">
      {faqs.map((faq, i) => (
        <details
          key={faq.q}
          ref={(el) => {
            items.current[i] = el;
          }}
          name="pricing-faq"
          open={i === 0}
          data-expanded={i === 0 ? "true" : "false"}
          className="faq group rounded-[22px] bg-paper/80 transition-colors duration-[var(--dur-base)] hover:bg-paper-white data-[expanded=true]:bg-paper-white"
          data-reveal
          style={delay(i * 60)}
        >
          <summary
            onClick={(e) => toggle(e, i)}
            className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 sm:px-7 [&::-webkit-details-marker]:hidden"
          >
            <h3 className="text-[1.125rem] leading-snug font-semibold tracking-[-0.015em] ar:tracking-normal ar:leading-relaxed">
              {faq.q}
            </h3>
            <span
              aria-hidden="true"
              className="faq-icon relative grid size-8 shrink-0 place-items-center rounded-full bg-ink-900/[0.06] transition-transform duration-[var(--dur-base)] ease-[var(--ease-quint)] group-data-[expanded=true]:rotate-45"
            >
              <span className="absolute h-[2px] w-3 rounded-full bg-ink-900" />
              <span className="absolute h-3 w-[2px] rounded-full bg-ink-900" />
            </span>
          </summary>
          <div data-faq-body className="overflow-hidden">
            <p className="t-body max-w-[60ch] px-5 pb-6 text-dim-600 sm:px-7">{faq.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
