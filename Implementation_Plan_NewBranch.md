# Implementation Plan 2.0 — Solgt.no model adoption

> **Living document for the next branch of work.** Covers Phases 17-22.
> Foundation phases 0-16 are logged in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). This document is the active reference for any work after Phase 16; that document is the historical record.

**Last updated:** 2026-05-27 (Phase 17 ✅ shipped on docs/surface-model; Phases 18-22 ⬜ Not started)

**Authoritative inputs:** [CLAUDE.md](CLAUDE.md) (Surface model + Conversion mechanics rules) · [CompetitorReviewResults.md](CompetitorReviewResults.md) (Solgt.no walkthrough Sections A-K, K11 prioritized backlog) · [brand_identity/](brand_identity/) (visual + copy rules)

---

## The principle

**We are adopting the Solgt.no model.** Solgt has a proven funnel: a polished marketing site (light theme, modular slabs, calculator-as-hero, paired CTAs, /pricing page, named landing pages per product and use case) that hands off to a focused product surface (dark theme, search-as-launcher, data-as-hero, no marketing components). They've validated this split works for consumer-grade real-estate analytics. We are copying and adapting as much as the Russian new-build market allows.

**The model implies an asymmetry that drives the entire shape of this plan:**

| Surface family | Today | Phases 17-22 do |
|---|---|---|
| **Product** (signed-in / mid-task) | **Mostly built and shipping.** `/calculator`, `/map`, `/analytics`, `/account/*` are functional, styled, theme-aware, and feature-complete through Phase 16. | **Refactor** one thing (favorites → lists) and **polish** with Solgt-validated patterns (blur paywalls, chart prose, named-query chips, notification bell, map data layers). No surface gets rebuilt. |
| **Marketing** (unconvinced / pre-signup) | **Essentially zero.** We have `/` (a search hero from Phase 10 — but with the wrong hero pattern for the new model) and `/blog/*` (6 seed articles from Phase 14). No `/pricing`, no `/products/*`, no `/applications/*`, no `/about`, no `/contact`. No `MarketingShell`, no slab library, no mega-menu. | **Build from scratch.** New route group, new shell, slab library, calculator-as-hero homepage swap, /pricing, 12 SEO landing pages, marketing-copy sweep. |
| **Foundation** | Single shared chrome via [`Header.tsx`](src/components/layout/Header.tsx). Components live in a flat `components/{projects,calculator,...}/` layout that doesn't distinguish surface family. | **Split the codebase** along the surface boundary CLAUDE.md introduces: route groups, two layout shells, theme-by-surface enforcement, `components/{marketing,product}/` directory reshape. Mechanical refactor; no behavior changes. |

**One-line per phase, classified by the work it does:**

| # | Phase | Type | What it does | Surface side |
|---|---|---|---|---|
| 17 | Lists refactor | **REFACTOR** | Favorites → multi-list Lists | Product |
| 18 | Surface model foundation | **FOUNDATION** | Route groups + shells + components/ reshape | Both |
| 19 | Marketing surface build-out | **CONSTRUCTION** | Calc-as-hero homepage swap + /pricing + slab library | Marketing |
| 20 | Marketing content: SEO landings | **CONSTRUCTION** | 12 SEO landing pages | Marketing |
| 21 | Product polish from Solgt patterns | **POLISH** | Blur paywall + chart prose + chips + bell + map layers | Product |
| 22 | Far-future (parked) | **PARKED** | Time-series dashboard + paste-a-link onramp | Both, blocked |

---

## Today's inventory (audit)

### Product surfaces — what exists, what we own

```
/calculator                          ✅ Built. Wizard + expert mode. Phase 11.
/map                                 ✅ Built. Markers + popup + district panel. Phase 5+13.
/analytics                           ✅ Built. 5 charts. Phase 4. No explanatory prose.
/account                             ✅ Built. Auth-gated tabs. Phase 6.
/account/favorites                   ✅ Built. Flat single-bucket favorites. Phase 6.
/account/saved                       ✅ Built. Saved calculations. Phase 6.
/account/portfolio                   ✅ Built. Rental portfolio (Pro-gated). Phase 7.
/account/settings                    ✅ Built. Profile + tier + alert settings. Phase 16.
/projects/[id]                       ✅ Built. SEO-critical project detail. Counted as marketing
                                        in CLAUDE.md (linkable, indexable), but the UI itself is
                                        a product-style detail page.
/projects/[id]/units/[unitId]        ✅ Built. Unit detail. Phase 2.
```

