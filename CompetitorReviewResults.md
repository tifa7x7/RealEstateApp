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

---

# Addendum — Signed-out UI walkthrough (2026-05-26)

> **Why this exists.** The original analysis (above) admits in its methodology note that WebFetch could only retrieve `<title>` tags from Solgt's SPA, so it inferred behaviour from Google snippets, blog posts, and press coverage. It never actually *saw* the rendered marketing site. The user recorded 7 short videos of the signed-out marketing surface; I extracted ~56 frames and walked them. This addendum captures what was visible — direct observations only, not inferred — and translates the strongest patterns into concrete moves we can adapt for [src/app/page.tsx](src/app/page.tsx) and the marketing surfaces around it. **Source material:** [Screen_dumps/](Screen_dumps/) (7 mp4s) → [Screen_dumps/frames/](Screen_dumps/frames/) (56 jpgs).

## A. Header & global navigation

- **Sticky horizontal nav with a 9-item slot pattern**: `[Solgt.no logo (dark pill)] [Company] [Products ▾] [Applications ▾] [Insights ▾] [Contact] [Pricing] [SIGN IN] [TRY FOR FREE]`. The two right-side items are visually weighted: SIGN IN is a plain link in caps, TRY FOR FREE is a bordered pill button.
- **Products is a mega-menu**, not a dropdown list. Hovering opens a 5-column row of named-product cards each with a small icon + name + one-line description (Value Analyst · Map Explorer · Scout · Rental · Neighborhood Statistics). Identical pattern under Applications (Buying / Selling / Rental / Reports / Investing / Curious).
- **Logo is a dark filled rounded-square block** containing "Solgt.no" in white — high contrast against the soft mint/lavender hero background. The brand pill stays consistent across every page.
- **Footer** is a 4-column structure: brand blurb (left) + Products / Company / Resources lists. Footer products list mirrors the mega-menu; resources include Terms / Privacy / FAQ / User Guide.

## B. Landing-page anatomy (single scroll)

In scroll order, the homepage is a **fixed sequence of ~10 modular sections**. Each is a self-contained "slab" with consistent rhythm:

1. **Hero with embedded product screenshot.** The hero doesn't lead with a search input — it leads with a *named product mockup* (the Value Analyst valuation table). The headline floats above the screenshot; below the screenshot is a three-stat strip ("8 ANALYTICS TABS · 3 VALUE MODELS · 1-10 STANDARD") in purple numerals + grey caption, and a primary CTA button "TRY VALUE ANALYST →" in solid indigo. This is **product-as-hero**, not search-as-hero. They are confident enough in the *visual* of their flagship tool to make it the headline asset.
2. **Three-card value-prop row** with eyebrow-style mini headlines ("You don't know what the home is worth" / "Standard accounts for 30-50% of the value" / "One overview. No searching."), each terminating in a small "→ SEE VALUE MODELS / ADJUST DEFAULT / SEE VALUE ANALYST" link. This is the *objection-handling* layer — it answers the three reasons a visitor might bounce.
3. **Logo trust strip** — 5 enterprise customer logos: Fredensborg · Heimstaden · UNION · Opsahl Gruppen · Utleiemegleren. All real estate / property investment firms. No counts, no quotes, just monochrome wordmarks.
4. **Alternating product feature blocks**, image-left/text-right then text-left/image-right. Each block: eyebrow product name in caps ("VALUE ANALYST" / "MAP EXPLORER" / "SCOUT"), serif headline ("Your most important tool for understanding what the home is worth"), 4 checkmark bullets, primary "TRY FOR FREE →" + secondary "Explore [Product] →" CTA pair.
5. **Capability summary row** — "From value estimate to bidding round. All in one platform." with 4 named highlight cards. Subhead: *"Real estate agents have had these tools for years. Now it's your turn."* — repositioning a professional-tier product as consumer-accessible.
6. **"MADE FOR" persona segmentation row** — 4 columns: Home buyers / First-time buyers / Home sellers / Homeowners, each with a one-paragraph use-case. No buttons; just framing.
7. **Testimonial carousel** — large serif quotes, paginated dots, small attribution ("MW · @MWCapital1"). Example verbatim: *"Thanks to Solgt.no, I bought an apartment 960,000 kr below the asking price."* Concrete number, attributable handle.
8. **Pricing table** with Monthly/Annually toggle (with "Save 20% with annual" pill underneath) and **four tiers**:

   | Tier | Price | Target | Bullets (counted) |
   |---|---|---|---|
   | **Sold Basis** | **0 kr/mo** | Sales prices throughout Norway, free explore | 3 |
   | **Sold Plus** | **499 kr/mo** | Home buyers, sellers, hobby investors | 6 |
   | **Sold Premium** | **799 kr/mo** *(RECOMMENDED badge)* | "Those looking for an extra advantage" | 5 |
   | **Sold company** | **Customized** | Investors, brokers, financial players | 5 + API |

   Bullets are crisp. *Sold Plus* lists: full sales history · all title holders · standard value estimate · 3 value models · 3 rental models · area statistics in maps · integrated basebook printing. *Sold Premium* adds: Sold Scout · renovation/high-standard finder · underpriced/high-yield table · Historical Land Registry Transcript · ownership history · price change notifications. **Notice that "price change notifications" sits in the Premium tier, validating our Phase 16 alerts decision and our Pro positioning.**
9. **Final "Get started" CTA** — eyebrow "GET STARTED" + headline "Start for free today. See what your home is worth." + the same two CTAs.
10. **Footer.**

## C. Use-case ("Applications") page anatomy

Every Applications page (Buying / Selling / Rental / Reports) **uses the exact same skeleton**:

