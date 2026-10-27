# Talaqa website (talaqa.ai) — project memory

Marketing site for **Talaqa / طلاقة**, an AI receptionist for appointment-based service
businesses (salons, barbers, clinics where appropriate, workshops, gyms, restaurants…).
It answers customers on WhatsApp, books / reschedules / cancels, answers business
questions, follows each business's rules, connects to its systems, and hands over to
humans. Positioning: **"Your AI receptionist, built around your business"** —
«موظف استقبال ذكي، مفصّل على مقاس شغلك». It is a digital employee that gets things done,
not a generic chatbot.

Next.js 16 ships its own agent notes; follow them too:

@AGENTS.md

## Run it (Windows)

```bash
npm.cmd install          # npm.ps1 is blocked by the PowerShell execution policy here
npm.cmd run dev          # http://localhost:3000 → redirects to /ar
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

- If `next dev` crashes with `EXDEV … nextjs-nodejs\Config\config.json`, set
  `NEXT_TELEMETRY_DISABLED=1` first (sandbox can't write Next's telemetry config).
- Phone on the same Wi-Fi: `http://192.168.100.39:3000/ar`. That IP is whitelisted in
  `next.config.ts` → `allowedDevOrigins`; update it if the PC's local IP changes.
- `.claude/launch.json` sits one folder up (session root) and runs `npm --prefix talaqa run dev`.
- Git lives in `talaqa/` (baseline commit `6eb8738`). `git` isn't on PATH here; GitHub Desktop's copy
  works: `%LOCALAPPDATA%\GitHubDesktop\app-3.1.2\resources\app\git\cmd\git.exe`. `.env*` is ignored.
