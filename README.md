# talaqa.ai

Marketing site for Talaqa (طلاقة) — your AI receptionist, built around your business.
Arabic-first (`/ar`, RTL) with an English edition (`/en`). WhatsApp is the primary channel.
Pages: home, `/pricing`, `/privacy`, `/terms`. Client dashboard: `/dashboard` (overview, inbox,
appointments, insights, settings) and `/login`. Signed-in clients see their own business from Supabase;
everyone else sees a clearly labelled sample business.

## Supabase (sign-in and dashboard data)

1. Copy `.env.example` to `.env.local` and fill in the project URL and **publishable** key
   (Supabase → Project Settings → API). Restart `npm run dev`.
2. In Supabase → SQL Editor, run `supabase/migrations/0001_init.sql`, then `0002_grants.sql` (once each).
3. For each client: create their user (Authentication → Users → Add user, auto-confirm), then fill in and
   run `supabase/first-business.sql`. They can now sign in at `/ar/login` or `/en/login`.

Without the two variables the site runs as before: the sample dashboard only, and sign-in marked as not live.

Arabic copy treats طلاقة as masculine, like a receptionist (طلاقة يرد، يحجز، ينفّذ) — keep verb agreement when editing.

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /ar
npm run build && npm start
npm run lint
npm run typecheck
```

## Where things live

| What | Where |
| --- | --- |
| All copy, both languages | `src/i18n/dictionaries/ar.ts` (source), `en.ts` |
| Copy shape (TypeScript keeps both locales in sync) | `src/i18n/types.ts` |
| Channel status (Available / Beta / Coming soon), capability status, plan prices, social links, contact email | `src/config/site.ts` |
| Plan names, features, FAQ | `pricing` in the dictionaries; page in `src/app/[locale]/pricing` → `src/components/pricing/*` |
| Design tokens (colour, type scale, motion) | `src/app/globals.css` |
| Sections, in page order | `src/app/[locale]/page.tsx` → `src/components/sections/*` |
| Hero example workflow (plays once, labelled as an example) | `src/components/hero/HeroPreview.tsx` |
| The thread — Talaqa's signature for actions it performs | `src/components/flow/Action.tsx` (used in the hero, demo and personalization) |
| Temporary mark + wordmark | `src/components/brand/` |

### Changing what's live

- **Channel goes live:** set its status in `siteConfig.channels`.
- **Integration confirmed:** name it in `workflow.systemsNote` in both dictionaries. Never name a system before a live integration exists.
- **Social profiles:** add to `siteConfig.social`; the footer shows them only when present.

## Live demo / Voiceflow

The demo UI (`src/components/demo/ChatWidget.tsx`) only talks to a `ConversationEngine`
(`src/components/demo/engine/types.ts`). Two engines exist:

- `scripted.ts` — default; plays the branching script stored in the dictionaries (`demo.script`).
- `voiceflow.ts` — calls `/api/assistant`, a server route that proxies the Voiceflow Dialog API
  so the key never reaches the browser.

To switch: copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_DEMO_ENGINE=voiceflow` and
`VOICEFLOW_API_KEY`. The Voiceflow adapter has **not** been tested against a live project —
check the trace mapping in `src/app/api/assistant/route.ts` against your agent first.
Visitors never see the word Voiceflow.

## Before launch

- Confirm `siteConfig.contactEmail` (currently `hello@talaqa.ai`); every "Book a demo" button opens it.
- Confirm channel and capability statuses in `src/config/site.ts` (defaults: WhatsApp available and primary, website chat available, phone coming soon, follow-ups beta).
- **Pricing is placeholder:** SAR 690 / 1,490 / tailored, the conversation limits (1,000 / 3,000) and the branch limits per plan are samples. Prices live in `siteConfig.pricing`; limits and features in the dictionaries. Set `monthly: null` to show "Tailored" instead of a number.
- **Legal review:** Privacy and Terms text lives in `src/content/legal/` (both languages). Have a lawyer review it and add the registered company name and commercial registration. Confirm governing law (Saudi Arabia), the liability cap (fees from the last 12 months) and cancellation terms.
- Sample content to review: business names (ركن للحلاقة / Rukn Barbers), staff names, branches, prices (e.g. SAR 80 haircut, SAR 180 facial) and opening hours used in the demos. These illustrate the product; none describe a real customer.

## Logo files

`public/brand/` holds the talaqa.ai logo with the lettering converted to outlines (no font needed):

| File | Use |
| --- | --- |
| `talaqa-logo-for-dark-backgrounds.svg` / `@4x.png` | Full lockup on dark backgrounds |
| `talaqa-logo-for-light-backgrounds.svg` / `@4x.png` | Full lockup on light backgrounds |
| `talaqa-icon-for-dark-backgrounds.svg` / `@4x.png` | Icon only (app icon, avatar) |
| `talaqa-icon-for-light-backgrounds.svg` / `@4x.png` | Icon only, on light backgrounds |

PNGs are 4× with transparent backgrounds. On the site the logo is the `<Wordmark />` component (`src/components/brand/Wordmark.tsx`). The mark is the same in Arabic and English and never mirrors.