**Component coverage on the product side:** `components/{projects,calculator,analytics,map,account}/` all populated and shipping. `<ProGate>` exists but only in `mode="replace"` form. `<UpgradePrompt>` modal exists. No header notification bell, no inline tier badges, no named-query chips, no chart explanatory copy.

### Marketing surfaces — what exists, what's missing

```
/                                    🟡 Exists, but wrong hero pattern.
                                        Phase 10 search hero needs the calculator-as-hero swap.
/blog                                ✅ Built. Index of 6 articles. Phase 14.
/blog/[slug]                         ✅ Built. Article template. Phase 14.

/pricing                             ❌ DOES NOT EXIST. UpgradePrompt is modal-only today.
/products/[slug]                     ❌ DOES NOT EXIST. No content registry either.
/applications/[slug]                 ❌ DOES NOT EXIST. No content registry either.
/about                               ❌ DOES NOT EXIST.
/contact                             ❌ DOES NOT EXIST.
```

**Component coverage on the marketing side: zero.** No `MarketingShell`, no `MarketingSlab`, no `MarketingCTAPair`, no `PricingTable`, no `PersonaRow`, no `FAQAccordion`, no `StatStrip`, no `TestimonialCarousel`. `components/marketing/` directory doesn't exist. No mega-menu in the header. No big-numeral marketing stats. No persona segmentation. No FAQ accordion on any marketing page.

### Foundation — what exists, what's missing

```
src/app/                             Flat. No route groups.
src/components/layout/Header.tsx     Single shared chrome (top nav).
src/components/layout/MobileNav.tsx  Bottom nav on mobile.
src/components/projects/             Lives at top level.
src/components/calculator/           Lives at top level.
src/components/analytics/            Lives at top level.
src/components/map/                  Lives at top level.
src/components/account/              Lives at top level.

src/app/(marketing)/                 ❌ Route group does not exist.
src/app/(product)/                   ❌ Route group does not exist.
src/components/layout/MarketingShell.tsx     ❌ Does not exist.
src/components/layout/ProductShell.tsx       ❌ Does not exist.
src/components/layout/ProductRail.tsx        ❌ Does not exist (Solgt-style left rail).
src/components/marketing/            ❌ Directory does not exist.
src/components/product/              ❌ Directory does not exist.
```

**Theme system:** dark default + light theme exists via CSS custom properties. No theme-by-surface enforcement — every page respects user preference today. CLAUDE.md now mandates marketing surfaces force-light.

---

## Status

| Phase | Title | Classification | Status |
|---|---|---|---|
| 17 | Lists refactor (multi-list favorites) | Product · REFACTOR | ✅ Complete (manual deploy pending) |
| 18 | Surface model foundation (route groups + shells) | Both · FOUNDATION | ✅ Complete |
| 19 | Marketing surface build-out | Marketing · CONSTRUCTION | ✅ Complete |
| 20 | Marketing content: SEO landings | Marketing · CONSTRUCTION | ⬜ Not started |
| 21 | Product polish from Solgt patterns | Product · POLISH | ⬜ Not started |
| 22 | Far-future (parked) | Both · PARKED | ⬜ Not started |

Status legend: ⬜ Not started · 🟡 In progress · ✅ Complete

---

## Sequencing

**Phase 17 first** because it's bounded, ships fast, and strengthens Pro tier value. Doing it before Phase 18 means the new list components get placed in the right `components/product/` location once the directory reshape happens.

**Phase 18 before Phases 19/20/21** because the route-group + shell + components/ refactor is a wide mechanical change that will conflict with any in-flight feature work. Land it on a quiet branch.

**Phase 19 before Phase 20** because Phase 20 is purely content using the slab library Phase 19 builds.

**Phase 21 is parallelizable with Phases 19/20.** Touches product surfaces (which Phase 18 already separated), not marketing surfaces. If a second contributor is available, run them concurrently.

**Phase 22 is parked**, tracker only — blocked on real prerequisites (6 months of snapshot data; legal review on scraping).

