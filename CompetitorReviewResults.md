# Competitive Analysis: Solgt.no vs. RealEstateApp

> **Methodology note.** Solgt.no's site is a JavaScript SPA — `WebFetch` could only retrieve page titles. The findings below come from Google's indexed snippets of their pages and blog posts, third-party profiles (PitchBook, TheOrg), Norwegian press coverage, and academic research published by their R&D team. I'll flag where information was not publicly discoverable rather than guess. **Important contextual caveat:** Solgt.no operates on the **resale (secondary) market** with rich Norwegian open property data; RealEstateApp targets the **new-build (primary) market** in Russia/Crimea where comparable infrastructure doesn't exist. Some of their features are infeasible for us at our market stage. I'll call those out.

---

## Phase 2.1 — Executive Summary & Value Proposition

**Primary marketing hook (verbatim from homepage):** *"Boligdata og verdivurdering for hele Norge"* — "Housing data and valuations for all of Norway."

**The pitch in one sentence:** Get three independent ML-based value estimates of any home in Norway, plus its sales history, ownership history, neighborhood data, and rental estimate — instantly, for free.

**Company facts:**
- Founded 2019, Oslo. ~7–10 employees. Raised ~$10.2M cumulative (PitchBook).
- CEO Arne Kvale, CTO Christian N. Iversen.
- **They have pivoted.** Original 2019 thesis was an iBuyer model (buy homes, renovate, resell). The current 2025–2026 product is a data/valuation platform — radically different go-to-market.
- Their R&D collaborates with NORCE (Norwegian Research Centre); their former Head of R&D Ulf Jakob Flø Aarsnes co-authored an academic paper on using floor-plan analysis to extract balcony sizes and other features for automated valuation models (published in *Journal of European Real Estate Research*, 2025).

**Target personas (inferred from product and press):**
1. **Curious homeowners** — "what's my house worth, what did the neighbor sell for?" The dominant consumer use case.
2. **Pre-purchase homebuyers** — researching a target neighborhood, validating broker estimates before bidding.
3. **Sellers preparing for listing** — sanity-checking the broker's valuation, deciding whether to renovate before sale.
4. **(Inferred B2B layer)** — banks/insurers/proptech needing programmatic AVM access, though the public site does not surface this. Their main competitor, Eiendomsverdi, is heavily B2B (owned by the big four Norwegian banks), so Solgt's commercial wedge may be there.

---

## Phase 2.2 — Core Product Capabilities & Data Evaluation

### Core features (assembled from search snippets and blog posts)

