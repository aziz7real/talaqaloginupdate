"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { otherLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";

export function SiteHeader({
  locale,
  nav,
  common,
  demoHref,
}: {
  locale: Locale;
  nav: Dictionary["nav"];
  common: Dictionary["common"];
  demoHref: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const other = otherLocale(locale);
  const switchHref = `/${other}${pathname.replace(/^\/(ar|en)(?=\/|$)/, "")}`;
  const home = `/${locale}`;

  const links = [
    { href: `${home}#product`, label: nav.product },
    { href: `${home}#demo`, label: nav.demo },
    { href: `${home}#how`, label: nav.how },
    { href: `${home}/pricing`, label: nav.pricing },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? "border-white/[0.06] bg-ink-900/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-transparent",
      )}
    >
      <a href="#main" className="skip-link">
        {common.skip}
      </a>
      <Container className="flex h-16 items-center justify-between gap-4 md:h-[72px]">
        {/* Logo and menu sit together on the reading-start side: left in English, right in Arabic. */}
        <div className="flex items-center gap-6 xl:gap-10">
          <a href={home} className="-mx-1 rounded-md px-1 text-paper" aria-label={locale === "ar" ? "talaqa.ai، الرئيسية" : "talaqa.ai home"}>
            <Wordmark />
          </a>

          <nav aria-label={nav.label} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-full px-3.5 py-2 text-[0.9375rem] text-mist-200 transition-colors duration-200 hover:bg-white/[0.06] hover:text-paper"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* For existing clients: a quiet text link, so "Request a demo" stays the one action that stands out. */}
          <Link
            href={`${home}/login`}
            className="hidden h-9 items-center rounded-full px-3 text-[0.875rem] text-mist-200 transition-colors hover:bg-white/[0.06] hover:text-paper md:inline-flex"
          >
            {nav.clientLogin}
          </Link>
          <Link
            href={switchHref}
            hrefLang={other}
            lang={other}
            aria-label={common.switchLabel}
            className="inline-flex h-9 min-w-11 items-center justify-center rounded-full px-3 text-[0.875rem] font-medium text-mist-200 transition-colors hover:bg-white/[0.06] hover:text-paper"
          >
            {common.switchShort}
          </Link>
          {/* On phones the menu carries this action; the bar stays uncluttered. */}
          <span className="hidden sm:block">
            <Button href={demoHref} size="sm" icon="mail">
              {common.requestDemo}
            </Button>
          </span>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? common.close : common.menu}
            className="inline-flex size-10 items-center justify-center rounded-full text-paper transition-colors hover:bg-white/[0.08] lg:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open ? (
          <m.div
            ref={menuRef}
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32 }}
            className="h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain bg-ink-900 lg:hidden"
          >
            <Container className="flex h-full flex-col pt-6 pb-10">
              <nav aria-label={nav.label}>
                <ul className="flex flex-col">
                  {links.map((link, i) => (
                    <m.li
                      key={link.href}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 + i * 0.04, duration: 0.32 }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block py-3 text-[2rem] leading-tight font-medium tracking-[-0.03em] text-paper ar:tracking-normal"
                      >
                        {link.label}
                      </a>
                    </m.li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto space-y-3 pt-10">
                <Button href={demoHref} size="lg" icon="mail" className="w-full">
                  {common.requestDemo}
                </Button>
                <Button href={`${home}/login`} size="lg" variant="secondary" className="w-full">
                  {nav.clientLogin}
                </Button>
              </div>
            </Container>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