```
Phase 17 (Lists)  ───►  Phase 18 (Foundation)  ───┬──►  Phase 19 (Marketing build-out)  ──►  Phase 20 (SEO landings)
                                                  │
                                                  └──►  Phase 21 (Product polish)
                                                                                              Phase 22 (parked)
```

---

## Phases

### Phase 17 — Lists refactor (multi-list favorites) ✅ · Product · REFACTOR

**Goal.** Replace the flat `favorites` + `fav_units` bucket with named, owned, optionally-shared `lists`. Every user gets a default `Избранное` list at signup; Pro users can create unlimited additional named lists, follow other users' public lists, and collaborate on shared lists. Phase 16 alerts re-key from per-favorite to per-list.

**Why now.** Solgt's "Lists" surface is the single biggest finding from the signed-in walkthrough ([CompetitorReviewResults.md K5](CompetitorReviewResults.md#k5-lists--the-most-undervalued-surface-in-the-entire-walkthrough)). It transforms favorites from "I starred this" into a curatorial/social layer that compounds Pro tier value. Doing this before the Phase 18 directory reshape means the new list components land in the right place once.

**This is REFACTOR work on a product surface.** No new marketing surface; no new shell. The user-facing change to an existing Free user is that their `Избранное` is still there with the same contents. The new affordances (creating more lists, sharing, following) appear behind the Pro paywall.

**Deliverables:**
- [ ] **Migration `supabase/migrations/0004_lists.sql`** — new tables `lists`, `list_items`, `list_followers`, `list_collaborators`, `list_comments` with RLS per CLAUDE.md. Data backfill: every user with rows in `favorites` ∪ `fav_units` gets an `Избранное` list with mirrored items. Drop `favorites` and `fav_units` in the same migration after backfill. Idempotent.
- [ ] **Migration `supabase/migrations/0005_alerts_per_list.sql`** — add `list_id` to `price_alerts`, backfill, drop `project_id` + `unit_id`. `capture_price_snapshots()` and `compute_pending_alerts()` traverse `list_items` instead of `favorites`/`fav_units`.
- [ ] **`src/lib/api/lists.ts`** — CRUD for lists, items, followers, collaborators, comments. `{ data, error }` shape per CLAUDE.md.
- [ ] **`src/hooks/useLists.ts`** — replaces `useFavorites`. Returns `{ defaultList, lists, createList, ..., follow, unfollow, ... }`. Tier-aware via `usePaywall('multi-list')`. Free hard-cap: 1 list, 25 items. Pro: unbounded.
- [ ] **`/account/lists`** — table of user's lists. Create/rename/delete/share actions.
- [ ] **`/account/lists/[id]`** — single-list view with header, member chips, ProjectCard/UnitCard grid, comments thread.
- [ ] **Featured lists rail** on `/account/lists` — 4-6 curated editorial lists with `🔒 Pro` lock where visibility requires Pro. Seeded by a script.
- [ ] **"Add to list" affordance** on ProjectCard / UnitCard / ProjectHero replacing the heart toggle. Default action = add to `Избранное`; menu opens to pick another list or create new. Heart icon retained as visual shorthand for "in any of my lists."
- [ ] **`AlertToggleButton` rewires** from per-favorite to per-list. A list with `alerts_enabled = true` triggers alerts on any item in it.
- [ ] **`handle_new_user()` trigger updated** to insert an `Избранное` list for new signups.

**Acceptance.** A Pro user creates "Инвестиции 2026", adds 30 projects, marks it public, shares the URL, and receives notifications when any item drops in price. A Free user can't create a second list but can follow the friend's public list and receives its weekly digest. The migration runs cleanly against a database populated with Phase 16 data.

**Sized:** ~2 weeks.

---

### Phase 18 — Surface model foundation (route groups + shells) ✅ · Both · FOUNDATION