| Feature | Description | RealEstateApp parity? |
|---|---|---|
| **3 independent value estimates per address** | Three different models produce three numbers, with a per-estimate **accuracy/confidence disclosure**. | ❌ We have no AVM (we sell new builds at developer prices). |
| **Rental estimate** | Predicted monthly rent for the address. | ⚠️ Partial. We hard-code rent by room type in [app-store.ts:74-81](src/store/app-store.ts#L74-L81) (₽25k/33k/40k/52k/60k/70k by 0–5K). Not address-specific. |
| **Owner history (eierhistorikk)** | Chronological list of every recorded owner of that property, sourced from Norwegian land registry. | ❌ N/A — new builds have no ownership history. |
| **Sales history (salgshistorikk)** | Every recorded sale of that property and comparable sales nearby. | ❌ Same — new builds don't have one. |
| **Interactive map of sold properties** | Click any pin to see the sale price, ₽/m², and price-development trend for that property. | ⚠️ We have a map of *projects* with developer asking prices. Closest analog. |
| **Neighborhood data (nabolagsdata)** | Demographics, schools, walkability, age mix per district. | ❌ Not implemented. |
| **Price-development charts** per area & class | Time-series of price/m² per neighborhood. | ⚠️ Our [PriceHeatmap.tsx](src/components/analytics/PriceHeatmap.tsx) shows city × class snapshot but no time series — we have no historical data to plot. |
| **Renovation-impact estimate** | "Before kitchen renovation, estimate was 6.7M NOK; after, 7.3M." Sensitivity analysis on standard. | ❌ Not implemented. Excellent feature idea even adapted to new builds (e.g., "with finishing included +X%"). |
| **Floor-plan ML analysis** | Their published research extracts features (balcony size, layout efficiency) from floor plans using ML to feed the AVM. | ❌ Not implemented. |
| **"Home standard" weighting** | Solgt claims to be "Norway's first tool that considers home standard, which accounts for 30–50% of home value." | ❌ Not implemented. Their key differentiation hook in marketing copy. |

### Data strategy and scale

- **Claimed dataset:** 10 million transactions for "all homes in Norway."
- **Likely sources** (Norway is data-rich):
  - **Kartverket** (Norwegian Mapping Authority) — open property + cadastral data via API.
  - **Eiendomsregisteret / Grunnboken** — government land registry for ownership history.
  - **FINN.no** — dominant listing marketplace, source for ~70% of recorded transactions.
  - **Real estate agent associations** — sale completion data.
  - **Their own iBuyer-era datasets** — internal transaction data from when they bought/sold homes themselves.
- **Models:** Plural — at least three ("tre uavhengige modeller"). Academic publications suggest the stack includes **hedonic regression + XGBoost + neural feature extraction from floor plans** (per the Aarsnes paper).
- **Update cadence:** Claim is "updated market prices" and "real-time data on registered transfers." No precise SLA found publicly.

### Data limitations (inferred)

- **Geographically Norway-only.** No multi-country support.
- **Old/rural properties** likely have sparser transaction comparables and lower confidence scores.
- **Off-market and private sales** may be missing (~30% of transactions per Eiendomsverdi/Real Estate Norway data on FINN.no sample coverage).

---

## Phase 2.3 — UX/UI & Usability Assessment

**Based on indirect signals (their own blog, journalist coverage, the SPA's structure):**

- The product is **deeply consumer-friendly** — the search aggregators pulled out language like "free quick estimate without waiting for a broker," "easy navigation," "visual overview of sold homes in your neighborhood." The landing flow is address-first, single-action.
- **Press framing is uniformly positive** for the consumer angle (e.g., Nettavisen coverage of competing "Boligpriser" service: *"gives more power to consumers"*). Solgt rides the same wave.
- **The interactive map is a centerpiece** — referenced in nearly every Solgt blog post indexed. Implies polished map UX, not a token feature.
- **Confidence/accuracy disclosure on every estimate** — explicit per Google snippet: *"The assumed accuracy is shown with each estimate, so you know how reliable the value is."* This is a sophisticated UX move that lesser AVMs avoid because admitting uncertainty looks weak. It signals product maturity.
- **JS-heavy SPA.** The Google bot couldn't see body content (and neither could WebFetch). This is a soft SEO red flag — they likely lean on direct traffic + blog SEO rather than ranked transactional terms.
- **Not in Norway's top 20 real-estate websites** by traffic (per [Semrush April 2026](https://www.semrush.com/trending-websites/no/real-estate)). They're a smaller, more focused player than FINN.no / hybel.no.

### Heavy data, map layering, exporting

- Not publicly documented. No PDF export feature surfaces in search results. No API docs surfaced. **This is a likely Pro/B2B gate**, not visible to anonymous visitors.

---

## Phase 2.4 — Pricing & Monetization Strategy

**Publicly discoverable pricing: none.** Multiple targeted Norwegian-language searches for "pris," "abonnement," "kostnad" surfaced no pricing page.

**Inferred model:**
- **Free consumer tier** — address lookup, sales history, basic estimate, map. Confirmed by snippets like *"free insight into registered property transfers and updated market prices."*
- **Inferred upsell** — most likely **B2B/API for banks, insurers, and brokers** (the segment their R&D papers target). This is where the $10.2M funding likely goes — selling AVM access into Eiendomsverdi's market.
- **Possible consumer Pro tier** — but no evidence of one in indexed pages. They may have chosen *"free-for-consumers, paid-for-businesses"* (the Zillow model) rather than freemium.

**No evidence of nickel-and-dime complaints** because no pricing page = no public price list to complain about.

> ⚠️ **Trustpilot caveat.** The Trustpilot reviews that surface for "solgt.com" are for a **different company** — a Danish/Norwegian used-car selling platform. They are NOT solgt.no reviews. I disambiguated and excluded them. No Trustpilot profile for solgt.no surfaced in searches.

---

## Phase 2.5 — User Sentiment & Pain Points (Gap Analysis)

**Major caveat:** I found **no widely-circulated user-review corpus** for solgt.no. Norway lacks a strong Reddit presence (consumer discussion happens on Diskusjon.no, Facebook groups, Hegnar.no comment sections — none well-indexed for my searches). Trustpilot results were for the unrelated car-selling site solgt.com. **Treat the sentiment section below as inference from product behavior, not from reviews.**

**What users likely love (inferred):**
- Instant, free address lookup with no signup wall.
- Three estimates with confidence scores — feels more honest than a single AVM number.
- The "what did the neighbor sell for" use case is universal and Solgt does it well.

**Three plausible pain points / gaps** (inferred from product gaps and market structure):

1. **No new-build / pre-construction coverage.** Solgt's models depend on transaction history. A buyer evaluating a brand-new development project has no signal from Solgt. This is *exactly* RealEstateApp's market. **This is the single largest exploitable gap.**

2. **No buyer-side investment math.** Solgt tells you *what a home is worth*. It does not tell you *whether buying it as an investment is a good idea.* No mortgage calculator, no rental ROI, no 10-year cashflow forecast. They're a valuation tool, not an investment-analysis tool. Their R&D depth is in valuation accuracy, not in financial modeling.

3. **No lead-capture / next-action.** A user gets the estimate, learns the neighbor sold for X, and then… leaves. There's no clear path from "I got data" to "I took action" within Solgt. (Eiendomsverdi solves this by being embedded inside bank apps, where the next action is "talk to your mortgage advisor.")

4. **Norway-only.** Not a pain point for their users; a constraint on their growth.

---

## Phase 3 — Lessons Learned & Strategic Recommendations

> **Critical framing:** Solgt.no is not a head-to-head competitor for RealEstateApp. They sell resale-market intel for Norwegian existing homes; we sell new-build investment analytics for Russian primary market. **But they have credibly executed the "Bloomberg-level analysis with zero learning curve" promise that CLAUDE.md sets as our north star.** They are a benchmark for *how* a small team executes consumer-grade data UX, not a competitor for the same buyers.

### Defensive play — table stakes we must match

| # | Feature | Why |
|---|---|---|
| D1 | **Address-first / search-first entry point on the homepage** | Solgt's first screen is one big search input. Our homepage shows KPI cards and a filter sidebar. They've validated that consumers want a single input box, not a research dashboard, as the entry. *(This dovetails with my AppReview recommendation to replace the KPI hero with a search hero.)* |
| D2 | **Confidence/accuracy disclosure on every estimate** | Their UX move of showing accuracy per estimate is differentiating. Our calculator outputs ROI, cap rate, etc. with no confidence interval. We should attach a "data confidence" badge to each metric or unit (we already have `dataConfidence: 'verified' \| 'estimated' \| 'unverified'` in [schema 0001_init.sql:32](supabase/migrations/0001_init.sql#L32) — never surfaced in UI). |
| D3 | **Interactive map as a first-class navigation surface, not a secondary tab** | Solgt's map is referenced in every blog post. Our [/map](src/app/map/page.tsx) is one nav tab. Promote it: let users discover by neighborhood, not by name. |
| D4 | **Free, signup-less data exploration** | Solgt requires no account to see a price estimate. We require no account to browse projects (✓ already), but the calculator's save-to-favorites flow nudges signup early. Keep the calculator fully usable anonymous — gate persistence, not capability. (Already true — confirm we don't regress on this.) |
| D5 | **Public blog as SEO + education channel** | Solgt's `/blog/*` URLs (e.g., `/blog/hvordan-solgt-revolusjonerer-verdivurdering-av-bolig`) are how they rank for Norwegian "verdivurdering" queries. We have no blog. Russian-language educational content ("Как считать ROI на новостройку," "Семейная ипотека: где подвох") would compound organic traffic over 12 months. |

### Offensive play — where we win

| # | Move | The gap it exploits |
|---|---|---|
| O1 | **Be the investment-analysis tool Solgt isn't.** | Solgt answers "what is it worth?" We answer "should I buy it?" Our calculator (mortgage, matkapital, rental cashflow, exit, 10-yr forecast) already does this. Lean into it in marketing: "we're not a price ticker — we're a decision tool." |
| O2 | **Own the new-build / primary market.** | Solgt's models only work where transaction history exists. New builds = no history = nothing to compare to. Russia and many EM markets are >50% new-build by volume. We're positioned in a market segment they structurally cannot enter. |
| O3 | **Subsidized-mortgage modeling.** | The split mortgage logic in [calculator.ts:17-41](src/lib/calculator.ts#L17-L41) (subsidized portion + market portion) is a uniquely Russian concept (family/IT/military programs) that Solgt has no analog for. **This is genuine technical moat for Russian PropTech that would take a foreign player 6+ months to replicate.** Market it as such. |
| O4 | **Bilingual from day one.** | Solgt is Norwegian-only. Our [/i18n/{ru,en}.ts](src/i18n/) already supports EN. When we expand to other Russian-influence markets (Kazakhstan, Belarus, Armenia) we already have the i18n bones. |
| O5 | **Lower cost to launch in new geographies.** | Solgt's product is a function of Norway's data infrastructure (Kartverket, FINN, agent participation). We're a function of *developer cooperation* — getting a developer to publish their unit price list. That's a sales motion, not a data-licensing motion. Faster iteration in markets without good public-records data. |

### Prioritized feature recommendations (3–5)

**High priority — implement before launch:**

**R1. Address-first search hero on homepage**
- **Problem solved:** Our homepage currently leads with KPI cards. Solgt has proven that consumers want one big input. (Maps directly to AppReview Section 1 finding.)
- **Implementation:** Replace [src/app/page.tsx](src/app/page.tsx#L12) hero with a Playfair headline ("Найди квартиру и просчитай инвестицию"), a single large search input + a city pill row, and demote KPI cards to a collapsed "Market context" strip.
- **Priority:** **High.** Effort: M.

**R2. Confidence/uncertainty disclosure on calculator metrics**
- **Problem solved:** Our calculator outputs precise ROI numbers (e.g., "12.4% Cash-on-Cash") with no error bars, but the inputs (rental rate, appreciation, vacancy) are wild estimates. Solgt has proven users accept uncertainty when it's transparent. Showing it builds trust.
- **Implementation:** Add a "Уверенность" pill next to each result row in [CalcResultsSummary.tsx](src/components/calculator/CalcResultsSummary.tsx). Compute it from the input volatility (e.g., if user used default appreciation, label "estimated"; if they overrode it, label "user input"). Also surface the existing `dataConfidence` field per project.
- **Priority:** **High.** Effort: S–M.

**R3. Neighborhood-data layer on the map**
- **Problem solved:** Solgt's map opens a "what's it like to live here" exploration mode that's missing from ours. For Crimea — distance to sea, distance to airport, walkability, school proximity — these matter for both end-users and investors.
- **Implementation:** Add a side panel to [ProjectMap.tsx](src/components/map/ProjectMap.tsx) that surfaces aggregate data per district (avg ₽/m², project count, avg sea distance, avg appreciation). Build it incrementally — start with what we can derive from our own project data.
- **Priority:** **High.** Effort: M.

**Medium priority — months 1–2:**

**R4. Renovation / finishing-grade sensitivity ("стандарт ремонта")**
- **Problem solved:** Solgt's biggest marketing differentiator is "home standard accounts for 30–50% of value." For new builds we have a direct equivalent: **finishing grade** (черновая / предчистовая / чистовая / white box / turn-key). Today our calculator's `renovation` field is just a ruble input; users have no anchor for what to type.
- **Implementation:** Replace the freeform `renovation` input in [CalcWizard.tsx:241-248](src/components/calculator/CalcWizard.tsx#L241-L248) with a 4-button selector (none / basic / standard / premium) with auto-filled ranges. Show the price delta as the user toggles.
- **Priority:** **Medium.** Effort: S.

**R5. Educational blog at /blog with Russian-language SEO content**
- **Problem solved:** Solgt indexes well for "verdivurdering" queries because their blog is structured and topical. We have zero organic content presence. Investment terms like "Cap Rate" and "NOI" have low Russian SEO density — high-value land grab.
- **Implementation:** Phase 10 deliverable. 6 evergreen articles to start: "Семейная ипотека в 2026: лимит, ставка, как считать," "Маткапитал на первоначальный взнос: пошагово," "Cap Rate, NOI, Cash-on-Cash простыми словами," "Стоит ли покупать новостройку на котловане," "Налог 4% самозанятого при сдаче квартиры в Крыму," "10 лет аренды vs. продажа: как считать."
- **Priority:** **Medium.** Effort: M (writing) + S (technical — Next file-based MDX route).

---

## What to take into the implementation plan

The most actionable carry-overs into the next plan iteration:
1. **R1 (search hero)** — combine with AppReview Launch-Blocker #9 ("Replace homepage KPI strip with hero").
2. **R2 (confidence labels)** — net-new finding from the Solgt benchmark; should be added.
3. **R3 (neighborhood layer on map)** — net-new; medium-effort, high-differentiation.
4. **R4 (finishing-grade selector)** — small, ships fast, marketing-friendly.
5. **R5 (blog)** — defer to a Phase 10 alongside OG images and full Lighthouse audit.

Solgt validates two of our deeper architectural bets:
- The "confidence/accuracy disclosure" is a maturity signal we already have data for (`dataConfidence` column) but never surface — easy win.
- The single-input search hero pattern, paired with rich exploration behind it, is the consumer-grade Bloomberg pattern. We have the back-end; we need to lead with it.

It also confirms two structural strengths we have over them:
- **Investment math** (mortgage splits, matkapital, NOI, forecast) — they don't do this and probably won't.
- **Subsidized-mortgage modeling** — uniquely Russian, technically nontrivial, already shipped.

## Sources

- [Solgt.no homepage](https://solgt.no/)
- [Hvordan Solgt revolusjonerer verdivurdering av bolig (blog)](https://solgt.no/blog/hvordan-solgt-revolusjonerer-verdivurdering-av-bolig)
- [Finn ut hva boligen din er verdt (blog)](https://solgt.no/blog/hva-boligen-din-er-verdt)
- [Få oversikt over eiendomssalg med kart – gratis på Solgt.no (blog)](https://solgt.no/blog/gratis-eiendomssalg-kart)
- [Se boliger i kart (blog)](https://solgt.no/blog/solgte-boliger-kart)
- [Solgt.no — PitchBook profile](https://pitchbook.com/profiles/company/499843-54)
- [Solgt.no — The Org](https://theorg.com/org/solgt-no)
- [Solgt.no — Crunchbase](https://www.crunchbase.com/organization/solgt-no)
- [Property valuation by machine learning for the Norwegian real estate market — ScienceOpen](https://www.scienceopen.com/hosted-document?doi=10.14293/S2199-1006.1.SOR-.PP0TP9I.v1)
- [AI-powered floor plan analysis for feature extraction in automated valuation models — Emerald](https://www.emerald.com/jerer/article-abstract/18/2/214/1252295/AI-powered-floor-plan-analysis-for-feature)
- [Eiendomsverdi: Automated Valuation Company for Residential Real Estate — SpareBank 1](https://spabol.sparebank1.no/articles/eiendomsverdi-automated-valuation-company-for-residential-real-estate)
- [Norway's Property Market 2025: Digital Brokers and the Future of Real Estate — Localmarket.no](https://localmarket.no/en/blog/norways-property-market-2025-digital-brokers-and-the-future-of-real-estate)
- [Hva solgte naboen boligen for? — Nettavisen](https://www.nettavisen.no/artikkel/hva-solgte-naboen-boligen-for-ny-tjeneste-gjor-det-enkelt-a-sjekke/s/12-95-3422815676)
- [Most visited real estate websites in Norway — Semrush, April 2026](https://www.semrush.com/trending-websites/no/real-estate)
