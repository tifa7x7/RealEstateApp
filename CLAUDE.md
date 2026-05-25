@AGENTS.md

# RealEstateApp — Project Instructions

> **Design system + visual rules live in [`brand_identity/`](brand_identity/README.md).** Colors, typography, spacing, components, motion, accessibility, brand voice and marketing-copy patterns are all there. Before writing UI, picking a color, or wording a headline, consult the relevant file in that folder. This document covers product strategy, architecture, code rules, and process.

## Product

Real estate investment analytics platform for new-build apartments in Russia (starting with Crimea). Target users are everyday apartment seekers and casual investors — not professionals. The core promise: Bloomberg-level analysis with zero learning curve.

**Positioning hierarchy.** We are first a *decision tool* for buyers (should I buy this?), second a *search tool* (where is the right one?), third a *market intelligence tool* (what's happening?). UI surfaces, feature priority, and the upsell argument must reflect that order. The default homepage entry is a single search input, not a market dashboard. The calculator is decision-first; analytics is market-intel-third. Never invert this. Voice and headline patterns that follow from this positioning are documented in [`brand_identity/positioning-voice.md`](brand_identity/positioning-voice.md).

- **Stack:** Next.js 16 (App Router, TypeScript, Tailwind CSS), Supabase (Postgres + Auth), Zustand (state), React Query (data fetching), Recharts (charts), Leaflet (maps), Lucide React (icons)
- **Monetization:** Freemium + ads for free tier
- **Localization:** Russian (primary) and English. All user-facing strings live in `src/i18n/ru.ts` and `src/i18n/en.ts`. Never hardcode display text in components.
- **Theme:** Dark (default) and light. All colors via CSS custom properties in `src/styles/globals.css`. See [`brand_identity/colors.md`](brand_identity/colors.md) for tokens and the no-raw-hex rule.

## Architecture

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/                # Backend API routes (Supabase queries)
│   ├── projects/[id]/      # SSR project detail pages (SEO-critical)
│   ├── calculator/         # Client-rendered (heavy state)
│   └── account/            # Auth-gated client pages
├── components/
│   ├── ui/                 # Design system primitives (Button, Card, Badge, Input, Modal, Toast, etc.)
│   ├── layout/             # Header, MobileNav, Sidebar, Footer
│   ├── projects/           # ProjectCard, ProjectTable, ProjectFilters, UnitTable
│   ├── calculator/         # CalcWizard, CalcStep1-4, CalcResults, CalcForecast
│   ├── analytics/          # Chart components
│   └── map/                # ProjectMap
├── lib/                    # Pure business logic — NO React, NO UI
│   ├── types.ts            # All TypeScript interfaces and types
│   ├── calculator.ts       # Financial math (mortgage, ROI, cashflow forecasts)
│   ├── formatters.ts       # Price, distance, number formatting (locale-aware)
│   ├── filters.ts          # Project filtering and sorting logic
│   └── constants.ts        # Market data, status/class colors, config
├── hooks/                  # Custom React hooks (useProjects, useFilters, useCalculator, useFavorites, useTheme)
├── store/                  # Zustand store (app-store.ts)
├── i18n/                   # Translation files (ru.ts, en.ts)
├── styles/                 # globals.css (CSS custom properties), design-tokens.ts
└── data/                   # Seed data (temporary — will be replaced by DB)
```

### Key rules

- **`lib/` is pure.** Files in `lib/` must have zero imports from React, Next.js, or any UI library. They export pure functions and TypeScript types only. This makes business logic testable and shareable.
- **`components/ui/` is generic.** UI primitives must not import from `lib/constants.ts` or know about real estate domain concepts. They accept props like `variant`, `size`, `color` — not `projectStatus` or `classType`.
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
- **Colors are tokens, not hex.** Never raw hex in `*.tsx`. `STATUS_COLORS` / `CLASS_COLORS` map to CSS variables; Recharts fills come from a `useChartColors()` hook (Phase 10), not hardcoded.
- **Mobile-first.** Card grid below `md:`, table only at `md:` and up. Bottom nav reserves safe-area inset.
- **Confidence is a UI concept**, not just a database column. See [`Domain Logic → Data confidence`](#data-confidence).

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

### Freemium boundaries

Free tier: full search, project/unit browsing, basic calculator (1 object), 25 favorites, 3 saved calcs, ads.
Pro tier: multi-object calculator with comparison + rankings, 10-year forecasts, portfolio tracker, exports, no ads, **price alerts on favorited units**.

**Pro must include at least one feature that benefits non-investor browsers** (the majority of users). Price alerts are that feature. Don't ship a Pro tier whose entire benefit set is investor math — Free is genuinely sufficient for browsers, and investor-only Pro will not convert at the volume the product needs.

Gate features with a `usePaywall(feature: string)` hook that checks user tier. Show a styled upgrade prompt — never a blank wall. **Never advertise a Pro feature in `UpgradePrompt` that isn't implemented** — either ship it or trim the copy.

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

### Process

- Don't add features not in the current stage — follow [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md).
- Don't pull on a thread listed in [Prototype boundaries](#prototype-boundaries-as-of-phase-9) outside of its owning phase.

### Product & positioning

- **Don't render the homepage as a market dashboard.** The above-the-fold experience is search-first (single input + city pills + value-prop headline). KPI cards live below the fold or in a collapsed "Market snapshot" strip.
- **Don't ship a calculator surface with more than 8 visible inputs in the first-time flow.** Use progressive disclosure (section toggles, wizard mode, expert-mode toggle) past that. Power users opt into complexity; new users must not be forced into it.
- **Don't display a single number where a confidence band or range is more honest.** Cap rate, ROI, projected sale, monthly cashflow — these are estimates. Tag them with their `verified` / `estimated` / `user-input` tier so users read them correctly.
- **Don't add a Pro feature that benefits investors only.** Pro must include at least one feature non-investor browsers will value (currently: price alerts on favorites).
- **Don't advertise a Pro feature in `UpgradePrompt` that isn't implemented.** Trim the copy or ship the feature.

### Visual & UX

Visual rules now live in [`brand_identity/`](brand_identity/README.md). The high-stakes ones:

- Don't use raw hex in `*.tsx`. Use CSS variables / semantic tokens. ([`colors.md`](brand_identity/colors.md))
- Don't use `text-[9px]` or `text-[10px]`. Minimum 11px. ([`typography.md`](brand_identity/typography.md))
- Don't invent new colors for one screen. Propose a token in `colors.md` in the same PR. ([`colors.md`](brand_identity/colors.md))
- Don't use `<table>` for the default mobile view. Cards default; table at `md:` and up. ([`spacing.md`](brand_identity/spacing.md))
- Don't let `components/ui/` know about domain concepts (`projectStatus`, `classType`). Pass generic props. ([`components.md`](brand_identity/components.md))
- Don't remove focus rings to make a design look cleaner. ([`accessibility.md`](brand_identity/accessibility.md))
- Don't write headlines using forbidden marketing tropes ("Революция", "Уникальная возможность", emoji clusters). ([`positioning-voice.md`](brand_identity/positioning-voice.md))

## Prototype boundaries (as of Phase 9)

The following are intentionally stubbed and will be replaced — they should NOT be treated as bugs to fix in ad-hoc work, only as scoped phase deliverables. Future Claude sessions: don't pull on these threads outside of their owning phase.

- `src/data/projects.ts` is the dev fallback. Disappears when Supabase becomes the live source (Phase 15).
- `useAuth` falls back to a no-password stub when Supabase env vars are absent. The stub must hard-fail in production (Phase 15).
- `currentTier` in the Zustand store is a debug toggle. Real tier lives in `profiles.tier` and arrives with billing (Phase 15).
- `UpgradePrompt`'s default feature list advertises PDF export and ad-free. Both are planned but not implemented (Phase 15 — ship or trim).
- Project Gallery and Location tabs are placeholders (real media + map embed deferred).
- Compare button (`compareIds` store) toggles state but renders no comparison view (Phase 13).
- The KPI cards / filter-sidebar homepage layout is the *prototype's* homepage; the *product's* homepage is search-first (Phase 10).
- Russian-language strings still hardcoded in Saved Calcs, Settings, Portfolio (Phase 6 i18n debt — fold into a translation sweep before locale toggle gets real users).