- Always run **lint, typecheck and build** before calling work done.
- Stop `next dev` before `npm run build`: running both corrupted `.next/dev` once (stale CSS, then
  every page 500'd with a JSON parse error). Fix: stop dev, delete `.next/dev`, restart.

## Brand rules (decided with the owner — do not change without asking)

- **Arabic name: طلاقة (with ة). Treat it as MASCULINE** like a receptionist:
  «طلاقة يرد، يحجز، يعدّل، ينفّذ»، «جرّبه»، «كيف يشتغل»، «مبني على…». This applies to
  site copy AND the Arabic legal text. Verbs whose subject is the business or "you" stay as they are.
  Avoid «تلقى» as a verb (it was the old brand name) — use «يحصّل».
- **English name: Talaqa.**
- **Logo = one Latin lockup "talaqa.ai" on BOTH locales** (graphite tile with the mark +
  "talaqa" + aqua dot as the period + grey "ai"). It never mirrors in RTL and is always LTR,
  `lang="en"`, `translate="no"`. Component: `src/components/brand/Wordmark.tsx`.
  Exported files: `public/brand/` (outlined SVG + 4× transparent PNG, dark/light, full/icon).
  The aqua dot is spaced **optically**, not with equal margins: the wordmark's tight tracking pulls
  "talaqa" into the dot, so it gets more space before (`ms-[0.12em] me-[0.02em]`; SVG circle cx 488.95)
  — equal ink gaps either side. Keep the component and the exported files in sync.
- The mark: a loose wave settling into a straight line ending in an aqua point
  (conversation → action). `src/components/brand/Mark.tsx`. Temporary until a final logo.
- **WhatsApp is the primary channel.** Website chat available; phone calls "coming soon".
- **Arabic-first.** Default route is `/ar`. Saudi/Gulf conversational but refined
  («وش»، «بكرا»، «أبشر»); no government-style MSA, no heavy slang. English gets equal care.
- Customer messages are shown **in Arabic on both locales**; English adds a gloss underneath.
- **Honesty rules:** no invented testimonials, customer counts, metrics, uptime,
  certifications, partner logos or integrations. Name a system only once a live integration
  is confirmed. Scripted demos are labelled as examples. CTA labels must say what happens
  (mailto links say "Request a demo" + mail icon, never "Book").
- No emojis in UI copy. No gradients/glows/decorative loops; motion must mean something.
- Header: logo + menu together on the reading-start side (left in EN, right in AR),
  language switch + CTA on the other side.

## Architecture

```
src/
  app/[locale]/layout.tsx      root: html lang/dir, fonts, metadata, MotionProvider (no chrome)
  app/[locale]/(marketing)/layout.tsx   site header + footer (route group: URLs unchanged)
  app/[locale]/(marketing)/page.tsx     homepage section order
  app/[locale]/(marketing)/pricing|privacy|terms/page.tsx
  app/[locale]/dashboard/...   client dashboard (own shell, noindex) — see "Client dashboard"
  app/[locale]/login/page.tsx  sign-in screen (Supabase Auth; "not live" only without env vars; noindex)
  app/[locale]/opengraph-image.tsx   Latin-only OG (loads Geist from Google Fonts)
  app/api/assistant/route.ts   Voiceflow proxy (503 until VOICEFLOW_API_KEY is set)
  app/sitemap.ts, robots.ts, globals.css (all design tokens)
  i18n/config.ts               locales ar|en, dir map
  i18n/types.ts                Dictionary type — keeps ar/en in sync (TS errors if a key is missing)
  i18n/dictionaries/ar.ts      SOURCE copy (Arabic)   en.ts  English
  content/legal/               Privacy + Terms, both languages ({email} placeholder)
  config/site.ts               contact email, channel + capability statuses, plan prices, social
  components/
    brand/      Mark, Wordmark (+ DomainName)
    flow/       Action.tsx — "the thread" (ActionThread + ActionRow), the visual signature
    hero/       Hero, HeroPreview (example workflow, plays once, Replay)
    demo/       ChatWidget (WhatsApp UI), LiveDemo, use-conversation, engine/{types,scripted,voiceflow}
    sections/   Capabilities, DemoSection, Personalization + BusinessSwitcher, Workflow, GetStarted
    pricing/    Plans, PricingDetails, PricingFaq
    layout/     SiteHeader, SiteFooter, LegalPage
    motion/     MotionProvider (LazyMotion+MotionConfig), RevealObserver, use-prefers-reduced-motion
    ui/         Button (icon: "arrow"|"mail"), StatusTag, icons, layout (Container, Section, SectionHeader)
public/brand/   logo files; public/icon.svg favicon
```

- Stack: Next.js 16.4 App Router, React 19, TypeScript, Tailwind CSS 4, `motion` (Motion for React).
  No UI library. Pages are statically generated per locale (`generateStaticParams`, `dynamicParams = false`).
- `/` redirects to `/ar` via `next.config.ts`.
- Copy lives only in dictionaries; facts that change (statuses, prices, email) only in `config/site.ts`.
- **Demo architecture:** the UI talks only to a `ConversationEngine`. `scripted.ts` plays
  `demo.script` from the dictionary (default). `voiceflow.ts` calls `/api/assistant`, enabled by
  `NEXT_PUBLIC_DEMO_ENGINE=voiceflow` + server `VOICEFLOW_API_KEY` (see `.env.example`).
  **Untested against a live Voiceflow project.** Engine turns carry `activity` (actions) which
  `use-conversation.ts` shows inline as `role: "action"` messages (running → done).
  The visitor answers only with the quick-reply chips, which sit right above a WhatsApp-style
  composer ("+", message field, mic). **The composer is display-only by the owner's choice**
  (`aria-hidden`, not focusable, no pointer) — don't wire up typing or "+" unless asked.

## Design system

- **Colour tokens** (`globals.css @theme`): graphite `ink-950…500` (#111315 base), light `paper`
  (#F5F6F4), `paper-2/3/white`, text `mist-*` (on dark) and `dim-*` (on light), accent **aqua
  #42E8C8** (sparingly) and `aqua-700` #0B7D6A for text/focus on light surfaces.
- **Type:** Geist (Latin) + IBM Plex Sans Arabic (Arabic). `adjustFontFallback: false` on both —
  otherwise an Arial fallback steals Arabic glyphs. Arabic never gets negative tracking.
  Scale: `.t-display` (hero/pricing only), `.t-h2` (section titles, ~46px max), `.t-h3`,
  `.t-lead`, `.t-body`, `.t-small`, `.t-label`; `:lang(ar)` overrides add leading.
  Custom variants `ar:` / `en:` exist.
- **Spacing:** `Section` = `py-20 sm:py-24 lg:py-28` (GetStarted matches it by hand); `Container` max 1280px, px 20/32/48.
  Visual blocks on the end side (hero example, demo phone) sit flush with the container edge.
- **Timelines** (Workflow, GetStarted): one connector per step, node to node with a 6px gap,
  never running past the last node. GetStarted's steps are numbered inside a quiet panel.
- **Fonts gotcha:** Turbopack emits Arial "… Fallback" faces even with `adjustFontFallback: false`,
  so `--font-sans` in `globals.css` names "Geist", "IBM Plex Sans Arabic" literally first.
  Without that, Arabic silently renders in Arial.
  `SectionHeader` = title + one lead line, same spacing everywhere.
- **Motion:** tokens `--dur-quick 180ms`, `--dur-base 320ms`, `--dur-enter 640ms`, easing
  `--ease-quint`. CSS `.rise` (hero load) and `[data-reveal]` (scroll, observed by
  `RevealObserver`; only hidden when `html.js`). Only state-bound loops (typing dots, caret,
  `.working`). Everything respects `prefers-reduced-motion` (hydration-safe hook).
- **The signature ("the thread"):** a thin aqua line with nodes on the reading-start side marks
  things Talaqa DOES (checked availability, recorded booking, applied a rule). Used in the hero
  preview, personalization, Workflow and GetStarted steps. In the WhatsApp demo, actions are
  subtle system events instead (`SystemEvent`: small muted text + aqua check between hairlines,
  no bubble or shadow, so they never read as a participant; legend says customers don't see them).
  The chat scroller hides its scrollbar (phone-like). Don't use the thread decoratively.
- Buttons: fully rounded, flat. Focus: aqua outline (aqua-700 on light surfaces).

## Homepage (one purpose per section)

1. **Hero** — headline + one line + "Try the conversation" (#demo) + "Request a demo" (mailto);
   HeroPreview: customer «أبي موعد بكرا بعد ٥» → understood → checked availability → reply →
   «٦ تمام» → booked card. Fixed-height, bottom-anchored (no layout shift).
2. **Capabilities** (#product) — 8 short items, list not cards (follow-ups = Beta).
3. **Demo** (#demo) — WhatsApp Business UI, reply buttons, inline action notices, booking card.
4. **Personalization** — tabs (salon/auto/fitness/restaurant); each has its OWN customer message,
   a business rule (shown as an action) and reply.
5. **Workflow** (#how) — customer → Talaqa → your systems → your team; channel statuses;
   integrations note (case by case, confirmed in the demo).
6. **GetStarted** (#contact) — 3 steps of what happens after emailing + mailto CTA.
Pricing page: Plans → included + setup → FAQ → GetStarted. Legal pages: TOC + sections.
FAQ (`pricing/FaqList.tsx`): native `<details name>` (works without JS, one open), enhanced with
Web Animations — height eases open/closed and opening one closes the other; instant with reduced motion.

## Supabase (Phase 2: sign-in + database)

- Packages: `@supabase/supabase-js`, `@supabase/ssr` (the only additions). Env in `.env.local` (git-ignored;
  template `.env.example` is tracked): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
  Publishable key only — never the service-role key in this app. Restart dev after changing env.
- **Without those vars the site behaves exactly as before** (`supabaseConfigured` in `lib/supabase/config.ts`):
  sample dashboard, login says sign-in isn't live. Builds never need the vars.
- `src/lib/supabase/server.ts` (per-request client as the user), `proxy.ts` (`updateSession`: refreshes the
  session, applies the no-cache headers @supabase/ssr passes). `src/proxy.ts` is Next 16's middleware
  (renamed); matcher only `/(ar|en)/dashboard/*` and `/(ar|en)/login`, so marketing pages stay static.
  It never redirects. No browser client: nothing needs one yet.
- Schema: `supabase/migrations/0001_init.sql`, then `0002_grants.sql` (run once each in the SQL editor).
  0002 grants `select` to `authenticated` explicitly: this project did NOT grant the API roles table
  access by default, so the membership lookup failed and sign-in said "not linked" (confirmed fixed by 0002).
  Any new table needs its own `grant select … to authenticated` next to its RLS policy.
  Lookup errors are now logged server-side and shown as "try again", never as "not linked". Composite FKs keep every row in
  one business; RLS = read-only for members of the business, limited to their `branch_ids` (null = all);
  no write policies (Phase 3 webhooks write server-side with the service role). New client:
  `supabase/first-business.sql` after creating the user under Authentication → Users.
- Auth: email + password, Server Actions in `src/lib/auth/actions.ts` (`signIn` refuses accounts with no
  membership, `signOut`). No public sign-up; password reset = "Email us" for now.
- Tenant: `getTenantContext()` (React `cache`) → `getClaims()` → first membership → `source: "supabase"`;
  signed out / unlinked / not configured → the sample tenant. `repository.ts` dispatches to
  `sample/store.ts` or `db/store.ts` (same contract; shared pure code in `derive.ts`). The DB store
  filters by business (and branches) in code as well as RLS; inbox loads the latest 200 conversations;
  Insights reads one row per conversation (`outcome`, `first_reply_at` are filled by Phase 3 webhooks;
  open conversations count as "didn't reply" until they end).
- Signed-in clients: no sample notice/tags, their name + role and Sign out in the shell. Dashboard pages
  are dynamic once Supabase is configured; conversation pages always render on request.

## Client dashboard (Phase 1 done: prototype on sample data)

Owner's decisions: Supabase (database + Auth, Phase 2), Voiceflow (agent), WhatsApp (channel); owners,
managers and staff per business, multiple branches, strict tenant isolation. Inbox is the primary screen;
human handovers live in the Inbox, not a separate page.

- Routes `/{ar|en}/dashboard` (Overview), `/inbox` (+ `/inbox/[conversationId]`), `/appointments`
  (`?day=&ap=` deep links, dynamic), `/insights`, `/settings` (+ `/team`, `/assistant`); `/{locale}/login`.
- Data: pages only call `src/lib/dashboard/repository.ts` with a `TenantContext` from `tenant.ts`
  (`import "server-only"`). Every row carries `businessId`; `inScope()` filters business + branch.
  Sample tables in `lib/dashboard/sample/` (frozen at `SAMPLE_NOW` = Mon 26 Oct 2026 14:20 Riyadh)
  include one other tenant's row that must never appear. Today's Insights row is counted from the
  conversations, so Overview/Inbox/Insights agree. Phase 3 swaps repository bodies for Supabase
  queries with the user's session (RLS), same signatures.
- Copy: separate `src/i18n/dashboard/{ar,en}.ts`; `DashboardDictionary = typeof ar` keeps them in sync.
- Dates/numbers: `lib/dashboard/time.ts` formats by hand (Riyadh, Western digits) — no Intl, no hydration drift.
- Search: `lib/dashboard/search.ts` matches across whole chat histories, tolerant of أ/إ/آ=ا, ى=ي, ة=ه,
  Arabic-Indic digits and diacritics.
- Design: dark graphite app shell (sidebar on the page ground, bottom bar + top bar on phones; inside
  a conversation on phones both hide). Panels `bg-ink-850` + `border-white/[0.07]`, 14px body, 24px h1.
  Colour only on data/status: aqua = Talaqa did it (bookings, actions, the thread on Overview);
  `--color-wait` amber = waiting for the team; `--color-alert` = no-show/bad change. Messages: customer
  on the start side (ink-800), Talaqa on the end side (aqua tint + mark), staff on the end side (paper),
  actions as grey event lines (customers don't see them). Latin names inside Arabic rows use `<bdi>`.
  No entrance animations in the dashboard; feedback only.
- Honesty: a sample-data notice on every sample screen; take over / hand back / resolve change local state
  only and say "preview only" (for signed-in clients too, until Phase 3); reply box, invites and settings
  are visibly disabled with the reason. Customer phone numbers only as `•• 1234`.
- Checked with the design-taste inspector (`inspect.mjs --app`) at 1440/768/390, both locales: 0 FAIL.
  Remaining WARNs are defensible (it reads `white/[0.07]` borders as solid white).

**Phase 2 is done** (see "Supabase"); signed-out visitors keep the sample dashboard (owner's decision).
**Phase 3 (next):** Voiceflow/WhatsApp webhooks (server-side, service role) writing customers,
conversations, messages/events, `outcome` and `first_reply_at`; real take-over (pause the agent per
conversation) and replies via the WhatsApp Business Platform; editable settings; password reset;
server-side search beyond the latest 200 conversations.

## Completed

Bilingual RTL/LTR site; homepage above; pricing; Privacy + Terms (drafts); unified logo + exported
files; WhatsApp-style demo; hero example workflow; SEO (metadata, hreflang, canonical, sitemap,
robots, JSON-LD, OG image); accessibility pass (skip link, focus rings, aria tabs, live regions,
reduced motion, `translate="no"` on logo); phone layouts checked at 390px; dead components removed.

## Unresolved / needs the owner

- **Pricing values are placeholders** (SAR 690 / 1,490 / tailored; 1,000 / 3,000 conversations).
- **Setup fee:** copy says setup is INCLUDED (from the owner's own EN edit "/ month including
  setup"); confirm with the owner — the FAQ "no separate setup fee" depends on it.
- **Contact email** `hello@talaqa.ai` is assumed (`config/site.ts`); every CTA is a mailto.
- **Legal text** needs a lawyer: registered company name/CR, governing law (KSA), liability cap
  (12 months of fees), cancellation terms. Privacy says no analytics cookies — update if added.
- Channel/capability statuses in `config/site.ts` are assumptions (WhatsApp + web available, phone soon, follow-ups beta).
- Sample content (Rukn Barbers / ركن للحلاقة, staff names, branches, prices, hours) is illustrative.
- Voiceflow adapter untested; Lighthouse not run; real iPhone/Android not tested (only emulation);
  Arabic copy not reviewed by a native copywriter.
- `meta.title` in `en.ts` is the owner's text ("Talaqa  — طلاقة", double space) — kept as written.
- Folders `../talaqa-vercel-ready`, `../talaqa.zip`, `../talaqa-vercel-ready.zip` were created by
  the owner; contents not reviewed and may be out of date — don't edit them unasked.

## Working agreements

- Edit copy in `ar.ts` first, then `en.ts`; keep both in sync (the type enforces shape).
- Keep the page short; every section must have a distinct job. Prefer demonstrations to paragraphs.
- Preserve the owner's edits in dictionaries; read files before overwriting.
- Verify both locales at desktop (1440) and phone (390), plus reduced motion, before finishing.
  Headless checks used during this project: the design-taste-frontend skill's
  `scripts/inspect.mjs` and its CDP helper `scripts/lib/cdp.mjs` (screenshots, click-throughs).
  The in-app browser pane throttles when hidden — don't trust its screenshots for animations.
- Flex scroll containers with clipped children need `shrink-0` (the booking card once collapsed on phones).
- Don't add dependencies without a clear reason; don't introduce gradients, glows, emojis or fake UI.
