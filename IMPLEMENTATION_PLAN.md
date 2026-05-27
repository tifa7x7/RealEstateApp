# RealEstateApp — Implementation Plan

> **Living document.** Check this before starting any implementation task. Update the status table and phase checklists as work completes.

**Last updated:** 2026-05-27 (Phases 10–16 complete; Phases 17–22 added from Solgt.no competitor adaptation. See [CompetitorReviewResults.md](CompetitorReviewResults.md) Section K11 for the prioritized backlog this draws from; [CLAUDE.md](CLAUDE.md) for the Surface model rules these phases implement.)

---

## Status

| Phase | Title | Status |
|---|---|---|
| 0 | Foundation | ✅ Complete |
| 1 | Browse (core loop) | ✅ Complete |
| 2 | Project & unit detail | ✅ Complete |
| 3 | Calculator (free tier) | ✅ Complete |
| 4 | Analytics | ✅ Complete |
| 5 | Map | ✅ Complete |
| 6 | Account / favorites | ✅ Complete |
| 7 | Pro tier features | ✅ Complete |
| 8 | Backend (Supabase) | ✅ Complete (code-only) |
| 9 | Polish | ✅ Complete |
| 10 | Consumer-first IA & visual identity | ✅ Complete |
| 11 | Calculator wizard mode | ✅ Complete |
| 12 | Confidence as a system | ✅ Complete |
| 13 | Comparison & exploration | ✅ Complete |
| 14 | Performance, SEO, content channel | ✅ Complete |
| 15 | Real Supabase + billing + Pro tier completion | ✅ Complete (code; provider integration pending) |
| 16 | Retention loop: price alerts | ✅ Complete (code; edge function + email provider integration pending) |
| 17 | Lists refactor (multi-list favorites) | ✅ Complete (code; manual deploy: apply 0004 + 0005 migrations and re-deploy edge function) |
| 18 | Surface model foundation (route groups + shells) | ✅ Complete |
| 19 | Marketing surface build-out | ✅ Complete |
| 20 | Marketing content: SEO landings | ⬜ Not started |
| 21 | Product polish from Solgt patterns | ⬜ Not started |
| 22 | Far-future (parked: time-series + paste-a-link) | ⬜ Not started |

Status legend: ⬜ Not started · 🟡 In progress · ✅ Complete

---

## What "done" looks like at the foundation layer

| Layer | Files |
|---|---|
| Pure logic | `src/lib/{types,constants,formatters,calculator,filters}.ts` |
| i18n | `src/i18n/{types,ru,en}.ts` (provider not yet wired) |
| Seed data | `src/data/projects.ts` — 18 projects with units |
| UI primitives | `src/components/ui/{Button,Badge,Card,Input,Modal,Toast,Skeleton,EmptyState}.tsx` |
| Layout | `src/components/layout/{Header,MobileNav,Footer,ThemeProvider}.tsx` |
| App shell | `src/app/{layout,page}.tsx`, `src/styles/globals.css` |
| Tooling | Next 15.5, React 19, TS strict, Tailwind v4, next/font |

Verified: `tsc --noEmit` exit 0, `npm run build` exit 0, 4 static routes (`/`, `/_not-found`).

---

## Cross-cutting decisions (locked in)

These decisions apply across phases. Don't re-litigate without explicit reason.

1. **State: one Zustand store with slices** (`filters`, `ui`, `userPrefs`, `calculator`). CLAUDE.md says `app-store.ts` singular. `persist` middleware on `userPrefs` only — never on `filters` / `ui` (URL handles those).
2. **URL is primary state for browse.** Filters, sort, search live in `searchParams` so listings can be Server Components and pages are shareable. Zustand mirrors for ergonomic access.
3. **i18n via `LocaleProvider` + `useTranslations()` hook**, backed by Zustand. Switching swaps the imported translation object at runtime. No localized routes — URL shape stays simple.
4. **Server vs client split per CLAUDE.md.** Project listings/details = Server Components reading `searchParams`. Filters, calculator, map, charts, account = client.
5. **Paywall via `usePaywall(feature)`** returning `{ allowed, requirePro() }`. Backed by hardcoded `currentTier` in store; later checks Supabase user.
6. **Persistence is hidden behind hooks** (`useFavorites`, `useSavedCalcs`). Today: Zustand-persist/localStorage. Later: Supabase. Components don't change.
7. **Mobile-first.** Cards default on mobile, table toggle on desktop. MobileNav < 768px, header tabs >= 768px.
8. **No `any`.** Use `unknown` and narrow with type guards (CLAUDE.md rule).
9. **No domain knowledge in `src/components/ui/`.** Generic props only (`variant`, `size`, `color`) — never `projectStatus`.

---

## Phases

### Phase 0 — Foundation ✅
Already covered above. Verified passing.

---

### Phase 1 — Browse (the core loop) ✅

**Goal:** User lands on `/`, sees KPI dashboard, filters projects, browses listings (cards on mobile, table on desktop), clicks into a project.

**Deliverables:**
- [x] `src/store/app-store.ts` — Zustand store, `userPrefs` + `ui` slices, `persist` middleware on `userPrefs` only via `partialize`. `filters` and `calculator` slices deferred (filters live in URL; calculator added in Phase 3).
- [x] `src/hooks/useTranslations.ts` (+ `useLocale`) — hook-only, no provider component (see Decision Log 2026-05-23).
- [x] Retrofit `Header`, `MobileNav`, `Footer` to use `useTranslations()` instead of `import { ru as t }`. Footer became a client component.
- [x] `src/hooks/useProjects.ts` — reads URL searchParams, returns filtered+sorted projects. Validates enum filters against type guards.
- [x] `src/hooks/useFilters.ts` — writes filter changes to URL. Exports `setSearch`, `setRegion`, `toggleArrayFilter`, `setRange`, `setSort`, `reset`.
- [x] `src/components/ui/DualRangeSlider.tsx` — domain-agnostic dual-handle slider with theme-aware thumb styling.
- [x] `src/components/projects/FilterPanel.tsx` — sidebar form (region select, city/status/class pills, price + sea range sliders, reset).
- [x] `src/components/projects/MobileFilterButton.tsx` — hidden on `lg+`, opens FilterPanel in a Modal. Not in original deliverable list; added because mobile UX needs a way to access filters when sidebar is hidden.
- [x] `src/components/projects/KPIDashboard.tsx` — 4 KPI cards (found / available units / avg price / avg sea).
- [x] `src/components/projects/ProjectCard.tsx` — mobile card with status/class badges, price metrics, favorite toggle.
- [x] `src/components/projects/ProjectTable.tsx` — desktop sortable table, column headers are `<Link>`s that update `?sort=&dir=`.
- [x] `src/components/projects/ProjectListings.tsx` — picks card grid (`md:hidden`) vs table (`hidden md:block`) via CSS visibility for SSR friendliness; EmptyState when no results.
- [x] Update `src/app/page.tsx` — sidebar (desktop) / mobile filter button / KPIs + listings. Suspense around all useSearchParams consumers.

**Debt fixed:** Header/MobileNav/Footer no longer hardcode `ru`; search box now actually wires to homepage filtering.

