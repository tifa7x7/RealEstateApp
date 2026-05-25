# Typography

## Stack

| Role | Family | Source | CSS variable |
|---|---|---|---|
| Headings + hero numbers | **Playfair Display** | `next/font/google` (`latin` + `cyrillic` subsets) | `--font-heading` |
| Body, UI, labels | **DM Sans** | `next/font/google` (`latin` + `latin-ext`) | `--font-body` |

Configuration lives in [`src/app/layout.tsx`](../src/app/layout.tsx). Both load via `next/font` so they ship SSR-safe with no FOUT.

> **Known limitation.** DM Sans ships no Cyrillic glyphs from Google. Russian body text falls through to the system sans-serif stack (`system-ui, -apple-system, BlinkMacSystemFont, sans-serif`). Acceptable. If we ever need uniform Cyrillic, switch to Inter or PT Sans for the body — single decision, single file.

## Type scale

Use only these sizes. The previously-stated 6-step scale (11/12/14/15/18/22) under-served the project; the new scale absorbs the existing 26/28 outliers.

| Token | Size | Use |
|---|---|---|
| `text-[11px]` | 11px | Uppercase labels, captions, KPI hints |
| `text-[12px]` | 12px | Secondary text, metadata, table cells (small) |
| `text-[13px]` | 13px | Body in tables, dense UI |
| `text-[14px]` | 14px | **Body default.** Set on `<body>` in `globals.css` |
| `text-[15px]` | 15px | Card titles, list-item headers |
| `text-[18px]` | 18px | Section titles, modal titles |
| `text-[22px]` | 22px | KPI numbers, calc result headlines |
| `text-[26px]` | 26px | Total-cost hero in calculator results |
| `text-[28px]` | 28px | Page-title hero (project name, analytics title) |
| `text-[32px]` — `text-[40px]` | 32–40px | Homepage hero (Phase 10) — Playfair only |

**Minimum 11px.** Never `text-[9px]` or `text-[10px]`.
**No arbitrary intermediate sizes** (no `text-[16px]`, `text-[17px]`, `text-[20px]`, etc.).

## Line height

| Context | Value |
|---|---|
| Body (DM Sans) | 1.55 |
| Headings (Playfair) | 1.3 |
| Hero numbers | 1.1 — let the number breathe |
| Dense UI (table rows, badges) | 1.2 |

## Weight

| Weight | Use |
|---|---|
| 400 (regular) | Body, table cells, secondary labels |
| 500 (medium) | Buttons, active nav items, emphasized values |
| 600 (semibold) | Card titles, KPI numbers, page-title heroes |
| 700 (bold) | Reserve for marketing surfaces — avoid in app chrome |

Don't mix 500 and 600 in adjacent labels of the same hierarchy tier.

## Numbers

**Always `tabular-nums` for any number the user might compare against another number.** Already in use throughout — keep it. Includes: KPI cards, calculator results, table price columns, badge counts, hero numbers, anything inside `<dl>`/`<dt>`/`<dd>`.

```tsx
<div className="text-[22px] font-semibold tabular-nums">
  {fmt.price(value, locale)}
</div>
```

## Hierarchy by surface

| Surface | Headline | Subhead | Body |
|---|---|---|---|
| Homepage hero (Phase 10) | Playfair 32–40px / 600 | DM Sans 16px / 400 / `--text-dim` | — |
| Project hero | Playfair 28px (md) / 22px (mobile) / 600 | DM Sans 13px / `--text-dim` | DM Sans 14px |
| Card title | DM Sans 15px / 600 | DM Sans 12px / `--text-dim` | DM Sans 12-13px |
| KPI card | DM Sans 11px / 600 / uppercase / `--text-muted` | — | Playfair 22px / 600 / `tabular-nums` |
| Calculator result hero | DM Sans 11px / 600 / uppercase / `--text-muted` | — | Playfair 26px / 600 / `tabular-nums` |
| Modal title | DM Sans 18px / 600 | — | DM Sans 13px |
| Table column header | DM Sans 11px / 600 / uppercase / `--text-muted` | — | — |

## Uppercase + tracking

`uppercase tracking-wider` is the standard treatment for tiny section labels (the 11px / 600 / `--text-muted` lockup). Use it consistently — don't sometimes do it and sometimes not for the same role. See `KPIDashboard`, `ProjectCard`, `CalcResultsSummary` for the established pattern.

## What to avoid

- Italicized body text (Playfair Italic is OK as a one-off emphasis in marketing copy, never in UI).
- Underlines for non-link emphasis — reserve underlines for links and focus rings.
- Mixed-weight headlines (don't bold one word in a 600 headline).
- Letterspacing on body sizes — only on the uppercase labels.

## Open questions

- Whether to switch the body font for better Russian support. Tracked above; revisit if Russian rendering becomes a real complaint.
