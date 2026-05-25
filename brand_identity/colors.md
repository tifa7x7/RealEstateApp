# Colors

All colors are CSS custom properties declared in [`src/styles/globals.css`](../src/styles/globals.css). **Never use raw hex in components.** Use `var(--token)` in inline styles or map to Tailwind classes.

## Foundation tokens

These already exist today. They are the floor.

```css
/* Backgrounds (3 tiers — page, card, elevated) */
--bg          /* page background           dark: #0b0e14   light: #ffffff */
--bg-card     /* card surfaces             dark: #131722   light: #f7f9fc */
--bg-elevated /* hover/pressed surfaces    dark: #1a1f2e   light: #eef2f7 */

/* Borders */
--border      /* dividers & card borders   dark: #1f2937   light: #e2e8f0 */

/* Text (3 tiers — primary, dim, muted) */
--text        /* body & headings           dark: #e7eaef   light: #1a202c */
--text-dim    /* secondary labels          dark: #8893a7   light: #4a5568 */
--text-muted  /* tertiary captions         dark: #5a6478   light: #718096 */

/* Brand */
--accent          /* teal — primary action      dark: #00d4aa   light: #00956f */
--accent-bg       /* hover/pressed variant      dark: #00b894   light: #007a5c */
--accent-surface  /* 10% accent on surface      rgba(0,212,170,0.10) / (0,149,111,0.08) */

/* Semantic */
--secondary  /* blue — links, info        dark: #3b82f6   light: #2563eb */
--warning    /* amber — caution            dark: #f59e0b   light: #d97706 */
--premium    /* purple — Pro features      dark: #a855f7   light: #9333ea */
--danger     /* red — error / negative     dark: #ef4444   light: #dc2626 */
```

## Semantic tokens (Phase 10)

To eliminate the hex-in-components anti-pattern in `lib/constants.ts` (`STATUS_COLORS`, `CLASS_COLORS`), introduce dedicated semantic tokens. These map onto the foundation palette but carry domain meaning. Components and `constants.ts` reference these — not the foundation tokens directly, and never raw hex.

```css
/* Project status — mapped to the existing palette */
--status-projected    /* "Проектируется"       = var(--secondary) */
--status-construction /* "Строится"             = var(--warning) */
--status-handover     /* "Ввод в эксплуатацию"  = var(--premium) */
--status-completed    /* "Сдан"                 = var(--accent) */

/* Project class — same palette, different mapping */
--class-economy   /* "Эконом"   = var(--text-dim) */
--class-comfort   /* "Комфорт"  = var(--secondary) */
--class-business  /* "Бизнес"   = var(--warning) */
--class-premium   /* "Премиум"  = var(--premium) */

/* Unit status */
--unit-available  /* "в продаже" = var(--accent) */
--unit-reserved   /* "бронь"     = var(--warning) */
--unit-sold       /* "продано"   = var(--danger) */
```

## Confidence tiers (Phase 12)

Every numeric value the user sees is classifiable. See `ConfidenceBadge` in [`components.md`](components.md#confidencebadge-phase-12).

```css
--confidence-verified   /* developer-confirmed   = var(--accent) */
--confidence-estimated  /* model output           = var(--text-dim) */
--confidence-user-input /* user-entered           = var(--secondary) */
```

Display:
- **Verified** — solid filled badge in `--accent`. Used for project data confirmed by the developer (`dataConfidence='verified'`).
- **Estimated** — outlined badge in `--text-dim`. Used for model outputs, calculator results derived from defaults, or `dataConfidence='estimated'`.
- **User input** — outlined badge in `--secondary`. Used for calculator results derived from values the user explicitly changed.

## Usage rules

| Color | When to use | When NOT to use |
|---|---|---|
| `--accent` (teal) | Primary action buttons, positive financial outcomes (positive cashflow, ROI > 0), "verified" confidence, the brand mark. | Never for warnings or negatives. |
| `--secondary` (blue) | Links, secondary actions, neutral information, "user input" confidence. | Not for primary CTAs. |
| `--warning` (amber) | "Under construction" status, attention-required states. | Not for errors (use `--danger`). |
| `--premium` (purple) | Pro-tier features, `ProGate`, `UpgradePrompt`, upsell badges. | Not for general accents. |
| `--danger` (red) | Errors, sold units, negative cashflow, destructive action confirmations. | Not for "caution" (use `--warning`). |

## Color-mix patterns

Use `color-mix(in srgb, <token> <pct>%, transparent)` when you need a translucent surface variant. This pattern is already in use for `FilterPanel` pill backgrounds and `UpgradePrompt` icon wells. Don't pre-bake new tokens at every percentage.

```tsx
style={{ background: 'color-mix(in srgb, var(--premium) 15%, transparent)' }}
```

## Recharts and other SVG-fill libraries

SVG `fill` attribute does not interpolate CSS variables. Instead of hardcoding hex per chart file, route through a `useChartColors()` hook (Phase 10 deliverable) that reads `getComputedStyle(document.documentElement).getPropertyValue('--token')` and returns a typed palette object. Charts subscribe to theme changes.

**Don't** copy hex values into `CashflowForecast.tsx`-style constants. **Do** depend on the hook.

## Banned

- Any raw hex value in `*.tsx` files. Period.
- New colors invented for one screen. If you need a new color, propose a token in this file in the same PR.
- Hue shifts (e.g., a "darker teal") via Tailwind opacity or `/20` suffix when a defined token would do.

## Open questions

- Light-theme chart contrast (axis ticks too pale) — to be fixed by the `useChartColors()` hook in Phase 10.
- Marker outline colors for confidence on the map — to be specified during Phase 12.