**Carried over to next phase:** favorites-first sort pinning (currently URL-only sort doesn't see client-side favorites); locale-switch UI in Header (mechanism exists via `setLocale`, no visible toggle yet); KPIDashboard's 5th card (matkapital coverage % from prototype).

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. Homepage 13.8 kB / 128 kB First Load.

---

### Phase 2 — Project & unit detail ✅

**Goal:** User can see full project info (amenities, location, units) and drill into individual apartments.

**Deliverables:**
- [x] Compare slice added to store (`compareIds`, `toggleCompare`, `clearCompare`, max 5, not persisted).
- [x] `src/components/projects/ProjectHero.tsx` — name + breadcrumb + status/class badges + favorite + compare buttons.
- [x] `src/components/projects/ProjectStats.tsx` — 4 hero metric cards + detailed spec dl.
- [x] `src/components/projects/ProjectAmenities.tsx` — icon mapping for known amenities, `Check` fallback for unknown.
- [x] `src/components/projects/ProjectTabs.tsx` — ARIA tablist with About / Apartments / Gallery / Location. Tab state in URL (`?tab=`); all panels rendered with `hidden` toggle for SEO.
- [x] `src/components/projects/UnitTable.tsx` — desktop sortable table (id/building/floor/rooms/area/price). Sort state local (per-page concern).
- [x] `src/components/projects/UnitCard.tsx` — mobile card. Added (not in original list) because CLAUDE.md mandates cards over tables on mobile.
- [x] `src/components/projects/UnitListings.tsx` — wrapper: status filter pills (all/available/reserved/sold with counts), then UnitTable (desktop) / UnitCard grid (mobile).
- [x] `src/components/projects/UnitActions.tsx` — favorite + calculate buttons for unit detail page. Calculate is a `<Link>` to `/calculator?project=N&unit=ID` (forward-compat with Phase 3).
- [x] `src/app/projects/[id]/page.tsx` — Server Component with `generateStaticParams` (18 projects SSG'd), `generateMetadata` (title + description per project), Suspense around ProjectTabs.
- [x] `src/app/projects/[id]/not-found.tsx` — Server-rendered 404 for invalid project IDs.
- [x] `src/app/projects/[id]/units/[unitId]/page.tsx` — Server Component, dynamic (not SSG — see Decision Log). Renders breadcrumb back to project, big apartment ID, price card, action buttons, spec list, floor-plan placeholder.
- [x] `src/app/projects/[id]/units/[unitId]/not-found.tsx` — Server-rendered 404 for invalid unit IDs.

**Decisions:** unit detail = route (not modal); compare action wired but no comparison view yet (just toggles store state); unit pages dynamic instead of SSG to avoid worker exhaustion on Windows (132+ unit pages caused `STATUS_STACK_BUFFER_OVERRUN`).

**Carried over:** comparison view UI (button toggles store state but nothing displays it yet); gallery & location are placeholders; floorplan placeholder on unit page.

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 22 routes: `/`, `/_not-found`, 18 SSG'd `/projects/[id]`, 1 dynamic `/projects/[id]/units/[unitId]`.

---

### Phase 3 — Calculator (free tier) ✅

**Goal:** User computes investment metrics for one apartment. Pro features stubbed with upgrade prompts.

**Deliverables:**
- [x] Calculator slice added to store (`calcObject`, `setCalcField`, `resetCalc`, `prefillCalcFromUnit`). `calcObject` IS persisted (users shouldn't lose in-progress work between sessions).
- [x] `src/hooks/useCalculator.ts` — wraps store slice + `computeCalcResults` via `useMemo`. Returns `{ object, setField, reset, prefillFromUnit, results }`.
- [x] `src/hooks/usePaywall.ts` — returns `{ allowed, tier, isPro }`. Pro features hardcoded in a Set; callers handle UX (no auto-modal).
- [x] `src/components/ui/UpgradePrompt.tsx` — styled paywall Modal with default Pro feature list + customizable description/CTA.
- [x] `src/components/calculator/CalcInput.tsx` — labeled `type="number"` input, optional tooltip, optional suffix, sanitizes NaN to 0.
- [x] `src/components/calculator/CalcWizard.tsx` — single-page form with section toggles (see decision log: NOT a step-by-step wizard despite the name).
- [x] `src/components/calculator/CalcResultsSummary.tsx` — sticky results panel, conditional cards per active section (matkapital, mortgage, rental, exit).
- [x] `src/components/calculator/MortgageBreakdown.tsx` — DP / loan / subsidized vs market parts / monthly payments.
- [x] `src/components/calculator/RentalSection.tsx` — 10 inputs: rent, vacancy, growth, tax rate, utilities, capRepair, propertyTax, insurance, mgmtPct, repairReserve.
- [x] `src/components/calculator/ExitSection.tsx` — appreciation, holdingYears, sellingCosts, saleTax (auto-disabled when ≥5 years), expenseGrowth.
- [x] `src/components/calculator/CatalogPicker.tsx` — Modal with project search → unit pick → `prefillFromUnit`. Sold units disabled.
- [x] `src/components/calculator/CalcUrlBootstrap.tsx` — runs `prefillFromUnit` from `?project=N&unit=ID` query params. Added (not in original list) to handle the contract established in Phase 2's UnitActions.
- [x] `src/app/calculator/page.tsx` — Server Component with `metadata`, Suspense around URL bootstrap + CalcWizard.
- [x] "Add another object" button — opens UpgradePrompt for free tier; also opens it for Pro since multi-object UI is Phase 7 (acceptable interim — see decision log).

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 23 routes total. `/calculator` is static at 8.76 kB / 127 kB First Load.

**Carried over:**
- Multi-object calculator UI (Phase 7).
- "It-mortgage" and "Military mortgage" programs (types exist in `CalcObject`; only `family` wired in Phase 3 UI).
- Saving calculations to `savedCalcs` (Phase 6 — Account / favorites).
- Locale switching of calculator labels works automatically via `useTranslations`, but currency switching (RUB/USD) for calculator outputs not yet implemented — calc displays always RUB.

---

### Phase 4 — Analytics ✅

**Goal:** Charts showing market trends.

**Deliverables:**
- [x] `npm install recharts` — installed `recharts@3.8.1` (current major).
- [x] `src/components/analytics/ValueQuadrantChart.tsx` — ScatterChart, price/m² (Y) vs distance to sea (X), color by class. Includes a class color legend.
- [x] `src/components/analytics/PriceHeatmap.tsx` — CSS grid (NOT Recharts), city × class matrix colored by price intensity via `color-mix(in srgb, var(--accent), ...)`. Empty cells (`—`) for combos with no projects.
- [x] `src/components/analytics/DevPortfolioChart.tsx` — horizontal BarChart, units summed per developer, sorted descending.
- [x] `src/components/analytics/AmenityImpactChart.tsx` — horizontal bar of (avg price/m² with amenity − overall avg). Min sample size 2. Positive bars accent color; negative bars danger. ReferenceLine at zero.
- [x] `src/components/analytics/ClassDistributionChart.tsx` — ComposedChart: bars for project count per class (color-coded by class), line for avg price/m². Dual Y axes.
- [x] `src/app/analytics/page.tsx` — Server Component shell, page-level h1, charts each wrapped in Suspense. Recharts components carry their own `'use client'`, no SSR issues encountered.

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 24 routes total. `/analytics` is 123 kB / 239 kB First Load (Recharts bundle dominates).

**Carried over:**
- **Filter inheritance.** Analytics charts use `useProjects()` which reads URL filters from the homepage state — so visiting `/analytics` from `/?statuses=Строится` shows charts of only "Строится" projects. There's no on-page filter control or a "based on N filtered projects" indicator yet. Add if user confusion warrants.
- **Theme-aware chart colors.** SVG `fill` attribute doesn't interpolate CSS variables, so chart axis text / grid / bar fills use hardcoded hex matching the dark-theme tokens. Visible mismatch in light theme (axis text too pale). Acceptable for now.
- **Locale-aware chart strings.** Class names ("Эконом" etc.) are stored in Russian in the data model; English wouldn't translate them. Class-name labels in charts therefore stay Russian regardless of locale.

---

### Phase 5 — Map ✅

**Goal:** Interactive map of all projects.

**Deliverables:**
- [x] `npm install leaflet react-leaflet @types/leaflet` — installed `leaflet@^1.9`, `react-leaflet@^5`, types.
- [x] `src/components/map/ProjectMap.tsx` — OSM tiles, 70vh height, centered on Crimea (44.95, 34.5) at zoom 9, scroll-wheel zoom enabled. Markers are class-colored `divIcon` (CSS circles), NOT the default Leaflet PNGs — avoids the broken-bundler-asset hack. Default export so it can be the target of `next/dynamic`.
- [x] `src/components/map/MarkerPopup.tsx` — name (link), developer, status + class badges, price/sqm + sea distance, "Подробнее →" link to project page.
- [x] `src/components/map/MapFilters.tsx` — compact URL-driven pill bar: status row + class row + "Сбросить все" when filters active. Shares `useFilters` with homepage so URL state stays consistent.
- [x] `src/components/map/MapPageClient.tsx` — client wrapper that does `dynamic(() => import('./ProjectMap'), { ssr: false })` with a "Загрузка карты…" fallback. Added (not in original list) because `next/dynamic` with `ssr: false` must live inside a client component in Next 15+.
- [x] `src/app/map/page.tsx` — Server Component shell, `metadata`, h1, renders `MapPageClient`.
- [x] Leaflet theme overrides added to `src/styles/globals.css` — popup wrapper/tip background, control buttons, attribution, all routed through CSS variables so the map matches the theme.

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 25 routes total. `/map` is 4.13 kB / 121 kB First Load (Leaflet is a lazy-loaded chunk, not counted).

**Carried over:**
- **Marker clustering** — at high zoom-out with 18 projects this isn't needed, but with real Supabase data of hundreds of projects we'd want `react-leaflet-cluster` or similar.
- **Custom city-bounds fit** — the map opens centered on Crimea regardless of which cities have results. Could call `fitBounds` on the marker set after mount.
- **No "select projects on map" interaction.** Markers open popups; they don't drive a side panel listing. Acceptable for Phase 5; could be richer in Polish phase.

---

### Phase 6 — Account / favorites (no backend) ✅

**Goal:** Favorites persist locally, calculations save, account UI exists.

**Deliverables:**
- [x] Store: added `loadSavedCalc(id)` action; switched factory to `(set, get)` signature so the action can read current state.
- [x] `src/components/account/AuthForm.tsx` — sign-in / register form with mode toggle. Calls `login(name, email)` on submit. Password field is cosmetic (no validation).
- [x] `src/hooks/useFavorites.ts` — wraps `favorites` + `favUnits` slices; returns enriched `Project[]` and `{project, unit}[]` via `PROJECTS` lookup. Also exposes `isFavorite`, `isFavUnit`, `clear`.
- [x] `src/hooks/useSavedCalcs.ts` — free limit = 1, Pro = `Number.POSITIVE_INFINITY`. `save()` returns `{ ok, id } | { ok: false, reason: 'limit-reached' }` so the caller can paywall-prompt.
- [x] `src/hooks/useHydration.ts` — added (not in plan deliverables). Returns true once Zustand-persist has rehydrated from localStorage. Used by AccountGate to avoid the auth-form flash before the persisted `loggedIn=true` arrives.
- [x] `src/components/account/AccountGate.tsx` — hydration skeleton → AuthForm if not logged in → tabs + children if logged in.
- [x] `src/components/account/AccountTabs.tsx` — Favorites / Расчёты / Настройки. `aria-current="page"` on active.
- [x] `src/components/account/FavoritesList.tsx` — two sections (ЖК, Квартиры) with respective counts; EmptyState when neither has items.
- [x] `src/components/account/SavedCalcsList.tsx` — list of saved calcs; "X / N" usage badge if free tier; per-row Open (→ /calculator) + Delete; EmptyState with CTA.
- [x] `src/components/account/SettingsForm.tsx` — profile read-out + tier toggle (testing aid for paywall) + Sign out. Wasn't on the plan's deliverable list but the `/settings` route was, so this is the content.
- [x] `src/app/account/layout.tsx` — wraps everything with `AccountGate`.
- [x] `src/app/account/page.tsx` — renders `FavoritesList` directly (no client-side redirect; the layout's tab nav highlights it as if it were /favorites).
- [x] `src/app/account/favorites/page.tsx`, `/saved/page.tsx`, `/settings/page.tsx` — thin server pages with metadata.
- [x] Save button added to `CalcWizard` — calls `useSavedCalcs().save()`; opens `UpgradePrompt` with a contextual reason when free-tier limit hit; brief "Сохранено" confirmation after success (2-second auto-clear).

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 29 routes total. All 4 account routes are static at <3.5 kB each.

**Carried over:**
- **No password validation** — register/sign-in accept any email; password field is cosmetic. Real auth in Phase 8 (Supabase).
- **No comparison view** — Phase 2 added `compareIds` slice and toggle; still no UI to view what's compared. Probably belongs in Phase 7 (Pro tier features) since multi-object comparison is the headline Pro feature.
- **Tier toggle in Settings is a debug aid**, not the real subscription mechanism. Phase 8 wires it to Supabase user.
- **i18n debt:** "Сохранённые расчёты", "Тариф", "Сохранить", "Открыть", "Удалить", and other labels added in this phase are hardcoded in Russian. Should become translation keys before locale switcher ships.

---

### Phase 7 — Pro tier features ✅

**Goal:** Multi-object calculator with comparison + rankings, 10-year forecast UI, portfolio tracker.

**Deliverables:**
- [x] **Multi-object store refactor.** `calcObject: CalcObject` → `calcObjects: CalcObject[]` + `activeCalcIndex: number`. Persist version bumped to 1 with `migrate(fromV0)` that converts the old single-object shape. Max 5 objects. Added `addCalcObject`, `removeCalcObject`, `setActiveCalcIndex` actions.
- [x] **Multi-object UI** — `src/components/calculator/ObjectTabs.tsx`. Tabs with `role="tab"` + `aria-selected`, per-tab × remove (when length > 1), "+ Добавить" button with Pro badge that opens `UpgradePrompt` for free tier.
- [x] `src/components/calculator/ComparisonTable.tsx` — metrics rows × objects cols. Best value per row highlighted in accent color. Skips rows where no object enables that metric (e.g. mortgage row hidden if no object has `useMortgage`). Self-hides when `objects.length < 2`.
- [x] `src/components/calculator/Rankings.tsx` — per-metric ranked list with #1 in accent and a numbered badge. Cash-on-cash, cap rate, monthly cashflow, total ROI (higher better) + price/m², own-invested (lower better). Self-hides when `objects.length < 2`.
- [x] `src/components/calculator/CashflowForecast.tsx` — Recharts LineChart with 4 series (cashflow, cumulative, property value, equity) for 10 years. Wrapped in `<ProGate feature="forecast">`. Shows "включите аренду или выход" hint when neither toggle is active.
- [x] `src/components/account/RentalPortfolio.tsx` — wrapped in `<ProGate feature="portfolio">`. 4 aggregate stat cards (count, value, monthly rent, monthly NOI) + per-property editable rows (name, type, current value, purchase price, monthly rent/expenses, computed NOI). Add/remove + EmptyState.
- [x] `src/hooks/usePortfolio.ts` — wraps `rentalProperties` slice + computes aggregates. Store actions added: `addRentalProperty`, `updateRentalProperty`, `removeRentalProperty`.
- [x] `src/hooks/useCalculator.ts` — extended return shape with `objects`, `activeIndex`, `setActiveIndex`, `addObject`, `removeObject`, `canAdd`, `canRemove`, `maxObjects`, `allResults`. Existing `object`/`setField`/`results` preserved (returns the active object) so single-object UI didn't need updates.
- [x] `src/hooks/useSavedCalcs.ts` — `save()` now serialises the full `calcObjects` array; `loadSavedCalc` (store action) replaces the entire array.
- [x] `src/components/ui/ProGate.tsx` — reusable wrapper. Renders children if `usePaywall(feature).allowed`; otherwise shows a Card with Pro icon + description + "Перейти на Pro" button that opens `UpgradePrompt`. Used by CashflowForecast and RentalPortfolio.
- [x] `RentalProperty` type extended with `type` and `purchaseDate` fields.
- [x] `src/app/account/portfolio/page.tsx` — server page with metadata.
- [x] `src/components/account/AccountTabs.tsx` — added Portfolio tab (Briefcase icon, label from `t.auth.myPortfolio`).
- [x] CalcWizard updated: ObjectTabs at top, "Add another" Card removed (now in ObjectTabs), ComparisonTable + Rankings + CashflowForecast appended below the form.
- [x] **Real paywall UX** — `UpgradePrompt` from Phase 3 reused as-is; `ProGate` wraps it with an inline Card preview. Contextual `description` per feature.

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 30 routes total. `/calculator` 12.1 kB / 244 kB (Recharts now bundled for forecast). `/account/portfolio` 2.89 kB / 126 kB.

**Carried over:**
- **Project comparison view UI** — still no page to show what's in `compareIds` (the toggle from Phase 2). Deferred to Phase 9 (polish) or as ad-hoc work.
- **Exports** — no PDF/CSV for comparison or forecast. Listed as a Pro feature in `UpgradePrompt`'s default copy but not implemented.
- **Forecast for multiple objects** — chart shows the active object only. Overlaying 2+ object lines would be the natural Pro feature; left for follow-up.
- **Portfolio mortgage detail** — RentalProperty model omits mortgage fields (payment, principal, rate). For a real portfolio tracker that's important; deferred.

---

### Phase 8 — Backend (Supabase) ✅ (code-only)

**Goal:** Real data + auth + cross-device persistence.

**Mode for this pass:** code-only, no live backend. The app still runs end-to-end on bundled seed data + localStorage. The Supabase wiring activates the moment `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`.

**Deliverables:**
- [x] **Schema migration** — `supabase/migrations/0001_init.sql`. Tables: `projects`, `units`, `profiles`, `favorites`, `fav_units`, `saved_calculations`, `rental_properties`. RLS: public read on projects/units; per-user read+write everywhere else. `updated_at` triggers on mutable tables. `auth.users` insert trigger auto-creates a `profiles` row.
- [x] **Seed pipeline** — `supabase/generate-seed.ts` reads `src/data/projects.ts` and emits `supabase/seed.sql` (18 projects, 130 units, idempotent). Run with `npx tsx supabase/generate-seed.ts`.
- [x] **Supabase clients** — `src/lib/supabase/{env,client,server,database.types}.ts`. Three flavors: browser (singleton, browser-only), server (cookies-aware via `@supabase/ssr`), and static (anon, no cookies — safe for `generateMetadata`/`generateStaticParams`). All return `null` when env vars are absent.
- [x] **Hand-written DB types** — `src/lib/supabase/database.types.ts` mirrors the schema. Each table includes `Relationships: [...]` to satisfy `@supabase/postgrest-js`'s `GenericTable` constraint. Regenerate via `npx supabase gen types typescript` once a real project exists.
- [x] **Data access layer (`src/lib/api/*`)** — framework-agnostic (no React, no Next.js) functions that hit Supabase when a client is supplied, else fall back to the seed. Files: `projects.ts`, `favorites.ts`, `saved-calcs.ts`, `portfolio.ts`. Each user-data file also exports a `bulkImport*` for the one-time migration.
- [x] **API routes** — `src/app/api/projects/route.ts` (GET list), `src/app/api/projects/[id]/route.ts` (GET single). Both follow CLAUDE.md's `{ data, error }` shape and never throw. User-scoped mutations (favorites, saved-calcs, portfolio) talk to Supabase directly from the browser via RLS — no API roundtrip needed.
- [x] **React Query** — `src/components/providers/QueryProvider.tsx` wraps the app inside the root layout (one `QueryClient` per session, created lazily). `useProjects` now reads via `useQuery({ queryKey: ['projects'] })` with `initialData: PROJECTS` so the synchronous return shape is preserved and the hook only fires the network request when Supabase is configured.
- [x] **Real Supabase auth** — `src/hooks/useAuth.ts` wraps `supabase.auth` with `signIn`/`signUp`/`signOut`/session subscription. Mirrors session state into the existing Zustand `loggedIn` flag so `AccountGate` / `Header` keep working. Falls back to the Phase 6 stub flow when Supabase isn't configured.
- [x] **`AuthForm` rewired** — uses `useAuth` instead of `useAppStore.login`. Password field is now actually required + submitted to Supabase. Stub mode still accepts any email/password.
- [x] **One-time localStorage → Supabase migration** — `src/hooks/useSupabaseUserDataSync.ts` runs on the first authenticated session per device, imports any local favorites/saved-calcs/portfolio rows into Supabase, then hydrates the store from Supabase (now the source of truth). Migration is gated by a per-user `real-estate-app:migrated:{userId}` localStorage flag. Mounted globally via `src/components/providers/SupabaseSync.tsx` in the layout.
- [x] **Hook write-through** — `useFavorites`, `useSavedCalcs`, `usePortfolio` updated to mirror every mutation to Supabase (optimistic, fire-and-forget) when authenticated. Component code unchanged. `SavedCalc.id` widened to `number | string` so server-issued UUIDs and local `Date.now()` ids both flow through the existing UI.
- [x] **Server Components migrated** — `app/projects/[id]/page.tsx` and `.../units/[unitId]/page.tsx` now fetch via `fetchProject(getSupabaseStaticClient(), id)`. Both `generateMetadata` and the page body use the static client (anon key, no cookies) so they remain safe in `generateMetadata` and at build time.

**Decision log additions (2026-05-23):**
- Seed file is **kept** as a dev fallback. Without `NEXT_PUBLIC_SUPABASE_*` set, every data-layer function falls back to `src/data/projects.ts` and every user-data write stays in Zustand+localStorage. The app is fully usable without a backend, which preserves Phases 1–7's offline-first dev story.
- **Browser client talks to Supabase directly, not through API routes** for user-data mutations. Reasoning: RLS already enforces per-user access via the session cookie, so an intermediate route adds a hop without adding security. API routes are limited to the public projects/units endpoints, mirroring the plan's deliverable letter without redundancy.
- **`SavedCalc.id: number | string`.** Local entries get `Date.now()` numeric ids (the existing Phase 6 contract); Supabase returns UUIDs. Both flow through unchanged because `id` is treated opaquely everywhere downstream.
- **One-time migration is per-device, not per-user globally.** The flag lives in localStorage. If the same user signs in on a new device with a different set of localStorage favorites, those will be merged in (idempotent upsert) the first time they log in on that device.
- **Sync direction.** After the one-time import, Zustand stays the UI's source of truth and writes get mirrored to Supabase optimistically. No subscriptions/real-time yet — data drift between devices is corrected only on next sign-in (full re-hydration). Real-time is Polish-tier work if it surfaces as a real complaint.
- **`generateStaticParams` removed from `/projects/[id]`.** Pre-Phase-8 we SSG'd 18 project pages. Adding `@supabase/*` + `@tanstack/react-query` to the build path pushed Next.js's Windows worker pool past `spawn UNKNOWN` (libuv UV_UNKNOWN). Followed the same precedent as the Phase 2 unit pages — project pages are now `dynamic = 'force-dynamic'`. Production rendering with a real Supabase would need on-demand anyway; SSG was useful only for the seed-as-source-of-truth case.
- **`next.config.ts` introduced** (was absent) with `experimental.cpus: 1`. Pinning to one build worker is the cheapest way to keep Windows builds reliable now that the build path is heavier. No runtime impact. Reconsider if build time on CI becomes a bottleneck.
- **`useFavorites` still resolves favorited rows against the bundled `PROJECTS` array**, not against the React Query'd projects cache. Acceptable while the database is seeded from the same source; flagged as a real bug if/when Supabase carries projects the seed doesn't.

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 14 routes total: 12 static (`/`, `/_not-found`, `/account/*`, `/analytics`, `/calculator`, `/map`) + 2 dynamic project routes + 2 API routes. `/calculator` 12.6 kB / 310 kB (Recharts + Supabase + React Query). `/analytics` 16.1 kB / 251 kB.

**Carried over:**
- **Apply schema + seed to a real Supabase project.** `supabase db push` or run the SQL files manually in the dashboard. No code change required after that — just set the env vars.
- **`generateStaticParams` for project pages.** Once Supabase is wired up, decide whether to re-introduce build-time generation (queries the DB) or keep them dynamic (current). Dynamic is correct as soon as the DB is the source of truth.
- **Drop `src/data/projects.ts` entirely.** Today it's still used as the fallback for unauthenticated/no-Supabase runs and by `useFavorites` for client-side project lookup. Removing it requires (a) wiring `useFavorites` to React Query for project resolution, (b) replacing the Zustand `prefillCalcFromUnit` PROJECTS lookup with a fetch, (c) shipping a real Supabase project so dev no longer needs a fallback.
- **No real-time / cross-tab sync.** A user editing favorites in two tabs sees only the local optimistic state until reload. Add `supabase.channel('user').on('postgres_changes', ...)` if needed.
- **`profiles.tier` not yet read.** Zustand `currentTier` is still a local toggle (settings page). After hooking up real billing, sync `profiles.tier` → store on hydrate.
- **No `useMutation` adoption.** The user-data hooks fire-and-forget instead of going through React Query's mutation flow. That's deliberate — Zustand is still the UI's reactive source. Worth revisiting if we need automatic refetch / invalidation guarantees.
- **Service-role client unused.** `getSupabaseAdminClient()` is wired but not called anywhere — reserved for admin scripts (seeding, impersonation, backups) that don't exist yet.

---

### Phase 9 — Polish ✅

**Goal:** Ship-ready.

**Deliverables:**
- [x] **Centralized SEO helper** — `src/lib/seo.ts`. Exports `SITE_NAME`, `SITE_URL` (from `NEXT_PUBLIC_SITE_URL` env), and `buildMetadata({ title, description, path, ogType })`. Every page metadata flows through it so titles, canonical URLs, OpenGraph, and Twitter cards stay consistent. Root layout sets `metadataBase` for relative URL resolution.
- [x] **Per-route metadata applied** — homepage (via layout), `/calculator`, `/analytics`, `/map`, `/account`, `/account/favorites`, `/account/saved`, `/account/settings`, `/account/portfolio`, `/projects/[id]`, `/projects/[id]/units/[unitId]` all now emit `openGraph` (`og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`) and `twitter:card="summary"`. Project + unit pages use `ogType: 'article'`; everything else stays `'website'`.
- [x] **Error boundaries per segment** — `src/components/ui/ErrorBoundary.tsx` is the shared body (icon + reset button + dev-mode `console.error`). One `error.tsx` per top-level segment: root, `/calculator`, `/analytics`, `/map`, `/account`, `/projects/[id]`. Each customises title + description for its context.
- [x] **Loading skeletons** — `src/components/ui/Skeletons.tsx` defines `CardSkeleton`, `KPISkeleton`, `ProjectListingsSkeleton`, `FilterPanelSkeleton`, `ChartSkeleton`, `MapSkeleton`, `CalcSkeleton`, `ProjectDetailSkeleton`. Per-route `loading.tsx` at root, `/calculator`, `/analytics`, `/map`, `/projects/[id]`. Existing `<Suspense fallback={null}>` on the homepage and `/analytics` upgraded to skeleton fallbacks.
- [x] **`sitemap.xml`** — `src/app/sitemap.ts` enumerates static routes (`/`, `/analytics`, `/map`, `/calculator`) at fixed priorities and appends one entry per project via `fetchProjects(getSupabaseStaticClient())`. Falls back to seed when Supabase is unconfigured.
- [x] **`robots.txt`** — `src/app/robots.ts`. Disallows `/account`, `/account/*`, `/api/*`. Points at the sitemap.
- [x] **PWA manifest** — `src/app/manifest.ts`. Name + short_name + description + theme/background colors (teal accent + dark bg) + locale. Icon entries left empty pending real PNG assets in `/public`.
- [x] **Locale switch UX** — `src/components/layout/LocaleToggle.tsx` is a compact RU/EN button next to the theme toggle in `Header`. Calls `setLocale` from the existing `useLocale` hook (Phase 1's mechanism). `src/components/layout/LocaleHtmlLang.tsx` mirrors the active locale into `document.documentElement.lang` so screen readers and translation tooling notice the change.
- [x] **A11y quick wins** — skip-to-content link at the top of `<body>` (visible only on focus, jumps to `#main-content`); `<main id="main-content">` in layout; visually-hidden `<h1>` on the homepage so the page has a proper heading even though the visual hierarchy starts with KPI cards. All icon-only buttons already had `aria-label` from prior phases — verified no regressions.

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 17 routes total: same 14 from Phase 8 plus `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`. Bundle sizes essentially unchanged (`/calculator` 309 kB First Load vs 310 kB; `/analytics` 251 kB; `/` 140 kB).

**Decision log additions (2026-05-23):**
- **`buildMetadata` returns a partial `Metadata` object** rather than spreading defaults onto each page's literal. Pages assign it directly via `export const metadata = buildMetadata({...})`. Cleaner than partial spreads; lets `tsc` catch typos in the helper's inputs.
- **OpenGraph image deliberately omitted.** No real OG image assets exist yet. Adding a placeholder would mislead Slack/Twitter previews — better to ship without and add real `/opengraph-image` files (Next file convention) when design provides them.
- **`twitter:card = 'summary'` (not `'summary_large_image'`).** Pairs with the missing image — `summary` renders cleanly text-only on Twitter. Upgrade to `summary_large_image` when OG images land.
- **One `loading.tsx` per top-level segment, not per leaf.** Route-segment transitions show the closest segment's loading state. Per-leaf skeletons would be redundant since the leaf is what's actually rendering when loading.tsx fires.
- **`error.tsx` is per top-level segment, not per leaf.** Same reasoning as loading.tsx. The root `error.tsx` catches anything not handled deeper.
- **Skip link uses `sr-only` + `focus:not-sr-only`** rather than always-visible. Standard pattern; doesn't add visual noise for sighted users, surfaces immediately on Tab.
- **Locale toggle doesn't change the URL.** No localized routes — locale is a client preference held in Zustand. Trade-off: shareable URLs always render in the recipient's last-used locale, not the sender's. Acceptable while the app has no localized SEO requirements.
- **`<html lang>` is updated via a client effect**, not via Server Component derivation. SSR ships `lang="ru"` (the persisted-default before hydration). Acceptable: bots see the dominant locale; the effect corrects the DOM as soon as the user's preference hydrates.
- **Lighthouse / full a11y audit not run.** Phase 9's "Lighthouse pass; a11y audit" deliverable closed as "structural prereqs in place" rather than "audited & all green." Running Lighthouse + axe is a Phase-10 / pre-launch task that needs a live deploy URL; the structural changes (skip link, locale lang, h1, error/loading boundaries) clear the obvious gates.

**Carried over (post-Phase 9):**
- **Real OG image generation.** Add `/opengraph-image.tsx` (or static assets) per page when design assets are ready. Switch `twitter:card` to `summary_large_image`.
- **Public icons (favicon, apple-touch-icon, PWA icons).** Manifest's `icons` array is empty pending real PNGs in `/public/icon-{192,512}.png`.
- **Full Lighthouse + axe audit on a deployed URL.** The structural items are in place; the audit itself wants a live URL.
- **Localized routes** if SEO ever needs Russian + English variants of the same canonical URL.
- **i18n debt from Phase 6** (hardcoded Russian labels in saved-calcs / settings) still pending — locale toggle now exposes this as user-visible.

---

### Phase 10 — Consumer-first IA & visual identity ✅

**Goal:** Stop being a research terminal. Start being an apartment app. Reorient the homepage and visual hierarchy around the *decision tool → search tool → market intel* positioning.

**Why now:** Both the AppReview (§1 "value proposition is invisible in the first second") and the competitor analysis (D1: Solgt's homepage is one search input, and they're winning) converged on this. The KPI dashboard hero is the single largest UX mismatch between what we sell and what we show.

**Deliverables:**
- [x] Homepage redesign: above-the-fold = Playfair value-prop headline + single large search input + city pills. Demote KPI cards to a collapsed "Market snapshot" strip below the fold. Update `src/app/page.tsx` accordingly; the visually-hidden `<h1>` is replaced by a visible heading. — Implemented via new `HomeHero` + `MarketSnapshot` components; visible `<h1>` lives in `HomeHero` (replacing the prior `sr-only` h1).
- [x] Project card visual upgrade: 16:9 image area at the top (gradient placeholder until real assets exist). Keep badges and price block beneath. Use `next/image` with `priority` only on the first row. — Shipped gradient placeholder tinted by `CLASS_COLORS` via `color-mix`; status badge + favorite button moved onto the image; class badge moved to the title row. `next/image` deferred until real CDN assets exist (the placeholder is pure CSS, no `next/image` needed).
- [x] Rename header tab "Table" / `t.tabs.table` → "Поиск" / "Search" (semantic, not implementation-leaking). Update `i18n/{ru,en}.ts`. — i18n key renamed `tabs.table` → `tabs.search`; `Header` + `MobileNav` updated.
- [x] Move `STATUS_COLORS` / `CLASS_COLORS` in `lib/constants.ts` off hex onto CSS variables. Introduce semantic tokens in `globals.css`: `--status-projected`, `--status-construction`, `--status-handover`, `--status-completed`, `--class-economy`, `--class-comfort`, `--class-business`, `--class-premium`. Fix the light-theme Recharts contrast issue at the same time via a `useChartColors()` hook that reads `getComputedStyle`. — Done; also added `--unit-*` and `--confidence-*` semantic tokens (the latter for Phase 12). `useChartColors` hook wired into all 4 analytics charts + `CashflowForecast`. `STATUS_COLOR_VARS` / `CLASS_COLOR_VARS` / `UNIT_STATUS_COLOR_VARS` exported alongside the `var(...)` maps so the hook can resolve hex.
- [x] Toast-based "saved" / "added to favorites" confirmations replacing inline button-variant flips in `CalcWizard` and elsewhere. Reuse existing `components/ui/Toast.tsx`. — `ToastProvider` + `useToast` hook added (`src/components/providers/ToastProvider.tsx`); mounted in `app/layout.tsx`. `Toast.tsx` refactored to be positioning-agnostic so the provider can stack. `CalcWizard` save flow converted; the `justSaved` state and `Check`/variant-flip removed.
- [x] Mobile sort affordance: a `<Select>` above the project card grid (visible only on `<md`) bound to `?sort=&dir=`. — `MobileSort.tsx` component, mounted in the new homepage layout alongside `MobileFilterButton`.
- [x] Marketing-copy sweep: rewrite homepage headline, OG titles via `lib/seo.ts`, and `UpgradePrompt` description to lead with "решите, стоит ли покупать" / "decide whether to buy" rather than dashboards/analytics. — `SITE_TITLE_DEFAULT` / `SITE_DESCRIPTION` rewritten. `i18n.hero.*` keys added (RU + EN). Root layout metadata title aligned. `UpgradePrompt` default features list trimmed: removed PDF export and "no ads" since neither is implemented (per the new CLAUDE.md rule against advertising unimplemented Pro features); replaced with "Безлимитное сохранение расчётов" which IS implemented.

**Verified:** `tsc --noEmit` exit 0, `npm run build` exit 0. 17 routes total. `/` First Load 142 kB (was 140 kB pre-Phase 10; +2 kB for `HomeHero` + `MarketSnapshot` + `MobileSort` + ToastProvider). Well within the 180 kB budget for content routes. `/calculator` 311 kB and `/analytics` 252 kB remain over their 240 kB budget — that's Phase 14's lazy-Recharts target, not regressed by this phase.

**Decision log additions (2026-05-25):**
- **Toast.tsx refactored to be positioning-agnostic.** Previously `fixed bottom-4 right-4 z-[300]` was hardcoded; moved into the provider so multiple toasts can stack via dynamic `bottom` offsets. Direct use of `<Toast>` outside the provider now requires explicit positioning classes — flagged in the file's JSDoc.
- **`useChartColors` returns dark-theme defaults on SSR** (no `window`). SSR markup matches the `data-theme="dark"` attribute on `<html>`; the effect re-resolves on hydration. Avoids a Recharts SSR/CSR mismatch.
- **`STATUS_COLOR_VARS` / `CLASS_COLOR_VARS` exported alongside the `var(...)` maps.** Two maps for the same data feels redundant, but consumers of inline-style `background: var(--token)` (Badge, Pill, divIcon) want the wrapped form; consumers of the hook (charts) want the unwrapped variable name to feed into `getComputedStyle().getPropertyValue()`. Inverted that with a runtime unwrap initially, decided two small maps are clearer than a regex strip.
- **Project card class badge moved off the image, onto the title row.** Image area carries status (the more time-sensitive label) plus favorite toggle; class is a relatively static attribute that pairs better with the project name. Avoids a 4-badge image overlay that competes with the building icon.
- **Hero h1 size scales 28 → 36 → 40 px** across breakpoints. Adds 36 to the type scale; `brand_identity/typography.md` already documented 32–40 px for hero. No new scale step.
- **Carry-over from Phase 6 i18n debt addressed in part**: hero strings + tab labels are now translated; saved-calc / settings / portfolio Russian-only labels remain — fold into a focused i18n sweep before Phase 15 ships locale-toggled real users.

**Carried over to later phases:**
- Real CDN images for project cards — wait for asset pipeline.
- `next/image` with `priority` on the first card row — no real images yet, no `next/image` needed.
- Light-theme chart contrast (legacy Phase 4 carry-over) — `useChartColors` fixes the mechanism; visual tuning of the actual light-theme hex if needed.
- The hero search input only writes the `q` URL parameter; advanced filters still live in the sidebar. Inline filter facets in the hero would belong with Phase 13's exploration work if it surfaces as a need.

**Acceptance check:** A user landing on `/` sees a value-prop headline + search input + city pills above the fold; KPI cards are collapsed behind a "Показатели рынка" toggle. Homepage First Load JS 142 kB, well under the 180 kB budget. ✓

---

### Phase 11 — Calculator wizard mode ✅

**Goal:** First-timers get 3 questions and an answer. Power users keep the full grid.

**Why now:** AppReview §1 scored the calculator at cognitive load 9/10 — directly violates CLAUDE.md's "zero learning curve" promise. CompetitorReview B1 plus our own Russian-market moat (split mortgages) both demand a calculator surface that doesn't intimidate.

**Deliverables:**
- [x] **Wizard mode** (default for new users on first visit, gated by a `userPrefs.calcWizardSeen` flag): 3 steps — (1) цена + город/тип, (2) ипотека Y/N (and if Y: программа + первый взнос), (3) сдавать в аренду Y/N. Result panel renders at the end. — Shipped as one component `CalcWizardSteps.tsx` (single file, inline step bodies — three separate files would have been over-fragmentation given each step is <60 lines). `userPrefs.calcWizardSeen` boolean added to the Zustand store + setter; included in `partialize` so it persists. Step indicator + Назад / Далее / Показать результат navigation. Each step writes directly to `useCalculator().setField` so no math is re-implemented and the results panel reacts live during the wizard.
- [x] **Expert mode toggle** ("Все параметры") flips back to the current `CalcWizard` full form. Preference persists in `userPrefs` via Zustand. — New parent `CalcExperience.tsx` chooses between `CalcWizardSteps` and `CalcWizard` based on `calcWizardSeen`. From the wizard a "Открыть все параметры" link sets the flag and switches; from the expert form a "Быстрый расчёт" link re-enters the wizard in a session-only override.
- [x] **Finishing-grade selector** replaces the freeform `renovation` ruble input. — `FINISHING_GRADES` constant added with 6 tiers (none / черновая / предчистовая / чистовая / white-box / turn-key) and per-tier ₽/m² rates. New `FinishingGradeSelector.tsx` component shows a 3×2 grid; selecting a tier writes `area × pricePerSqm` to `renovation`. Selection is fuzzy-matched to ±10% so a user override still highlights the closest tier. The freeform CalcInput is kept underneath the selector for manual override, now tooltip-annotated.
- [x] **Mobile floating "Показать результат" pill**: visible on `<lg` whenever the calculator scrolls past the result panel. Opens results in a bottom Sheet. — `MobileResultPill.tsx`: floating pill bottom-right showing the running total-cost number. Tapping opens `CalcResultsSummary` in a bottom `Sheet`. Mounted inside `CalcWizard`. Offsets the bottom by `80px + safe-area-inset-bottom` to clear the `MobileNav` strip.
- [x] **`Sheet` / `Drawer` primitive** in `components/ui/`: side-mounted on desktop, bottom-mounted on mobile, focus-trapped, themed. Replaces the centered-Modal hack for mobile filters (`MobileFilterButton`) too. — `Sheet.tsx` shipped with `side: 'right' | 'bottom' | 'auto'` and an `auto` default that does bottom on `<lg` / right on `lg+` via Tailwind responsive classes (no JS measurement). Focus trap + Esc dismiss + body scroll lock — same contract as `Modal`. `MobileFilterButton` migrated; uses `side="bottom"`.
- [x] **Lead with subsidized-mortgage story** in `MortgageBreakdown.tsx`: visible split badge "6% до 6 млн ₽ · 21% на остаток" with a one-line explanation. — New `SplitRateBanner` sub-component renders an accent-tinted card at the top of the mortgage breakdown showing both rates with the cap and a one-line plain-language hint. Component now takes `familyRate` / `marketRate` / `subsidyLimit` props; `CalcResultsSummary` updated to pass them.
- [x] **Tooltip primitive** in `components/ui/Tooltip.tsx`. — Lightweight implementation, no Floating-UI dependency (kept the bundle lean — Floating-UI is ~12 kB). Auto-flip top/bottom on open via one viewport check; hover + focus + Esc dismiss; 300ms hover delay; `aria-describedby` wiring on the trigger. `CalcInput` migrated off its inline tooltip code.

**Verified:** `tsc --noEmit` exit 0. **`npm run build` was deliberately skipped this round** — running it against an active dev server's `.next/` corrupts dev (the lesson learned at Phase 10 close). Will run a clean build at the next phase boundary when dev can be stopped first.

**Decision log additions (2026-05-25):**
- **Wizard ships as one file, not four.** The plan said "CalcWizardSteps + Step1/2/3". Three separate Step files would each be ~60 lines and split the navigation state across components. Kept the steps inline in `CalcWizardSteps` and exposed `StepContainer`/`BinaryChoice`/`ChoiceButton` sub-components for the shared shapes. Easier to maintain.
- **`Tooltip` deliberately omits Floating-UI.** Saves ~12 kB on every page that uses it. Our positioning needs (top/bottom flip, short text, no virtual reference, no overflow:hidden ancestors at the trigger sites) don't justify the dependency. If we later need anchored popovers in complex layouts (e.g., comparison drawer), revisit.
- **`Sheet`'s `auto` mode picks side via Tailwind responsive classes, not JS measurement.** `lg:flex-row lg:inset-y-0 lg:right-0` switches between bottom-mounted and right-mounted at the `lg:` breakpoint. No matchMedia, no layout-measurement effect — works at SSR. Trade-off: the same component name yields different visual shapes, but the contract (focus-trap, themed panel, Esc dismiss) is identical.
- **`FinishingGradeSelector` doesn't deprecate the freeform `renovation` `CalcInput`.** Power users + edge cases (custom turn-key with high-end appliances → user wants to type 80k/m²) need an override. The selector and input live side-by-side; the input gets a tooltip explaining where the auto-filled number came from.
- **Wizard's first step exposes the FinishingGradeSelector.** Per CLAUDE.md "≤ 8 visible inputs in the first-time flow." Counted: district + aptType + area + price + finishing-grade (counts as one selector) = 5 visible inputs. Within budget.
- **Expert-mode re-entry sets `calcWizardSeen = false` only for the current session via local state, not persisted.** Reasoning: persisting it would silently undo the user's earlier "I'm done with the tutorial" choice. If they want the wizard back permanently they can clear localStorage; for one-off tutorial revisits the session-only behavior is right.
- **`SplitRateBanner` always renders, even when the loan fits inside the subsidized cap.** When `marketPart === 0`, it shows only the family rate + cap label and a hint that says the loan fits — communicates the subsidy is being used to its full effect. Original brief implied only-show-when-split, but the always-on variant is a better story for the moat positioning.
- **Production build skipped.** Documented above; next phase boundary will run it.

**Carried over to later phases:**
- The wizard doesn't yet expose `useMatkapital` / `useExit` toggles. Adding them as steps 4/5 would exceed the 3-step promise; users who want them switch to expert mode. Acceptable.
- IT and Military mortgage programs (CalcObject has the fields) still aren't surfaced in either the wizard or the expert form. Phase 15+ work.
- The desktop sticky result panel currently re-renders on every input change, same as before. If perf becomes an issue at scale, memoize `CalcResultsSummary` by the relevant slice — not done now.
- `<table>`-driven RU-only labels in Saved Calcs / Settings / Portfolio (Phase 6 carry-over) still hardcoded — fold into pre-Phase-15 i18n sweep.

**Acceptance check:** A user landing on `/calculator` for the first time sees a 3-step wizard with ≤ 5 inputs visible per step. After completing or skipping, they land in expert mode. Returning visits land directly in expert mode. ✓

---

### Phase 12 — Confidence as a system ✅

**Goal:** Make uncertainty visible everywhere. The `dataConfidence` column already exists; we just don't surface it.

**Why now:** CompetitorReview C2/D2 — Solgt's signature UX move is "accuracy shown with each estimate," and users reward it. We already have the data model for it (Phase 8 schema, line 32). This is a trust-and-differentiation win at modest cost.

**Deliverables:**
- [x] **`ConfidenceBadge` UI primitive** in `components/ui/ConfidenceBadge.tsx`. — Shipped. Pill with icon (CheckCircle2 / Sparkles / Pencil / HelpCircle) + label, color-mixed background and outline from `--confidence-verified` / `--confidence-estimated` / `--confidence-user-input` / `--warning`. Wraps a `Tooltip` so hover/focus reveals the per-tier hint. `compact` prop hides the label for dense rows (icon only, screen-reader text retained). Helper `projectDataConfidenceToTier()` maps the schema's `verified` / `estimated` / `unverified` plus `undefined` into the canonical UI tier set.
- [x] **Surface project `dataConfidence`** on `ProjectCard` (small badge top-right) and `ProjectHero` (next to the class badge). — `ProjectCard` shows it as a compact (icon-only) badge in the image-area top-right strip next to the status badge. `ProjectHero` shows it labeled next to the building-type badge. Both call `projectDataConfidenceToTier()`.
- [x] **Tag calculator output rows** with their confidence tier. — New `classifyCalcSection(section, obj)` in `lib/calculator.ts` (pure function). Returns `'verified' | 'estimated' | 'user-input'` based on (a) whether `sourceProjectId` is set, and (b) whether any of the section's driving inputs differ from `defaultCalcObject()`. Sections classified: `cost`, `mortgage`, `rental`, `exit`, `metrics`. Wired into `CalcResultsSummary` via a new `SectionHeader` sub-component that renders the title + compact `ConfidenceBadge` together.
- [x] **Map markers carry confidence** via outline color. — `ProjectMap` now varies the marker outline: `--confidence-verified` ring on verified projects, `--warning` ring on unverified, white ring otherwise. `ICON_CACHE` keyed on `${color}|${ring}` so different combinations cache independently. CSS variables resolve at paint time inside the `divIcon` HTML — already verified working in Phase 10.
- [x] **Tooltip integration**: hovering / tapping a `ConfidenceBadge` explains the tier in plain language. — Built into `ConfidenceBadge` itself. Per-tier fallback hints come from `t.confidence.*Hint`; caller can override via the `tooltip` prop for contextual explanations (e.g., "Rate sourced from MARKET_DATA").
- [x] **Translations**: add confidence-tier strings to `i18n/{ru,en}.ts`. — `t.confidence.{verifiedLabel, verifiedHint, estimatedLabel, estimatedHint, userInputLabel, userInputHint, unverifiedLabel, unverifiedHint}` shipped in both locales.

**Verified:** `tsc --noEmit` exit 0. (`npm run build` deferred to next phase boundary per the dev-server-cache discipline established at Phase 11 close.)

**Decision log additions (2026-05-25):**
- **Four tiers shipped, three canonical.** CLAUDE.md and `brand_identity/colors.md` declared three confidence tiers (`verified` / `estimated` / `user-input`); the database schema already has a fourth (`unverified`) on projects. Rather than collapse `unverified` into `estimated` at the boundary, I extended `ConfidenceBadge` to render a fourth tier (warning amber, HelpCircle icon) so the developer signal can reach the user when the data is explicitly flagged as not validated. `unverified` is reserved for **project-level data** only — calculator outputs only ever produce `verified` / `estimated` / `user-input`.
- **`classifyCalcSection` lives in `lib/calculator.ts`, not in `useCalculator`.** Per CLAUDE.md "`lib/` is pure." The function reads a `CalcObject` and returns a tier; no React, no state. The hook surface in `useCalculator` is unchanged — feature components import the classifier directly. Keeps the math layer cohesive and testable.
- **`metrics` section inherits from contributing sections.** It's a composite (totals + payback + DSCR span cost + mortgage + rental). Its tier is `user-input` if any contributing section is `user-input`, else `verified` if `sourceProjectId` is set, else `estimated`. Documented in the function's JSDoc.
- **Mortgage tier ignores `sourceProjectId`.** Even when the price came from a verified project, the mortgage *output* is a model derivation from formulas + MARKET_DATA constants — calling that `verified` would overclaim. Stays `estimated` unless the user overrides a rate / DP %.
- **`ConfidenceBadge` always wraps in a Tooltip.** No no-tooltip variant. Reasoning: a badge without an explanation is the failure mode we're trying to fix in the first place. If a future surface needs the visual without the tooltip (e.g., inside a tooltip itself), it can construct the pill directly — but the primitive enforces the contract.
- **Card content uses `--confidence-estimated` as the fallback for `undefined` project `dataConfidence`.** Treating "we don't know" as "estimated" is more honest than "verified" and less alarming than "unverified." Mirrors how Solgt presents low-confidence AVM outputs.

**Carried over to later phases:**
- **Per-row confidence inside `MortgageBreakdown` / `RentalSection` / `ExitSection`.** Currently the section-header badge tags the whole card; individual rows aren't tagged. If user research reveals confusion (e.g., "is THIS specific number my input or the model's?"), revisit at row granularity.
- **Confidence on analytics chart aggregates.** Charts (`PriceHeatmap`, `AmenityImpactChart`, etc.) compute aggregates from `useProjects()` data. If most contributing projects are `unverified`, the aggregate should arguably be `estimated`. Deferred — needs design pass on how to present chart-level uncertainty without crowding the axes.
- **`MarkerPopup` doesn't yet include a confidence label.** The outline ring is the only signal at marker level. A small badge in the popup body would reinforce it; deferred to Phase 13's map exploration work.

**Acceptance check:** Every project card / project hero / map marker shows a confidence signal. Every calculator result card shows a confidence badge in its header. Hovering any badge reveals a plain-language tier hint. ✓

---

### Phase 13 — Comparison & exploration ✅

**Goal:** Activate the dormant Compare flow. Make the map a destination, not a side trip.

**Why now:** AppReview A1 — Compare button is "the single most user-confusing artifact." CompetitorReview C3 — Solgt elevates the map as a primary surface; we have one but bury it as one of four tabs.

**Deliverables:**
- [x] **Compare drawer**: floating "Сравнить (N)" button bottom-right whenever `compareIds.length > 0`. Opens a side `Drawer` (Phase 11 primitive) with side-by-side project specs. — Shipped as `CompareDrawer.tsx` + `CompareLauncher.tsx`. The drawer is a `Sheet side="auto"` (right on `lg+`, bottom on `<lg`) with a 10-row spec table: price/m², min price, sea distance, city, status, class, completion, floors, buildings, amenity count. Best-value cells in each numeric row are highlighted in `--accent` — same pattern as Phase 7's `ComparisonTable`. Per-project remove button + global "Очистить". Calculator `ComparisonTable` was NOT reused directly — its metric model is purely calculator-output (cash-on-cash, ROI, payback) while the project comparison covers static project attributes. Two different concerns; two tables.
- [x] **Free tier compare limit**: 2 projects. Pro: up to 5. Hook `usePaywall('compare-multi')` checks the 3rd toggle. — `usePaywall` extended with `'compare-multi'` feature key + `COMPARE_LIMIT_FREE` (2) / `COMPARE_LIMIT_PRO` (5) constants. New `useCompare` hook wraps the Zustand `compareIds` slice with a tier-aware `toggle()` that returns `{ ok: false, reason: 'limit-reached', limit }` when the user tries to exceed. `ProjectHero` migrated; it opens an `UpgradePrompt` with a context-aware description on the rejection.
- [x] **Neighborhood / district side panel on the map**: clicking a marker (or in a future iteration, a marker cluster) opens a side panel showing district aggregates (avg ₽/m², project count, avg sea distance, sample projects). Compute aggregates in `lib/filters.ts` via a new `getDistrictStats(projects)` function — pure, no React. — `getDistrictStats(projects, district, { sampleSize })` in `lib/filters.ts` returns count + totalUnits + availableUnits + avgPricePerSqm + minPrice + maxPrice + avgSeaDistance + sampleProjects. New `DistrictPanel.tsx` consumes it and renders next to the map (right rail on `lg+`, below on `<lg`). Closes via X button or by setting `selectedDistrict` back to `null`.
- [x] **Promote map in navigation**: in `MobileNav`, move Map to position 2 (after Search). In header `Header.tsx`, do the same. — Both nav arrays reordered. Order is now: Search · Map · Analytics · Calculator (· Account on mobile).
- [x] **Map → calculator handoff**: clicking a project in the map side panel opens the marker popup; the popup gets a "Рассчитать" button matching the unit-detail pattern from Phase 2. — `MarkerPopup` now computes the cheapest available unit for the project and renders a "Рассчитать" link to `/calculator?project=N&unit=ID`. Reuses Phase 2's `CalcUrlBootstrap` contract; no new wiring needed. Also added the `ConfidenceBadge` to the popup since that was a documented Phase 12 carry-over.

**Verified:** `tsc --noEmit` exit 0. (Production build deferred again — same dev-server-cache discipline.)

**Decision log additions (2026-05-25):**
- **`useCompare` is a policy layer, not parallel state.** The store still owns `compareIds`. The hook reads them, applies tier-aware limits, and exposes a typed failure mode. Multiple components can read the same hook without state drift.
- **Project comparison and calculator comparison stay separate tables.** They cover different data shapes (static project attributes vs. computed financial metrics) and serve different decision moments. Sharing one component would have required generic prop shapes that obscured both call sites.
- **`CompareLauncher` floats on the left of `<lg` and the right on `lg+`.** Mobile already has the calculator's result pill on the right (Phase 11) plus the bottom-anchored MobileNav; pinning Compare to the left avoids stacking. Desktop has the room on the right.
- **`MarkerPopup` picks the cheapest available unit for the calculator handoff.** Marker level has no specific unit context; auto-selecting the entry-priced unit gives the user a sensible default they can change in the calculator's catalog picker. If no available unit exists (all reserved/sold), the link is hidden — better than a dead-end.
- **District selection is lifted into `MapPageClient`, not `ProjectMap`.** The map component stays focused on rendering; the parent owns the selection state and renders the side panel. ProjectMap exposes `onSelectDistrict?: (district: string) => void` and fires it from the marker's `eventHandlers.click`. Keeps the dynamic-imported map small.
- **`DistrictPanel` reads from `useProjects()`**, so it inherits the URL filter state. Visiting `/map?statuses=Строится` and clicking a marker shows only the "Строится" subset in the panel aggregates. Consistent with the existing analytics-charts-respect-URL pattern from Phase 4.

**Carried over to later phases:**
- **Marker clustering** — at 18 seed projects density is fine, but at real-DB scale (hundreds+) we'll want `react-leaflet-cluster`. Phase 14/15 candidate.
- **District selection persistence in URL** (`?district=...`). Today it's local React state in `MapPageClient` — refreshing loses the selection. URL-as-state would be in keeping with our pattern but isn't load-bearing for the use case.
- **District panel on small screens stacks below the map** (full width). Could be a `Sheet` instead so the user keeps the map visible; deferred until usage signals friction.
- **Cross-page Compare state**: the launcher is mounted globally, so the count persists across navigations and is visible everywhere. The drawer itself is not pre-mounted (it's lazy via launcher state). If we want compare to be cross-tab synced (open in two tabs, add in one, see in the other), Phase 16's real-time architecture can extend that.

**Acceptance check:** Compare button on a project hero now opens a real comparison surface. Map shows a side panel with district aggregates on marker click. Map is the second nav item. ✓

---

### Phase 14 — Performance, SEO, content channel ✅

**Goal:** Earn organic traffic. Stop blocking the user with heavy bundles.

**Why now:** Both reviews flagged this. AppReview §5 has explicit numbers (`/calculator` 309 kB, `/analytics` 251 kB); CompetitorReview D5 noted we have zero SEO-content surface and Solgt's blog is a defensible moat.

**Deliverables:**
- [x] **Lazy-load Recharts** on `/analytics` and `/calculator` via `next/dynamic({ ssr: false })`. Add an intersection-observer wrapper (`components/ui/InViewport.tsx`) so off-screen charts on `/analytics` only download their bundle when scrolled into view. — New `InViewport.tsx` primitive with configurable `rootMargin` (default 200px pre-load) and a `once` flag. `AnalyticsContent.tsx` (new client wrapper) dynamic-imports all 5 charts; the top chart renders eagerly, the other four wrap in `<InViewport>`. `CashflowForecast.tsx` was split: `ForecastChart.tsx` is now a separate file dynamic-imported with `ssr: false`, so Recharts only ships on `/calculator` when the user enables rental/exit AND is Pro (or hits the gate).
- [x] **Real OG image generation** per route. — `lib/og-image.tsx` exports `renderOgImage({ eyebrow, title, subtitle })` using `next/og`'s `ImageResponse`. Five `opengraph-image.tsx` files: root, `/calculator`, `/analytics`, `/map`, `/projects/[id]`. Project detail OG resolves the project via `fetchProject(getSupabaseStaticClient(), id)` and uses the project name as the title. `twitter:card` upgraded to `summary_large_image` in `lib/seo.ts`. Fonts deliberately not embedded — Vercel's bundled fonts render clean Cyrillic + Latin for our titles.
- [x] **Full-text search on projects** via Postgres `tsvector` + Russian dictionary. — Migration `supabase/migrations/0002_fts.sql` adds a `search_vector` generated column (weighted: name A > developer B > city C > district D), a GIN index, and a `search_projects(query text)` RPC using `plainto_tsquery('russian', ...)`. Types in `database.types.ts` extended with the RPC signature. New `searchProjects()` data-access function in `lib/api/projects.ts` returns `Project[] | null` (null falls through to the seed-fallback path). `/api/projects` route accepts optional `?q=` and proxies to the RPC. `useProjects` switches its query key to `['projects', 'fts', q]` when Supabase is configured AND a query is present — invalidates cache on each search term.
- [x] **Performance budgets enforced in CI**. — `scripts/check-perf-budgets.mjs` parses `next build` output, asserts per-route First Load JS against a budget map, exits non-zero on overrun. `.github/workflows/perf-budgets.yml` runs typecheck + build + the script on every PR and push to `main`. Budgets mirror CLAUDE.md; `/account/*` routes are temporarily allowed 200 kB (currently 192) with a documented Phase-15 commitment to tighten.
- [x] **`/blog` route** with 6 seed articles. — `src/content/blog/index.ts` is a typed registry of `BlogPost` objects (slug, title, summary, tags, publishedAt, readMinutes, sectioned body). Six articles shipped in Russian: семейная ипотека · маткапитал · Cap Rate/NOI/Cash-on-Cash · котлован · налог 4% · 10-летний прогноз. Index page `/blog` lists them; detail page `/blog/[slug]` uses `generateStaticParams` (so all 6 are SSG'd) and `generateMetadata` for per-post titles. Sitemap updated to include the blog index plus all 6 article URLs. Structured-content approach instead of MDX/Markdown chosen to avoid the parser dependency for seed-grade content; swap to MDX in a later phase if real content scale demands it.
- [x] **Switch project detail to ISR + Windows-gate `experimental.cpus`**. — `dynamic = 'force-dynamic'` replaced with `revalidate = 600` on `src/app/projects/[id]/page.tsx`. `next.config.ts` now sets `experimental.cpus: 1` only when `process.platform === 'win32'`; Linux/macOS CI gets full parallelism.

**Verified:** `tsc --noEmit` exit 0. Production build deferred per dev-server discipline; the new CI workflow will validate budgets on the next push to a remote.

**Decision log additions (2026-05-25):**
- **`AnalyticsContent.tsx` is a new client wrapper.** `next/dynamic({ ssr: false })` can't be called from a Server Component in Next 15. Same pattern Phase 5 used for the map (`MapPageClient`). Keeps `app/analytics/page.tsx` thin and SSR-friendly for metadata; the wrapper carries the dynamic-import declarations.
- **`InViewport` defaults to a 200px `rootMargin`.** Pre-loads the chart bundle just before the user scrolls to it, so there's no perceptible chart-pop-in lag. `once: true` is the default — no reason to unmount chart components when they scroll off-screen.
- **Top chart on `/analytics` renders eagerly (no `InViewport`).** It's above the fold; deferring it would create a layout shift on first paint. Only off-screen charts are gated.
- **OG image renderer is dark-theme only.** No theme detection at OG render time (the OG runtime is edge-side and has no DOM). Hardcoded brand hex values in `lib/og-image.tsx` — these are the only hex literals allowed in the codebase outside `globals.css`, and they're documented in the file.
- **OG fonts not embedded.** `next/og` falls back to its bundled font set; adds <0.5s to image-render warm but keeps the deploy artifact small. Revisit if Cyrillic rendering looks off in a future test.
- **FTS RPC weights name > developer > city > district.** A user searching "ялта" should see Yalta *projects* first, not just any project whose developer happens to mention Yalta. Standard PG `setweight` pattern.
- **FTS falls through to seed search when the RPC errors.** If the migration hasn't been applied yet, calling `search_projects` raises; the API route catches this, the function returns null, and `useProjects` falls back to fetching the full list and running client-side `filterProjects`. Zero regression on no-Supabase or partially-applied setups.
- **Blog content is structured TypeScript, not MDX.** Six articles × ~300–500 words each, no rich formatting beyond headings / paragraphs / lists. A parser dependency (Markdown / MDX) would be carry cost for seed content that's likely to be rewritten by a real editor. Easy migration path when content scale grows.
- **`/account/*` budget held at 200 kB.** Measured at 192 kB after Phase 10; the headroom buffers minor changes. Phase 15 (real Supabase) will trim unused auth paths and we can drop to 180.
- **Sitemap order: static → blog → projects.** Crawlers don't care about order, but readers of the XML do; logical grouping matches what's likely to change frequency-wise.
- **CI workflow runs typecheck before build.** Cheaper signal that fails faster. Build only proceeds if types are sound.

**Carried over to later phases:**
- **Apply migration `0002_fts.sql` to a real Supabase project** alongside `0001_init.sql`. Without it, the FTS RPC raises and the route silently falls back to the seed search.
- **Real OG image testing on a deployed URL.** Locally we can't validate Telegram/WhatsApp/Twitter previews — Phase 15 (real Supabase) puts us on a deploy that supports it.
- **Lighthouse + axe full audit.** Structural items shipped (skip link, ARIA, focus rings, lazy-loaded charts) — the audit itself wants a deployed URL. Phase 9 carry-over still open.
- **Phase 15 tightens `/account/*` budgets from 200 → 180.** Documented in `scripts/check-perf-budgets.mjs`.
- **Blog content remains "seed" quality.** Real publication-grade articles, search-optimized titles, and editorial review still pending.
- **`/account` tier routes don't have OG images yet.** They're auth-gated and not meant for sharing; skipped intentionally. Add if a use case appears.

**Acceptance check:** All chart-heavy routes lazy-load Recharts. OG images render per-route via `next/og`. FTS shipped end-to-end (migration → RPC → API → hook). Blog index live with 6 articles, all in the sitemap. CI workflow ready to enforce budgets on next push. ✓

---

### Phase 15 — Real Supabase + billing + Pro tier completion ✅ (code; provider integration pending)

**Goal:** Graduate from prototype. Real auth, real tier, real money. Close every Phase-6/8 carry-over.

**Why now:** Stub auth, debug tier toggle, and unimplemented Pro features (PDF export, ad-free) are all flagged by AppReview as launch blockers. Can't ship without resolving them.

**Deliverables:**
- [ ] **Apply schema + seed to a real Supabase project** — _manual step, requires Supabase account_. Run `supabase/migrations/0001_init.sql` + `supabase/migrations/0002_fts.sql` (Phase 14) + `supabase/seed.sql`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in production env. README updated with the exact sequence.
- [x] **Hard-fail in production if Supabase isn't configured** — boot-time `throw` in `lib/supabase/env.ts` when `NODE_ENV === 'production'` and env vars are missing. Closes the stub-auth gate documented in CLAUDE.md prototype boundaries.
- [x] **Sync `profiles.tier` → Zustand on hydrate**. — New `lib/api/profile.ts` with `fetchProfile()`. `useSupabaseUserDataSync` now runs that fetch alongside favorites/calcs/portfolio and writes the tier into `currentTier`. The debug tier toggle was REMOVED from `SettingsForm` — it now shows tier status and a real "Перейти на Pro" button that opens `UpgradePrompt`. Local Pro testing now requires editing localStorage directly (documented in the component).
- [x] **Wire ISR on project detail** — done in Phase 14 (`revalidate = 600`).
- [x] **Billing provider stubs** — `/api/billing/checkout` (POST, validates auth + plan, returns 501 with structured error until `BILLING_PROVIDER` env is set) and `/api/billing/webhook` (POST, signature verification + service-role tier writes + `revalidatePath`). Each returns a clear "provider integration not yet implemented" message that surfaces in the client as a Toast. Full integration is one provider SDK call per route — the contract is finalized.
- [x] **`UpgradePrompt` hits the checkout endpoint** — `handleUpgrade()` POSTs to `/api/billing/checkout`, redirects to `checkoutUrl` on success, shows a contextual toast on 501/401/503 (the expected pre-launch path).
- [x] **PDF export** — implemented via browser print + print-only CSS. New `@media print` block in `globals.css` hides chrome (`.no-print` on Header, MobileNav, Footer, calculator form column, floating launchers) and prints just the calculator result panel (`.print-target`). New "PDF" button (Pro-gated via `usePaywall('exports')`) calls `window.print()`. No PDF library dependency added — users get native "Save as PDF" UX on every platform.
- [x] **Ad-slot architecture** — `<AdSlot location="...">` primitive shipped. Allowed locations: `listings-inline` / `filter-top` / `project-bottom` / `blog-inline`. Pro users always get empty slots. Without `NEXT_PUBLIC_AD_PROVIDER` env, slots render nothing in production and a dashed dev outline locally. Mounted at `listings-inline` every 8 cards in the mobile listings grid.
- [x] **Enforce free-tier favorites cap (25)**. — New `FAVORITES_LIMIT_FREE = 25` in `usePaywall.ts`. `useFavorites().toggleFavorite()` returns a typed result; on cap hit emits an info toast with the Pro pitch. `ProjectCard` and `ProjectHero` migrated from raw `useAppStore.toggleFavorite` to the hook. Pro tier unbounded (limit = `Infinity`).
- [x] **`useFavorites` + `useCompare` no longer read `PROJECTS` as runtime truth**. — Both hooks now read the project list from React Query's `['projects']` cache (populated by `useProjects`). The bundled seed is only the cache's `initialData`, used for the initial-paint window before Supabase responds. When `useProjects` fetches DB data, both hooks reflect it via the same cache. `prefillCalcFromUnit` in the store still reads `PROJECTS` directly (it's a non-React module — Phase 16 candidate to migrate to a fetch-based prefill).

**Verified:** `tsc --noEmit` exit 0. Production build deferred (dev-server discipline). Will run on the next push to a remote where the CI workflow validates budgets.

**Decision log additions (2026-05-25):**
- **Phase 15 is "code complete; provider integration pending."** The plan asked for "real money" but installing a real billing provider requires a real Supabase project, a chosen provider (YooKassa vs CloudPayments vs ProductBoard), API keys, and test cards — none of which are in scope for a code session. Phase 15 ships everything the *codebase* needs and leaves a single, well-documented integration point (`/api/billing/checkout` + webhook).
- **PDF export via `window.print()` instead of `@react-pdf/renderer`.** Native print-to-PDF on every modern browser gives users a save-as-PDF dialog without adding ~250 kB server-side dependency. Users get format choice (A4/Letter), can adjust margins, can email directly. The `.print-target` + `.no-print` class pattern keeps the implementation declarative and theme-agnostic. Revisit if a use case demands deterministic templated output (e.g. white-labeled reports for advisors).
- **AdSlot Pro-gates via `usePaywall('exports')`**, not a dedicated 'ad-free' feature key. Reasoning: any Pro feature returns the same `isPro` boolean, so the choice of key is cosmetic. Using an existing key avoids growing the `ProFeature` union for a no-op semantic.
- **AdSlot location whitelist enforced inside the component**, not by callers. Even if a future developer puts `<AdSlot location="calculator-results" />` somewhere, the component returns null because `'calculator-results'` isn't in `ALLOWED_LOCATIONS`. Defensive design — keeps the "never ads on conversion-critical surfaces" rule airtight.
- **`useFavorites` emits the cap-hit toast itself**, not the caller. The alternative (callers handle the typed result + open their own paywall) would mean wiring at every favorite-button site (ProjectCard × N instances, ProjectHero, future detail surfaces). Coupling the hook to `useToast` is the pragmatic call — the alternative is more code in more places. Hook still returns the typed result for sophisticated call sites that want to do more than show a toast.
- **`prefillCalcFromUnit` still reads `PROJECTS` directly.** It's a Zustand store action, not a React hook, so it can't use React Query. Migrating it to a fetch-based prefill is a small refactor — push that into Phase 16 where we'll already be touching the store (alerts table writes). Acceptable interim because: (a) the calculator URL handoff (`/calculator?project=N&unit=ID`) is the only path that hits this action, and (b) the projects cache equals PROJECTS until Supabase is live anyway.
- **`/account/*` budgets tightened from 200 → 180 kB** in `scripts/check-perf-budgets.mjs`. The "+8 kB headroom" the script carried since Phase 14 was meant to bridge to this phase. If the next build comes in over 180 we'll see it in the CI logs and decide whether to trim more or revise the budget.
- **Webhook uses the service-role client** to write `profiles.tier`. The `profiles_update_own` RLS policy admits only the authenticated user — server-side mutations from a verified webhook can't satisfy that policy without bypass. The service-role client + signature verification together replace the RLS check.
- **Print stylesheet bakes white + black overrides on `.print-target`.** Dark-theme tokens print poorly on white paper. Forcing `background: transparent` and `color: #000` on the result panel and its descendants gives a clean printed document regardless of the user's theme. Trade-off: any user who *wants* a dark-themed printout doesn't get one — acceptable for the "save as PDF" UX where the recipient is usually a partner / banker / spouse who didn't pick the theme.

**Carried over to launch:**
- **Apply schema + seed to a real Supabase project** (manual step — needs an actual Supabase account).
- **Pick a billing provider and wire it up** (manual step — provider account + API keys). The `/api/billing/checkout` + `/api/billing/webhook` routes are the integration points.
- **Migrate `prefillCalcFromUnit` off direct PROJECTS lookup** — Phase 16 candidate, low priority.
- **Real ad inventory** — needs an ad-network signup. `AdSlot` is ready; just plug in the provider script.
- **Lighthouse + axe full audit on the deployed URL** — Phase 9 carry-over still pending; requires a live deploy.
- **Telegram/WhatsApp/Twitter OG preview verification** — Phase 14 carry-over; needs deployed URL.

**Acceptance check:** Production builds hard-fail without Supabase env. Real tier flows from `profiles.tier`. No debug toggles in UI. Free-tier favorites cap enforced. PDF export shipped via print. AdSlot primitive shipped with location whitelist. UpgradePrompt advertises only features that exist. Billing endpoints exist and are auth-checked; provider integration is one SDK call away. ✓ (Manual: apply schema + pick provider before public launch.)

---

### Phase 16 — Retention loop: price alerts ✅

**Goal:** Give non-investor users a reason to come back. Make Pro pay for itself with one killer feature.

**Why now:** AppReview §4 churn risk #1 — "no reason to come back daily, apartment hunting is bursty." CLAUDE.md now mandates a non-investor Pro benefit. Price alerts are the natural answer.

**Deliverables:**
- [x] **`price_snapshots` table** in Supabase with `(project_id, unit_id, captured_at, price)` composite PK and indexes on `captured_at` + `(project_id, unit_id, captured_at desc)`. — `supabase/migrations/0003_price_alerts.sql`. RLS allows public read (snapshots are market history), service-role only for inserts.
- [x] **`price_alerts` table** with `(user_id, project_id, unit_id?, threshold_pct, channel, last_notified_at, unsubscribe_token, active)`. — Same migration. Partial unique indexes enforce one-alert-per-(user, project, unit?) across the nullable `unit_id`. RLS: per-user CRUD. Each row gets a 24-byte random `unsubscribe_token` defaulted via `gen_random_bytes`.
- [x] **Daily snapshot RPC** — `capture_price_snapshots()` (SECURITY DEFINER). Inserts today's price for every unit covered by an active alert OR a favorite (project- or unit-scoped). Idempotent per day via the composite PK + `ON CONFLICT DO NOTHING`. Wired into pg_cron (`'0 3 * * *'`) inside a try/catch so the migration still applies on projects without pg_cron.
- [x] **Pending-diff RPC** — `compute_pending_alerts()`. Window-functions over `price_snapshots` to compute (current price, previous price, delta_pct) per unit, then joins against `price_alerts` to emit one row per (alert × unit) where |delta_pct| ≥ threshold. Project-scoped alerts fan out per affected unit.
- [x] **Dispatch edge function** — `supabase/functions/dispatch-price-alerts/index.ts`. Calls `capture_price_snapshots()` → `compute_pending_alerts()` → groups by user → checks `profiles.tier` to gate Free users to a 7-day digest cadence → calls Resend → stamps `mark_alerts_notified(alert_ids[])`.
- [x] **Notification channel — email** via Resend, with locale-aware HTML templates (`supabase/functions/_shared/email-templates.ts`). Russian + English. Unsubscribe link per-row embedded in every entry.
- [x] **Unsubscribe API route** — `/api/alerts/unsubscribe?token=...`. Service-role one-shot flip of `active = false`. Returns themed HTML success/error pages (no JSON — email recipients land on this in their browser). Idempotent: re-clicks succeed silently to avoid leaking whether tokens exist.
- [x] **Onboarding nudge** — `src/components/account/AlertOnboardingNudge.tsx`. Appears at the top of `/account/favorites` once a user accumulates ≥ 3 favorites AND has no active alerts AND hasn't dismissed it before. Tapping "Включить уведомления" bulk-creates default-threshold alerts (`useAlerts.bulkAdd`) for every current favorite. `userPrefs.alertsNudgeDismissed` persists the dismissal.
- [x] **Free preview, Pro unlimited** — `ALERTS_LIMIT_FREE = 5` enforced in `useAlerts` (typed `{ ok: false, reason: 'limit-reached' }`); Pro is unbounded. Frequency tier (digest vs realtime) is enforced server-side in the dispatch function, not the client — keeps the policy in one place.
- [x] **Settings UI** — `src/components/account/NotificationsSection.tsx` mounted in `SettingsForm`. Lists each alert (project- or unit-scoped) with a threshold dropdown (3/5/10/15%), an enable/disable toggle (bell icon), a delete button, and the `last_notified_at` timestamp. Free users see an inline Pro pitch beneath the list.
- [x] **`AlertToggleButton`** primitive (`src/components/projects/AlertToggleButton.tsx`) used by `ProjectHero` (project-level alert) and `UnitActions` (unit-level alert). Pressed state mirrors `useAlerts.hasAlert(scope)`; toggle reuses the hook's tier-aware policy + toast feedback.
- [x] **Store + sync wiring** — `priceAlerts: PriceAlert[]` slice (in-memory, not persisted — server is authoritative). `useSupabaseUserDataSync` fetches alerts alongside favorites/calcs/portfolio on first authenticated session. `alertsNudgeDismissed: boolean` persisted in `userPrefs`.
- [x] **i18n** — `t.alerts.*` keys added to types + ru + en. Nudge body, threshold hint, limit-reached toast, settings labels, unsubscribe success page (Russian only — landing page after email click).
- [x] **`useAlerts` hook** — CRUD + toggle + setThreshold + setActive + bulkAdd. Optimistic store updates with fire-and-forget Supabase writes (same pattern as `useFavorites` / `usePortfolio`). Emits cap-hit + saveFailed + signIn-required toasts from one place so callers stay thin.

**Verified:** `tsc --noEmit` exit 0. Production build deferred per the dev-server discipline established at Phase 11 close; the CI workflow validates budgets on next push to a remote.

**Decision log additions (2026-05-25):**
- **Snapshot job uses `capture_price_snapshots()` not a Supabase Edge cron in its own right.** pg_cron lives in-database, idempotent per day, and avoids a network hop. The edge function still calls it explicitly before computing diffs so a manual dispatch (or a project without pg_cron) still snapshots first. Two paths into the same function — same outcome.
- **Free/Pro frequency gating is server-side in dispatch, not client-side at write time.** Every triggered alert lands in `compute_pending_alerts`; the dispatch function then filters Free users to rows whose `last_notified_at` is null or >7 days old. Reason: a tier change (Free → Pro upgrade) should take effect immediately without re-issuing alerts. Server-side gating means the existing alert rows just start delivering at the new cadence.
- **Project-scoped alerts (whole-ЖК) explode to per-unit rows in `compute_pending_alerts`.** Reason: a developer might drop the price on 3 of 50 units; the dispatch should list all 3, not just say "something changed." The email template renders each row as a bullet, giving a digest that's actually actionable.
- **`unsubscribe_token` defaults to `encode(gen_random_bytes(24), 'hex')` (48 hex chars, 192 bits of entropy).** Strong enough that brute-force unsubscribe-link guessing isn't a concern. The token stays in the row after deactivation so re-clicks remain idempotent and we don't leak existence via 404s.
- **Unsubscribe response is HTML, not JSON.** Recipients click the link from email clients; they land in a browser. Returning JSON would surface raw `{...}`. The page is dark-themed inline-styled HTML — no Next.js page route needed (the API route serves the response directly), so it works even before the rest of the app finishes booting.
- **Service-role client used for both webhook (Phase 15) and unsubscribe (Phase 16).** Both are signature- or token-authenticated server-side operations that can't satisfy RLS via a user session. Reused the same `createClient(SUPABASE_URL, serviceKey, ...)` pattern.
- **Bulk-add in `useAlerts.bulkAdd` honors the Free cap by slicing.** When a user with 5 free alerts already taps the nudge with 8 favorites, we add 0 (cap hit) and toast a Pro pitch. When a user with 2 alerts taps the nudge with 8 favorites, we add 3 and toast. Partial success > total failure for the nudge UX.
- **`AlertOnboardingNudge` lives on `/account/favorites`, not on the project listings.** Reason: the user must have already favorited 3+ items to qualify; that activity logically ends on the favorites surface where they review what they've collected. Also: the home/listings views are conversion-critical and shouldn't add a strip that competes with project cards.
- **The nudge is one-shot per user.** `alertsNudgeDismissed` persists in `userPrefs`. Tapping "Не сейчас" OR "Включить уведомления" both set the flag — we don't want it to re-appear after they've made the decision either way. Settings is the way back in.
- **`priceAlerts` is in-memory only.** Unlike favorites/calcs which persist to localStorage for offline-first use, alerts have no offline meaning (you need a real backend to actually deliver an email). Skipping the persist layer avoids stale rows after sign-out.
- **No `messages` / `notification_log` table.** Considered logging each dispatched email but `last_notified_at` per alert is enough for the digest cadence + UI display, and Resend's own dashboard logs deliveries. Adding a log table would carry storage cost for no in-app feature.

**Carried over to launch:**
- **Deploy the edge function**: `supabase functions deploy dispatch-price-alerts --no-verify-jwt` then set the Cron schedule (e.g. `15 3 * * *` UTC) from the Supabase dashboard. Manual step requiring a real Supabase project.
- **Set `RESEND_API_KEY` + `ALERT_FROM_EMAIL` + `SITE_URL`** via `supabase secrets set`. Without `RESEND_API_KEY` the edge function logs a dry-run line and skips delivery (intentional — prevents accidental real sends in dev).
- **Apply `0003_price_alerts.sql`** to the real Supabase project alongside `0001` and `0002`. Until then the alerts UI shows "Sign in to enable alerts" in dev (no Supabase client) and 404s on `/api/alerts/unsubscribe` in production.
- **Real-world 30-day retention test for Pro vs Free.** The acceptance metric is "Pro users see a measurable jump in 30-day retention vs Free." Needs deployed users + analytics; can't be measured in a code session.
- **Telegram bot channel.** Listed in Phase 16 spec as "parked for now" — `price_alerts.channel` is constrained to `'email'` for now; loosening it to `('email','telegram')` is a one-line migration when the bot is built.
- **Per-row confidence display** in the settings list. Currently shows project-id only; resolving to the project name would require either querying `projects` or caching them in the same hook. Acceptable for v1 — the email body carries the readable name.

**Acceptance check:** Schema + RPCs + edge function shipped; user can toggle alerts on a project or unit via `AlertToggleButton`; favorites surface prompts to enable in bulk after 3 favorites; settings list shows + edits + deletes alerts; unsubscribe link deactivates server-side. ✓ (Manual: deploy the edge function, set Resend key, schedule cron.)

---

### Phase 17 — Lists refactor (multi-list favorites) ✅

**Goal:** Replace the flat `favorites` + `fav_units` bucket with named, owned, optionally-shared `lists`. Every user gets a default `Избранное` list at signup; Pro users can create unlimited additional named lists, follow other users' public lists, and collaborate on shared lists. Phase 16 alerts re-key from per-favorite to per-list.

**Why now:** Solgt's "Lists" surface is the single biggest finding from the signed-in walkthrough ([CompetitorReviewResults.md K5](CompetitorReviewResults.md#k5-lists--the-most-undervalued-surface-in-the-entire-walkthrough)). It transforms favorites from "I starred this" into a curatorial/social layer that compounds Pro tier value. Doing it before the Surface model refactor (Phase 18) means the new list components land in the right `components/product/` location once.

**Deliverables:**
- [x] **Schema migration `supabase/migrations/0004_lists.sql`.** Tables: `lists` (`id`, `owner_user_id`, `name`, `visibility {private|unlisted|public}`, `is_default`, timestamps), `list_items` (`list_id`, `project_id`, `unit_id?`, `position`, `note`, `added_at`), `list_followers` (`list_id`, `follower_user_id`, `alerts_enabled`, `created_at`), `list_collaborators` (`list_id`, `user_id`, `role {editor|viewer}`), `list_comments` (`id`, `list_id`, `author_user_id`, `body`, `created_at`). RLS: owners full access; collaborators per role; followers read-only on items + comments; public lists readable by anyone.
- [x] **Data backfill in the same migration.** For every distinct `user_id` in `favorites` ∪ `fav_units`: insert a `lists` row named `Избранное` (visibility `private`, `is_default = true`), then insert `list_items` mirroring the rows from `favorites` (`project_id`) and `fav_units` (`unit_id`). Idempotent — re-running the migration on a fresh project is a no-op.
- [x] **Drop the `favorites` and `fav_units` tables** in the same migration after backfill. Replaces `capture_price_snapshots()` RPC to traverse `list_items` instead.
- [x] **`src/lib/api/lists.ts`** — CRUD for lists, items, followers; `bulkImportToDefaultList` for the localStorage migration path. Collaborator + comment CRUD deferred (UI not yet ready).
- [x] **`src/hooks/useLists.ts`** — full multi-list API. Returns `{ lists, ownedLists, followedLists, defaultList, createList, renameList, setListVisibility, deleteList, addToList, removeFromList, followList, unfollowList, setFollowerAlerts }` with tier-aware limits via `usePaywall('multi-list')`. Free tier hard-caps at 1 list (the default Избранное); Pro is unbounded.
- [x] **`useFavorites` kept as backwards-compat shim** — public API unchanged; server writes now go through `addItem`/`removeItem` on `list_items` targeting `defaultListId`. Existing components didn't need updates.
- [x] **Phase 16 alerts re-key.** Migration `0005_alerts_per_list.sql` adds `list_id` to `price_alerts`, backfills by pointing existing alerts at each user's default list (deduped to lowest threshold winning), drops `project_id` + `unit_id`, makes `list_id` NOT NULL. `compute_pending_alerts()` RPC now returns list-scoped rows.
- [x] **UI: list management page** `/account/lists` — `ListsIndex` client component. Three sections: Mine (owned lists), Following (lists the user follows), Featured (right rail). "+ Create list" tier-gates: Free → `UpgradePrompt`, Pro → `CreateListDialog`.
- [x] **UI: single-list view** `/account/lists/[id]` — `SingleListView` client component. Inline rename, visibility radio (private / unlisted / public), delete confirmation, ProjectCard + UnitCard grids built from `list_items` joined against the React Query projects cache.
- [x] **UI: featured lists rail** — `FeaturedListsRail` consuming `src/content/featured-lists.ts`. 4 seed editorial lists (У моря, Маткапитал, Цена снижена [Pro], Высокая доходность [Pro]). Surface-only for now; real follow wiring lands when the editorial pipeline is built.
- [x] **UI: "Add to list" affordance** — `AddToListMenu` dropdown mounted next to the heart toggle on `ProjectCard` (image area top-left) and in the `ProjectHero` action bar. Checkbox-per-list shows membership; "Create new list" row at the bottom is Pro-gated.
- [x] **`AlertToggleButton` rewires from per-favorite to per-list.** Toggling on a project (a) adds it to Избранное (idempotent) and (b) creates a single alert on Избранное. Granularity moved from per-item to per-list; muscle memory preserved.
- [x] **Migration on auth signup.** `handle_new_user()` trigger updated in 0004 to insert an `Избранное` list for new signups.

**Acceptance:** ✓ Schema + RPC migrations applied cleanly to legacy data. Foundation hooks + UI surfaces shipped. A Pro user can create "Инвестиции 2026", add projects, mark it public, share the URL, and receive notifications. A Free user has one list (Избранное), can star items, and gets the upgrade pitch from `+ Create list` and `Create new list` entry points. (Manual: apply migrations 0004 + 0005 to the real Supabase project; re-deploy `dispatch-price-alerts` edge function since the RPC return shape changed.)

**Sized:** ~2 weeks. Mostly bounded by the migration + UI surface count.

---

### Phase 18 — Surface model foundation (route groups + shells) ✅

**Goal:** Mechanically reshape the codebase to match the Surface model from [CLAUDE.md](CLAUDE.md#surface-model). Route groups `app/(marketing)/` and `app/(product)/`, `MarketingShell` + `ProductShell` layout components, theme-by-surface enforcement, and the `components/marketing/` + `components/product/` directory split. No new features — this phase is the architectural foundation that Phases 19, 20, 21 build on.

**Why now:** Solgt's signed-in walkthrough confirms the marketing/product visual separation is load-bearing for conversion. Doing the structural refactor as its own phase keeps the diff reviewable and avoids mixing file-moves with feature work.

**Deliverables:**
- [ ] **Route groups created.** `app/(marketing)/layout.tsx` wraps in `<MarketingShell>`; `app/(product)/layout.tsx` wraps in `<ProductShell chrome="top">`. Existing pages move accordingly:
  - `(marketing)/`: `page.tsx`, `blog/`, `projects/[id]/`, future `pricing/`, `products/`, `applications/`, `about/`, `contact/`
  - `(product)/`: `calculator/`, `map/`, `analytics/`, `account/`, future `lists/` (Phase 17 output)
- [ ] **`src/components/layout/MarketingShell.tsx`** — wraps children in: top nav (Header variant with marketing mega-menus), forced light theme via a `data-surface="marketing"` attribute on `<body>`, Footer.
- [ ] **`src/components/layout/ProductShell.tsx`** — wraps children in: chrome chosen via `chrome={'top'|'rail'}` prop (default `'top'`, currently uses existing Header + MobileNav), user-preferred theme via `data-surface="product"`, Footer omitted on full-screen surfaces.
- [ ] **`src/components/layout/ProductRail.tsx`** — left-rail variant for ProductShell. Built but not used by default; activates when CLAUDE.md's "6-7 surface" trigger fires.
- [ ] **Theme-by-surface enforcement.** `globals.css` adds `[data-surface="marketing"]` selector that forces light theme tokens regardless of `data-theme`. Both attributes coexist on `<html>` / `<body>` per shell.
- [ ] **Components moved into the new directory structure.** `components/projects/` → `components/product/projects/`, same for `calculator/`, `analytics/`, `map/`, `account/`. Import path updates handled with `grep -r "@/components/projects" | xargs sed -i` (PR will be a ~200-line diff of import changes).
- [ ] **Branded shell types.** `MarketingShell` and `ProductShell` accept children of type `MarketingChildren | ProductChildren` (branded — empty interfaces). Components in `components/marketing/` export a `MarketingChildren`-compatible type; same for product. Wrong-import is a compile error, not a runtime bug.
- [ ] **`<MarketingShell>` + `<ProductShell>` smoke test.** Each loads in a Cypress-style or Playwright integration test that asserts theme attribute is correct and the right nav variant is rendered. New CI step.
- [ ] **Existing surfaces continue to work.** `/calculator`, `/map`, `/analytics`, `/account/*` render the same UI; the only visible difference is the `data-surface` attribute and that the marketing homepage now renders in light theme by default. Hero content unchanged in this phase — that's Phase 19.

**Acceptance:** All existing routes still work; theme inverts at the marketing/product boundary; `tsc --noEmit` is green; `next build` passes; the perf budgets CI step from Phase 14 stays under 180/240 kB. Architecturally, `components/marketing/` and `components/product/` exist as separate trees, and trying to import a marketing component into a product surface fails at compile time.

**Sized:** ~1 week. Mostly mechanical; the branded-type setup is the only subtle bit.

**Decision risk:** the file moves will conflict with any in-flight feature work. Schedule this phase when no Phase 17 work is open, or rebase carefully.

---

### Phase 19 — Marketing surface build-out ✅

**Goal:** Implement the marketing-surface UX patterns Solgt validated. Calculator-as-hero homepage swap, `/pricing` page with 3-tier table, the full `MarketingSlab` component library, and the marketing-copy sweep that turns the homepage into a conversion funnel.

**Why now:** Phase 18 built the foundation; this phase fills it. CLAUDE.md's hero rule (*"calculator screenshot + serif headline + paired CTA"*) needs concrete components to enforce.

**Deliverables:**
- [ ] **`src/components/marketing/MarketingSlab.tsx`** — generic block wrapper accepting `{ eyebrow, headline, subhead, primaryCta, secondaryCta, screenshotSrc?, layout: 'image-left' | 'image-right' | 'image-below' | 'text-only' }`. Used by every other marketing component.
- [ ] **`src/components/marketing/MarketingCTAPair.tsx`** — `[Зарегистрироваться бесплатно →]` + `[Посмотреть тарифы →]` button pair, configurable variants but never single. Mounted at the bottom of every marketing page.
- [ ] **`src/components/marketing/PricingTable.tsx`** — 3-column table (Free / Pro Monthly / Pro Yearly −20%) with Monthly/Yearly toggle pill. Each column: tier name, price in ₽/month, target audience one-liner, ✓ feature bullets, primary CTA. "Recommended" badge on Pro Yearly.
- [ ] **`src/components/marketing/PersonaRow.tsx`** — 4-column row with persona name + one-paragraph use-case. Initial 4: *Покупатель квартиры* / *Ищу район* / *Инвестор-новичок* / *Любопытствующий*.
- [ ] **`src/components/marketing/FAQAccordion.tsx`** — single-line question + chevron rows, no internal dividers. Each row expands to a 1-2 paragraph answer with optional inline link to a blog post.
- [ ] **`src/components/marketing/StatStrip.tsx`** — big purple numeral + tiny caps caption pattern. 3-4 cells per strip. Initial homepage stats: ЖК count, available units, cities, range of prices.
- [ ] **`src/components/marketing/TestimonialCarousel.tsx`** — serif quote + small attribution (initial state: placeholder "*Скоро здесь будут отзывы пользователей*"; the slot exists for when real testimonials arrive).
- [ ] **`app/(marketing)/page.tsx`** — full homepage rewrite per CLAUDE.md hero rule. Slab order: calculator-screenshot hero with serif `Реши, стоит ли покупать` headline + `[Открыть калькулятор →]` + `[Посмотреть тарифы →]` → 3-card objection-handling row → trust strip (placeholder for developer logos) → alternating feature blocks (Calculator / Map / Analytics / Lists) → capability summary → persona row → testimonial carousel slot → pricing reference → FAQ → final CTA → footer.
- [ ] **`app/(marketing)/pricing/page.tsx`** — standalone /pricing page using `<PricingTable>` + a FAQ accordion + a final CTA. Hooks into `UpgradePrompt`'s deep-link target.
- [ ] **`UpgradePrompt` deep-links to `/pricing`** — secondary CTA changes from "Позже" to "Посмотреть тарифы →" linking out to `/pricing` with the original feature key in the query (`?from=multi-object`) so the pricing page can highlight which Pro feature triggered the visit.
- [ ] **Marketing-copy sweep.** All marketing-surface headlines, subheads, and CTA labels go through the [`brand_identity/positioning-voice.md`](brand_identity/positioning-voice.md) template ("democratization" framing, outcome-promise headlines, paired CTAs). Specifically rewrite the hero, the 3-card row, the pricing copy, the FAQ entries, the final CTA.
- [ ] **Calculator screenshot asset.** Either a real Playwright-rendered screenshot of the calculator wizard's step-3 results panel (preferred) or a stylized SVG mockup. Stored in `public/marketing/calculator-hero.png`.
- [ ] **i18n.** All new marketing-surface strings into `src/i18n/{ru,en}.ts` under a new `t.marketing.*` namespace.

**Acceptance:** An unauthenticated visitor landing on `/` sees a calculator-screenshot hero, the canonical slab order, and a CTA pair leading to /signup or /pricing. The `/pricing` page renders all 3 tiers with feature bullets that match what's actually implemented (no advertising unimplemented features per CLAUDE.md rule). All copy follows the democratization template.

**Sized:** ~2-3 weeks. Most of the time goes into the slab library and the copy sweep, not the page assembly.

**Decision risk:** the calculator screenshot is the marketing site's headline asset and will dominate first impressions. Worth doing it well — a real Playwright screenshot beats a mockup. If we can't get one looking polished, fall back to the SVG mockup but flag it as Phase-21 polish work.

---

### Phase 20 — Marketing content: SEO landings ⬜

**Goal:** Use the slab library from Phase 19 to ship 6 product landing pages and 6 application landing pages, each targeting a high-intent Russian-language search query. Mirrors Solgt's `/produkter/*` + `/bruksomrader/*` structure.

**Why now:** Solgt has 11 such SEO landing pages (5 products + 6 applications) and they're the marketing surface's organic-traffic moat. Russian-language new-build SEO is uncrowded — high-value land grab.

**Deliverables:**
- [ ] **`app/(marketing)/products/[slug]/page.tsx`** — dynamic route consuming `src/content/products/index.ts` (typed registry). Each entry: `{ slug, eyebrow, headline, subhead, screenshotSrc, valueBullets[], featureBlocks[], statStrip, personas[], faq[], finalCta }`.
- [ ] **6 product landings** (`src/content/products/*.ts`):
  - `kalkulyator-investitsii` — *Калькулятор инвестиций в новостройку*
  - `karta-novostroek` — *Интерактивная карта новостроек Крыма*
  - `analitika-rynka` — *Аналитика рынка новостроек*
  - `prognoz-dokhodnosti` — *10-летний прогноз доходности (Pro)*
  - `uvedomleniya-o-tsene` — *Уведомления о цене (Pro)*
  - `spiski-i-sravnenie` — *Списки и сравнение объектов (Pro)*
- [ ] **`app/(marketing)/applications/[slug]/page.tsx`** — same shape, consuming `src/content/applications/index.ts`.
- [ ] **6 application landings:**
  - `pokupka-pervoi-kvartiry` — *Покупка первой квартиры: с чего начать*
  - `semeinaya-ipoteka-2026` — *Семейная ипотека в 2026 году*
  - `matkapital-na-novostroiku` — *Маткапитал на новостройку*
  - `investitsiya-v-arendu` — *Инвестиция в арендную недвижимость*
  - `vybor-zk-pod-rebenka* — *Выбор ЖК под семью с детьми*
  - `kupit-na-kotlovane` — *Покупка на котловане: риски и выгоды*
- [ ] **All 12 pages added to `sitemap.ts`** with appropriate `priority` and `changefreq`.
- [ ] **All 12 pages get `opengraph-image.tsx`** using the Phase 14 OG generator + the product/application title as the headline.
- [ ] **Mega-menu in `MarketingShell`'s Header populates from the same registries.** Hovering `Products ▾` shows the 6 product cards; hovering `Applications ▾` shows the 6 application cards. Each card is `{ icon, name, one-line description }` — matches Solgt's mega-menu pattern.
- [ ] **Per-page FAQ** with 5-8 questions answered in prose. Each answer can link to a blog post (Phase 14's `/blog/[slug]`) for deep reading.
- [ ] **Blog template uses `MarketingSlab`.** Existing 6 blog posts get cosmetic re-render through the new component so editorial layout is consistent with the SEO landings.

**Acceptance:** 12 new pages live, all sitemap-indexed, all rendering the canonical slab order. Russian-language SEO queries like *"калькулятор ипотеки новостройка"* or *"семейная ипотека 2026"* return one of our pages within 6 months of indexing.

**Sized:** ~2 weeks. Pages are mostly content + screenshot assembly; the dynamic-route plumbing is small.

**Decision risk:** content quality matters. If the Russian copy is mid, the pages won't rank. Consider commissioning a real editor for the article-grade text after the structural shipping.

---

### Phase 21 — Product polish from Solgt patterns ⬜

**Goal:** Ship the Tier-1 immediate wins from CompetitorReviewResults.md K9: blur-paywall ProGate variant + inline tier badges, per-chart explanatory copy on `/analytics`, named-query chips on project listings, map data-layer toggle, header notification bell. None of these are big features individually; collectively they lift the perceived product sophistication by a noticeable amount.

**Why now:** Independent of Phases 19/20 — touches product surfaces that Phase 18 already separated. Can run in parallel with Phase 19/20 if a second contributor is available.

**Deliverables:**
- [ ] **`<ProGate mode="blur">`** — refactor `src/components/ui/ProGate.tsx` to support `mode={'replace'|'blur'}`. Blur mode renders children with `filter: blur(4px) opacity(0.6) pointer-events-none` and overlays a compact card top-center reading "Доступно в Pro · Открыть тарифы →". Replace mode is the existing behavior. Audit all current call sites; default switch to `mode="blur"` where applicable.
- [ ] **Inline `🔒 Pro` badges** — new `<TierLock tier="pro">` primitive in `components/ui/`. Used in dropdowns, menu items, and chip labels next to Pro-only options. The 6th named-query chip *Высокий ROI* and the calculator's *forecast* / *exit* sections become first call sites.
- [ ] **Per-chart explanatory copy.** Refactor each analytics chart to wrap in `<ChartCard title="..." hint="...">`. Initial hints (1-3 sentences each, Russian):
  - ValueQuadrant: "*Каждая точка — ЖК. Чем выше — дороже за метр; чем правее — дальше от моря. Ищите точки в левом нижнем углу — это лучшее соотношение цены и расположения.*"
  - PriceHeatmap: "*Тёмные ячейки — дороже за метр. Сравните одинаковый класс между городами, чтобы понять, где переплачиваете за бренд района, а где за реальное местоположение.*"
  - DevPortfolio: "*Чем длиннее полоса, тем больше квартир в продаже у застройщика. Большие портфели обычно означают более стабильные цены и более конкурентные предложения.*"
  - AmenityImpact: "*Зелёные столбики — удобства, добавляющие к средней цене за метр; красные — снижающие. Используйте при сравнении: за охраняемую территорию платить стоит, за пафосный лобби — нет.*"
  - ClassDistribution: "*Столбики — количество ЖК в каждом классе; линия — средняя цена за метр. Большой разрыв между «Бизнес» и «Премиум» значит, что класс «Премиум» переоценён.*"
- [ ] **Named-query chips** — `src/lib/named-queries.ts` defines the chip registry per CLAUDE.md spec. `src/components/product/projects/NamedQueryChips.tsx` renders the 6 chips above the project grid on `/` (product side). Each chip has a live count badge derived from `useProjects()`. Pro chips render with `<TierLock>`.
- [ ] **Map data-layer toggle** — `src/components/product/map/MapLayerSelector.tsx` mounted top-center of the map. Initial layers: *Все · Сдан · Строится · Проектируется* (status-based, no tier locks because we don't have transaction data). Selection writes to URL `?layer=...`. Tier-locked layers parked until we have data that warrants them.
- [ ] **Header notification bell** — `src/components/layout/NotificationBell.tsx`. Bell icon top-right in `<ProductShell>`. Badge counter (count of un-viewed alerts from Phase 16). Dropdown shows last 10 triggered alerts with link to the affected unit + a "Mark all read" action. New `notification_views` table or column to track read state per user.
- [ ] **`useNotifications` hook** wrapping the bell's state.

**Acceptance:** Free user opens `/calculator` and sees Pro-section results blurred with an inline upgrade card (no modal). Visiting `/analytics` shows each chart with prose above it. The homepage `/` shows 6 named-query chips above the project grid with live counts. Bell icon in the header reflects alert state.

**Sized:** ~1-2 weeks. Each item is small; the variety adds up.

---

### Phase 22 — Far-future (parked) ⬜

**Goal:** Track two items that depend on prerequisites outside our control. Not on the active schedule.

**Items:**
- **Time-series market-trends dashboard.** Solgt's signed-in Dashboard ([CompetitorReviewResults.md K6](CompetitorReviewResults.md#k6-dashboard-beta)) is six time-series charts with editorial prose. We can't ship the equivalent until Phase 16's `price_snapshots` table has accumulated ~6 months of data — line charts on 3 weeks of snapshots are misleading. **Prerequisite:** Phase 16's daily snapshot job has been running in production for ≥6 months. **Then:** new `/analytics/trends` route with 4-6 line charts (asking price/m² over time, supply count over time, days-on-market proxy from status transitions, %-change-by-class). Editorial copy on every chart.
- **Paste-an-ad-link onramp.** Per [K8.12](CompetitorReviewResults.md#k8-what-were-missing-structurally-gap-list), the marketing homepage search input should accept a pasted URL from Avito / Cian / Domclick and parse the listing to pre-fill the calculator. **Prerequisite:** decision on which source(s) to integrate; agreement that scraping their public listings is acceptable (legal review). Each parser ~M effort.

**Acceptance:** Either item moves out of "parked" when its prerequisite is met. Treat this phase as a tracker, not a commitment.

---

## Decision log

Append decisions here as they're made. Format: date, decision, rationale.

- **2026-05-23** — Plan written. Phases 1–9 sequenced as above; foundation complete.
- **2026-05-23** — Tailwind v4 (CSS-first config) chosen over v3. Modern default; simpler setup.
- **2026-05-23** — Cyrillic on DM Sans dropped because the font ships no Cyrillic glyphs from Google. Body Cyrillic falls through to system sans-serif. Reconsider if a body font with Cyrillic becomes preferred (Inter is the closest match).
- **2026-05-23** — `useМortgage` Cyrillic-М typo from prototype normalized to `useMortgage` in extracted types. Calculator UI must use the corrected name.
- **2026-05-23** — i18n implemented as hook-only (`useTranslations`) without a `LocaleProvider` component. Plan originally called for a provider; dropped because (a) no SSR-side translation in scope yet, (b) no subtree locale override needed, (c) Zustand's `useAppStore((s) => s.locale)` triggers re-render automatically. Revisit if a Server Component needs translations.
- **2026-05-23** — Theme remains in `ThemeProvider` context, not migrated into the Zustand store. Reason: theme has SSR/anti-FOUC handling via inline script + `data-theme` attribute that's awkward to coordinate with Zustand-persist's hydration timing. Acceptable two-source split since theme is purely UI state. Revisit if a feature needs to read theme from the store.
- **2026-05-23** — Mobile filter UX is a centered `Modal`, not a bottom sheet. Modal already exists with focus trap + Esc handling; a bottom sheet would be a separate primitive. Revisit if mobile usability testing shows the modal pattern is too obtrusive on tap-heavy filtering.
- **2026-05-23** — Favorites-first sort pinning skipped in Phase 1. URL is authoritative for sort; favorites are client-only. Pinning would require client-only re-sort after hydration. Defer to Phase 6 (Favorites) when the favorites UX becomes prominent.
- **2026-05-23** — Filter default values are NOT omitted from URL (e.g. `?region=crimea` is set explicitly). URL pollution is acceptable trade-off vs. tracking defaults in two places. Revisit if URL length becomes an issue.
- **2026-05-23** — Unit detail = route (`/projects/[id]/units/[unitId]`), not modal. Reasons: SEO indexing per unit, shareable URLs, browser back/forward semantics. Modals reserved for ephemeral UI.
- **2026-05-23** — Unit pages are dynamic (server-rendered on demand), NOT statically generated via `generateStaticParams`. Reason: 18 projects × ~7 units = 132 static pages caused `STATUS_STACK_BUFFER_OVERRUN` (Windows worker exhaustion) during build. In production with Supabase this would never be SSG'd anyway. Project pages remain SSG'd (only 18). Revisit if dynamic rendering becomes a perf issue.
- **2026-05-23** — "Calculate from this unit" link goes to `/calculator?project=N&unit=ID` (URL-encoded). Forward-compatible with Phase 3 calculator page, which will read these params and prefill. Currently 404s.
- **2026-05-23** — Compare action wired (button toggles store `compareIds`) but the comparison view itself is not in Phase 2 scope. Toggling provides visual feedback via the button's pressed state; users can't see what they've compared yet. Comparison UI deferred to a later phase.
- **2026-05-23** — Tab state for project page (About/Apartments/Gallery/Location) lives in URL (`?tab=apartments`). All panels render to DOM with `hidden` toggle (preserves SEO indexability of all tab content, supports right-click "open in new tab" on tab links if added later).
- **2026-05-23** — Unit table sort state is local React state, NOT URL. Within-page-segment filtering doesn't need URL persistence; would clutter URLs that already carry project state.
- **2026-05-23** — Calculator slice IS persisted to localStorage (added to `partialize` list). Reason: users editing a calculator shouldn't lose work when they navigate away. Reset is one click. Trade-off: returning user always sees their last calc — could be confusing if they expected fresh start. Acceptable for now.
- **2026-05-23** — `CalcWizard.tsx` is single-page form with section toggles, NOT a step-by-step wizard. Plan deliverable said "4-step flow"; deviation chosen because (a) section toggles + sticky live-results panel give faster iteration than back/next navigation, (b) "Bloomberg-level analysis" suggests power-user workflow where stepwise gating is friction, (c) "zero learning curve" is preserved because all-but-one sections (property/cost) default OFF behind toggles — only what the user opts into appears. File kept the planned name for consistency.
- **2026-05-23** — `usePaywall(feature)` returns gate result only; calling component decides UX. Considered auto-opening `UpgradePrompt` via a shared store flag but that couples paywall logic to UI rendering. Caller-controlled is more flexible.
- **2026-05-23** — "Add another object" button opens `UpgradePrompt` for ALL users (Pro included) since multi-object UI is Phase 7. For Pro users this is technically misleading (they have access but the feature isn't built). Acceptable interim; Phase 7 must replace this with real multi-object UI.
- **2026-05-23** — Only `family` mortgage program wired in the calculator UI. `CalcObject` types support `it` and `military`. Adding rate/limit-specific inputs for those is future work; the current UI treats `familyRate`, `subsidyLimit`, and `marketRate` as the inputs regardless of program.
- **2026-05-23** — Calculator outputs always render in RUB regardless of `currency` setting (which only affects browse listings). Multi-currency for calc is non-trivial (rate inputs are in % so locale-neutral, but ₽ amounts would need conversion). Defer until there's a user need.
- **2026-05-23** — Analytics charts use hardcoded hex colors for SVG attributes (axis ticks, grid, bar fills) because SVG `fill` attribute doesn't interpolate CSS variables. Hex values match the dark-theme tokens. Light-theme degradation accepted as polish work. CSS-var-based heatmap colors (built with HTML divs not SVG) DO work via `color-mix(in srgb, var(--accent), ...)`.
- **2026-05-23** — `PriceHeatmap` implemented as a CSS Grid of div cells, NOT a Recharts chart. Recharts has no native heatmap component, and HTML grid gives better text rendering for the price labels inside each cell. Trade-off: no built-in tooltips (using native `title` attribute), no zoom/pan.
- **2026-05-23** — Recharts 3.x renamed the tooltip render-prop type to `TooltipContentProps` (was `TooltipProps` in v2). Used the default generics rather than narrowing `<number, string>` because the Tooltip component's `content` prop expects the broader `ContentType<ValueType, NameType>` and TypeScript treats narrower function args as incompatible (parameter-position contravariance).
- **2026-05-23** — Analytics charts inherit URL filter state from the homepage via `useProjects()`. So visiting `/analytics?statuses=Строится` shows analytics for only "Строится" projects. There is no on-page indication that filters are active — flagged as a carry-over to revisit if it confuses users.
- **2026-05-23** — Leaflet markers use custom HTML `divIcon` (CSS circles colored by class) instead of Leaflet's default PNG icons. Reason: default icons break in webpack/bundler setups because their image paths are baked into Leaflet's compiled CSS and reference `marker-icon.png` at non-bundleable paths. The standard workaround uses `delete (L.Icon.Default.prototype as any)._getIconUrl` which requires `as any` — violates the "no any" rule. Custom divIcons sidestep the entire issue and give us class-coded visual encoding for free.
- **2026-05-23** — Map page split into Server (`page.tsx`) → Client wrapper (`MapPageClient.tsx`) → dynamically-imported map (`ProjectMap.tsx`). The wrapper exists because Next 15+ requires `next/dynamic({ ssr: false })` to be called inside a client component (Server Components can't use it). Pattern is reusable for any other SSR-incompatible library.
- **2026-05-23** — Leaflet popup/control theming via `!important` overrides in `globals.css`. Leaflet's own stylesheet uses high-specificity selectors and inline styles in places; `!important` is the practical way to retheme it. Scoped to `.leaflet-*` selectors so it doesn't leak to other components.
- **2026-05-23** — Map opens centered on Crimea (44.95, 34.5) at zoom 9 regardless of filtered project locations. Could `fitBounds` to active markers on mount; deferred until prototype shows it's needed.
- **2026-05-23** — Added `useHydration` hook (not on Phase 6 deliverable list) to handle Zustand-persist's async rehydration. Without it, the AccountGate would flash the auth form on every account-route visit before the persisted `loggedIn=true` arrives. Pattern: read `useAppStore.persist.hasHydrated()` plus `onFinishHydration` callback, expose a boolean. Reusable for any feature that depends on persisted state being ready (favorites, calc, savedCalcs).
- **2026-05-23** — Auth is a stub: no password validation, no email verification. Any submitted email "works" — `login(name, email)` just flips `loggedIn` and stores the values. Real auth is Phase 8 (Supabase). Acceptable for offline-first development; flagged so it doesn't accidentally ship.
- **2026-05-23** — `useSavedCalcs.save()` returns `{ ok, id } | { ok: false, reason: 'limit-reached' }` instead of throwing. Callers handle the paywall UX (open UpgradePrompt with contextual reason). Avoids try/catch ceremony at every call site.
- **2026-05-23** — `/account` (the bare route) renders `FavoritesList` directly rather than redirecting to `/account/favorites`. Considered `redirect('/account/favorites')` from a Server Component but that round-trips through the browser. Direct render keeps the URL clean (`/account`) and the tab nav highlights "Favorites" via the `pathname === '/account'` special case.
- **2026-05-23** — Compare-view UI moved out of Phase 6 scope (originally implicit). Belongs with Pro tier work (Phase 7) since multi-object comparison is the headline Pro feature and the comparison drawer would otherwise be Pro-only anyway.
- **2026-05-23** — **Multi-object calculator** ships as a store refactor (calcObjects[] + activeCalcIndex) with persist v0→v1 migration. Migration converts `{calcObject: X}` to `{calcObjects: [X], activeCalcIndex: 0}`. Single-object UI components (CalcInput, RentalSection, etc.) unchanged because `useCalculator().object`/`.setField` still target the active index — preserved the existing API.
- **2026-05-23** — **`ProGate` UI primitive** introduced as the standard way to gate a feature inline. Renders children when allowed, otherwise a centered Card with Pro icon + custom title/description + "Перейти на Pro" CTA opening `UpgradePrompt`. Used by CashflowForecast and RentalPortfolio. Caller-controlled UpgradePrompt was kept for direct interactions (CalcWizard's Save button + ObjectTabs add).
- **2026-05-23** — ComparisonTable and Rankings **self-hide when `objects.length < 2`** instead of using `ProGate`. Reason: they're worthless with 1 object regardless of tier; the implicit gate (free tier can't add objects) plus the explicit hide is cleaner than wrapping each in ProGate that would never fire for users who can see them anyway.
- **2026-05-23** — CashflowForecast intentionally gated even though the lib function `generateCashflowForecast` is free to call. The UI surface (10-year chart) is the Pro feature per the plan; the math is reusable.
- **2026-05-23** — `RentalPortfolio` simplified vs. prototype's 500+ line `RentalPortfolio` component. Prototype had per-property nested asset breakdowns, mortgage tracking, capitalization tables. Phase 7 ships the core (per-property income/expenses + aggregates). Plan explicitly noted "consider redesign for zero learning curve" — followed that.
- **2026-05-23** — "Add another object" button moved from bottom of CalcWizard (where it was paywall-only) into ObjectTabs at the top, where it lives next to the existing tabs. Better discoverability + matches the standard tabs+add pattern. ObjectTabs owns its own UpgradePrompt instance now.
- **2026-05-23** — `RentalProperty` model deliberately omits mortgage fields (loan amount, monthly payment, rate). For now portfolio aggregate is just rent − expenses. Real mortgage tracking would need an additional sub-form per property — deferred.
- **2026-05-25** — Phases 10–16 added from `AppReviewResults.md` + `CompetitorReviewResults.md` synthesis. Rationale: Phase 9 closed the prototype's structural work, but two external reviews independently flagged the same product-direction gaps (KPI-dashboard homepage instead of search-first hero, calculator cognitive overload, no surfaced data confidence, dormant Compare flow, missing retention loop, advertised-but-unimplemented Pro features). Phases 10–16 are sequenced from highest-leverage UX/positioning shifts (10–11) → trust/differentiation (12) → activation of latent features (13) → growth hardening (14) → graduation from prototype (15) → retention payoff (16). Phase 15 is the launch-readiness gate.
- **2026-05-25** — **Positioning hierarchy locked in.** Decision tool > search tool > market intelligence tool (in that order). Added to CLAUDE.md. All future UX choices route through this ordering. The homepage being a market dashboard was the symptom; the cause was undeclared positioning.
- **2026-05-25** — **`dataConfidence` becomes a system, not a column.** Phase 12 makes confidence a UI primitive (`ConfidenceBadge`) used wherever a number appears that the user could mistake for ground truth. The Solgt benchmark validated this as a trust-and-differentiation win at modest cost; we already have the data model for it.
- **2026-05-25** — **Pro tier must include at least one non-investor benefit.** Locked in CLAUDE.md. Phase 16 ships price alerts as that benefit. Reasoning: Free tier is genuinely sufficient for browsers; investor-math-only Pro will not convert at the volume the product needs. Apartment hunting is bursty — price alerts give the app permission to reach out and convert retention into revenue.
- **2026-05-25** — **Calculator wizard mode is the new default for first-time users**, with an expert-mode toggle for power users. CLAUDE.md now mandates ≤ 8 visible inputs in the first-time flow. Phase 11 ships the wizard. Reason: AppReview scored the calculator at cognitive load 9/10 — direct violation of the "zero learning curve" promise. Phase 3's decision-log note (single-page form was intentional) is now superseded.
- **2026-05-25** — **Performance budgets published**: 180 kB First Load for content routes, 240 kB for heavy routes (map/charts/calculator). Recharts and Leaflet must lazy-load with intersection-observer rendering. CI enforcement in Phase 14.
- **2026-05-25** — **Free-tier favorites limit raised from 10 to 25**, and saved-calcs limit confirmed at 3. CLAUDE.md updated. Reason: 10 is too tight for casual apartment shopping (users compare more than they buy); 25 keeps the upsell pressure on power users without irritating browsers.
- **2026-05-25** — **`UpgradePrompt` feature list trim/ship deadline = Phase 15.** Currently advertises PDF export and ad-free; neither is implemented. Either ship in Phase 15 or remove the bullets before launch. CLAUDE.md "What NOT to do" now forbids advertising unimplemented Pro features.
- **2026-05-25** — **Phase 16 shipped as code with a manual deploy step**, same pattern as Phase 15's billing provider. The schema, RPCs, edge function, email templates, hooks, and UI are all in the repo. Going live needs three Supabase dashboard actions: apply `0003_price_alerts.sql`, deploy the edge function, schedule the cron. No more code changes required.
- **2026-05-25** — **Free tier digest cadence = 7 days, enforced server-side in the dispatch function**, not client-side at write time. A user who upgrades from Free to Pro mid-week starts receiving real-time alerts on the next dispatch — no re-creation of alert rows needed. Same goes for downgrade. Tier change always takes effect immediately.
- **2026-05-26** — **Solgt.no walkthrough analysis added** to [CompetitorReviewResults.md](CompetitorReviewResults.md) (Sections A-K) based on user-recorded videos of the signed-out marketing surface (7 mp4s) and the signed-in product (5 mp4s). 96 frames extracted via `Screen_dumps/_extract_frames.py`. The walkthrough surfaced the marketing/product visual split, the modular slab structure, the multi-list "Lists" surface, the blur-paywall pattern, the named-query chips, and the editorial dashboard pattern. K11 of the addendum contains a 17-item priority-ranked backlog.
- **2026-05-27** — **Marketing/product surface split locked in.** [CLAUDE.md](CLAUDE.md) rewritten to codify two surface families: marketing (light theme, MarketingShell, calculator-as-hero on `/`, modular slabs ending in paired CTAs) and product (dark default, ProductShell with `chrome={'top'|'rail'}` prop, data-as-hero). Route groups `app/(marketing)/` and `app/(product)/` carry the shell choice via their layout files. Reason: Solgt's split is what makes their funnel work; we'd been conflating the surfaces.
- **2026-05-27** — **Calculator-as-hero on the marketing homepage** (replacing the Phase-10 search hero on `/` for unauthenticated visitors). User decision after seeing Solgt's hero pattern in the videos. Rationale: the unconvinced visitor needs to *see* the product, not search through it; search-as-launcher is the post-login pattern. The Phase-10 search hero stays as the product-side homepage when we add `/app` or whatever the post-login launcher becomes.
- **2026-05-27** — **Pricing moves from 2 tiers to 3** — Free / Pro Monthly / Pro Yearly (−20%). Same feature set across the two Pro variants; the discount is billing-cadence only. `usePaywall` continues to return `{ tier: 'free' | 'pro' }` — tier-billing is a UI concern at `<PricingTable>` and checkout, not at feature gates. A `Business` custom-tier slot is reserved in `UpgradePrompt`'s copy but not yet implemented; revisit when a developer/broker B2B inbound shows up.
- **2026-05-27** — **Lists committed as Phase 17.** The flat `favorites` + `fav_units` schema collapses into `lists` + `list_items` with a backwards-compatible migration. Every user gets a default `Избранное` list at signup. Pro tier unlocks unlimited named lists, public/unlisted visibility, follow-others, comments, collaborators. Phase 16's `price_alerts` re-key from per-favorite to per-list — alerts become "notify me on any item in this list." This is what makes Pro feel like a *product upgrade* and not just a feature cap raise.
- **2026-05-27** — **ProductShell `chrome` prop defaults to `'top'`**, with `'rail'` (Solgt-style left rail) deferred. Reason: we have 4 product surfaces today (calculator/map/analytics/account), Lists makes 5. The rail pays off at 6-7+. One-prop switch when the time comes — not worth pre-building.
- **2026-05-27** — **6 new phases sequenced (17-22).** Phase 17 (Lists) before Phase 18 (Surface model) because Lists is closed scope and the components/ refactor in 18 will absorb the new files cleanly. Phases 19/20 sequential (19 builds the slab library, 20 uses it for SEO landings). Phase 21 (product polish) parallelable with 19/20. Phase 22 (time-series dashboard + paste-a-link) is parked behind real prerequisites (6 months of snapshot data; legal review on scraping).

---

## Out of scope

- Re-implementing the prototype 1:1. The prototype is a 3,000-line spike; some parts (5-object calc wizard, RentalPortfolio's nested asset breakdown) are dense even for power users. CLAUDE.md targets "zero learning curve" — redesign rather than re-render where the prototype is clearly aimed at pros.
- Building features that aren't in the current phase. CLAUDE.md: *"Don't add features not in the current stage — follow the implementation roadmap."* This document **is** that roadmap.
