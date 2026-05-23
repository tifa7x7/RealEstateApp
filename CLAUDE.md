@AGENTS.md

# CrimeaDevTracker — Project Instructions

## Product

Real estate investment analytics platform for new-build apartments in Russia (starting with Crimea). Target users are everyday apartment seekers and casual investors — not professionals. The core promise: Bloomberg-level analysis with zero learning curve.

- **Stack:** Next.js 16 (App Router, TypeScript, Tailwind CSS), Supabase (Postgres + Auth), Zustand (state), React Query (data fetching), Recharts (charts), Leaflet (maps), Lucide React (icons)
- **Monetization:** Freemium + ads for free tier
- **Localization:** Russian (primary) and English. All user-facing strings live in `src/i18n/ru.ts` and `src/i18n/en.ts`. Never hardcode display text in components.
- **Theme:** Dark (default) and light. All colors via CSS custom properties in `src/styles/globals.css`. Never hardcode color hex values in components — use `var(--token)` or Tailwind classes mapped to tokens.

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

### Colors (CSS custom properties in globals.css)

```
--bg, --bg-card, --bg-elevated       # Background tiers
--border                              # Borders and dividers
--text, --text-dim, --text-muted      # Text hierarchy (primary → secondary → tertiary)
--accent / --accent-bg / --accent-surface   # Teal (#00d4aa dark, #00956f light for text contrast)
--secondary: #3b82f6                  # Blue — links, secondary actions
--warning: #f59e0b                    # Amber — caution, "under construction"
--premium: #a855f7                    # Purple — Pro/paid features
--danger: #ef4444                     # Red — errors, negative values, "sold"
```

Never use raw hex in components. Use `var(--accent)` in inline styles or map to Tailwind classes.

### Typography

- **Headings / hero numbers:** `font-family: 'Playfair Display', serif`
- **Body / UI:** `font-family: 'DM Sans', sans-serif`
- **Size scale (use only these):** 11px (xs), 12px (sm), 14px (base), 15px (md), 18px (lg), 22px (xl)
- **Minimum font size:** 11px. Never use text-[9px] or text-[10px].
- **Line height:** 1.55 for body, 1.3 for headings

### Spacing

4px base grid. Prefer: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px). Card padding is `p-4` (16px). Don't mix `p-3`, `p-3.5`, `p-4` for the same type of container.

### Components

Every `ui/` component must:
- Accept a `className` prop for composition
- Use `forwardRef` if it wraps a native element
- Have TypeScript props interface
- Support dark/light themes via CSS variables (not conditional classes)

Button variants: `primary` (teal bg), `secondary` (blue outline), `ghost` (no border), `danger` (red).
Badge: accepts `color` prop. Used for status and class labels.

### Accessibility

- Every icon-only button needs `aria-label`
- All interactive elements need visible focus rings: `focus-visible:ring-2 focus-visible:ring-[var(--accent)]`
- Modals: `role="dialog"`, `aria-modal="true"`, focus trap
- Minimum contrast 4.5:1 for text, 3:1 for large text
- Table headers: `scope="col"`

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

### Freemium boundaries

Free tier: full search, project/unit browsing, basic calculator (1 object), 10 favorites.
Pro tier: multi-object calculator with comparison + rankings, 10-year forecasts, portfolio tracker, exports, no ads.

Gate features with a `usePaywall(feature: string)` hook that checks user tier. Show a styled upgrade prompt — never a blank wall.

## Conventions

- **Commits:** Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`)
- **Files:** kebab-case for files (`project-card.tsx`), PascalCase for components (`ProjectCard`)
- **Imports:** Use `@/` alias. Group: React → Next.js → external libs → `@/lib` → `@/hooks` → `@/components` → relative
- **API responses:** Always return `{ data, error }` shape. Never throw from API routes.
- **Error handling:** Components that fetch data must handle loading, error, and empty states.
- **No `any`.** Use `unknown` and narrow with type guards.

## What NOT to do

- Don't hardcode Russian text in components — use i18n keys
- Don't hardcode hex colors — use CSS variables or design tokens
- Don't put business logic in components — extract to `lib/`
- Don't use `useEffect` for derived state — use `useMemo`
- Don't use `localStorage` for user data that should persist across devices — use Supabase
- Don't add features not in the current stage — follow the implementation roadmap
- Don't use `text-[9px]` or `text-[10px]` — minimum 11px
- Don't create new color values — use the established palette
- Don't skip loading/error/empty states when building data-fetching components
- Don't use `<table>` for the default mobile view — use cards, with table as a desktop toggle
