@AGENTS.md

# RealEstateApp — Project Instructions

> **Design system + visual rules live in [`brand_identity/`](brand_identity/README.md).** Colors, typography, spacing, components, motion, accessibility, brand voice and marketing-copy patterns are all there. Before writing UI, picking a color, or wording a headline, consult the relevant file in that folder. This document covers product strategy, architecture, code rules, and process.

## Product

Real estate investment analytics platform for new-build apartments in Russia (starting with Crimea). Target users are everyday apartment seekers and casual investors — not professionals. The core promise: Bloomberg-level analysis with zero learning curve.

**Positioning hierarchy.** We are first a *decision tool* for buyers (should I buy this?), second a *search tool* (where is the right one?), third a *market intelligence tool* (what's happening?). UI surfaces, feature priority, and the upsell argument must reflect that order. Never invert this. Voice and headline patterns are documented in [`brand_identity/positioning-voice.md`](brand_identity/positioning-voice.md).

> ⚠️ The positioning hierarchy applies to **product surfaces**. On the **marketing homepage** (`/` for unauthenticated visitors), the hero is *calculator-as-hero* — a calculator screenshot + serif headline + paired CTA — because the unconvinced visitor needs to *see* what we are before they search. See [Surface model](#surface-model).

- **Stack:** Next.js 16 (App Router, TypeScript, Tailwind CSS), Supabase (Postgres + Auth), Zustand (state), React Query (data fetching), Recharts (charts), Leaflet (maps), Lucide React (icons).
- **Monetization:** Freemium + ads on Free. **Three tiers**: Free / Pro Monthly / Pro Yearly (−20%). See [Freemium boundaries](#freemium-boundaries).
- **Localization:** Russian (primary) and English. All user-facing strings live in `src/i18n/ru.ts` and `src/i18n/en.ts`. Never hardcode display text in components.
- **Theme:** Dark (default) and light. All colors via CSS custom properties in `src/styles/globals.css`. **Marketing surfaces force-light by default; product surfaces respect user preference.** See [`brand_identity/colors.md`](brand_identity/colors.md) for tokens and the no-raw-hex rule.

## Surface model

**Two surface families exist. Conflating them is the most common cause of mediocre UX in this codebase.**

### Marketing surfaces

URL pattern: `/`, `/pricing`, `/products/*`, `/applications/*`, `/blog/*`, `/about`, `/contact`. Audience: unconvinced visitor (often unauthenticated, but signed-in users browse these too). Job: move them from "what is this" to "create account / upgrade."

- **Chrome:** `<MarketingShell>` — horizontal top nav with mega-menus (`Products ▾ · Applications ▾ · Pricing · Blog · Sign in · Try for free`).
- **Theme:** Light (soft white/lavender gradient backgrounds). Forced regardless of user preference.
- **Hero rule (homepage):** Product screenshot + serif headline + paired CTA. *Not* a search input. Search lives below the fold in feature blocks.
- **Page structure:** Modular slabs in canonical order — hero · 3-card value props · trust strip · alternating feature blocks · capability summary · persona row · testimonials · pricing reference · FAQ · final CTA · footer. Use `<MarketingSlab>` for each.
- **CTA pair:** Every page ends with `<MarketingCTAPair>` rendering `[Зарегистрироваться бесплатно →]` + `[Посмотреть тарифы →]`. Never single, never dead-end.

### Product surfaces

URL pattern: `/calculator`, `/map`, `/analytics`, `/account/*`, `/lists/*` (Phase 17). Audience: signed-in user (or anonymous user mid-task). Job: let them do work fast.

- **Chrome:** `<ProductShell chrome={'top' | 'rail'}>`. Default `'top'` (existing `Header` + `MobileNav`). Switch to `'rail'` (narrow icon-only left rail, Solgt-style) when product surface count grows past 6-7. The switch is one prop, not a rewrite — both modes share the same auth, theme, and notification surfaces.
- **Theme:** Dark default; respect user preference (light still allowed).
- **Hero rule:** The data is the hero. No screenshots of the data inside the data. No marketing slabs.
- **No marketing components.** Product surfaces never render `<MarketingSlab>`, `<MarketingCTAPair>`, `<PricingTable>`, etc. Upgrade prompts inside product surfaces use `<UpgradePrompt>` (modal, user-initiated) or `<ProGate mode="blur">` (inline, contextual).

### Picking the right shell

A page is "marketing" if it can be linked to and indexed for SEO without authentication. A page is "product" if it requires (or strongly assumes) authentication and is where the user does work. `/projects/[id]` is a **marketing surface** (SEO-indexed product detail). `/calculator` is a **product surface** even though it works anonymously. When uncertain, default to marketing — wrong choice degrades conversion; right choice helps SEO and theme consistency.

## Architecture

```
src/
├── app/
│   ├── (marketing)/        # Route group: MarketingShell + light theme
│   │   ├── page.tsx        # Marketing homepage (calculator-as-hero)
│   │   ├── pricing/        # /pricing — 3-tier table with Monthly/Yearly toggle
│   │   ├── products/       # /products/[slug] — SEO landing pages per feature
│   │   ├── applications/   # /applications/[slug] — SEO landing pages per use-case
│   │   ├── blog/           # /blog and /blog/[slug]
│   │   └── projects/[id]/  # SEO-critical product detail — stays marketing
│   ├── (product)/          # Route group: ProductShell + dark default
│   │   ├── calculator/
│   │   ├── map/
│   │   ├── analytics/
│   │   ├── account/
│   │   └── lists/          # Phase 17
│   └── api/                # Backend API routes (Supabase queries)
├── components/
│   ├── ui/                 # Generic primitives. Domain-free.
│   ├── layout/
│   │   ├── MarketingShell.tsx   # used by app/(marketing)/layout.tsx
│   │   ├── ProductShell.tsx     # accepts chrome={'top'|'rail'}
│   │   ├── Header.tsx           # top-nav variant (both shells can use)
│   │   ├── ProductRail.tsx      # left-rail variant (ProductShell only)
│   │   ├── MobileNav.tsx
│   │   └── Footer.tsx
│   ├── marketing/          # Renders ONLY inside MarketingShell
│   │   ├── MarketingSlab.tsx
│   │   ├── MarketingCTAPair.tsx
│   │   ├── PricingTable.tsx
│   │   ├── PersonaRow.tsx
│   │   ├── FAQAccordion.tsx
│   │   └── StatStrip.tsx
│   └── product/            # Renders ONLY inside ProductShell
│       ├── projects/       # ProjectCard, ProjectTable, ProjectHero, etc.
│       ├── calculator/     # CalcWizard, CalcResults, ForecastChart, etc.
│       ├── analytics/      # Chart components
│       ├── map/            # ProjectMap, MarkerPopup, DistrictPanel
│       └── account/        # AccountGate, FavoritesList, NotificationsSection
├── lib/                    # Pure business logic — NO React, NO UI
│   ├── types.ts            # All TypeScript interfaces and types
│   ├── calculator.ts       # Financial math (mortgage, ROI, cashflow forecasts)
│   ├── formatters.ts       # Price, distance, number formatting (locale-aware)
│   ├── filters.ts          # Project filtering and sorting logic
│   ├── named-queries.ts    # Predicate library for the chip surface
│   └── constants.ts        # Market data, status/class colors, config
├── hooks/                  # Custom React hooks
├── store/                  # Zustand store (app-store.ts)
├── i18n/                   # Translation files (ru.ts, en.ts)
├── styles/                 # globals.css (CSS custom properties), design-tokens.ts
└── data/                   # Seed data (temporary — will be replaced by DB)
```

### Key rules

- **`lib/` is pure.** Files in `lib/` must have zero imports from React, Next.js, or any UI library. They export pure functions and TypeScript types only. This makes business logic testable and shareable.
- **`components/ui/` is generic.** UI primitives must not import from `lib/constants.ts` or know about real estate domain concepts. They accept props like `variant`, `size`, `color` — not `projectStatus` or `classType`.
- **`components/marketing/` and `components/product/` are mutually exclusive.** A marketing component must never appear inside a product surface, and vice versa. Route groups (`app/(marketing)/` vs `app/(product)/`) carry the shell choice via their layout files — per-page shell overrides are forbidden.
- **`components/{feature}/` is domain-specific.** Feature components compose UI primitives with domain logic. They translate domain concepts (e.g., project status) into UI props (e.g., badge color).
- **Pages are thin.** Files in `app/` should do data fetching, compose feature components, and handle routing. Minimal logic.
- **Server vs client:** Default to Server Components. Add `'use client'` only when the component needs state, effects, event handlers, or browser APIs. Charts, maps, filters, and calculator are client. Project listings and detail pages are server-rendered.

## Design System

The visual and interaction system lives in [`brand_identity/`](brand_identity/README.md). It is binding for all UI work. Quick index:

| Concern | File |
|---|---|
| Brand voice, headline templates, microcopy patterns | [`positioning-voice.md`](brand_identity/positioning-voice.md) |
| Color tokens, semantic + confidence-tier colors | [`colors.md`](brand_identity/colors.md) |
| Font stack, type scale, hierarchy by surface | [`typography.md`](brand_identity/typography.md) |
| 4px grid, container padding, breakpoints | [`spacing.md`](brand_identity/spacing.md) |
| UI primitive visual specs (existing + planned) | [`components.md`](brand_identity/components.md) |
| Easing, durations, when to animate | [`motion.md`](brand_identity/motion.md) |
| WCAG 2.1 AA contract, ARIA patterns, focus, contrast | [`accessibility.md`](brand_identity/accessibility.md) |

**Rules of thumb** (full detail in the files above):

- **Primitives in `components/ui/` are domain-free.** They accept `variant`, `size`, `color` — never `projectStatus` or `classType`. Domain mapping happens in feature components.
- **Colors are tokens, not hex.** Never raw hex in `*.tsx`. `STATUS_COLORS` / `CLASS_COLORS` map to CSS variables; Recharts fills come from `useChartColors()` (Phase 10), not hardcoded.
- **Mobile-first.** Card grid below `md:`, table only at `md:` and up. Bottom nav reserves safe-area inset.
- **Confidence is a UI concept**, not just a database column. See [Domain Logic → Data confidence](#data-confidence).
- **Theme follows surface.** Marketing surfaces render light regardless of the user's theme preference; product surfaces honor the preference (dark default). The marketing/product visual identity contrast is intentional and helps users mentally segment "I'm being sold to" from "I'm working."

## Domain Logic

### Financial calculations (lib/calculator.ts)

All monetary values are in Russian rubles (₽). USD conversion uses `MARKET_DATA.rubUsd` rate.

Key formulas:
- **Monthly mortgage payment:** Standard annuity formula. Input: principal, annual rate, term in years.
- **Split mortgage:** Russian subsidized programs cap the subsidized portion (e.g., 6M ₽ at 6% for family mortgage). Amount above the cap is at market rate (~21%). The total monthly payment is the sum of both.
- **NOI:** Effective annual rent (rent × 12 × (1 - vacancy%)) minus operating expenses minus tax.
- **Cash-on-Cash:** Annual cashflow ÷ own invested capital × 100.
- **Matkapital:** Government grant (963,243 ₽ in 2026) applied to down payment. Subsidy 450K for 3+ children applied to loan principal.

These functions must remain pure — no side effects, no state, no API calls. They receive parameters and return results.

### Project data model

```typescript
interface Project {
  id: number;
  name: string;              // "ЖК «Ривьера Парк»"
  developer: string;
  city: string;              // Crimean cities
  district: string;
  status: 'Проектируется' | 'Строится' | 'Ввод в эксплуатацию' | 'Сдан';
  classType: 'Эконом' | 'Комфорт' | 'Бизнес' | 'Премиум';
  buildingType: string;
  buildings: number;
  totalUnits: number;
  sizeMin: number;           // m² smallest unit
  sizeMax: number;           // m² largest unit
  floors: number;
  pricePerSqm: number;      // ₽ per m²
  minPrice: number;          // ₽ cheapest unit
  completion: string;        // "III кв. 2026"
  amenities: string[];
  distSea: number;           // km to sea
  lat: number;
  lng: number;
  units: Unit[];
}

interface Unit {
  id: string;                // "1-4-03" (building-floor-number)
  building: string;          // "Корпус 1"
  floor: number;
  rooms: number;             // 0 = studio
  area: number;              // m²
  price: number;             // ₽
  status: 'в продаже' | 'бронь' | 'продано';
}
```

### Data confidence

Data confidence is a first-class UI concept. Every computed or stored value that the user sees should be classifiable as `verified`, `estimated`, or `user-input`, and rendered with a corresponding visual treatment (badge, tooltip, or muted-vs-accent color). The `dataConfidence` column on `projects` already exists and must be surfaced. New derived metrics — calculator outputs, analytics aggregates, AVM-style estimates — must declare their tier. **Never present an estimate as if it were a measurement.** Use the `ConfidenceBadge` UI primitive (Phase 12) wherever a number appears that the user might mistake for ground truth.

### Named queries

Common buyer intents map to one-click chips above project listings. Each chip is a `NamedQuery` — `{ id, label, predicate, tier? }` triple defined in `lib/named-queries.ts`. Chips render with a live count badge and double as marketing — each name *teaches* the user what to look for.

Initial set (Russian-language):
- *Маткапитал покрывает ПВ* — matkapital covers down payment
- *У моря (< 1 км)* — within 1 km of the sea
- *Скоро сдача* — completing within 6 months
- *Цена снижена* — price dropped in the last 30 days
- *Высокий ROI* — projected cash-on-cash ≥ 10% **(Pro)**
- *Лучшая цена/м²* — bottom decile of price/m²

Chips marked `tier: 'pro'` show a `🔒 Pro` badge next to the label and open the upgrade flow when clicked by Free users. The data they would query is never sent to the client.

### Lists (Phase 17 — committed)

A `List` is a named, owned, optionally-shared bucket of project or unit references. Every user has a default `Избранное` list created at signup. The existing `favorites` and `fav_units` tables collapse into `list_items` of the default list (backwards-compatible migration).

Schema sketch:
- `lists` (`id`, `owner_user_id`, `name`, `visibility {private|unlisted|public}`, timestamps)
- `list_items` (`list_id`, `project_id?`, `unit_id?`, `position`, `note`, `added_at`)
- `list_followers` (`list_id`, `follower_user_id`, `alerts_enabled`, `created_at`)
- `list_collaborators` (`list_id`, `user_id`, `role {editor|viewer}`)
- `list_comments` (`id`, `list_id`, `author_user_id`, `body`, `created_at`)

**Phase 16 alerts re-key to lists.** A `price_alert` becomes `(user_id, list_id, threshold_pct, …)`. Per-favorite alerts become "alert on any item in this list." This is the strongest single reason to do the refactor.

**Tier policy:**
- Free: 1 list (the default `Избранное`), 25 items, no sharing.
- Pro: unlimited lists, unlimited items per list, public/unlisted visibility, follow other public lists, comment on lists you own or are a collaborator on.

**Featured lists** (curated by us) appear on the right rail of `/lists` with a `🔒 Pro` lock if the list visibility requires Pro to follow. Editorial content surface — same pattern as `/blog`, but in-product.

### Freemium boundaries

**Free** — full search, project/unit browsing, basic calculator (1 object), default `Избранное` list with up to 25 items, 3 saved calcs, ads. Weekly digest of any price alerts.

**Pro Monthly / Pro Yearly (−20%)** — same feature set, two billing cadences. Includes:
- Multi-object calculator with comparison + rankings
- 10-year cashflow forecast
- Rental portfolio tracker
- PDF / Excel exports
- No ads
- **Real-time price alerts** (instead of weekly digest)
- **Unlimited lists** (multiple named lists, public/private, follow others, comments, collaborators)
- Pro-tier named queries (e.g., *Высокий ROI*)
- Pro-only map layers and analytics aggregates
- (Reserved) `Business` custom-tier slot for API access + bulk listings + white-labeled exports for developers/brokers. Not implemented.

**Pro must include at least one feature that benefits non-investor browsers.** Price alerts + multi-list favorites are those features. Don't ship a Pro tier whose entire benefit set is investor math.

Gate features with `usePaywall(feature: ProFeature)`. **Default to `<ProGate mode="blur">`** — render the surface with blurred values and a small upgrade card overlay. Use `<ProGate mode="replace">` only when blurring is meaningless (e.g., an entire route). **Tier locks are inline.** Dropdowns and menu items show `🔒 Pro` next to the locked option. Modals (`UpgradePrompt`) are for *user-initiated* upgrade flows, not for telling the user what they can't have.

## Conversion mechanics

- **Every marketing surface ends with `<MarketingCTAPair>`**: primary `Зарегистрироваться бесплатно →` + secondary `Посмотреть тарифы →`. Never single, never dead-end.
- **`/pricing` is a real page**, not a modal. Built with `<PricingTable>` showing all 3 tiers (Free / Pro Monthly / Pro Yearly) with a Monthly/Yearly toggle. `UpgradePrompt` deep-links into it.
- **Tier-billing is a UI concern; tier-features are an entitlement concern.** `usePaywall` returns `{ tier: 'free' | 'pro' }` only. Monthly vs Yearly is invisible to feature gates — it only matters in `<PricingTable>` and at checkout.
- **Paste-a-link onramp.** Marketing homepage search input accepts both a project/district name AND a pasted URL from Avito / Cian / Domclick. When a URL is detected, parse the listing and pre-fill the calculator. This converts "I'm browsing Avito" into "I'm using us to evaluate what I found on Avito." Phase 18+ candidate; one parser per source.

## Conventions

- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`)
- **Files:** kebab-case for files (`project-card.tsx`), PascalCase for components (`ProjectCard`)
- **Imports:** Use `@/` alias. Group: React → Next.js → external libs → `@/lib` → `@/hooks` → `@/components` → relative
- **API responses:** Always return `{ data, error }` shape. Never throw from API routes.
- **Error handling:** Components that fetch data must handle loading, error, and empty states.
- **No `any`.** Use `unknown` and narrow with type guards.

### Performance budgets

First Load JS per route, gzipped:
- **Static / content routes** (`/`, `/projects/[id]`, `/account/*`): ≤ 180 kB.
- **Map / chart / calculator routes** (`/map`, `/analytics`, `/calculator`): ≤ 240 kB.

Routes exceeding these must use `next/dynamic` for the heavy library, with a skeleton fallback. Recharts and Leaflet are the usual culprits; both must be lazy-loaded and rendered only when in viewport (intersection observer) for off-screen charts. Validate budgets in CI (Lighthouse / `next build` output) and treat regressions as build failures.

## What NOT to do

### Architecture & code

- Don't hardcode Russian text in components — use i18n keys.
- Don't put business logic in components — extract to `lib/`.
- Don't use `useEffect` for derived state — use `useMemo`.
- Don't use `localStorage` for user data that should persist across devices — use Supabase.
- Don't skip loading / error / empty states when building data-fetching components.
- Don't import a `components/marketing/*` component into a product surface or vice versa. The route group + import path discipline keeps it natural; the TypeScript shell-branded types will catch slips.

### Process

- Don't add features not in the current stage — follow [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md).
- Don't pull on a thread listed in [Prototype boundaries](#prototype-boundaries-as-of-phase-16) outside of its owning phase.

### Product & positioning

- **Don't render the PRODUCT homepage (post-login) as a market dashboard.** The signed-in entry is search + map launcher. Dashboards live at `/analytics`.
- **Don't render the MARKETING homepage as a search-only page.** It must lead with a calculator screenshot + serif headline + paired CTA. Search lives below the fold in feature blocks. (See [Surface model](#surface-model).)
- **Don't ship a marketing page that doesn't follow the canonical slab order.** Hero · 3-card value props · trust strip · alternating feature blocks · capability summary · persona row · testimonials · pricing reference · FAQ · final CTA · footer.
- **Don't ship a calculator surface with more than 8 visible inputs in the first-time flow.** Use progressive disclosure (section toggles, wizard mode, expert-mode toggle) past that. Power users opt into complexity; new users must not be forced into it.
- **Don't display a single number where a confidence band or range is more honest.** Cap rate, ROI, projected sale, monthly cashflow — these are estimates. Tag them with their `verified` / `estimated` / `user-input` tier so users read them correctly.
- **Don't add a Pro feature that benefits investors only.** Pro must include at least one feature non-investor browsers will value (currently: price alerts on favorites + multi-list lists).
- **Don't advertise a Pro feature in `UpgradePrompt` or `PricingTable` that isn't implemented.** Trim the copy or ship the feature.
- **Don't hide a paywall behind a modal-only `UpgradePrompt`.** Every Pro feature visible in-context must have a `<ProGate mode="blur">` preview. Modals are for *user-initiated* upgrade flows, not for telling the user what they can't have.
- **Don't write a chart on `/analytics` without a 1-3 sentence "how to read this" paragraph above it.** Charts without context are decoration.

### Visual & UX

Visual rules live in [`brand_identity/`](brand_identity/README.md). The high-stakes ones:

- Don't use raw hex in `*.tsx`. Use CSS variables / semantic tokens. ([`colors.md`](brand_identity/colors.md))
- Don't use `text-[9px]` or `text-[10px]`. Minimum 11px. ([`typography.md`](brand_identity/typography.md))
- Don't invent new colors for one screen. Propose a token in `colors.md` in the same PR. ([`colors.md`](brand_identity/colors.md))
- Don't use `<table>` for the default mobile view. Cards default; table at `md:` and up. ([`spacing.md`](brand_identity/spacing.md))
- Don't let `components/ui/` know about domain concepts (`projectStatus`, `classType`). Pass generic props. ([`components.md`](brand_identity/components.md))
- Don't remove focus rings to make a design look cleaner. ([`accessibility.md`](brand_identity/accessibility.md))
- Don't write headlines using forbidden marketing tropes ("Революция", "Уникальная возможность", emoji clusters). ([`positioning-voice.md`](brand_identity/positioning-voice.md))
- Don't reuse `<MarketingShell>` inside a product surface or `<ProductShell>` on a marketing surface. Use the route groups (`app/(marketing)/` vs `app/(product)/`) — picking the wrong shell is the visible symptom of surface-family confusion.
- Don't introduce a new product screenshot in marketing without a real product to back it. Placeholder screenshots mean the marketing page isn't ready to ship.

## Prototype boundaries (as of Phase 16)

The following are intentionally stubbed and will be replaced — they should NOT be treated as bugs to fix in ad-hoc work, only as scoped phase deliverables. Future Claude sessions: don't pull on these threads outside of their owning phase.

- `src/data/projects.ts` is the dev fallback. Disappears when a real Supabase project is provisioned and the env vars are set.
- `useAuth` falls back to a no-password stub when Supabase env vars are absent. Phase 15 added a production hard-fail in `lib/supabase/env.ts`; the stub now only runs in dev. Don't reintroduce a stub path in production.
- Project Gallery and Location tabs are placeholders (real media + map embed deferred).
- The KPI cards / filter-sidebar homepage layout from the original prototype was replaced in Phase 10 by a search-first hero, then *will be replaced again* in Phase 18+ by the calculator-as-hero marketing homepage (see Surface model).
- Saved Calcs, Settings, and Portfolio still hardcode some Russian-language labels (Phase 6 i18n debt — fold into a translation sweep before locale toggle gets real users).
- **Phase 17 — Lists refactor.** Today's `favorites` + `fav_units` collapse into `list_items` of a default per-user `Избранное` list. Schema, hooks, and Phase 16 alerts re-key from per-favorite to per-list. Backwards-compatible migration. Don't pull on flat-favorites assumptions outside of this phase.
- **Phase 18+ — Marketing surface build-out.** Route-group split into `app/(marketing)/` and `app/(product)/`, `<MarketingShell>` and `<ProductShell>`, `/pricing` page, `/products/*` + `/applications/*` SEO landing pages, calculator-as-hero homepage swap, and paste-a-link onramp. Until then, `/` keeps the current search hero and all components live in the flat `components/{projects,calculator,...}/` layout.
- **ProductShell `chrome` prop defaults to `'top'`.** Revisit `'rail'` when the product surface count grows past 6-7. One-prop switch, not a rewrite.
- **Manual launch steps still open** (carried from Phase 15-16): apply Supabase migrations `0001`-`0003` to a real project, deploy `dispatch-price-alerts` edge function, set `RESEND_API_KEY` + `ALERT_FROM_EMAIL` + `SITE_URL` secrets, choose and wire a billing provider via `/api/billing/checkout` + `/api/billing/webhook`.
