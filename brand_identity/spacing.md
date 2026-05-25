# Spacing & Layout

## The grid

**4px base.** Every margin, padding, and gap should be a multiple of 4.

Prefer the established Tailwind tokens:

| Token | Value | Common use |
|---|---|---|
| `gap-1` / `p-1` | 4px | Tight icon/text pairs, badge inner spacing |
| `gap-1.5` / `p-1.5` | 6px | Pill spacing |
| `gap-2` / `p-2` | 8px | Compact controls, icon buttons |
| `gap-3` / `p-3` | 12px | Tight cards, dense form rows |
| `gap-4` / `p-4` | 16px | **Default card padding.** Section gaps |
| `gap-5` / `p-5` | 20px | Looser sections |
| `gap-6` / `p-6` | 24px | Layout-level gaps, modal padding |
| `gap-8` / `p-8` | 32px | Major section dividers |

Don't mix `p-3` / `p-3.5` / `p-4` for the same kind of container. Pick one and propagate.

## Card padding

- Default card: **`p-4`** (16px). Established convention. Don't change without reason.
- Compact card (inside a card, list item): `p-3` (12px).
- Modal body: `p-6` (24px).
- Hero / full-bleed card: top/bottom 32–40px, left/right 16–24px.

## Page chrome

Per the established pattern in `src/app/*/page.tsx`:

```tsx
<div className="px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto flex flex-col gap-6">
```

- Mobile: 16px horizontal, 24px vertical.
- Desktop (`md+`): 24px horizontal, 32px vertical.
- Section gap inside a page: 24px (`gap-6`).
- Max width: most pages 6xl (72rem = 1152px); analytics 7xl (80rem) given its chart density.

## Breakpoints

We use Tailwind defaults. **Mobile-first** — write base styles for mobile, then add `md:`, `lg:` overrides upward.

| Token | Min-width | Designed for |
|---|---|---|
| (base) | 0px | Phones, 375–414px target |
| `sm:` | 640px | Larger phones, small tablets |
| `md:` | 768px | Tablets — switch from card grid to table, show header tabs |
| `lg:` | 1024px | Desktop — show sidebar filter panel, sticky calculator results |
| `xl:` | 1280px | Wide desktop — comparison drawers, multi-column layouts |

## Mobile bottom-nav spacing

MobileNav is fixed at the bottom on `<md`. Pages reserve `pb-20` (`md:pb-0`) on `<main>` so content isn't hidden behind it. Don't omit this when adding new pages.

Account for iOS safe-area inset:

```css
padding-bottom: env(safe-area-inset-bottom);
```

Already in `MobileNav.tsx` — re-apply if you add other bottom-anchored surfaces.

## Sticky positioning

- Header: `sticky top-0 z-[100]`.
- Desktop filter sidebar: `sticky top-[120px]` (120px = header + tab nav height).
- Desktop calculator results: `lg:sticky lg:top-[120px]` (only on `lg+` — on mobile the results panel is in-flow at the bottom of scroll; Phase 11 adds a floating "Показать результат" pill + Sheet).

**Never** use a sticky position smaller than `z-[10]` when the element can overlap a Modal or Toast; Modal uses `z-[200]`, Toast uses `z-[300]`, MobileNav and Header use `z-[100]`.

## Card grid vs table

CLAUDE.md rule: **don't use `<table>` for the default mobile view.** Pattern:

```tsx
<div className="md:hidden grid gap-3">
  {/* cards */}
</div>
<div className="hidden md:block">
  {/* table */}
</div>
```

Both render in markup (CSS-toggle) so SSR is unambiguous.

## Container max-widths

| Page | Max width |
|---|---|
| Homepage | None (filter sidebar + listings, full width within page chrome) |
| Project detail | `max-w-6xl` |
| Calculator | None (form + sticky results sidebar, full width on lg+) |
| Analytics | `max-w-7xl` |
| Account / Settings forms | `max-w-md` for forms, `max-w-3xl` for tab content |
| Map | Full width — let the map breathe |

## What to avoid

- Pixel-level margins (`mt-[7px]`) when a token would do.
- Inconsistent vertical rhythm between sibling sections.
- Negative margins to "fix" a layout. If you need a negative margin, redesign the layout.
- Hard-coded heights (`h-[472px]`) — let content drive height except for charts and map (which need explicit heights for ResponsiveContainer).
