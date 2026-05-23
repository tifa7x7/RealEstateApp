# CrimeaDevTracker — Session History

Chronological summary of the build session that took the prototype (`C:\Users\fayzu\crimea-tracker\App.jsx`, 2958 lines) to a working Next.js application through Phase 7 of [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

**Period:** 2026-05-22 → 2026-05-23
**Outcome:** 30 routes, ~70 source files, all phases 0–7 complete. `tsc --noEmit` and `npm run build` exit 0 at every phase boundary.

For per-decision rationale, see the **Decision log** in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — this document references it rather than duplicating.

---

## Stack timeline (cumulative)

| When | Added |
|---|---|
| Pre-Phase 0 | `react@19`, `react-dom@19`, `lucide-react`, `typescript@5.6`, `@types/react`, `@types/react-dom` |
| Phase 0 layout | `next@15.5` (+ auto `@types/node`) |
| Tailwind wiring | `tailwindcss@^4`, `@tailwindcss/postcss@^4` |
| Phase 1 | `zustand` |
| Phase 4 | `recharts@3.8` |
| Phase 5 | `leaflet@^1.9`, `react-leaflet@^5`, `@types/leaflet` |

---

## Pre-Phase 0: Extraction

Goal: turn the prototype's pure logic + data into typed `src/lib/` and `src/data/` modules.

**Built**
- `src/lib/{types,constants,formatters,calculator,filters}.ts`
- `src/i18n/{types,ru,en}.ts` (full `Translations` interface)
- `src/data/projects.ts` (18 projects with units)

**Decisions of note**
- Fixed prototype's `useМortgage` Cyrillic-М typo → `useMortgage`
- `dist` formatter takes `locale` instead of the i18n object — `lib/` stays React-free
- DM Sans body font drops Cyrillic (font has no Cyrillic glyphs on Google Fonts); body Cyrillic falls through to system sans-serif. Playfair (headings) keeps Cyrillic.

---

## Phase 0: Foundation

Goal: app shell + design system + UI primitives.

**Built**
- 8 UI primitives in `src/components/ui/`: Button, Badge, Card, Input, Modal (focus-trap, ARIA), Toast, Skeleton, EmptyState
- 4 layout components in `src/components/layout/`: Header (with Suspense-isolated search), MobileNav, Footer, ThemeProvider
- `src/styles/globals.css` with dual-theme CSS variables
- `src/app/{layout,page}.tsx` with `next/font` (Playfair + DM Sans) and an inline anti-FOUC theme-init script
- Project setup: `package.json`, `tsconfig.json` (strict + `verbatimModuleSyntax`), `postcss.config.mjs`

**Issues hit & fixed**
- `useSearchParams()` in Header → "should be wrapped in suspense" build error → split SearchForm into shell + dynamic, wrapped dynamic in `<Suspense fallback={<Shell/>}>`
- Tailwind needed wiring → installed v4 + `@tailwindcss/postcss`, swapped `@tailwind` directives for `@import "tailwindcss"`

**Verified:** 4 routes (`/`, `/_not-found`).

---

## Implementation plan + memory entry

After foundation, wrote [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): 9 phases, cross-cutting decisions, deliverable checklists, decision log seed. Saved a feedback memory entry instructing future-me to read the plan before starting implementation work and to update its status on completion.

The plan became the single source of truth for "what's in scope right now"; every subsequent phase re-read it first and appended to the decision log on completion.

---

## Phase 1: Browse (core loop)

Goal: real homepage with filters + listings.

**Built**
- `src/store/app-store.ts` — Zustand store, `userPrefs` + `ui` slices, `persist` middleware with `partialize` (userPrefs only)
- 3 hooks: `useTranslations`/`useLocale`, `useProjects` (URL → filtered/sorted), `useFilters` (writes filter changes to URL)
- Retrofit Header/MobileNav/Footer from direct `ru` import to `useTranslations()`
- `DualRangeSlider` UI primitive
- 6 feature components in `src/components/projects/`: FilterPanel, MobileFilterButton, KPIDashboard, ProjectCard, ProjectTable, ProjectListings
- Homepage with sidebar filter (desktop) / Modal-sheet filter (mobile)

**Decisions of note**
- Skipped a separate LocaleProvider — `useTranslations` reads Zustand directly
- Theme stayed in its own ThemeProvider (anti-FOUC pattern is fiddly to coordinate with Zustand-persist)
- ProjectTable sort lives in URL (shareable, browser back), `aria-sort` on active columns

**Verified:** `/` is 13.8 kB / 128 kB First Load.

---

## Phase 2: Project & unit detail

Goal: full project pages + unit drill-downs.

**Built**
- `compareIds` slice added to store (max 5, not persisted)
- 8 feature components: ProjectHero, ProjectStats, ProjectAmenities, ProjectTabs (ARIA tablist with URL `?tab=`), UnitTable, UnitCard, UnitListings, UnitActions
- Routes: `/projects/[id]/page.tsx` (SSG'd for 18 projects), `/projects/[id]/units/[unitId]/page.tsx` (dynamic), both with `not-found.tsx`

**Decisions of note**
- Unit detail is a route, not a modal — SEO + shareability
- "Calculate from this unit" link → `/calculator?project=N&unit=ID` (forward-compat with Phase 3)
- Compare button wired to store, but **no comparison view yet** — deferred

**Issues hit & fixed**
- First build attempt crashed with `STATUS_STACK_BUFFER_OVERRUN` while statically generating 152 pages (18 projects × ~7 units). Windows Node worker exhaustion. → Dropped `generateStaticParams` from the unit page; it now renders dynamically. Project pages still SSG.

**Verified:** 22 routes.

---

## Phase 3: Calculator (free tier)

Goal: single-object investment calculator with paywalled add-more.

**Built**
- `calcObject` slice added to store (persisted — users shouldn't lose work)
- 2 hooks: `useCalculator`, `usePaywall(feature)` returning `{ allowed, tier, isPro }`
- `UpgradePrompt` UI primitive
- 8 calculator components: CalcInput (with tooltip), CatalogPicker (project → unit), RentalSection, ExitSection, MortgageBreakdown, CalcResultsSummary, CalcWizard (single-page form with toggle cards, NOT step-by-step despite the name), CalcUrlBootstrap (reads `?project=&unit=` and prefills)
- `/calculator/page.tsx`

**Decisions of note**
- CalcWizard is single-page with section toggles — better for "zero learning curve" + faster iteration than a stepped wizard
- `usePaywall` returns gate result only; caller decides UX (no auto-modal)
- Calculator always renders RUB regardless of currency setting

**Verified:** 23 routes. `/calculator` 8.76 kB / 127 kB.

---

## Phase 4: Analytics

Goal: 5 charts of market data.

**Built**
- `recharts@3.8` installed
- 5 charts: ValueQuadrantChart (scatter), ClassDistributionChart (composed bar+line), DevPortfolioChart (horizontal bar), PriceHeatmap (CSS grid, not Recharts), AmenityImpactChart (horizontal diff bar with ReferenceLine at 0)
- `/analytics/page.tsx`

**Decisions of note**
- PriceHeatmap built as CSS grid because Recharts has no native heatmap and HTML gives better text rendering
- Chart-internal colors are hex (SVG `fill` attribute doesn't interpolate CSS variables); slight light-theme degradation accepted
- Analytics charts respect URL filters via `useProjects()` — visiting `/analytics?statuses=Строится` shows analytics for the filtered subset

**Issues hit & fixed**
- Recharts 3.x renamed Tooltip content prop type: `TooltipProps<V, N>` → `TooltipContentProps` with default generics. Fixed across all 4 charts.

**Verified:** 24 routes. `/analytics` 123 kB / 239 kB (Recharts is heavy).

---

## Phase 5: Map

Goal: interactive Leaflet map of all projects.

**Built**
- `leaflet`, `react-leaflet`, `@types/leaflet` installed
- ProjectMap (OSM tiles, custom class-colored divIcon markers, cached by color)
- MarkerPopup, MapFilters (compact URL-driven status + class pills), MapPageClient (client wrapper that dynamic-imports map with `ssr: false`)
- `/map/page.tsx`
- Leaflet theme overrides added to globals.css (popup, attribution, zoom buttons)

**Decisions of note**
- Custom HTML divIcon markers instead of default PNG icons → avoids broken bundler asset paths AND the standard hack which requires `as any`
- Server page → Client wrapper → dynamically-imported map; Next 15+ requires `dynamic({ ssr: false })` to live inside a client component

**Verified:** 25 routes. `/map` 4.13 kB / 121 kB (Leaflet is a lazy chunk, not counted in First Load).

---

## Phase 6: Account / favorites

Goal: auth stub + favorites + saved calcs + settings.

**Built**
- Store: added `loadSavedCalc(id)` action; factory switched to `(set, get)`
- 3 hooks: `useFavorites` (enriches IDs to Project/Unit objects), `useSavedCalcs` (free limit 1, Pro unlimited; returns `{ ok, id } | { ok: false, reason: 'limit-reached' }`), `useHydration` (waits for Zustand-persist rehydration)
- 6 account components: AuthForm (mode toggle, no validation), AccountGate (hydration skeleton → auth form → tabs + content), AccountTabs, FavoritesList (projects + units sections), SavedCalcsList (Open/Delete), SettingsForm (profile + tier toggle for testing + sign out)
- Routes: `/account/layout.tsx`, `/account/page.tsx`, `/account/favorites/page.tsx`, `/account/saved/page.tsx`, `/account/settings/page.tsx`
- **CalcWizard: added Save button** that saves all calc state, shows "Сохранено" confirmation, opens UpgradePrompt with **contextual** reason when free-tier limit hit

**Decisions of note**
- Added `useHydration` (not on deliverable list) because AccountGate would otherwise flash the auth form before persisted `loggedIn=true` arrives
- `/account` renders FavoritesList directly rather than redirecting
- Auth is fully stubbed — any email works

**Verified:** 29 routes. All account pages <3.5 kB each.

---

## Phase 7: Pro tier features

Goal: multi-object calc + comparison + rankings + 10-year forecast + portfolio.

**Built**
- **Store refactor:** `calcObject: CalcObject` → `calcObjects: CalcObject[]` + `activeCalcIndex: number`. Persist version bumped to **v1** with `migrate(fromV0)` that converts `{calcObject: X}` → `{calcObjects: [X], activeCalcIndex: 0}`. Max 5 objects. Portfolio CRUD actions added.
- `RentalProperty` type extended (`type`, `purchaseDate`)
- 1 hook: `usePortfolio` (CRUD + aggregate totals)
- `ProGate` UI primitive (renders children if allowed, else paywall Card + UpgradePrompt CTA)
- 4 calculator components: ObjectTabs (tabs with × remove + paywalled "+ Добавить"), ComparisonTable (metrics × objects with best highlighted), Rankings (per-metric podium), CashflowForecast (Recharts LineChart, Pro-gated)
- RentalPortfolio (Pro-gated, aggregate stats + editable per-property rows)
- AccountTabs: added Portfolio tab
- `/account/portfolio/page.tsx`
- CalcWizard updated: ObjectTabs at top, multi-object analysis below the form

**Decisions of note**
- `useCalculator` preserves the existing single-object API (`object`/`setField`/`results`) so existing form components didn't change
- ComparisonTable + Rankings self-hide when `objects.length < 2` (no need to ProGate them — free tier can't add objects anyway)
- CashflowForecast is Pro-gated even though the lib function `generateCashflowForecast` is free — gating is on the UI surface
- RentalPortfolio simplified vs. prototype's 500+ line version

**Verified:** 30 routes. `/calculator` jumped to 12.1 kB / 244 kB (Recharts now loaded for forecast). `/account/portfolio` 2.89 kB / 126 kB.

---

## Issues hit & fixes (rollup)

| Phase | Issue | Fix |
|---|---|---|
| 0 | DM Sans has no Cyrillic glyphs on Google Fonts | Dropped Cyrillic subset; body Cyrillic falls back to system sans-serif |
| 0 | `useSearchParams()` triggered SSG bailout | Split SearchForm into shell + dynamic; wrapped dynamic in Suspense |
| 0 | Tailwind not installed | Added `tailwindcss@4` + `@tailwindcss/postcss`, switched to `@import "tailwindcss"` |
| 2 | Static build crashed with `STATUS_STACK_BUFFER_OVERRUN` (Windows worker exhaustion at 152 pages) | Dropped `generateStaticParams` from `/projects/[id]/units/[unitId]` |
| 4 | Recharts 3.x renamed `TooltipProps` → `TooltipContentProps` with default generics | Updated all 4 chart tooltip types |
| 5 | Leaflet default PNG markers break in bundlers; standard hack needs `as any` | Used custom HTML `divIcon` per marker (class-colored circles) — sidesteps default-icon path issue entirely |
| 6 | Zustand-persist hydration flashes default state on first paint | Added `useHydration` hook + skeleton fallback in AccountGate |
| 7 | Multi-object calc shape change vs. persisted localStorage | Persist `version: 1` with `migrate(fromV0)` |

---

## Build progression

| Phase | Routes | Notable Page Size | Notable First Load JS |
|---|---|---|---|
| 0 | 2 | `/` 123 B | `/` 103 kB |
| 1 | 4 | `/` 13.8 kB | `/` 128 kB |
| 2 | 22 | `/projects/[id]` 7.6 kB (SSG ×18) | 122 kB |
| 3 | 23 | `/calculator` 8.76 kB | 127 kB |
| 4 | 24 | `/analytics` 123 kB | 239 kB (Recharts) |
| 5 | 25 | `/map` 4.13 kB | 121 kB (Leaflet lazy) |
| 6 | 29 | `/account/*` <3.5 kB each | 120–126 kB |
| 7 | 30 | `/account/portfolio` 2.89 kB; `/calculator` jumped to 12.1 kB | `/calculator` to 244 kB (Recharts) |

---

## Persistence

A feedback memory entry was created during plan creation: **"Before starting any implementation task in this repo, read `IMPLEMENTATION_PLAN.md` first; update its status table and check off deliverables on completion."** Honored throughout phases 1–7.

[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) tracks status (✅ ⬜ 🟡), per-phase deliverable checklists, and an append-only Decision Log with ~35 entries by end of Phase 7. That file is the source of truth for what's in scope; this document is the source of truth for what happened.

---

## Where the project stands

**Complete:** Phases 0–7 (foundation + browse + detail + free calc + analytics + map + account + Pro features).

**Remaining per plan:**
- **Phase 8** — Backend (Supabase): schema, queries, real auth, migrate hooks from localStorage to Supabase.
- **Phase 9** — Polish: per-route metadata + open-graph, loading skeletons, error boundaries, sitemap, PWA manifest, lighthouse pass, locale-switcher UI.

**Outstanding cross-phase debt:**
- Project comparison view (toggle works since Phase 2; no display)
- Exports (PDF/CSV/Excel) for comparison/forecast
- Multi-object forecast overlay
- Portfolio mortgage tracking
- i18n for newly-added strings in Phase 6+7 (hardcoded Russian)
- Calculator's Recharts bundle bloat (could lazy-import the forecast chart)
- Light-theme chart axis colors (hardcoded hex)
- Locale-switcher UI surface (mechanism exists)
