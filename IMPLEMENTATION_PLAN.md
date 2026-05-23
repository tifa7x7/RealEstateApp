# CrimeaDevTracker — Implementation Plan

> **Living document.** Check this before starting any implementation task. Update the status table and phase checklists as work completes.

**Last updated:** 2026-05-23 (Phase 9 complete)

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
- [x] **One-time localStorage → Supabase migration** — `src/hooks/useSupabaseUserDataSync.ts` runs on the first authenticated session per device, imports any local favorites/saved-calcs/portfolio rows into Supabase, then hydrates the store from Supabase (now the source of truth). Migration is gated by a per-user `crimea-dev-tracker:migrated:{userId}` localStorage flag. Mounted globally via `src/components/providers/SupabaseSync.tsx` in the layout.
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

---

## Out of scope

- Re-implementing the prototype 1:1. The prototype is a 3,000-line spike; some parts (5-object calc wizard, RentalPortfolio's nested asset breakdown) are dense even for power users. CLAUDE.md targets "zero learning curve" — redesign rather than re-render where the prototype is clearly aimed at pros.
- Building features that aren't in the current phase. CLAUDE.md: *"Don't add features not in the current stage — follow the implementation roadmap."* This document **is** that roadmap.