1. Eyebrow tag in caps (e.g. `HOME SALES`)
2. Serif headline (e.g. *"Sell your home smarter"*) — 2 lines, large, centered
3. One-paragraph subhead
4. Two CTAs side by side: **TRY FOR FREE →** (solid indigo) + **SEE PRICES →** (outlined)
5. Product screenshot (always dark-themed) — even though the marketing site is light, the product UI shown is dark. **Dual theming on display.**
6. Big purple-numeral stats strip (3-4 numbers): e.g. *"3 VALUE MODELS · 8 ANALYTICS TABS · 1M+ TRANSACTIONS · PDF/Excel EXPORTS"*
7. Centered headline section like *"Why do people pay thousands for an appraisal?"* with numbered list (1 / 2 / 3) of short paragraph reasoning
8. Feature grid: 2×3 of icon + bold mini-headline + paragraph ("Three value models for independent estimation" / "Comparable sales in the neighborhood" / "Simulate renovation for value addition" / etc.)
9. Persona row: "Who is X for?" — numbered (01-06) persona cards (Home buyers / First-time buyers / Brokers / Curious / Landlords / Investors)
10. FAQ accordion (8-10 items, all chevron-down)
11. Final "Ready to…?" CTA with `→` icon in a circle, headline, sub, and same two CTAs
12. Footer

The pattern is rigid enough that **every page feels like the same product** — same visual rhythm, same CTA pair, same FAQ shape. No bespoke pages.

## D. Product page anatomy

Same skeleton as Applications but with a stronger lean on the product mockup. The Value Analyst page hero is the table screenshot; the Map Explorer page hero is the dark-theme map with overlay numbers; the Scout page hero is the dark-theme filter table. Each page reuses 3-6 of the same modular blocks: stats strip, "Who is X for?" persona row, FAQ, final CTA.

## E. Visual system (observed directly)

- **Type:** Serif (Playfair-ish) for headlines, sans-serif for body. Headlines are large (≥48px on hero), 2-3 lines, deliberately literary in tone (*"Your most important tool for understanding what the home is worth"*).
- **Color palette:** White / soft mint or lavender wash (vertical gradient backgrounds, very subtle), dark indigo for primary CTAs (looks like `#5252DE` / `#6366f1` range), black-near for nav logo, mid-grey for body text. Stats numbers are saturated purple.
- **Two distinct UI themes coexist:** marketing surface = white/soft gradient; product surface (shown in screenshots) = pure dark with electric green / teal data accents. They want the marketing to look approachable and the product to look powerful. **This pattern matches our app — we have a dark default UI and could afford to give the marketing pages a light skin.**
- **Stats are huge purple numerals** (~64px) with tiny caps captions underneath. Used at least once per page. Very high contrast against white.
- **CTAs are always paired**: primary (filled) + secondary (outlined or link). Never a single CTA. The secondary is almost always "SEE PRICES" — they consistently send curious visitors to the pricing page as the *backup* conversion, not a dead-end.
- **Eyebrow labels in caps** above every section heading. Tiny, letter-spaced, muted. Acts as a section index ("VALUE ANALYST" / "SCOUT" / "MADE FOR" / "GET STARTED").
- **FAQ accordions are everywhere** — every product, every application page closes with one. Each row is a single-line question + chevron, no row dividers between (subtle horizontal hairlines instead).
- **Concrete numbers everywhere**: "17,000+ active ads", "611,000+ historical sales", "1M+ transactions", "200,000 data points", "960,000 kr below asking". They quantify everything they can.

## F. Marketing-copy patterns (verbatim where possible)

- Headlines are *outcome-promises*, not feature-descriptions: "Sell your home smarter" / "Buy a home with insight, not gut feeling" / "Set the right rental price, based on data" / "Ready to pick up your property report?"
- Subheads are 2-line plain language: "Understand what the home is worth before contacting the agent. Three value models, neighborhood data, and comparable sales put you in control of the sales process."
- Repeated competitive framing: *"Real estate agents have had these tools for years. Now it's your turn."* — explicit *democratization* angle.
- Pricing-page copy ("For home buyers, home sellers, and hobby investors. **Don't go into the bidding round blindly.**") puts the fear cleanly. They sell against ignorance, not against competitors.
- The Sold *Scout* page differentiator copy: *"What distinguishes Scout from housing marketplaces?"* with numbered comparison list — they don't name FINN.no but it's clearly the implicit target. **Worth copying as a pattern**: positioning against the *category* rather than the *competitor name* is gentler legally and more inclusive of any future competitor.

## G. Conversion mechanics (observed)

- **Free-tier visible from the homepage** (Sold Basis at 0 kr/mo). They don't hide the free tier behind "Pricing" — it's the first column of the pricing table.
- **Both CTAs land on signup**, not on a feature deep-dive. "TRY FOR FREE" goes to registration; "SEE PRICES" goes to the pricing table. The choice is between "I'm sold, sign me up" and "show me the numbers first" — no third option to "explore the product without signing up." This is intentional: the *interactive demo IS the signed-up product*. Free tier exists so the first click after signup gives real value.
- **No live demo / interactive widget on the marketing site.** Screenshots only. They've decided the signup friction is worth less than the demo-build maintenance cost.

---

## H. What this means for RealEstateApp — concrete adaptations

The original analysis already pulled R1-R5 (search hero, confidence labels, neighborhood map layer, finishing-grade selector, blog) — and we shipped most of those in Phases 10-14. The walk-through surfaces a **second wave** of adaptations specifically about *marketing surface* (not in-app), most of which we haven't started.

### H1. Marketing-vs-app theming split

**Observation:** Solgt's marketing pages are light; the product UI shown in screenshots is dark. They get warmth on the funnel + power on the tool.