**Goal.** Mechanically reshape the codebase to match the Surface model from [CLAUDE.md](CLAUDE.md#surface-model). Route groups `app/(marketing)/` and `app/(product)/`, `MarketingShell` + `ProductShell` layout components, theme-by-surface enforcement, and the `components/marketing/` + `components/product/` directory split.

**Why now.** Solgt's marketing/product visual separation is load-bearing for conversion. Doing the structural refactor as its own phase keeps the diff reviewable and avoids mixing file-moves with feature work.

**This is FOUNDATION work touching both sides.** No new pages, no new features. Existing surfaces continue to render the same UI; the only visible difference is `data-surface` attribute and that the marketing homepage now renders in forced light theme. Architectural enabler for Phases 19, 20, 21.

**Deliverables:**
- [ ] **Route groups created.** `app/(marketing)/layout.tsx` wraps in `<MarketingShell>`; `app/(product)/layout.tsx` wraps in `<ProductShell chrome="top">`. Existing pages move:
  - **(marketing)/**: `page.tsx`, `blog/`, `projects/[id]/` *(SEO-critical, stays marketing)*
  - **(product)/**: `calculator/`, `map/`, `analytics/`, `account/`, `lists/` *(Phase 17 output)*
- [ ] **`src/components/layout/MarketingShell.tsx`** — top nav (Header variant with marketing mega-menus), forced light theme via `data-surface="marketing"` on `<body>`, Footer.
- [ ] **`src/components/layout/ProductShell.tsx`** — chrome chosen via `chrome={'top'|'rail'}` prop (default `'top'`), user-preferred theme via `data-surface="product"`, Footer omitted on full-screen surfaces.
- [ ] **`src/components/layout/ProductRail.tsx`** — Solgt-style left-rail variant. Built but unused by default; activates when CLAUDE.md's "6-7 surface" trigger fires.
- [ ] **Theme-by-surface enforcement** in `globals.css` — `[data-surface="marketing"]` selector forces light theme tokens regardless of `data-theme`. Both attributes coexist on `<html>` / `<body>`.
- [ ] **Components moved** into the new directory structure:
  ```
  components/projects/      →  components/product/projects/
  components/calculator/    →  components/product/calculator/
  components/analytics/     →  components/product/analytics/
  components/map/           →  components/product/map/
  components/account/       →  components/product/account/
  ```
  Import paths updated with `grep -r ... | xargs sed -i`. PR will be a ~200-line diff of mostly mechanical import changes.
- [ ] **Branded shell types.** `MarketingShell` and `ProductShell` accept children of branded type `MarketingChildren | ProductChildren`. Components in `components/marketing/` and `components/product/` export the matching brand. Wrong-import is a compile error.
- [ ] **`components/marketing/` directory created**, empty for now — Phase 19 fills it.
- [ ] **Smoke test in CI** — Playwright integration test asserts each shell renders the right `data-surface` attribute and the right nav variant. New CI step.

**Acceptance.** All existing routes still work; theme inverts at the marketing/product boundary; `tsc --noEmit` is green; `next build` passes; perf budgets stay under 180/240 kB. Importing a `components/marketing/*` component into a product surface fails at compile time.

**Sized:** ~1 week. Mechanical refactor; the branded-type setup is the only subtle bit.

**Risk.** File moves conflict with any in-flight feature work. Land this when Phase 17 is merged and no other PR is open against the same paths.

---

### Phase 19 — Marketing surface build-out ✅ · Marketing · CONSTRUCTION

**Goal.** Build the marketing surface from scratch. Calculator-as-hero homepage swap, `/pricing` page, and the full slab library Phases 20+ depend on.

**Why now.** Phase 18 built the foundation; this phase fills it. Today the marketing side is essentially empty — only the homepage (with the wrong hero pattern) and the blog. After this phase, the marketing side has a real funnel.

**This is CONSTRUCTION work on the marketing side.** Net-new components, net-new pages, net-new copy. The only existing marketing surface this touches is `/` (full homepage rewrite per the calculator-as-hero rule).

**Deliverables:**

*Component library (all net-new under `components/marketing/`):*
- [ ] **`MarketingSlab.tsx`** — generic block wrapper. `{ eyebrow, headline, subhead, primaryCta, secondaryCta, screenshotSrc?, layout: 'image-left' | 'image-right' | 'image-below' | 'text-only' }`. Every other marketing component uses this.
- [ ] **`MarketingCTAPair.tsx`** — `[Зарегистрироваться бесплатно →]` + `[Посмотреть тарифы →]`. Never single. Mounted at the bottom of every marketing page.
- [ ] **`PricingTable.tsx`** — 3-column table (Free / Pro Monthly / Pro Yearly −20%) with Monthly/Yearly toggle pill. Each column: tier name, price in ₽/month, target audience one-liner, ✓ feature bullets, primary CTA. "Recommended" badge on Pro Yearly.
- [ ] **`PersonaRow.tsx`** — 4-column row. Initial personas: *Покупатель квартиры* / *Ищу район* / *Инвестор-новичок* / *Любопытствующий*. One paragraph each. No CTA — just framing.
- [ ] **`FAQAccordion.tsx`** — single-line question + chevron rows, hairline dividers. Expands to 1-2 paragraph answer with optional inline link to a blog post.
- [ ] **`StatStrip.tsx`** — big purple numeral + tiny caps caption pattern. 3-4 cells. Initial homepage stats: ЖК count, available units, cities, price range.
- [ ] **`TestimonialCarousel.tsx`** — serif quote + small attribution. Initial state: placeholder "*Скоро здесь будут отзывы пользователей*"; the slot exists for when real testimonials arrive.

*Pages (net-new or hero swap):*
- [ ] **`app/(marketing)/page.tsx`** — full homepage rewrite. Slab order: calculator-screenshot hero with serif `Реши, стоит ли покупать` + `[Открыть калькулятор →]` + `[Посмотреть тарифы →]` → 3-card objection-handling row → trust strip (placeholder for developer logos) → alternating feature blocks (Calculator / Map / Analytics / Lists) → capability summary → persona row → testimonial carousel slot → pricing reference → FAQ → final CTA → footer.
- [ ] **`app/(marketing)/pricing/page.tsx`** — standalone /pricing using `<PricingTable>` + FAQ + final CTA. Deep-link target for `UpgradePrompt`.

*Integration:*
- [ ] **`UpgradePrompt` deep-links to `/pricing`** — secondary CTA changes from "Позже" to "Посмотреть тарифы →" linking to `/pricing?from=<feature-key>` so the pricing page can highlight which feature triggered the visit.

*Content + assets:*
- [ ] **Marketing-copy sweep.** All new headlines, subheads, CTA labels through the [`brand_identity/positioning-voice.md`](brand_identity/positioning-voice.md) template (democratization framing, outcome-promise headlines, paired CTAs).
- [ ] **Calculator screenshot asset.** Real Playwright-rendered screenshot of the calculator wizard's step-3 results panel (preferred) or stylized SVG mockup. Stored in `public/marketing/calculator-hero.png`.
- [ ] **i18n.** All new strings into `src/i18n/{ru,en}.ts` under a new `t.marketing.*` namespace.

**Acceptance.** An unauthenticated visitor on `/` sees a calculator-screenshot hero, the canonical slab order, and a CTA pair. The `/pricing` page renders all 3 tiers with feature bullets that match what's actually implemented. All copy follows the democratization template.

**Sized:** ~2-3 weeks. Most time goes into the slab library + copy sweep; page assembly is small.

**Risk.** The calculator screenshot is the headline asset and dominates first impressions. Worth doing it well — a real screenshot beats a mockup. If we can't get one looking polished, fall back to SVG mockup and flag as Phase-21 polish work.

---

### Phase 20 — Marketing content: SEO landings ⬜ · Marketing · CONSTRUCTION

**Goal.** Use Phase 19's slab library to ship 6 product landing pages and 6 application landing pages, each targeting a high-intent Russian-language search query. Mirrors Solgt's `/produkter/*` + `/bruksomrader/*` structure.

**Why now.** Solgt has 11 such SEO landing pages and they're the marketing surface's organic-traffic moat. Russian-language new-build SEO is uncrowded — high-value land grab while the category is still cheap.

**This is CONSTRUCTION work on the marketing side.** Pure content using the slab library Phase 19 builds. Net-new pages, net-new content, net-new mega-menu entries.

**Deliverables:**

*Routes:*
- [ ] **`app/(marketing)/products/[slug]/page.tsx`** — dynamic route consuming `src/content/products/index.ts`.
- [ ] **`app/(marketing)/applications/[slug]/page.tsx`** — dynamic route consuming `src/content/applications/index.ts`.

*6 product landings (`src/content/products/*.ts`):*
- [ ] `kalkulyator-investitsii` — *Калькулятор инвестиций в новостройку*
- [ ] `karta-novostroek` — *Интерактивная карта новостроек Крыма*
- [ ] `analitika-rynka` — *Аналитика рынка новостроек*
- [ ] `prognoz-dokhodnosti` — *10-летний прогноз доходности (Pro)*
- [ ] `uvedomleniya-o-tsene` — *Уведомления о цене (Pro)*
- [ ] `spiski-i-sravnenie` — *Списки и сравнение объектов (Pro)*

*6 application landings (`src/content/applications/*.ts`):*
- [ ] `pokupka-pervoi-kvartiry` — *Покупка первой квартиры: с чего начать*
- [ ] `semeinaya-ipoteka-2026` — *Семейная ипотека в 2026 году*
- [ ] `matkapital-na-novostroiku` — *Маткапитал на новостройку*
- [ ] `investitsiya-v-arendu` — *Инвестиция в арендную недвижимость*
- [ ] `vybor-zk-pod-rebenka` — *Выбор ЖК под семью с детьми*
- [ ] `kupit-na-kotlovane` — *Покупка на котловане: риски и выгоды*

*Integration:*
- [ ] **All 12 pages added to `sitemap.ts`** with appropriate `priority` and `changefreq`.
- [ ] **All 12 pages get `opengraph-image.tsx`** using the Phase 14 OG generator + per-page title.
- [ ] **Mega-menu in `MarketingShell`'s Header populates from both registries.** Hovering `Products ▾` shows 6 product cards; `Applications ▾` shows 6 application cards. Card shape: `{ icon, name, one-line description }` — matches Solgt's mega-menu.
- [ ] **Per-page FAQ** with 5-8 questions, prose answers. Each answer can link to a `/blog/[slug]` post for deep reading.
- [ ] **Blog template re-renders through `MarketingSlab`** for editorial layout consistency.

**Acceptance.** 12 new pages live and sitemap-indexed. Russian-language SEO queries like *калькулятор ипотеки новостройка* or *семейная ипотека 2026* return one of our pages within 6 months of indexing.

**Sized:** ~2 weeks.

**Risk.** Content quality determines whether the pages rank. If the Russian copy is mid, the SEO bet fails. Consider commissioning a real editor for article-grade text after the structural ship.

---

### Phase 21 — Product polish from Solgt patterns ⬜ · Product · POLISH

**Goal.** Ship the Tier-1 immediate wins from [CompetitorReviewResults.md K9](CompetitorReviewResults.md#k9-concrete-adaptations--prioritized-ranked): blur-paywall ProGate variant, inline `🔒 Pro` badges, per-chart explanatory copy on `/analytics`, named-query chips on project listings, map data-layer toggle, header notification bell.

**Why now.** Independent of Phases 19/20 — touches product surfaces (which Phase 18 separated). Parallelizable with the marketing build-out if a second contributor is available.

**This is POLISH work on already-built product surfaces.** No new pages, no new core flows. Six discrete improvements informed by Solgt's signed-in product walkthrough. Each item is small; collectively they lift perceived sophistication noticeably.

**Deliverables:**
- [ ] **`<ProGate mode="blur">`** — refactor `src/components/ui/ProGate.tsx` to support `mode={'replace'|'blur'}`. Blur mode renders children with `filter: blur(4px) opacity(0.6) pointer-events-none` and overlays a compact card top-center "Доступно в Pro · Открыть тарифы →". Audit all current call sites; default switch to `mode="blur"` where blurring is meaningful.
- [ ] **Inline `🔒 Pro` badges** — new `<TierLock tier="pro">` primitive in `components/ui/`. Used in dropdowns, menu items, chip labels. First call sites: the *Высокий ROI* named-query chip and the calculator's *forecast* / *exit* sections.
- [ ] **Per-chart explanatory copy.** Wrap each analytics chart in `<ChartCard title hint>`. Initial hints (Russian, 1-3 sentences each — full text in IMPLEMENTATION_PLAN.md Phase 21 deliverable).
- [ ] **Named-query chips** — `src/lib/named-queries.ts` defines the chip registry. `src/components/product/projects/NamedQueryChips.tsx` renders chips above the project grid. Each chip carries a live count derived from `useProjects()`. Pro chips render with `<TierLock>`. Initial 6 chips:
  - *Маткапитал покрывает ПВ*
  - *У моря (< 1 км)*
  - *Скоро сдача*
  - *Цена снижена*
  - *Высокий ROI* **(Pro)**
  - *Лучшая цена/м²*
- [ ] **Map data-layer toggle** — `src/components/product/map/MapLayerSelector.tsx` mounted top-center of the map. Initial layers: *Все · Сдан · Строится · Проектируется* (status-based, no tier locks since we don't have transaction data). Selection writes to URL `?layer=...`.
- [ ] **Header notification bell** — `src/components/layout/NotificationBell.tsx`. Bell icon top-right in `<ProductShell>`. Badge counter for un-viewed alerts (from Phase 16). Dropdown shows last 10 triggered alerts with link to affected unit + "Mark all read" action. New `notification_views` table or column to track read state per user.
- [ ] **`useNotifications` hook** wrapping the bell's state.

**Acceptance.** Free user opens `/calculator` and sees Pro sections blurred with inline upgrade card (no modal). `/analytics` shows each chart with prose. `/` shows 6 named-query chips above the project grid with live counts. Bell icon in header reflects alert state.

**Sized:** ~1-2 weeks.

---

### Phase 22 — Far-future (parked) ⬜ · Both · PARKED

**Tracker only — not on the active schedule.** Two items blocked on real prerequisites:

**Time-series market-trends dashboard.** Solgt's signed-in Dashboard ([K6](CompetitorReviewResults.md#k6-dashboard-beta)) is six time-series charts with editorial prose. We can't ship the equivalent until Phase 16's `price_snapshots` table has accumulated ~6 months of data — line charts on 3 weeks of snapshots are misleading. **Prerequisite:** Phase 16's daily snapshot job has been running in production for ≥6 months. **Then:** new `/analytics/trends` route with 4-6 line charts (asking price/m² over time, supply count over time, days-on-market proxy from status transitions, %-change-by-class). Editorial copy on every chart.

**Paste-an-ad-link onramp.** Per [K8.12](CompetitorReviewResults.md#k8-what-were-missing-structurally-gap-list), the marketing homepage search input should accept a pasted URL from Avito / Cian / Domclick and parse the listing to pre-fill the calculator. **Prerequisite:** decision on which source(s) to integrate; agreement that scraping their public listings is acceptable (legal review). Each parser ~M effort.

**Acceptance.** Either item moves out of "parked" when its prerequisite is met.

---

## Decision log (carryover + new)

The full decision history lives in [IMPLEMENTATION_PLAN.md → Decision log](IMPLEMENTATION_PLAN.md). The most recent entries directly relevant to this branch:

- **2026-05-26** — Solgt.no walkthrough analysis added to [CompetitorReviewResults.md](CompetitorReviewResults.md) (Sections A-K).
- **2026-05-27** — Marketing/product surface split locked in; CLAUDE.md rewritten.
- **2026-05-27** — Calculator-as-hero on the marketing homepage.
- **2026-05-27** — Pricing moves from 2 to 3 tiers (Free / Pro Monthly / Pro Yearly).
- **2026-05-27** — Lists committed as Phase 17.
- **2026-05-27** — ProductShell `chrome` prop defaults to `'top'`; `'rail'` deferred.
- **2026-05-27** — 6 new phases sequenced (17-22).
- **2026-05-27** — **This document created.** [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) didn't make the marketing-from-scratch / product-preserve asymmetry explicit enough; this 2.0 plan exists to fix that. Same six phases, reframed with classification badges (REFACTOR / FOUNDATION / CONSTRUCTION / POLISH / PARKED) and an inventory audit so the asymmetry is impossible to miss.

---

## Out of scope for this branch

- **Re-doing Phases 0-16.** Those shipped (with documented manual launch steps for billing + alerts). This branch builds on top.
- **A separate iOS/Android app.** Not in the surface model. Mobile = responsive web only.
- **Real B2B sales motion.** The `Business` custom tier is reserved in `UpgradePrompt`'s copy and CLAUDE.md but not built. Revisit when a real inbound shows up.
- **AI features** (interior design, automated descriptions, etc.). Not in the Solgt model; not in our positioning hierarchy. The calculator + map + alerts are the differentiators; AI is a distraction until those are visibly working at scale.
- **Multi-region expansion beyond Crimea.** The architecture supports it (i18n, region filter, etc.) but no new region-specific data, partnerships, or content live in this branch.
