# RealEstateApp — Session History

Chronological summary of the build session that took the prototype (`C:\Users\fayzu\crimea-tracker\App.jsx`, 2958 lines) through Phase 15 of [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — a launch-ready (pending external integrations) Next.js application.

**Period:** 2026-05-22 → 2026-05-25
**Outcome:** Phases 0–15 complete. Phase 16 (price alerts) queued as the final retention-loop deliverable. `tsc --noEmit` clean at every phase boundary; `npm run build` exit 0 at Phase 10 close (production builds deferred for later phases due to dev-server cache discipline — CI workflow validates on remote pushes).

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
| Phase 8 | `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query` |
| Phases 10–15 | _No new dependencies added._ All new features built on the existing stack. |

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

## Phase 8: Backend (Supabase) — code-only

Goal: real schema, real auth, cross-device persistence — without yet provisioning a live Supabase project.

**Built**
- `supabase/migrations/0001_init.sql` — 7 tables (projects, units, profiles, favorites, fav_units, saved_calculations, rental_properties) + RLS policies + `updated_at` triggers + `handle_new_user` trigger that auto-creates a profiles row
- `supabase/generate-seed.ts` + `supabase/seed.sql` — pipeline from `src/data/projects.ts` to idempotent SQL inserts
- Three Supabase clients in `src/lib/supabase/`: browser (singleton), server (cookies-aware), static (anon, no cookies — safe for `generateMetadata`)
- `database.types.ts` hand-written to match the schema (regenerate later via `supabase gen types`)
- Data-access layer in `src/lib/api/{projects,favorites,saved-calcs,portfolio}.ts` — framework-agnostic, falls back to seed when no client
- `src/app/api/projects/` routes (list + by id)
- `QueryProvider` wrapping React Query; `useProjects` switched to `useQuery` with `initialData: PROJECTS`
- Real Supabase auth via `useAuth` hook; falls back to Phase-6 stub when env vars absent
- `useSupabaseUserDataSync` — one-time per-device localStorage→Supabase import + ongoing store hydration
- Hook write-through: useFavorites / useSavedCalcs / usePortfolio mirror mutations to Supabase via RLS
- Server Components migrated: `/projects/[id]` and unit detail fetch via Supabase static client

**Decisions of note**
- Seed kept as offline-dev fallback (Phases 1–7 still run with no Supabase)
- Browser writes to Supabase directly (RLS already enforces per-user access) — API routes only for public reads
- `generateStaticParams` dropped from `/projects/[id]` (Windows worker exhaustion after deps added); pages went `force-dynamic`
- `next.config.ts` introduced with `experimental.cpus: 1` to stabilize Windows builds

---

## Phase 9: Polish

Goal: ship-ready surface — SEO, error boundaries, loading skeletons, PWA manifest, accessibility.

**Built**
- Centralized SEO helper `lib/seo.ts` (`buildMetadata`, `SITE_NAME`, `SITE_URL`); every page metadata flows through it for canonical URLs + OpenGraph + Twitter
- `error.tsx` per top-level segment (root, /calculator, /analytics, /map, /account, /projects/[id]) using a shared `ErrorBoundary` component
- `loading.tsx` per top-level segment with content-shaped skeletons in `components/ui/Skeletons.tsx`
- `sitemap.ts` (static + per-project), `robots.ts` (disallows /account, /api/*), `manifest.ts` (PWA)
- Locale switcher in Header (`LocaleToggle`) + `LocaleHtmlLang` effect to mirror locale into `<html lang>`
- Skip-to-content link + `<main id="main-content">` + visible/sr-only h1 on homepage

**Decisions of note**
- OpenGraph image deliberately omitted (real OG assets generated in Phase 14)
- Twitter card stayed `summary` pending real images (upgraded in Phase 14)
- Locale toggle doesn't change URL — locale is a client preference held in Zustand

---

## App review + competitive analysis

Between Phase 9 and Phase 10 a deep audit happened — three documents produced, all saved to the repo root:

- **[AppReviewResults.md](AppReviewResults.md)** — comprehensive review playing three hats (Senior Full-Stack Dev, UI/UX Designer, Product Strategist) against the [AppReview.md](AppReview.md) prompt. Scored each surface 1–10 on cognitive load, flagged the homepage value-prop being invisible (`sr-only` h1), the calculator at cognitive load 9/10, the dormant Compare button, and unimplemented Pro features in UpgradePrompt copy. Concluded with a 20-row prioritized action plan grouped as Launch Blockers / Week 1 / Month 1 / Quarter 1.
- **[CompetitorReviewResults.md](CompetitorReviewResults.md)** — competitive analysis of [solgt.no](https://solgt.no) (Norwegian housing-data + valuation platform). Despite the SPA being JS-rendered (WebFetch could only see page titles), assembled the picture from Google snippets, PitchBook/TheOrg profiles, and academic papers from their R&D team. Conclusion: Solgt's "address-first single search input" + "accuracy disclosure on every estimate" + "interactive map as primary surface" are direct wins to copy. Our moats vs. them: investment math, subsidized-mortgage modeling, new-build coverage (their resale models can't enter).
- **Synthesis** — the two reviews converged on 5 strongest signals (search-first homepage, confidence-as-a-system, map as primary surface, calculator wizard mode, blog for SEO) plus 5 AppReview-only and 5 CompetitorReview-only items. Synthesis fed directly into Phase 10–16 plan and the CLAUDE.md + IMPLEMENTATION_PLAN.md updates that followed.

The synthesis output was also where **Phases 10–16 got their structure**: each phase grew out of one of the converged signals plus its mechanical prerequisites.

---

## Brand identity folder

A separate [`brand_identity/`](brand_identity/README.md) folder was created during the synthesis cycle, holding 7 topic files for the design system:

- `positioning-voice.md` — voice ("decision tool, not price ticker"), headline templates, microcopy, forbidden marketing tropes
- `colors.md` — foundation + semantic + confidence tokens, usage rules, no-raw-hex rule
- `typography.md` — Playfair / DM Sans stack, 9-step scale, hierarchy by surface
- `spacing.md` — 4px grid, container padding, breakpoints, sticky/z-index conventions
- `components.md` — visual specs for every `ui/` primitive (current + planned)
- `motion.md` — single ease (`cubic-bezier(0.25, 0.1, 0.25, 1)`), 4 duration tiers, when-to-animate
- `accessibility.md` — WCAG 2.1 AA contract, ARIA patterns, pre-launch checklist

CLAUDE.md was slimmed to reference the folder via a quick-index table at the top of the design system section. All visual rules moved out of CLAUDE.md into the topic files; CLAUDE.md retained product strategy, code rules, and prototype-boundary documentation.

---

## Phase 10: Consumer-first IA & visual identity

Goal: stop being a research terminal. Reorient the homepage and visual hierarchy around "decision tool → search tool → market intel."

**Built**
- New `HomeHero` (Playfair value-prop headline + large search input + city pills) — replaces the `sr-only` h1 + KPI strip homepage
- `MarketSnapshot` — collapsible wrapper around `KPIDashboard`, demoted below the fold
- `MobileSort` — `<Select>` above the project card grid on `<md`, bound to `?sort=&dir=` URL params
- `useChartColors` hook — resolves CSS variables to hex at paint time for SVG `fill` attributes; eliminates hardcoded hex in 4 analytics charts + `CashflowForecast`
- Semantic color tokens added to globals.css: `--status-*` × 4, `--class-*` × 4, `--unit-*` × 3, `--confidence-*` × 3 (the last set used in Phase 12)
- `ToastProvider` + `useToast` hook — imperative toast API mounted in root layout; `Toast.tsx` refactored to be positioning-agnostic
- `CalcWizard` save flow converted from inline button-variant flip to a Toast
- 16:9 placeholder image area on `ProjectCard` (radial gradient tinted by class color, building icon)
- Marketing-copy sweep: homepage headline, OG titles via `lib/seo.ts`, `UpgradePrompt` trimmed to only-what-ships
- Header tab `tabs.table` → `tabs.search` (semantic key + i18n value rename)

**Decisions of note**
- `Toast.tsx` refactored to be position-agnostic so the provider can stack multiple toasts at dynamic offsets
- `useChartColors` returns dark-theme defaults on SSR (no `window`) — Recharts hydration matches the initial `data-theme="dark"`
- Two parallel maps shipped — `STATUS_COLORS` (for inline-style `background: var(--token)`) and `STATUS_COLOR_VARS` (raw variable names for the hook) — clearer than a runtime unwrap
- Project card class badge moved off the image area onto the title row; status badge stayed on the image since it's the time-sensitive label
- Hero h1 size scales 28 → 36 → 40 px across breakpoints (typography.md already documented 32–40 px for hero — no new step)

**Verified:** `tsc --noEmit` + `npm run build` exit 0. Homepage 142 kB First Load (was 140 kB pre-Phase-10; +2 kB for new components, well under 180 kB budget).

---

## Phase 11: Calculator wizard mode

Goal: first-timers get 3 questions and an answer; power users keep the full grid.

**Built**
- `userPrefs.calcWizardSeen` boolean added to Zustand store + setter; included in `partialize` so it persists
- `CalcWizardSteps.tsx` — 3-step wizard (price + property basics → mortgage Y/N → rental Y/N) wrapping the same `useCalculator` store; no math re-implemented
- `CalcExperience.tsx` — parent router that picks wizard vs expert mode based on `calcWizardSeen`; expert mode shows a "Быстрый расчёт" link to re-enter the wizard for the session
- `FinishingGradeSelector.tsx` — 6-tier grade grid (none / черновая / предчистовая / чистовая / white-box / turn-key) writing `area × pricePerSqm` to the renovation field; fuzzy-matches user overrides to ±10% so the closest tier stays highlighted
- `FINISHING_GRADES` constant added to `lib/constants.ts` with per-tier ₽/m² rates + Russian/English hints
- `MobileResultPill.tsx` — `<lg` floating pill bottom-right showing running total cost; opens result panel in a bottom `Sheet`
- `Sheet.tsx` — side/bottom/auto drawer primitive in `components/ui/` with focus trap + Esc dismiss + body scroll lock
- `Tooltip.tsx` — lightweight tooltip primitive with auto-flip on viewport check; **no Floating-UI dependency**
- `MortgageBreakdown.tsx` enhanced with `SplitRateBanner` — visible accent-tinted card showing "6% до 6 млн ₽ · 21% на остаток" with a plain-language hint
- `CalcInput.tsx` migrated to use the new `Tooltip` primitive
- `MobileFilterButton.tsx` migrated to `Sheet` (replaces centered-Modal pattern from Phase 1)

**Decisions of note**
- Wizard ships as one file (steps inline as sub-components), not four — fragmentation wasn't earning anything at ~60 lines per step
- `Tooltip` deliberately omits Floating-UI to save ~12 kB on every page that uses it
- `Sheet`'s `auto` mode picks side via Tailwind responsive classes (`lg:flex-row lg:inset-y-0`), not JS measurement — SSR-safe
- `FinishingGradeSelector` does NOT deprecate the manual `renovation` `CalcInput` — both render side-by-side, the manual one gets a tooltip pointing at the selector
- Expert-mode re-entry sets `calcWizardSeen = false` for the current session only via local state (persisted flag stays true) — wouldn't silently undo the user's earlier "I'm done with the tutorial" choice
- `SplitRateBanner` always renders even when the loan fits inside the subsidized cap (better story for the moat positioning than "only show when split")

**Verified:** `tsc --noEmit` exit 0. Production build skipped this round per dev-server discipline (lesson learned at Phase 10 close).

---

## Phase 12: Confidence as a system

Goal: make uncertainty visible everywhere. The `dataConfidence` column already existed (Phase 8 schema); just hadn't been surfaced.

**Built**
- `ConfidenceBadge` UI primitive — pill with icon + label, color-mixed background from `--confidence-*` semantic tokens, always wraps in `Tooltip` for per-tier hint
- `projectDataConfidenceToTier()` helper — maps schema's `'verified' | 'estimated' | 'unverified' | undefined` to the canonical UI tier set
- `classifyCalcSection(section, obj)` — pure function in `lib/calculator.ts` returning `'verified' | 'estimated' | 'user-input'` based on whether `sourceProjectId` is set + whether inputs differ from `defaultCalcObject()`
- `SectionHeader` sub-component in `CalcResultsSummary.tsx` — renders title + compact `ConfidenceBadge` together on every result card
- Project cards: compact badge in image-area top-right next to status
- Project hero: labeled badge next to building-type badge
- Map markers: outline ring colored by confidence (`--confidence-verified` teal / `--warning` amber / white default)
- i18n: `t.confidence.{verifiedLabel, verifiedHint, ...}` in RU + EN

**Decisions of note**
- Four tiers shipped (canonical 3 + `unverified` for project-level only) — the schema's signal reaches users instead of being collapsed to "estimated"
- `classifyCalcSection` lives in `lib/calculator.ts` per CLAUDE.md "`lib/` is pure" — no React, no state, testable in isolation
- Mortgage section stays `estimated` even when the calc was prefilled from a verified project — the mortgage output is a model derivation from formulas + MARKET_DATA constants; calling that `verified` would overclaim
- `ConfidenceBadge` always wraps in a Tooltip — no naked variant; a badge without explanation is the failure mode we're trying to fix
- Undefined `dataConfidence` maps to `estimated` (not `verified`) — more honest about what we don't know

**Verified:** `tsc --noEmit` exit 0.

---

## Phase 13: Comparison & exploration

Goal: activate the dormant Compare flow (Phase 2 carry-over) and make the map a destination, not a side trip.

**Built**
- `useCompare` hook — tier-aware policy wrapper over the Zustand `compareIds` slice; returns typed `{ ok: false, reason: 'limit-reached', limit }` on overflow
- `usePaywall` extended with `'compare-multi'` feature + `COMPARE_LIMIT_FREE` (2) / `COMPARE_LIMIT_PRO` (5) constants
- `CompareDrawer.tsx` — side/bottom `Sheet` with 10-row spec comparison table (price/m², min price, sea distance, city, status, class, completion, floors, buildings, amenity count); best-value cells in numeric rows highlighted accent
- `CompareLauncher.tsx` — floating bottom-left button (mobile) / bottom-right (desktop) visible whenever `compareIds.length > 0`; mounted globally in root layout
- `getDistrictStats()` — pure function in `lib/filters.ts` returning aggregates per district (count, totalUnits, availableUnits, avgPricePerSqm, minPrice, maxPrice, avgSeaDistance, sampleProjects)
- `DistrictPanel.tsx` — map side panel (right rail on `lg+`, below on `<lg`) showing district aggregates + 5 sample projects
- `ProjectMap` extended with `onSelectDistrict?: (district: string) => void`; marker click fires it
- `MapPageClient` hosts the selected-district state and renders the side panel
- `MarkerPopup` now includes a "Рассчитать" link to `/calculator?project=N&unit=ID` (cheapest available unit auto-selected) + `ConfidenceBadge`
- `ProjectHero` migrated from raw store action to `useCompare().toggle` + `UpgradePrompt` on overflow
- Map promoted to position 2 in `Header` and `MobileNav` tab arrays (was position 3)

**Decisions of note**
- `useCompare` is a policy layer, not parallel state — store stays the source of truth
- Project comparison and calculator comparison tables are separate (different data shapes, different decision moments); sharing one component would have required generic prop shapes that obscured both call sites
- `CompareLauncher` floats on the LEFT on mobile to avoid stacking with the calculator's `MobileResultPill` (right-pinned)
- District selection lives in `MapPageClient`, not `ProjectMap` — the dynamic-imported map stays focused on rendering
- `DistrictPanel` reads from `useProjects()` so it inherits URL filter state (consistent with the analytics-charts-respect-URL pattern from Phase 4)
- `MarkerPopup` auto-selects the cheapest available unit for the calculator link; hides the link if no available unit (better than a dead-end)

**Verified:** `tsc --noEmit` exit 0.

---

## Phase 14: Performance, SEO, content channel

Goal: earn organic traffic. Stop blocking the user with heavy bundles.

**Built**
- `InViewport.tsx` UI primitive — IntersectionObserver wrapper for lazy mounting; default `rootMargin: '200px'` pre-loads just before viewport entry
- `AnalyticsContent.tsx` — new client wrapper (`ssr: false` can't be used in Server Components per Phase 5 pattern); dynamic-imports all 5 charts. Top chart renders eagerly; other four wrap in `<InViewport>`
- `ForecastChart.tsx` — split out from `CashflowForecast.tsx` so Recharts can be dynamic-imported only when rental/exit toggles + Pro tier are active
- `lib/og-image.tsx` — shared `renderOgImage({ eyebrow, title, subtitle })` using `next/og`'s `ImageResponse`; dark gradient + accent dot + serif title
- 5 × `opengraph-image.tsx` files (root, /calculator, /analytics, /map, /projects/[id]); project OG resolves project via `fetchProject(getSupabaseStaticClient(), id)`
- Twitter card upgraded to `summary_large_image` in `lib/seo.ts`
- `supabase/migrations/0002_fts.sql` — Russian FTS: weighted `tsvector` generated column (name A > developer B > city C > district D) + GIN index + `search_projects(query text)` RPC using `plainto_tsquery('russian', ...)`
- `Database['public']['Functions']['search_projects']` typing in `database.types.ts`
- `searchProjects()` data-access function in `lib/api/projects.ts` (returns null on RPC error → falls through to seed)
- `/api/projects` route accepts optional `?q=`; `useProjects` keys cache as `['projects', 'fts', q]` when active
- `scripts/check-perf-budgets.mjs` — parses `next build` stdin, asserts per-route First Load JS against budget map, exits non-zero on overrun
- `.github/workflows/perf-budgets.yml` — typecheck + build + budget assertion on every PR / push to main
- `src/content/blog/index.ts` — typed `BlogPost` registry with 6 Russian articles: семейная ипотека · маткапитал · Cap Rate/NOI/Cash-on-Cash · котлован · налог 4% · 10-летний прогноз
- `/blog` index + `/blog/[slug]` detail with `generateStaticParams` (all 6 SSG'd) + `generateMetadata`; sitemap updated
- Project detail switched from `dynamic = 'force-dynamic'` to `revalidate = 600` (ISR)
- `next.config.ts` `experimental.cpus: 1` gated to `process.platform === 'win32'` only — Linux/macOS CI gets full parallelism

**Decisions of note**
- `AnalyticsContent` is a new client wrapper because `next/dynamic({ ssr: false })` can't be called from a Server Component in Next 15 (same Phase 5 constraint that gave us `MapPageClient`)
- Top chart on `/analytics` renders eagerly (no `InViewport`) — it's above the fold; deferring would create layout shift
- OG image renderer is dark-theme only with hardcoded brand hex literals (no DOM at edge runtime); documented in the file as the only allowed hex outside `globals.css`
- OG fonts not embedded — Vercel's bundled set renders Cyrillic + Latin cleanly
- FTS RPC weights name > developer > city > district so "ялта" returns Yalta projects, not developers based in Yalta
- FTS falls through to seed-search when the RPC errors (zero regression on partially-applied Supabase setups)
- Blog content shipped as structured TypeScript modules, not MDX/Markdown — avoids a parser dependency for seed-grade content; easy migration when content scale grows
- `/account/*` budget held at 200 kB temporarily (currently 192) with a Phase 15 commitment to tighten (delivered there)

**Verified:** `tsc --noEmit` exit 0. Production build deferred to next phase boundary.

---

## Phase 15: Real Supabase + billing + Pro tier completion (code; provider integration pending)

Goal: graduate from prototype. Real auth, real tier, real money. Close every Phase-6/8 carry-over.

**Built**
- **Production gate**: boot-time `throw` in `lib/supabase/env.ts` when `NODE_ENV === 'production'` and Supabase env vars are missing — closes the stub-auth gate documented in CLAUDE.md prototype boundaries
- `lib/api/profile.ts` with `fetchProfile(client, userId)`; `useSupabaseUserDataSync` extended to fetch profile alongside favorites/calcs/portfolio and write `profiles.tier` into the store's `currentTier`
- `SettingsForm.tsx` debug tier toggle REMOVED; replaced with tier display + "Перейти на Pro" button opening `UpgradePrompt`
- `FAVORITES_LIMIT_FREE = 25` constant; `useFavorites().toggleFavorite()` returns typed result + emits info toast on cap hit; `ProjectCard` + `ProjectHero` migrated from raw `useAppStore.toggleFavorite` to the hook
- `useFavorites` + `useCompare` now resolve projects via React Query's `['projects']` cache (populated by `useProjects`); seed remains only as `initialData` for the initial-paint window
- `AdSlot.tsx` UI primitive — location-whitelisted (`listings-inline` / `filter-top` / `project-bottom` / `blog-inline`); Pro users always get null; without `NEXT_PUBLIC_AD_PROVIDER` renders nothing in production, dashed dev outline locally
- AdSlot mounted at `listings-inline` every 8 cards in the mobile listings grid
- `/api/billing/checkout/route.ts` — auth-checked POST that returns 501 with structured error until `BILLING_PROVIDER` env is set; the contract (plan name + successPath) is finalized
- `/api/billing/webhook/route.ts` — signature verification + service-role tier writes + `revalidatePath` on subscription events
- `UpgradePrompt.handleUpgrade()` — POSTs to `/api/billing/checkout`, redirects to `checkoutUrl` on success, shows contextual toast on 501/401/503 (the expected pre-launch path)
- `UpgradePrompt` default feature list restored to advertise PDF export + ad-free (both now architecturally implemented)
- Print-based PDF export — new `@media print` block in `globals.css` (`.no-print` hides chrome, `.print-target` prints the result panel with white-paper overrides); chrome elements tagged `.no-print` (Header, MobileNav, Footer, calculator form column, MobileResultPill, CompareLauncher); calculator result panel tagged `.print-target`; new "PDF" button (Pro-gated via `usePaywall('exports')`) calls `window.print()`
- `scripts/check-perf-budgets.mjs` — `/account/*` budgets tightened from 200 → 180 kB
- `.env.example` rewritten with Supabase + billing + ads sections + comments
- `README.md` rewritten — clear "REQUIRED in production" framing, exact migration sequence (`0001_init.sql` + `0002_fts.sql` + `seed.sql`), billing setup steps

**Decisions of note**
- Phase 15 is "code complete; provider integration pending" — installing a real billing provider needs a Supabase account, a chosen provider, API keys, and test cards (out of code-session scope). Single, well-documented integration point left at `/api/billing/checkout` + webhook
- PDF export uses `window.print()` instead of `@react-pdf/renderer` — saves ~250 kB server-side dep, gives users native save-as-PDF UX on every platform
- `useFavorites` emits the cap-hit toast itself (couples hook to `useToast`) — alternative would mean wiring at every favorite-button site; pragmatic call
- AdSlot location whitelist enforced inside the component, not by callers — defensive against accidental misuse on conversion-critical surfaces (calculator results, analytics, account, project Apartments tab)
- Webhook uses service-role client to write `profiles.tier` — `profiles_update_own` RLS policy admits only the authenticated user; signature verification + service-role together replace the RLS check
- Print stylesheet bakes white + black overrides on `.print-target` — dark-theme tokens print poorly on white paper; trade-off accepted (user can't print a dark version)
- `prefillCalcFromUnit` still reads `PROJECTS` directly — it's a non-React store action that can't use React Query; deferred to Phase 16 alongside the alerts table work

**Verified:** `tsc --noEmit` exit 0.

---

## Issues hit & fixes (Phases 8–15 addendum)

| Phase | Issue | Fix |
|---|---|---|
| 8 | Windows worker exhaustion at 18 SSG'd project pages with the Supabase deps on the build path | Dropped `generateStaticParams` from `/projects/[id]`; introduced `next.config.ts` with `experimental.cpus: 1` |
| 10 | Stale `.next/` after running `npm run build` against the same directory as a live `npm run dev` — dev server's in-memory chunks reference paths that no longer exist on disk; "Internal server error" on every route | Established dev-server discipline: never run `npm run build` while dev is alive. Subsequent phases skipped local production builds at phase boundaries; CI workflow validates on remote pushes |
| 11 | Modal feels obtrusive on mobile filter panel | `Sheet` primitive (auto-mode picks side via Tailwind classes) — `MobileFilterButton` migrated; mobile calculator results also get a Sheet via `MobileResultPill` |
| 14 | `next/dynamic({ ssr: false })` not allowed in Server Components (Next 15 constraint) | Same fix as Phase 5: client wrapper `AnalyticsContent` hosts the dynamic imports; Server page renders the wrapper |
| 14 | `next/og` runtime has no DOM, so OG images can't resolve CSS variables | Hardcoded brand hex literals in `lib/og-image.tsx`; the file is the only documented place hex literals are allowed outside `globals.css` |
| 15 | `profiles_update_own` RLS policy blocks webhook from writing tier | Webhook uses service-role client with explicit signature verification before any mutation |

---

## Build progression (updated)

| Phase | Routes | Notable Page Size | Notable First Load JS |
|---|---|---|---|
| 0 | 2 | `/` 123 B | `/` 103 kB |
| 1 | 4 | `/` 13.8 kB | `/` 128 kB |
| 2 | 22 | `/projects/[id]` 7.6 kB (SSG ×18) | 122 kB |
| 3 | 23 | `/calculator` 8.76 kB | 127 kB |
| 4 | 24 | `/analytics` 123 kB | 239 kB (Recharts) |
| 5 | 25 | `/map` 4.13 kB | 121 kB (Leaflet lazy) |
| 6 | 29 | `/account/*` <3.5 kB each | 120–126 kB |
| 7 | 30 | `/calculator` 12.1 kB | 244 kB (Recharts) |
| 8 | 14 routes total | (project pages dynamic-fetched) | `/calculator` 310 kB (Supabase + RQ added) |
| 9 | 17 | (+ sitemap + robots + manifest) | unchanged from Phase 8 |
| 10 | 17 | `/` 9.44 kB (HomeHero + MarketSnapshot + MobileSort) | `/` 142 kB (well under 180 kB budget) |
| 11–15 | 17–22+ (added /blog × 7, billing × 2, OG × 5) | (production builds deferred per discipline) | (CI workflow validates) |

`/blog` adds 7 routes (`/blog` index + 6 SSG'd articles). `/api/billing/*` adds 2 routes. OG image generation adds 5 edge-runtime image routes. Final route count pending production-build validation on next remote push.

---

## Persistence

Two memory entries are active in user auto-memory:

- **Read plan before implementing** (created at Phase 0 plan write): "Before starting any implementation task in this repo, read `IMPLEMENTATION_PLAN.md` first; update its status table and check off deliverables on completion." Honored throughout phases 1–15.

[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) tracks status (✅ ⬜ 🟡), per-phase deliverable checklists, and an append-only Decision Log with ~80+ entries by end of Phase 15. CLAUDE.md governs architecture + product strategy + code rules. [`brand_identity/`](brand_identity/README.md) governs everything visual.

That trio is the source of truth for what's in scope and how to build it; this document is the source of truth for what happened.

---

## Where the project stands

**Complete:** Phases 0–15 (foundation + browse + detail + free calc + analytics + map + account + Pro features + backend + polish + consumer-first IA + calculator wizard + confidence as a system + compare/exploration + perf/SEO/content + real Supabase + billing scaffolding).

**Remaining per plan:**
- **Phase 16** — Retention loop: price alerts. Snapshots table + daily diff job + email (later Telegram) notifications + free-preview / Pro-unlimited gate. The one non-investor Pro benefit per CLAUDE.md's "Pro must include at least one feature that benefits non-investor browsers" rule.

**Manual steps remaining for actual launch (out of code-session scope):**
- Provision a Supabase project; apply `0001_init.sql` + `0002_fts.sql` + `seed.sql`
- Pick a billing provider (YooKassa / CloudPayments / ProductBoard); set env keys; replace 501 stubs in `/api/billing/checkout` + `/api/billing/webhook` with provider SDK calls
- (Optional pre-launch) Pick an ad provider; set `NEXT_PUBLIC_AD_PROVIDER`; wire script tag in `AdSlot`
- Run Lighthouse + axe audit on deployed URL (Phase 9 carry-over)
- Verify Telegram/WhatsApp/Twitter OG previews on deployed URL (Phase 14 carry-over)

**Outstanding cross-phase debt:**
- `prefillCalcFromUnit` in the Zustand store still reads `PROJECTS` directly (Phase 15 carry-over — non-React module can't use React Query; needs a fetch-based prefill refactor in Phase 16)
- Marker clustering on the map at >100 projects (Phase 5 + 13 carry-over) — `react-leaflet-cluster` candidate
- District selection persistence in URL (Phase 13) — currently local React state, lost on refresh
- Per-row confidence inside calculator breakdowns (Phase 12) — currently only per-card-header tier
- Chart-aggregate confidence on `/analytics` (Phase 12) — needs design pass
- Blog content stays "seed-grade" pending an editorial pass; could migrate to MDX when scale demands richer formatting (Phase 14)
- Forecast for multiple objects overlay (Phase 7) — chart shows active object only
- Portfolio mortgage tracking (Phase 7) — RentalProperty model omits loan fields
- i18n for hardcoded Russian strings in saved-calcs / settings / portfolio (Phase 6+7 debt)
- Pro tier non-investor benefits beyond price alerts (Phase 16 ships the first; future phases can add weekly-digest / Telegram-bot / new-projects-matching-saved-search alerts)