**Our state:** We have a dark default + light theme [globals.css](src/styles/globals.css), but the homepage [src/app/page.tsx](src/app/page.tsx) renders in the same theme the user picks. The marketing surface and the product surface are visually identical, which means we don't get the "marketing feels approachable" lift.

**Move:** Either force-light the unauthenticated marketing pages (`/`, `/blog/*`, future `/products/*` and `/applications/*` use-case pages) regardless of the user's stored theme preference, OR give the marketing pages a distinct "soft" palette (lavender/mint gradients instead of true white). Low-risk: a `data-marketing="true"` attribute on the layout that overrides a small set of tokens. **Effort:** S. **Priority:** Medium — visual polish, not a feature.

### H2. Product-as-hero, not search-as-hero (revise R1 from prior analysis)

**Observation:** Solgt's hero is **not** a search input. It's a screenshot of the Value Analyst with a "TRY VALUE ANALYST →" CTA. Our Phase 10 shipped a search-first hero ([HomeHero.tsx](src/components/projects/HomeHero.tsx)) which was correct for the "browse 18 projects" prototype scale. As we grow the catalog and lean into the calculator as the differentiator, the hero asset arguably should be a **screenshot of the calculator** (or the wizard's step 3 with a satisfying result number visible) and the primary CTA should be "Рассчитать инвестицию →" not "Найти квартиру."

**Why this is a real reconsider:** The prior analysis used Solgt as evidence for *search-first*. But the actual Solgt homepage is *calculator-first* in visual hierarchy. CLAUDE.md positions us as *decision tool > search tool > market intel*. The decision tool is the calculator. The hero should match the positioning.

**Move:** A/B-style choice — either (a) keep the current search hero and add a "Calculate Investment →" secondary button alongside the search input, or (b) flip to a calculator-screenshot hero with the search input demoted to the second slab. **Don't ship either silently** — this is a positioning decision worth a user check before implementing. **Effort:** M. **Priority:** Decision needed before action.

### H3. Public product/use-case landing pages (new)

**Observation:** Solgt has FIVE `/produkter/*` pages and SIX `/bruksomrader/*` pages — 11 landing pages that all follow the same modular skeleton. They're SEO landing pages that double as detailed feature walkthroughs.

**Our state:** Zero. Our marketing surface is the homepage + the blog. The calculator/map/analytics pages are in-app, not marketing.

**Move:** Build a small page builder around a `MarketingSlab` component supporting: eyebrow + serif headline + subhead + screenshot + stats strip + feature grid + persona row + FAQ + CTA-pair. Then generate ~6 SEO landing pages: `/калькулятор-инвестиций-новостройки`, `/семейная-ипотека-2026`, `/маткапитал-новостройка`, `/новостройки-крыма`, `/как-выбрать-новостройку`, `/доходность-аренды`. Each targets a high-intent Russian-language query. **Effort:** M (component) + M (writing each page). **Priority:** Medium — pairs naturally with the blog from Phase 14.

### H4. "TRY FOR FREE" + "SEE PRICES" as a CTA-pair pattern

**Observation:** Solgt uses the exact same two-CTA pair on every page. Primary = signup; secondary = pricing. They never give you a single CTA. Never a dead-end.

**Our state:** Hero has a single search input. UpgradePrompt has "Перейти на Pro" + "Позже." We don't have a consistent marketing-surface CTA-pair.

**Move:** Define a `MarketingCTAPair` component with the canonical pair `[Зарегистрироваться бесплатно →]` + `[Посмотреть тарифы →]`. Mount it at the bottom of every marketing slab. Adds one global, repeated conversion path. Also — we don't have a `/pricing` page; we have UpgradePrompt as a modal. **A standalone `/pricing` page is a Phase-15 carry-over we can ship now** that doubles as the destination for the secondary CTA. **Effort:** S (component) + M (pricing page). **Priority:** High — it's a missing conversion surface.

### H5. The pricing table itself — 4 tiers vs our 2

**Observation:** Solgt has 4 tiers (Free / Plus 499 / Premium 799 / Company custom). Premium is the recommended middle. The free tier is **visible from the homepage**, not hidden behind /pricing.

**Our state:** Two tiers (Free / Pro). Pro is a single price (implicit in UpgradePrompt). No tier comparison surface exists.

**Move (long form):** Consider adding a 3rd tier between Free and Pro that's annual-only ("Pro Yearly — 20% off"), and a 4th "Бизнес / Команды" custom tier for the (currently hypothetical) developer/broker B2B segment that contacts sales. That gives us the same 4-column visual structure and a destination for any inbound enterprise interest. **The B2B tier is also where the API access lives**, which is something we don't have but could pre-announce. **Effort:** M for the pricing-page UI + S for adding the B2B custom tier copy. **Priority:** Medium — depends on whether we want to signal multi-segment ambition before having a real B2B sale.

**Move (short form, ship-now version):** Keep 2 tiers, but build the pricing page and present it as a comparison table with annual toggle. Even a 2-column table is better than the current "modal-only" pattern.

### H6. Persona segmentation row ("Made for" / "Кому подходит")

**Observation:** Every Solgt page has a numbered persona row (01-06): Home buyers / First-time buyers / Sellers / Investors / Brokers / Landlords / Curious. It's a 30-second "is this for me?" answer.

**Our state:** None. We talk about "everyday apartment seekers and casual investors" in CLAUDE.md but never tell the visitor "this is for you."

**Move:** Add a "Кому подходит RealEstateApp" row to the homepage. 4 personas matching our positioning hierarchy: *Покупатель квартиры* (decision-tool) / *Ищу район* (search-tool) / *Инвестор-новичок* (calculator + portfolio) / *Любопытствующий* (market intel + blog). One paragraph each, no CTA. **Effort:** S. **Priority:** Medium — quick win for the positioning-clarity goal.

### H7. Concrete-number stat strips

**Observation:** Every Solgt page has at least one big-purple-number stats strip. *"611,000+ historical sales"* / *"17,000+ active ads"* / *"1M+ transactions"* / *"200,000 data points"*. Quantified everywhere.

**Our state:** We say "18 projects in 5 cities" only in passing on the homepage market-snapshot strip. We don't lead with numbers.

**Move:** Surface our real counts as a big-numeral strip — "18 ЖК · 130 квартир · 5 городов · ₽X млрд предложений." When Supabase goes live and the catalog grows, this strip will grow with it and become more impressive. **Effort:** S. **Priority:** Low — works better once the catalog is larger.

### H8. FAQ accordion as a closing pattern

**Observation:** Every product/application page closes with an 8-10 row FAQ accordion before the final CTA.

**Our state:** No FAQ surface anywhere in the app.

**Move:** Author 5-8 FAQs per marketing surface (homepage, calculator landing, future product pages, future application pages) and use an accordion primitive. Topics: *"Откуда данные о ценах?"* / *"Это бесплатно?"* / *"Что считает калькулятор?"* / *"Семейная ипотека — где подвох?"* / *"Можно ли использовать без регистрации?"* / *"Когда появятся другие регионы?"* — each answer 1-2 paragraphs, links to the relevant blog post where applicable. Triple-duty: visitor reassurance, internal linking for SEO, support-load reduction. **Effort:** S (component) + M (writing). **Priority:** Medium.

### H9. Testimonial carousel with attribution

**Observation:** Quotes are large, serif, paginated, with a small username attribution ("MW · @MWCapital1"). Concrete claim numbers in the quote itself ("960,000 kr below asking").

**Our state:** Zero testimonials, zero user quotes.

**Move:** Don't fake any — but **add the surface now** with a placeholder "Скоро здесь будут отзывы пользователей" so the layout slot exists, and start collecting from beta users when Supabase goes live. The structural slab matters more than the content right now. **Effort:** S (component) + ongoing (collecting). **Priority:** Low — but the slot is cheap.

### H10. Mega-menu for products

**Observation:** Solgt's `Products ▾` opens a 5-column row of named-product cards with icons.

**Our state:** Our header has linear tabs (Search · Map · Analytics · Calculator). Acceptable today; doesn't scale once we add more surfaces (blog, products landing pages, application landing pages, settings, account).

**Move:** Not yet. Mega-menus pay off when the IA grows past ~7 top-level items. We're at 4. Revisit when there are 6+ marketing surfaces to organize.

---

## I. Concrete patterns I would NOT copy

Calling these out so the addendum doesn't read as "copy everything."

- **Product-screenshot-as-hero in dark theme on a light page.** Solgt does this because their product is mature enough to demo visually. Our calculator UI is fine but not photogenic in screenshot form. Wait until we have a calculator screen worth screenshotting (post Phase 11 wizard, with confidence badges from Phase 12) before going screenshot-hero.
- **Product names in English on a Russian-language site.** Solgt names products *Verdianalytiker / Speider / Kartutforsker* in Norwegian. We should resist naming our calculator "InvestPro" or similar — keep names in plain Russian ("Калькулятор инвестиций" / "Карта" / "Аналитика рынка") because our target user is the *opposite* of jargon-tolerant.
- **Numbered persona cards (01, 02, 03…) as a primary IA pattern.** Looks polished but adds visual noise; our [components.md](brand_identity/components.md) hasn't blessed numbered-row treatments. The persona idea is good (H6) but I'd render the columns without the numerals.
- **Hiding `/pricing` until Phase-15-style billing is real.** Solgt has live billing. We have stubs. A pricing page that says "Pro — coming soon" undermines trust. **Build the pricing page in code, but soft-launch it (no nav link) until billing is wired.** Linkable from UpgradePrompt only, until then.

---

## J. What's still missing — signed-in surface

The user explicitly called out *"different UI when signed in and when Try for free option clicked and registered."* I have **no visibility into that surface** — the videos in [Screen_dumps/](Screen_dumps/) are signed-out marketing only. The signed-in product UI is what'll most directly inform our own in-app surfaces (calculator, map, account dashboard), and that's where the second round of videos comes in.

When those land in [Screen_dumps/](Screen_dumps/) I'll extract frames the same way and write Section K below covering: signed-in IA / dashboard layout / how their "favorites" surface compares to our [FavoritesList.tsx](src/components/account/FavoritesList.tsx) / how their notifications UI compares to our Phase 16 [NotificationsSection.tsx](src/components/account/NotificationsSection.tsx) / what their report-export ("etakst") flow looks like vs our print-to-PDF.

**Standing offer:** drop more mp4s in [Screen_dumps/](Screen_dumps/) at any time. The frame-extraction script ([Screen_dumps/\_extract_frames.py](Screen_dumps/_extract_frames.py)) is checked in and re-runnable.

---

# Section K — Signed-in product walkthrough (2026-05-26)

> Source material: 5 new mp4s in [Screen_dumps/](Screen_dumps/) — `Inside_Account_page-1-Main_page.mp4` through `-5-Dashboard_page.mp4` — covering the post-login surfaces of Solgt.no: home/search, Map explorer, Scout, Lists (their "favorites" surface), and Dashboard. 40 frames extracted via the same pipeline as Section A-J.

## K1. Signed-in chrome (replaces top-nav with left rail)

The marketing site's horizontal top nav (`Company · Products ▾ · Applications ▾ · Insights ▾ · Contact · Pricing · SIGN IN · TRY FOR FREE`) **disappears completely** after login. In its place:

- **Narrow left rail** (icon-only by default, ~40px wide), with collapse/expand-on-hover behavior. Expanded labels in order:
  - **Solgt.no** logo (top, dark on dark — same brand pill style)
  - **Map explorer**
  - **Scout**
  - **Lists**
  - **Dashboard** *(separator)*
  - **Recruitment campaign** *(probable referral/affiliate flow — not investigated)*
  - *(spacer pushes the rest to the bottom)*
  - **Profile**
  - **Privacy mode** *(an explicit toggle, not a setting — possibly hides activity from collaborators or anonymizes search history)*
  - **Feedback**
  - **Log out**
- **Top-right utilities only** at chrome level: theme toggle (sun icon) + notification bell. Nothing else.
- **Theme inverts to dark** by default. The marketing pages were white/lavender; the product is true dark with electric green/blue/purple data accents. **This is the visible payoff of the dual-theming hypothesis from H1** — they really do ship two visual languages.
- **No global search in the chrome**; the search input is a *page element* on the home/main and Scout pages, not part of the rail. This is deliberate — search isn't always the right next action; sometimes the user wants the map or the dashboard.

**Comparison to our app:** we have a horizontal top nav ([Header.tsx](src/components/layout/Header.tsx)) + mobile bottom nav ([MobileNav.tsx](src/components/layout/MobileNav.tsx)) that's identical pre- and post-login. There's no separate "product chrome." Our `/account` segment has its own tab bar ([AccountTabs.tsx](src/components/account/AccountTabs.tsx)) but it sits *under* the same global header. They make a much harder break between marketing IA and product IA.

## K2. Main page after login = single search input + "Explore the map" CTA

The signed-in home page is **radically minimal**:
- Centered `Solgt.no` wordmark
- A single search input: *"Search by address or with ad link"*
- An `OR` divider
- An "Explore the map" pill button
- Footer (same as marketing, dark theme)

That's the entire page. No KPI strip, no dashboard, no recommendations, no recent activity. It's a launcher, not a homepage.

**Notable detail:** they accept *both* an address query *and* a paste of an ad link (Norwegian equivalent of a FINN.no listing URL). That second affordance — "paste a listing URL we'll parse" — is a brilliant low-friction onramp that converts "I'm browsing FINN" into "I'm using Solgt to evaluate what I found on FINN." It's a hook into someone else's traffic.

**Inverted insight vs marketing analysis:** Section B of the prior addendum found that the *marketing* hero leads with a product screenshot (Value Analyst table), not a search input. The *signed-in* main is the opposite — search-first, screenshot-free. They reserved the screenshot-as-hero for unconvinced visitors who need to see what they're getting; signed-in users already know what the product is and just want a starting point.

## K3. Map explorer — three notable patterns

The Map explorer is their flagship surface and accounts for arguably the most invested UI in the product.

**K3a. Data-layer selector as a first-class control.** Top center of the map sits a `Sold homes ▾` dropdown that opens to four layers, with **per-layer tier locks visible in the menu**:

| Layer | Tier gate |
|---|---|
| For sale | Free |
| **Pulled ads** | 🔒 **Premium** |
| Sold homes | Free |
| **Rental ads** | 🔒 **Plus** |

The Plus/Premium badges are **inline, monochrome, in the dropdown itself**. Users see exactly what's locked and at what tier. No modal interrupts them — the lock badge is enough. Tapping a locked layer presumably opens the upgrade flow.

**K3b. Floating left toolbar with 4 circular buttons** stacked vertically: `FILTER · ANALYSIS · DRAWING · STORAGE`. Each is a soft-blue circle with a small icon + small caps caption. These aren't tabs — they're persistent floating actions that open side panels:
- `FILTER` → opens a full filter dialog with sections: Year of construction · Ownership form (Freeholder/Share buttons) · Price (with `Including joint debt` toggle, dual-handle range slider) · Joint debt · Monthly common expenses
- `ANALYSIS` → opens a left-side panel with tabs `Prices / Market / Brokers` showing aggregate statistics for the visible map area
- `DRAWING` → enter a draw-a-polygon mode to constrain the area
- `STORAGE` → save the current map view (presumably for revisit / sharing)

**K3c. The Analysis panel paywalls by blur-and-CTA.** When the user opens the analysis panel as a Free user, the layout fully renders — column labels, row labels, the section structure — but the **numeric values are blurred** and a `Try Sold Plus` button with a purple-pink gradient sits at the top of the panel. *This is the most polished paywall pattern in the entire product walkthrough.* It tells the user (a) what data exists, (b) that they're missing it, (c) exactly which tier unlocks it, in one glance, without breaking the surrounding UI. Compare to our `<ProGate>` component which replaces the entire surface with an upgrade card — Solgt's approach preserves orientation.

**Comparison to our [ProjectMap.tsx](src/components/map/ProjectMap.tsx):** ours is mostly a passive viewer with a [DistrictPanel](src/components/map/DistrictPanel.tsx) side panel (Phase 13). We don't have data layers; we don't have a draw-an-area tool; we don't have a save-view affordance. The most valuable adaptation here is **K3a + K3c**: a layer-selector with inline tier locks and a blur-instead-of-hide paywall pattern.

## K4. Scout — gridded paywall + 6 named filter categories

Scout is their "find underpriced homes" surface and is **heavily paywalled** (Sold Premium tier).

**K4a. Six named filter chips along the top of the data area**, each with a count badge: `Your selection (0) · High standard (0) · Renovation project (0) · Underpriced (0) · High yield (0) · Price changes (0)`. These aren't filters in the conventional sense — they're **pre-built saved queries** that map common buyer intents to one click. "Underpriced" means "asking price < value estimate"; "High yield" means "predicted rental yield > X%"; etc. The counts let the user see at a glance which categories have hits in their current filter scope.

**K4b. Extensive left filter panel** (always visible, dismissible) with sections: Areas · Housing type · Ownership form · Price quote (range slider) · Value estimate (range slider) · Square meter price · Size (BAR) · Plot size · Story (button row: All · 1 · 2 · 3 · 4 · 5+) · **Standard** with sub-sliders for Average / Kitchen / Bathroom on a 1-10 scale · Facilities (button row: Balcony · Garage · Elevator · Rental part).

**K4c. Persistent paywall card centered over the data**: a dark card reading *"Scout — Are you interested in finding the best homes on the market, sorted by standard, yield and price changes?"* with a `Try Sold Premium` button. The data table renders blurred behind it. The card is dismissible (it disappears in some frames) but reappears prominently.

**K4d. Top toolbar pattern** mirrors a Bloomberg-style terminal: `Filter` (toggle the panel) · `Sorting` dropdown · `Speed dial` dropdown (named for the saved-views idiom) · `Table / Grid` view toggle on the far right. Below it: `Columns · Export · Reset` mini-buttons (Export presumably gated).

**K4e. Two top-level tabs:** `Advertisements` (live listings) vs `Market sales` (historical transactions, gated by `Sold Business` tier).

**Comparison to our app:** we have ProjectListings with filters + sort, but nothing like the "named query chip" pattern. Phase 13's value would 10x if we shipped 4-6 such chips on the homepage (`Лучшая цена/м²` · `Скоро сдача` · `У моря` · `Маткапитал покрывает ПВ` · `Снижение цены за месяц` · `Высокий ROI по нашему калькулятору`). They are *the* shortcut from "I want a place" to "look at these specific 5 places." We have the data; we don't have the chips.

## K5. Lists — the most undervalued surface in the entire walkthrough

This is the biggest single finding from the signed-in videos.

What Solgt calls "Favorites" is actually a **multi-list curatorial layer** with social-discovery scaffolding. Layout:

- **Your lists** at the top — table with columns: Title · Created · Updated · [visibility icon (public/private)] · [item count] · [collaborator count] · [comments count]. Each list is a named bucket of properties.
- **Featured lists** on the right rail — a curated set of editorially-promoted lists each with a 🔒 Plus or 🔒 Premium tier lock. Examples observed: *"Jan's List: Exciting homes" · "Monster purchase with Jan Oftedal" · "First-time purchases or rental properties" · "Renovation projects - January" · "Farm Slaughter (Co-Ownership Edition)"*. The Solgt team (and named power users) curate these as content.
- **Activity tab** at the bottom-left — *"Your most active lists based on content and comments"*. Surfaces lists the user actually engages with.
- **Favorites tab** next to Activity — *"Lists you have set as favorites across your own and others' shared lists"*. Lets users follow other people's public lists.
- **Public lists** at the bottom main — a large table of community lists with: Title · item count · follower count · comment count · Owner · Updated. Real examples observed: *"Oslo lowered its asking price" · "Bargain list (October)" · "OSLO SOLD MOST ABOVE!" · "possible flips" · "Investment opportunity" · "Vestfold lowered its asking price" · "Bergen Top List October"*. Owners include `Jan Oftedal | Sold.no` (a Solgt employee) and individual users (`Christian | CTO Solgt.no`, `Jasper`, `Yonas`, `Camilla`, `Erik-Johannes`).

**What this changes about how we should think about Phase 6/16:**

Our [FavoritesList.tsx](src/components/account/FavoritesList.tsx) is a single flat list. Solgt's structure says:
- **Lists should be named buckets, not one bucket.** A user collecting projects to compare for their family is doing different work from a user tracking 20 projects for investment ROI ranking. Same data, different lists.
- **Lists should be shareable and followable.** "Follow this list" creates a notification subscription (which our Phase 16 alert system already has the bones for — just rebind it from "favorite" to "list").
- **Featured/editorial lists are a content marketing surface that scales.** Solgt employees curate "Top homes in Oslo" lists as marketing content visible inside the product. Our blog (Phase 14) is one content channel; in-product curated lists are another and they convert because the user is already inside the buying flow.
- **Lists as collaboration objects.** *"Monster purchase with Jan Oftedal"* implies multi-user list ownership / co-editing — partners shopping for a place together, or buyer + broker. This is a future feature for us but the schema should leave room.

**Schema reshape for us (if we adopted this):**
```
favorites_lists (id, owner_user_id, name, visibility {private|unlisted|public}, created_at, updated_at)
favorites_list_items (list_id, project_id?, unit_id?, position, added_at, note)
favorites_list_followers (list_id, follower_user_id, alerts_enabled, created_at)
favorites_list_collaborators (list_id, user_id, role {editor|viewer}, created_at)
favorites_list_comments (id, list_id, author_user_id, body, created_at)
```
Our current `favorites` + `fav_units` collapses into `favorites_list_items` of a single "default" list per user — backwards-compatible migration. This is a **Phase 17 candidate**, sized M-L.

## K6. Dashboard (Beta)

The Dashboard surface is rich and almost editorial:

**Header section:** Search bar at top, then page title *"📈 Dashboard (Beta)"* — the `Beta` label is exposed in the chrome. Then a 4-up filter row: Time period (`Last 2 years`) · County (`All of Norway`) · Housing type (`All housing types`) · Bedroom (`All`). All four are dropdowns above the data.

**KPI strip:** 3 huge numbers, larger than the marketing-page stats:
- **249,306** — Total number of new ads
- **224,269** — Total number of homes sold
- **24,323** — Active ads now

Below the KPIs: a single explanatory paragraph: *"The figures show the total number of new listings and sold used homes for the selected time period and area. The ratio between new listings and sold homes is 1.11, which means that there are more new listings than sales during the period."*

**"Understanding change metrics" section header**, followed by 3 column-style links:
- **3 and 6 months (WoW)** — Shows week-over-week changes for short-term market trends
- **1 year (MoM)** — Shows month-over-month changes for medium-term trends
- **2 and 5 years (YoY)** — Shows year-over-year changes for long-term trends

**Six time-series charts**, each with a title + 1-3 sentence explanatory paragraph + the chart:
1. *New listings vs. sold homes* (blue + green line, paragraph explains supply/demand reading)
2. *Active ads* (purple line)
3. *Square meter price: Sales price vs. Suggested price (NOK/m²)* (orange + green lines comparing asking vs achieved)
4. *Units sold within X days (%)* (multi-line area chart showing percentiles)
5. *Difference between asking price and selling price (%)* (purple line near 0%)
6. *Average number of days on market* (purple line trending around 50-80 days)

**What this is, that ours isn't:** an **editorial market dashboard** — every chart comes with prose that tells the reader *what to look for* in the data. Compare our [analytics/page.tsx](src/app/analytics/page.tsx) (5 charts: ValueQuadrant / PriceHeatmap / DevPortfolio / AmenityImpact / ClassDistribution): we render the chart and stop. The user is left to interpret. Solgt treats the dashboard as a teaching tool — *"more new listings than sales means..."*

The **temporal orientation** is also distinct: our analytics is cross-sectional ("which class is more expensive *right now*"); theirs is time-series ("is the market heating up or cooling down *over time*"). The latter is a stronger retention hook — there's always new data to come back to.

**Big charts we can't ship today and shouldn't pretend to:**
- We don't have transaction-history data (only developer asking prices). Charts (1), (3), (5) need actual sold-price-vs-asking-price data which our domain doesn't have.
- We *can* ship: average price/m² over time (once we have snapshots — Phase 16's `price_snapshots` table is the foundation), supply count over time (count of listed units per month), days-from-listing-to-sold (proxy: stage transitions in our project status enum).

## K7. Theme + visual system inside the product

- **Pure dark backgrounds** (close to `#0d1117` or `#11151c`), no gradient. Marketing surfaces had subtle vertical gradients; the product is flat black.
- **Charts use saturated single-tone lines**: blue (#3B82F6-ish), green (#22C55E-ish), purple (#A855F7-ish), orange (#F97316-ish). Each chart's legend uses tiny color squares + label.
- **Data tables use red/green delta percentages inline** — observed in the Scout table (red `-10.x%` / green `+5.x%` numbers in dedicated `DELTA %` and `YIELD` columns). This is a Bloomberg-terminal convention they lean into.
- **Locked/Premium badges are tiny pill labels** with a small lock icon: `🔒 Plus` / `🔒 Premium`. They're never modal — they're always inline next to the feature.
- **Upgrade CTAs use a pink-purple gradient** (`Try Sold Plus` / `Try Sold Premium`) that stands out against the dark surface but doesn't shout. Restrained.
- **No animations beyond hover state transitions** observed in the videos.

## K8. What we're missing structurally (gap list)

Concrete deltas between Solgt's signed-in product and ours:

| # | Gap | Our state | Solgt's behaviour | Effort to close |
|---|---|---|---|---|
| K8.1 | Product chrome separate from marketing chrome | One header for everything | Marketing horizontal nav + product left rail | M |
| K8.2 | Multi-list favorites with naming + sharing | One flat favorites bucket | Multiple named lists, public/private, follower count, comments | L |
| K8.3 | Featured/curated lists as in-product content | None | Right-rail editorial lists with tier locks | M (after K8.2) |
| K8.4 | Named-query chips on Scout-style surfaces | Filters only | 6 named chips: Your selection · High standard · Renovation · Underpriced · High yield · Price changes | M |
| K8.5 | Inline paywall locks on feature controls (badge in dropdown) | Modal-only paywalls | `🔒 Plus` / `🔒 Premium` badges inside dropdowns and menus | S |
| K8.6 | Blur-instead-of-hide paywall pattern | `ProGate` replaces the surface entirely | Layout renders, values blurred, CTA at top | S |
| K8.7 | Data-layer selector on the map | One marker type, fixed | Sold homes / For sale / Pulled ads / Rental ads, per-layer tier gates | M |
| K8.8 | Draw-an-area filtering on the map | None | `DRAWING` tool to constrain queries to a polygon | M |
| K8.9 | Save-view / saved-search affordance | None | `STORAGE` button on the map; saved views surfaced later | M |
| K8.10 | Editorial dashboard with per-chart explanatory copy | Charts with no prose | Every chart has a 1-3 sentence "how to read this" paragraph | S |
| K8.11 | Time-series KPI dashboard separate from category analytics | `/analytics` mixes both | Dashboard surface is purely time-series, `/analytics` would stay cross-sectional | M |
| K8.12 | Paste-an-ad-link onramp on the home page | None | Search input accepts both addresses and FINN.no URLs | M (requires a "paste-a-link" parser per source) |
| K8.13 | Privacy mode toggle | None | Top-level `Privacy mode` item in the rail | S (unclear what it does — possibly anonymize collaborator visibility) |
| K8.14 | Notifications surfaced via header bell + per-feature controls | Phase 16 added notification *settings*; no bell in chrome yet | Bell icon top-right, badge counter, dropdown of recent triggers | M |

## K9. Concrete adaptations — prioritized, ranked

I'd order these against our positioning hierarchy (decision tool > search tool > market intel):

**Tier 1 — ship next (high leverage, fits current architecture):**

1. **K8.6 + K8.5 — refactor `ProGate` to support a blur-and-overlay variant**, and add inline `🔒 Plus` / `🔒 Pro` badges to dropdowns/menus. The current `<ProGate>` is too binary (allowed vs replaced). A `<ProGate mode="blur">` that renders children with `filter: blur(4px) opacity(0.6)` and overlays a smaller centered card is a small change with big UX payoff. **Effort:** S. **Files:** [ProGate.tsx](src/components/ui/ProGate.tsx) + audit existing call sites.

2. **K8.10 — add explanatory prose under each analytics chart.** Wrap each chart in a `<ChartCard title="..." hint="..." />` component. Three sentences per chart, explaining what the data shows and what to look for. **Effort:** S (component) + S (writing per chart). **Files:** [src/app/analytics/page.tsx](src/app/analytics/page.tsx) + all 5 chart components.

3. **K8.4 — named-query chips on the homepage listings.** Add 4-6 chips above the project grid that map to one-click predicates: `Маткапитал покрывает ПВ · У моря (< 1 км) · Скоро сдача · Цена снижена · Высокий ROI · Лучшая цена/м²`. Each chip is a saved query. They double as marketing hooks because each name *teaches* the user what to look for. **Effort:** M. **Files:** new `NamedQueryChips.tsx` + [src/lib/filters.ts](src/lib/filters.ts) + homepage layout.

**Tier 2 — fold into a Phase 17 retention/social loop:**

4. **K8.2 + K8.3 — multi-list favorites with sharing.** This is the biggest structural change, but unlocks: better organization for power users, a path to social discovery, in-product editorial content, and a meaningful Pro differentiator (Free = 3 lists, Pro = unlimited + collaborators). It also folds cleanly into the existing Phase 16 alert system — alerts become per-list, not per-favorite. **Effort:** L. **Phase candidate:** 17.

5. **K8.11 + K8.10 — split `/analytics` into `/market-trends` (time-series, editorial) and `/market-snapshot` (cross-sectional, what we have today).** Time-series needs Phase 16's `price_snapshots` to mature; ~6 months of weekly snapshots before the line charts have meaningful shape. Start the snapshot job now (it's running), surface the new dashboard later. **Effort:** M (UI) + 6 months of data accumulation.

**Tier 3 — opportunistic / strategic:**

6. **K8.7 — data-layer selector on the map.** We don't have transaction history, but we *do* have layers we don't expose: by status, by price tier, by completion date. A `Все / Сдан / Строится / Проектируется` layer toggle is feasible today. **Effort:** S-M.

7. **K8.12 — paste-an-ad-link onramp.** We don't have an obvious source (no Russian equivalent of FINN.no dominates the way it does in Norway), but **Avito, Domclick, and Cian** do. Each has a parseable URL format. A "paste a link from Avito/Cian/Domclick → we'll pull the unit and pre-fill the calculator" hook would be powerful. Sized M because it needs a parser per source. **Effort:** M per source.

8. **K8.14 — surface the notification bell in the header chrome.** Phase 16 shipped the alert system + settings UI but didn't surface a recent-triggers dropdown. Adding a bell with badge + dropdown closes that loop. **Effort:** S-M.

## K10. What we should NOT copy

- **K8.1 (separate product chrome)** — premature for our app's complexity. We have 4 top-level surfaces; Solgt has 5 + collaboration. We won't benefit from inventing a left rail until we have 6-7 surfaces and the horizontal nav genuinely runs out of room.
- **K8.8 (draw-an-area)** — engineering complexity is high (Mapbox polygon tools, server-side area predicate); user base is too small to justify. Park it.
- **K8.9 (saved views)** — only valuable when filters get complex enough to be hard to recreate. Today our filter URL is already shareable; a `Сохранить вид` button would compete with bookmarking. Park.
- **Solgt's `Recruitment campaign` rail item** — looks like a referral/affiliate program. Worth considering later but not in scope for retention. Skip.
- **The `Privacy mode` toggle** — unclear what it does; we don't have collaboration yet so the failure mode (your activity visible to who?) doesn't apply. Skip until we ship K8.2.

## K11. Updated summary table — adaptations from both walkthroughs combined

Folding signed-out (Sections A-J) and signed-in (Section K) findings together, the priority-ordered backlog:

| ID | Move | Where it comes from | Sized |
|---|---|---|---|
| 1 | Blur-and-CTA `ProGate` variant + inline tier badges | K8.5 + K8.6 | S |
| 2 | Per-chart explanatory copy on `/analytics` | K8.10 | S |
| 3 | Named-query chips above project listings | K8.4 | M |
| 4 | `/pricing` page as standalone marketing surface | H4 | M |
| 5 | `MarketingCTAPair` reusable component | H4 | S |
| 6 | "Кому подходит" persona row on the homepage | H6 | S |
| 7 | FAQ accordion blocks on homepage + each marketing surface | H8 | S+M |
| 8 | `MarketingSlab` component + 6 SEO landing pages | H3 | M+M |
| 9 | Data-layer toggle on the map (status-based, what we already have) | K8.7 | S-M |
| 10 | Header notification bell + recent-triggers dropdown | K8.14 | S-M |
| 11 | Multi-list favorites with sharing + alerts-per-list refactor | K8.2 + K8.3 | L (Phase 17) |
| 12 | Time-series market-trends dashboard (post-snapshot accumulation) | K8.11 | M + wait |
| 13 | Paste-an-ad-link onramp (Avito/Cian/Domclick) | K8.12 | M per source |
| 14 | Calculator-as-hero rethink on the homepage | H2 | Decision needed |
| 15 | Marketing-vs-product theme split | H1 | S |
| 16 | Big-numeral stat strip on the homepage | H7 | S |
| 17 | Testimonial carousel slot (placeholder, content later) | H9 | S |

Items 1-3 are immediate wins. Items 11 + 14 are positioning-level decisions worth a user check before implementation. Items 12 and 13 need either data accumulation or external API integration. Item 4 (`/pricing` page) is the most overdue gap — every other marketing-tier site I've seen has one and we have only `UpgradePrompt` modal.

