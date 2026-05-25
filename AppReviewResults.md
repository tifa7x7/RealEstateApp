# RealEstateApp — Comprehensive Review

## State of the build (one paragraph)

You've shipped Phases 0–9 of a credible Next.js 15 + Supabase prototype: 18 seeded projects with units, real Postgres schema + RLS, filtered listings with URL-as-state, project detail pages, a multi-object investment calculator with mortgage / matkapital / rental / exit toggles, 5 analytics charts, Leaflet map, account/favorites, paywall scaffolding, full SEO/manifest/sitemap/robots, error+loading boundaries per segment, i18n (RU/EN) with locale toggle, and a clean lib/ ↔ ui/ ↔ feature/ separation that's actually respected throughout the codebase. The architecture is sound — most of what's left to do is product polish, paywall conversion, and turning "Bloomberg" data density into something that doesn't intimidate a 32-year-old first-time buyer.

---

## Section 1 — First Impressions Audit

Pretending I'm Anna, 32, looking for a 1-bedroom in Yalta:

**5-second test.** I land on [/](src/app/page.tsx#L12). I see a dark sticky header with a small search box and 4 KPI cards. I see filter pills on the left and project cards on the right. I have no idea what the brand promises. There's an `sr-only` h1 ([src/app/page.tsx:15](src/app/page.tsx#L15)) — so the page literally has no visible headline. **The product's value proposition is invisible in the first second.**

**Cognitive load (1–10).**
- Homepage: **5/10**. KPIs are abstract ("found / units / avg / avg sea"). I came to find an apartment, not a market report.
- [/calculator](src/app/calculator/page.tsx): **9/10**. Even with most sections toggled off, [CalcWizard.tsx](src/components/calculator/CalcWizard.tsx) shows Object info (5 fields), Costs (7 ruble inputs at lines 215–274), then 4 toggle cards. The result panel is a 5-card column. This is "Bloomberg." It is not "zero learning curve."
- [/analytics](src/app/analytics/page.tsx): **8/10**. Five chart types, no explainer. ValueQuadrantChart, PriceHeatmap, AmenityImpactChart — analyst-grade visuals shown without context.
- [/map](src/app/map/page.tsx): **3/10**. Best screen.
- [/projects/[id]](src/app/projects/[id]/page.tsx): **4/10**. Clean. The Gallery and Location tabs are placeholders though ([page.tsx:69-99](src/app/projects/[id]/page.tsx#L69-L99)).

**Tap count to core tasks (current → target):**
- Find a 1K in Yalta under 8M ₽: homepage → city pill → class pill → price slider → click card. **4 taps, ~10 seconds.** This is good.
- Run an investment analysis on that apartment: open project → Apartments tab → unit → "Рассчитать" → calculator opens with prefill ([CalcUrlBootstrap.tsx](src/components/calculator/CalcUrlBootstrap.tsx)). **4 taps, ~30 seconds**, but you then face 30+ visible/toggleable fields. The unit-to-calculator handoff is good; the calculator itself isn't.

**Visual noise to remove (homepage):**
- The 4 KPI cards in their current form duplicate information the filter panel already conveys. Either turn them into a single "X projects · Y available units · from ₽Z" sentence, or hide them behind a "Market context" expander.
- "Сохранено" badge logic in CalcWizard ([CalcWizard.tsx:139-144](src/components/calculator/CalcWizard.tsx#L139-L144)) — the variant-swap "ghost when saved" is clever but creates a UI flicker. A toast would be cleaner and reusable; you already have [Toast.tsx](src/components/ui/Toast.tsx).
- The header carries: logo, search box (max-w-xl flex-1), locale toggle, theme toggle, settings link, account link ([Header.tsx:97-142](src/components/layout/Header.tsx#L97-L142)). At <420px the search box collapses to almost nothing. **Move settings into account dropdown.**

**Emotional tone.** Trustworthy and serious — yes. Premium — no. Calm — barely (filter panel is dense). The dark palette + monospace numbers + Playfair display read "fintech research terminal," which is what CLAUDE.md asked for. But for a consumer apartment-search app, you currently lean 80% Bloomberg / 20% iOS. The target is the inverse.

---

## Section 2 — Design System & Visual Identity

**What's good and locked in:**
- One source of truth for color in [globals.css](src/styles/globals.css) via CSS custom properties. Dark/light forks are clean.
- Two-font stack (Playfair Display + DM Sans) via `next/font/google` ([layout.tsx:16-26](src/app/layout.tsx#L16-L26)) — proper SSR, no FOUT.
- `tabular-nums` everywhere a number lives (search ProjectCard line 71, KPIDashboard line 27). Numbers don't jitter on hover.
- Anti-FOUC theme hydration script in head ([layout.tsx:36](src/app/layout.tsx#L36)) — correct.
- Components/ui/ primitives are domain-free, accept `className`, use `forwardRef` ([Card.tsx](src/components/ui/Card.tsx), [Button.tsx](src/components/ui/Button.tsx)).

**Typography hierarchy.** You declare a 6-step scale (11/12/14/15/18/22 px) in CLAUDE.md. In practice the calculator's results header uses 26px ([CalcResultsSummary.tsx:36](src/components/calculator/CalcResultsSummary.tsx#L36)), analytics title uses 28px ([analytics/page.tsx:21](src/app/analytics/page.tsx#L21)), project hero uses 28px ([ProjectHero.tsx:38](src/components/projects/ProjectHero.tsx#L38)). **You're already at 8 sizes. Either extend the scale officially (11/12/14/15/18/22/26/28) or normalize.**

**Color palette.** Six brand tokens (`--accent`, `--secondary`, `--warning`, `--premium`, `--danger`, plus `--accent-surface`). The `STATUS_COLORS` and `CLASS_COLORS` maps in [constants.ts:64-76](src/lib/constants.ts#L64-L76) hardcode hex (`#3b82f6`, `#a855f7`...) outside the CSS variable system. CLAUDE.md says "never hardcode color hex values." These colors should map to the existing tokens — `STATUS_COLORS['Сдан'] = 'var(--accent)'`, etc. — or be added as semantic tokens like `--status-construction`, `--status-projected`.

**Proposed palette refinement (max 5 brand colors + neutrals):**
```
--accent:    #00d4aa (teal)        — primary actions, success, positive metrics
--info:      #3b82f6 (blue)        — links, "Projected", "Comfort class"
--warning:   #f59e0b (amber)       — "Under construction", caution
--premium:   #a855f7 (purple)      — Pro features, "Premium class"
--danger:    #ef4444 (red)         — errors, sold, negative cashflow
```
You already have these; just stop bypassing them.

**Spacing.** CLAUDE.md mandates 4px grid; codebase mostly honors it. One outlier: `py-2.5` in [Header.tsx:99](src/components/layout/Header.tsx#L99) (10px) and Button's `lg` size ([Button.tsx:25](src/components/ui/Button.tsx#L25)). Not violations, just creep — flag if it spreads.

**Component library audit.** Generic primitives: Button (4 variants × 3 sizes), Card, Badge, Input, Modal, Toast, Skeleton, EmptyState, DualRangeSlider, ErrorBoundary, ProGate, UpgradePrompt. That's a solid minimal set. Two missing:
- **Tooltip primitive.** [CalcInput.tsx](src/components/calculator/CalcInput.tsx) and the calculator's marketRate field ([CalcWizard.tsx:327](src/components/calculator/CalcWizard.tsx#L327)) use a `tooltip` string prop with what appears to be ad-hoc rendering. A real Tooltip component (with Popper/Floating UI positioning) would standardize this.
- **Drawer / Sheet primitive.** The mobile filter button currently opens a centered Modal ([Decision log 2026-05-23](IMPLEMENTATION_PLAN.md)). A bottom sheet is the iOS-native pattern.

**Motion.** Currently only `transition-colors` everywhere. Should add:
- Favorite heart fill animation (40ms ease-out scale-then-fill)
- Modal open: 150ms fade + translate
- Skeleton → content cross-fade (you have skeletons but they snap)

**Dark mode readiness.** Built in. The one limitation is documented at [IMPLEMENTATION_PLAN.md Phase 4 carry-over](IMPLEMENTATION_PLAN.md): Recharts SVG `fill` attribute won't interpolate CSS variables, so charts use hardcoded dark-theme hex (`#1f2937`, `#8893a7` in [CashflowForecast.tsx:23-24](src/components/calculator/CashflowForecast.tsx#L23-L24)). In light theme axis text becomes too pale. The proper fix is to read `getComputedStyle(document.documentElement).getPropertyValue('--text-muted')` inside a `useTheme()`-aware chart wrapper.

**Bloomberg-meets-iOS score: 6/10 today.** What gets you to 9:
1. Replace the four homepage KPI cards with a single hero block: a one-sentence value-prop in Playfair (24px) + a soft photo or rendered isometric map illustration + a single big search input. Move KPIs into a collapsible "Market snapshot" strip below the fold.
2. Replace project-card badges-only with a 16:9 image area (placeholder gradient if no asset). Real estate without images feels like a CSV.
3. Stop showing all 30+ calculator fields in one scroll. Wizard the first-time experience: "Цена → Ипотека? Y/N → Сдавать в аренду? Y/N → Результат." Power users see all sections via a "Все параметры" toggle.
4. Adopt iOS spring easing (`cubic-bezier(0.25, 0.1, 0.25, 1)`) for all transitions ≥ 100ms.
5. Add a 4px-radius elevation primitive — a subtle shadow on cards in light theme (currently border-only). Dark theme is fine without.

---

## Section 3 — Information Architecture & User Flows

**Current sitemap:**
```
/                        Browse + filters
/projects/[id]           Project detail (About / Apartments / Gallery / Location tabs)
/projects/[id]/units/[unitId]  Unit detail
/calculator              Calculator + Pro features
/analytics               5 charts
/map                     Leaflet map
/account                 Tabs: Favorites / Saved / Settings / Portfolio
/account/portfolio       Portfolio (Pro)
```

**Issues:**
- The header tabs ([Header.tsx:90-95](src/components/layout/Header.tsx#L90-L95)) are: Table (which is actually `/`, labeled "table"), Analytics, Map, Calculator. Naming the homepage tab "Table" leaks an implementation detail. Call it "Search" or "Projects."
- MobileNav ([MobileNav.tsx:30-36](src/components/layout/MobileNav.tsx#L30-L36)) has 5 tabs including Account. Adequate, though "Аналитика" + "Калькулятор" + "Карта" + "Поиск" + "Аккаунт" is 5 cognitively distinct destinations — at the upper end of mobile bottom-nav capacity.
- The Compare button on [ProjectHero.tsx:64](src/components/projects/ProjectHero.tsx#L64) toggles `compareIds` in the store, but there is no /compare route or comparison drawer. Toggling does nothing visible to the user beyond the button state. **This is the single most user-confusing artifact in the build.** Either ship a comparison drawer (button at bottom right showing "Сравнить (3)") or remove the button.
- The four account routes (/account, /favorites, /saved, /settings, /portfolio) are static aliases for the same gated layout. `/account` itself renders FavoritesList directly ([AccountGate.tsx](src/components/account/AccountGate.tsx) + [account/page.tsx](src/app/account/page.tsx)). Fine, but the tab nav's special-cased treatment of pathname === '/account' as "Favorites" ([Decision log entry](IMPLEMENTATION_PLAN.md)) is a smell — collapse to one canonical route, not three.

**Happy path: search → contact.** Currently: Home → filter → card → tab "Apartments" → unit → favorite. There is **no contact / lead-capture / inquiry flow at all.** The product can't yet do the most fundamental thing apartment-search apps do: hand the user off to the developer or schedule a viewing. This is the biggest product gap.

**Happy path: analysis → action.** Calculator runs; output is on screen. There's no "Save & share", no "compare this unit to others I'm viewing," no "send to advisor." `useSavedCalcs.save()` puts it into localStorage (or Supabase) and the user moves on. After running the math, what does the app want them to do next?

**Progressive disclosure issues:**
- All 7 cost inputs visible by default in calculator's "Cost" card ([CalcWizard.tsx:215-274](src/components/calculator/CalcWizard.tsx#L215-L274)). Show price + parking by default; collapse storage/renovation/duty/realtor/other into "Дополнительные расходы".
- All amenities listed in [ProjectAmenities.tsx](src/components/projects/ProjectAmenities.tsx). If a project has 20 amenities, show 8 and collapse.
- FilterPanel ([FilterPanel.tsx](src/components/projects/FilterPanel.tsx)) shows region, all cities, all statuses, all classes, price range, sea range. Six filter groups visible at once on desktop. Reorder by user value: city → price → status (project stage) → class as primary; sea-distance + class as "Advanced filters" expandable.

**Empty states.** Solid — [EmptyState.tsx](src/components/ui/EmptyState.tsx) is generic and called from ProjectListings, RentalPortfolio, SavedCalcsList. **What's missing:** a first-run onboarding overlay. A new user landing on `/` sees results immediately but has no signal that they can filter, favorite, run analyses, or compare. A single tooltip-coachmark sequence on first visit (set a localStorage flag) would do it.

**Search/filter UX:**
- Search input lives in the global header and posts to `/?q=...` ([Header.tsx:67-74](src/components/layout/Header.tsx#L67-L74)). It only searches **name + city + district + developer** (via [filterProjects](src/lib/filters.ts)). No fuzzy match, no synonyms, no Cyrillic-fold (typing "ялта" lowercase still works because `.toLowerCase()` matches "Ялта"). Acceptable but unforgiving.
- The "sort" parameter is in URL, sort-arrows in [ProjectTable.tsx:74-100](src/components/projects/ProjectTable.tsx#L74-L100) — good. But on mobile cards (no table header), there's no sort UI at all. Add a `<Select>` "Сортировка: цена ↑" above the card list on mobile.

---

## Section 4 — Freemium & Monetization Architecture

**Current paywall surface** (from [usePaywall.ts](src/hooks/usePaywall.ts) + [UpgradePrompt.tsx](src/components/ui/UpgradePrompt.tsx) defaults):
- Compare ≤5 objects with rankings (Pro)
- 10-year cashflow forecast (Pro)
- Rental portfolio (Pro)
- PDF/Excel export (Pro — advertised in [UpgradePrompt.tsx:17-23](src/components/ui/UpgradePrompt.tsx#L17-L23) but **not implemented anywhere**)
- No ads (Pro — advertising is **not implemented anywhere**)
- Saved calcs limit: 1 free, ∞ Pro ([useSavedCalcs.ts](src/hooks/useSavedCalcs.ts))
- Multi-object calc: 1 free, up to 5 Pro ([app-store.ts:71](src/store/app-store.ts#L71))
- Favorites: capped at 10 in CLAUDE.md but **not actually enforced** in [toggleFavorite](src/store/app-store.ts#L139-L144). Code review finding.

**Two of the four advertised Pro benefits don't exist in code** (exports, ad-free). Either build them or remove from the upgrade prompt — selling vapor erodes trust fast.

**Proposed paywall sit:**
| Capability | Free | Pro |
|---|---|---|
| Browse projects | ∞ | ∞ |
| Favorites | 25 | ∞ |
| Calculator (single object) | ✓ | ✓ |
| Multi-object compare | ✗ (preview blurred) | up to 10 |
| 10-yr forecast | ✗ | ✓ |
| Portfolio tracker | up to 1 property | ∞ |
| Saved calcs | 3 | ∞ |
| Export PDF | ✗ | ✓ |
| Ads | shown | hidden |
| Price alerts on saved units | ✗ | ✓ ← *killer Pro feature you don't have yet* |

**Conversion logic:** Free user uses the basic calculator → saves a calc → tries to save a 2nd → upsell. Lands on a unit → toggles favorite → tries to add an 11th → upsell. Wants to compare two projects → upsell. **Price alerts on favorited units would be the strongest retention loop** — it gives the app permission to email the user weekly and is a real benefit, not a software gate.

**Ad strategy** (you have zero ads now — fine for pre-launch, but plan it):
- **OK:** native cards interleaved every 8 projects in [ProjectListings](src/components/projects/ProjectListings.tsx#L32) on mobile.
- **OK:** house-style "Featured developer" banner above filter panel.
- **NEVER on:** calculator results, analytics charts, account pages, project-detail Apartments tab. These are conversion-critical.

**Upgrade nudge moments:**
1. After user saves their first calc successfully — small inline "Save unlimited calcs and compare → Pro" strip in the saved-calcs list (not modal).
2. When user favorites their 6th project — a `Toast` saying "Tip: Pro users get price-drop alerts on favorites" with a "Learn more" link. Once per session.
3. After 3 minutes of session time on /analytics — inline card between charts: "Compare what you're seeing across regions with Pro."

**Pricing tier sketch:**
- **Free** — full search, basic calc, 25 favorites, 3 saved calcs, ads.
- **Pro — ₽490/mo or ₽3,990/yr** — everything unlocked, price alerts, ad-free.
- **(later) Pro+ — ₽1,490/mo** — Telegram alerts, comparative report PDFs, early access to new regions.

Russian SaaS pricing convention is monthly + annual with ~33% annual discount. Test both gates.

**Top 3 churn risks:**
1. **No reason to come back daily.** Apartment hunting is bursty: a user comes 10 times in a week, then disappears for months. → Build the price-alert email/Telegram loop so the *app* reaches *out*, not the other way.
2. **Only Crimea coverage.** A user from Moscow tries the app, sees the region dropdown ([FilterPanel.tsx:117-122](src/components/projects/FilterPanel.tsx#L117-L122)) with everything except Crimea labeled "(coming soon)", and leaves forever. → Either hide non-implemented regions or do a basic "waitlist for Moscow" capture.
3. **The Free tier is genuinely enough for most users.** Free = search + browse + favorites + basic calc. That's the entire apartment-search use case. Investors are the upgrade segment but they're a small slice of "everyday apartment seekers." → Make Pro irresistible for *non-investor users too*: price alerts, off-plan completion alerts, "we found 3 new projects matching your search" weekly digest. Otherwise Pro will only convert investors.

---

## Section 5 — Frontend Architecture & Performance

**Stack assessment.** Next 15 App Router + React 19 + TS strict + Tailwind v4 + Zustand + React Query + Supabase + Recharts + Leaflet. This is a defensible 2026 stack. Recharts is the heaviest dependency at ~180kB gzipped and dominates the analytics bundle ([Phase 4 Verified: 123kB / 239kB First Load](IMPLEMENTATION_PLAN.md)).

**Performance flags:**

1. **`src/data/projects.ts` ships to every client.** It's 170 lines of seed data imported by [KPIDashboard](src/components/projects/KPIDashboard.tsx#L5), [FilterPanel](src/components/projects/FilterPanel.tsx#L7), [useProjects](src/hooks/useProjects.ts#L6) (as React Query `initialData`), [app-store](src/store/app-store.ts#L3) for `prefillCalcFromUnit`, and [useFavorites](src/hooks/useFavorites.ts) for project lookup. Even after Supabase is wired up in prod, the seed remains in the client bundle. Drop it as soon as a Supabase project exists (this is already a Phase-8 carry-over) — wire `useFavorites` to React Query's projects cache, and replace `prefillCalcFromUnit` with a fetch.

2. **`/calculator` First Load 309 kB.** Recharts pulled in for the forecast chart, Supabase + React Query for save. Lazy-load `CashflowForecast` via `next/dynamic({ ssr: false })`. It's gated behind toggles so users who don't enable rental/exit never need the chart code.

3. **`/analytics` 251 kB.** Five charts in one page, all Recharts. Move them to per-chart dynamic imports + intersection-observer "render when scrolled into view." Right now the user pays the full chart bundle even if they only look at the first one.

4. **`dynamic = 'force-dynamic'` on project pages** ([projects/[id]/page.tsx:25](src/app/projects/[id]/page.tsx#L25)) means every request hits Supabase. No caching. At scale, add `revalidate: 600` (10-minute ISR) or use Next's `unstable_cache` keyed by project id. The note in the file (Windows worker exhaustion) is a build-time concern — runtime caching is independent. **This is the single highest-leverage perf change before launch.**

5. **`next.config.ts` sets `experimental.cpus: 1`** ([Phase 8 decision log](IMPLEMENTATION_PLAN.md)) as a Windows workaround. Fine for local; on Linux CI this kneecaps build parallelism. Wrap in an OS check: `cpus: process.platform === 'win32' ? 1 : undefined`.

6. **No virtualization on listings.** [ProjectListings](src/components/projects/ProjectListings.tsx#L30-L41) renders all projects. At 18, fine. At 1000+ ("tens of thousands of users" implies a much larger catalog), use `@tanstack/react-virtual` for the table and a windowed grid for the cards.

7. **Map renders all markers at once** ([ProjectMap.tsx:59-65](src/components/map/ProjectMap.tsx#L59-L65)). At 18 markers, fine. At 1k+, add `react-leaflet-cluster` (already a documented carry-over).

8. **Theme init script runs `dangerouslySetInnerHTML`** ([layout.tsx:46](src/app/layout.tsx#L46)). Acceptable (it's static and reads only localStorage + matchMedia), but it's CSP-unfriendly. Plan a `nonce`-based variant when you add a CSP header.

**Mobile responsiveness (375/390/428):**
- Header at 375px: logo "RealEstateApp" + search + 3 icon buttons. Search box becomes ~150px wide, tight but usable.
- Calculator at 375px: input grid is `sm:grid-cols-2` → collapses to 1 column on mobile. Many many scrolls. **The results panel becomes `lg:sticky` only at lg+** ([CalcWizard.tsx:382-386](src/components/calculator/CalcWizard.tsx#L382-L386)) so on mobile it sits at the bottom of a very long scroll. Consider a floating "View results" pill at bottom that opens results in a sheet.
- ProjectTable on mobile is hidden (correct), card grid takes over.
- Analytics charts at 375px: width OK, but PriceHeatmap is a CSS grid of city × class cells — at narrow widths cells become tiny.

**Accessibility (WCAG 2.1 AA):**
- Skip-link present ([layout.tsx:49-54](src/app/layout.tsx#L49-L54)) ✓
- All icon-only buttons have `aria-label` (verified across Header, ProjectCard, ProjectHero, UnitActions). ✓
- Visible focus rings everywhere (`focus-visible:ring-2 focus-visible:ring-[var(--accent)]`). ✓
- Tabs use `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `tabIndex={active ? 0 : -1}` ([ProjectTabs.tsx:50-79](src/components/projects/ProjectTabs.tsx#L50-L79)). ✓
- `aria-pressed` on toggle buttons (favorites, compare). ✓
- Tables: `scope="col"`, `aria-sort` ([ProjectTable.tsx:69, 77-83](src/components/projects/ProjectTable.tsx#L69)). ✓

**A11y gaps:**
- Toggle switches in CalcWizard use `role="switch"` + `aria-checked` ([CalcWizard.tsx:42-43](src/components/calculator/CalcWizard.tsx#L42-L43)) — correct, but `aria-label` is the toggle title which may be read awkwardly. Consider `aria-labelledby` pointing to the section title.
- Custom Leaflet markers ([ProjectMap.tsx:21-29](src/components/map/ProjectMap.tsx#L21-L29)) have no `aria-label` or alt text. Screen readers will hear nothing on the map.
- Contrast: `--text-muted: #5a6478` on `--bg-card: #131722` is ~5.1:1 — passes AA for body but is at the floor. Light theme `#718096` on `#f7f9fc` is ~4.7:1, also borderline. Verify with a contrast tool before launch.
- Form inputs in [AuthForm](src/components/account/AuthForm.tsx) and [CalcInput](src/components/calculator/CalcInput.tsx) — `Input.tsx` (not read but inferred from props) handles `label`. Spot-check that labels associate via `<label htmlFor>` or wrapping, not just visual text.

**SEO readiness.**
- [seo.ts](src/lib/seo.ts) centralizes OG + Twitter + canonical. ✓
- Sitemap + robots in place ([Phase 9](IMPLEMENTATION_PLAN.md)). ✓
- Project detail pages emit `og:type: article` with developer/city in the title. ✓
- **Two SEO gaps:** (1) No `og:image` anywhere ([seo.ts:42-50](src/lib/seo.ts#L42-L50)) — Telegram/WhatsApp link previews will look bare. Generate a per-route OG image via `app/[route]/opengraph-image.tsx`. (2) Project pages are `force-dynamic` — Googlebot will see them but ISR-cached pages crawl faster. Switch to `revalidate: 3600` once Supabase is wired.

**Core Web Vitals estimate (untested, structural):**
- LCP: Homepage = KPI numbers (text). Should be <1.5s on 4G. **At risk if you add project images** without `next/image` + priority hint.
- INP: Filter changes write to URL via `router.push` ([useFilters.ts:25](src/hooks/useFilters.ts#L25)) → triggers full re-render. Should be <200ms with 18 projects; verify at 500+.
- CLS: Skeletons in place for all major sections (Phase 9). Low risk. ✓

---

## Section 6 — Backend, Data & Scalability

**Schema** ([supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)) is well-thought-out:
- Composite PK on `units(project_id, id)` — correct (unit ids are project-scoped).
- Foreign keys on `fav_units` reference the composite — keeps it consistent.
- `auth.users` → `profiles` insert trigger ([handle_new_user](supabase/migrations/0001_init.sql#L176-L188)) is the right pattern.
- RLS: public read on projects/units, per-user read+write on user-owned tables ([lines 193-237](supabase/migrations/0001_init.sql#L193-L237)). Correct.
- `saved_calculations.objects jsonb` — flexible, no server-side validation.

**Backend issues:**

1. **No full-text search.** Search currently goes client-side through all loaded projects via `filterProjects`. At 1k+ projects this won't scale and won't fuzzy-match. Add a `tsvector` column + `GIN` index + a `search_projects(query text)` Postgres RPC. Russian text needs `to_tsvector('russian', ...)`.

2. **`saved_calculations.objects` has no schema constraint.** Any malformed `CalcObject` can land in the DB. Either define a Postgres CHECK that validates the JSON structure, or validate server-side via a Supabase Edge Function before insert. Trust client-side validation only at your peril.

3. **No rate limiting on /api/projects.** ([projects/route.ts](src/app/api/projects/route.ts)). At launch, throw `@upstash/ratelimit` or Vercel's edge middleware in front. Even read endpoints should be capped.

4. **Two sources of truth for `tier`.** `profiles.tier` exists in schema but [app-store currentTier](src/store/app-store.ts#L127) is a separate persisted client-side toggle, and the SettingsForm lets the user flip it ([Phase 6 decision log](IMPLEMENTATION_PLAN.md)). On launch this needs to be tightened: server is canonical, store mirrors. Otherwise a user can self-promote to Pro by flipping the toggle in DevTools.

5. **`useFavorites` resolves project IDs against the bundled `PROJECTS` array** ([Phase 8 decision log](IMPLEMENTATION_PLAN.md)), not against React Query'd Supabase data. If the user favorites project ID 7 and ID 7 only exists in Supabase (not in the seed), it'll render as missing. Bug, but quiet.

6. **`useSupabaseUserDataSync.ts`** mutates the store via `useAppStore.setState({...})` from inside the effect ([line 89-94](src/hooks/useSupabaseUserDataSync.ts#L89-L94)). On a slow connection a user can favorite a project locally, then have it overwritten when Supabase responds. Use a "merge, don't replace" strategy or set a "syncing" flag that disables writes until hydrated.

7. **No service-role admin endpoints.** ([Phase 8 carry-over](IMPLEMENTATION_PLAN.md)). Fine for launch; you'll need them for moderation and data ops.

8. **No audit log / soft delete.** A user can delete a saved calc with no recovery. For a financial tool this is genuinely fine, but if you ever offer "advisor mode" or B2B, expect to add soft delete.

**Security:**
- RLS is the security model. Correct.
- Stub-mode auth ([useAuth.ts:78-83](src/hooks/useAuth.ts#L78-L83)) accepts any email and flips `loggedIn=true`. **This must not ship.** Add a build-time assert: `if (!isSupabaseConfigured() && process.env.NODE_ENV === 'production') throw new Error(...)`.
- No CSP headers. Add via `next.config.ts` headers().
- `dangerouslySetInnerHTML` only used for the theme init script ([layout.tsx:46](src/app/layout.tsx#L46)) — content is static, safe, but CSP work needs to account for it (nonce).
- AuthForm password field has no client-side strength check. Supabase enforces minimum length but the user gets no feedback before submit.

**Caching strategy proposal:**
- **CDN/edge:** `/`, `/analytics`, `/map`, `/calculator` — full HTML cacheable for 60s for anonymous users; revalidate-on-tag for authenticated.
- **Server (Next):** `unstable_cache` on `fetchProjects(client)` keyed by `['projects', filters-hash]`, TTL 5 min. Invalidate on project mutation via `revalidateTag('projects')`.
- **Client (React Query):** 5-min `staleTime` on projects, already set ([useProjects.ts:92](src/hooks/useProjects.ts#L92)). ✓
- **User data:** no cache; always fresh from Supabase via RLS-protected direct queries.

---

## Section 7 — Prioritized Action Plan

| # | Priority | Change | Category | Effort | Impact | Why now |
|---|---|---|---|---|---|---|
| 1 | **Launch Blocker** | Remove or build the Compare button (toggle currently does nothing visible) | UX | M | 8 | Single most confusing artifact |
| 2 | **Launch Blocker** | Lock down stub auth in prod (`isSupabaseConfigured()` assert at boot) | Security | S | 10 | Shipping anonymous-as-any-user is unacceptable |
| 3 | **Launch Blocker** | Tier server-side; remove user-facing tier toggle from Settings | Security | S | 9 | Current toggle = "self-upgrade to Pro" exploit |
| 4 | **Launch Blocker** | Either build PDF export + ad-free or remove from UpgradePrompt features list | Trust | S | 7 | Selling features that don't exist |
| 5 | **Launch Blocker** | Add contact / lead-capture on project detail (phone, form, "request callback") | Product | M | 10 | Core apartment-search action missing |
| 6 | **Launch Blocker** | Hide "(coming soon)" non-Crimea regions or add a waitlist capture | Product | S | 7 | First-impression dead-end for non-Crimea users |
| 7 | **Launch Blocker** | Enforce favorites limit on free tier (CLAUDE.md says 10; not enforced in store) | Paywall | S | 6 | Documented gate that isn't actually gated |
| 8 | **Launch Blocker** | Real OG image generation per route (`app/opengraph-image.tsx`) | SEO/Growth | M | 7 | Telegram/WhatsApp shares are the primary organic loop in RU |
| 9 | **Week 1** | Replace homepage KPI strip with hero (value-prop + big search) | UX | M | 9 | Today's homepage doesn't tell users what the app is |
| 10 | **Week 1** | Wizard the first-time calculator experience (3-step → expert-mode toggle) | UX | L | 9 | "Zero learning curve" failure point |
| 11 | **Week 1** | Add project image area (placeholder/gradient → real CDN images later) | UX | M | 8 | Real estate without images = CSV |
| 12 | **Week 1** | Lazy-load Recharts on /analytics + /calculator (intersection observer) | Perf | S | 7 | Drops 60–80kB First Load on both pages |
| 13 | **Week 1** | Switch project detail to `revalidate: 600` instead of force-dynamic | Perf | S | 8 | Free 5–10× perf win for the highest-traffic route |
| 14 | **Week 1** | Move STATUS_COLORS/CLASS_COLORS into CSS variables; stop hex in components | Design | S | 5 | Cleans up theme & light-mode chart bug too |
| 15 | **Month 1** | Toast-based "saved" confirmations (replace inline button variant swap) | UX | S | 5 | Consistency; reuses existing primitive |
| 16 | **Month 1** | Full-text search via `tsvector` + Russian dictionary | Backend | M | 8 | Current `String.includes` scales to ~500 projects |
| 17 | **Month 1** | Price-alert email/Telegram subscription on favorited units | Product | L | 10 | Strongest retention loop the app could have |
| 18 | **Month 1** | Add Compare drawer (multi-object project comparison) | Product/Pro | M | 7 | Activates the existing `compareIds` store; Pro feature |
| 19 | **Month 1** | Rate limiting on all `/api/*` routes | Security | S | 6 | Free is a launch DoS magnet |
| 20 | **Quarter 1** | Expand beyond Crimea — Moscow, Sochi, Krasnodar | Product | XL | 10 | TAM constraint; rest of plan compounds with it |

---

## Executive summary

**Biggest strength:** The architecture is rare for a prototype — `lib/` is genuinely pure, the Zustand store is disciplined with a documented migration, URL-is-state is honored, Supabase + RLS is set up correctly, and a clean offline-first fallback means you can demo and develop without a backend. The phase-by-phase plan was followed and the decision log is honest about trade-offs. This is a codebase you can grow on.

**Biggest risk:** The product is currently a research terminal, not an apartment app. It can't capture leads, has no images, dumps a 30-field calculator on a first-time user, and its paywall sells features that don't exist (PDF export, ad-free). It targets "everyday apartment seekers" but the UI defaults to investor-density on every screen. Before launch, the experience needs an aspirational homepage, a wizardized first-time calculator, project images, a contact/lead action, and one or two Pro features that *non-investors* would actually pay for (price alerts being the obvious candidate). Ship the structural Launch Blockers first; the rest of the prototype is genuinely strong scaffolding for them to sit on.
