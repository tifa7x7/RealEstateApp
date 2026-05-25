# Components

Visual specs for the `src/components/ui/` design-system primitives. Each primitive must:

1. Accept a `className` prop for composition.
2. Use `forwardRef` if it wraps a native element.
3. Have a TypeScript props interface (no `any`).
4. Support dark and light themes via CSS variables — not conditional classes.
5. Be domain-free. UI primitives don't know about real estate. Generic props only (`variant`, `size`, `color`) — never `projectStatus` or `classType`.

Domain logic (mapping a `ProjectStatus` to a status color) lives in feature components like `ProjectCard`, not in `Badge`.

## Existing primitives

### Button

Variants: `primary` (teal background, white text), `secondary` (blue outline), `ghost` (no border, hover surface), `danger` (red background, white text).
Sizes: `sm` (px-3 py-1.5, 12px text), `md` (px-4 py-2, 13px text), `lg` (px-5 py-2.5, 14px text).
States: default, hover (opacity 90% on filled, 10% bg on outline), focused (2px accent ring with 2px offset), disabled (50% opacity, not-allowed cursor).
Always renders as `<button type="button">` unless `type` is overridden.

### Card

Props: `padded` (default true → `p-4`), `elevated` (use `--bg-elevated` instead of `--bg-card`), `interactive` (hover border + focus ring).
Always has `border border-[var(--border)] rounded-lg`.
Interactive cards must wrap a single primary action target (a `<Link>` or `<button>`) and forward `focus-visible` to the card itself.

### Badge

Props: `color` (any token-or-mix), `size` (`sm` / `md`).
Visual: pill, rounded-full, 11–12px, weight 500, soft tinted background via `color-mix(... 12%, transparent)` with a matching outline at 25%.
Used for project status, class, unit status, and the `(soon)` pill — never invent a new "label" component.

### Input

Props: `label` (auto-associated via `htmlFor`/`id`), `wrapperClassName`, `tooltip` (forthcoming Tooltip integration), standard HTML input props.
Visual: `--bg-elevated` fill, `--border` outline, 13px, 8px vertical padding, focus ring in `--accent`.
Label position: above input, 11px / 600 / uppercase / `--text-muted` — matches the section-label convention.

### Modal

ARIA: `role="dialog"`, `aria-modal="true"`, focus trap, Esc to close, click-outside to close.
Sizes: `sm` / `md` / `lg`. Centered on desktop. On `<md` it remains centered for now — Phase 11 introduces a Sheet primitive that takes over mobile-friendly cases.

### Toast

Stack at top-right (desktop) / top (mobile). 2-second auto-dismiss by default. Two-word body convention (see [positioning-voice.md](positioning-voice.md#toast-confirmations)).
Replaces inline button-variant flips for confirmation (Phase 10 sweep). Don't reuse this primitive for upsell or paywall — use `UpgradePrompt`.

### Skeleton / Skeletons

`Skeleton` is the primitive (height / width / border-radius props).
`Skeletons.tsx` exports composed skeletons (`CardSkeleton`, `KPISkeleton`, `ChartSkeleton`, etc.) used in `loading.tsx` per route segment.
**No spinners.** Always content-shaped skeletons.

### EmptyState

Props: `icon` (Lucide component), `title`, `description?`, `action?` (`{ label, onClick, variant }`).
Centered vertically and horizontally. Icon at 44px in `--text-muted`. Title 15px / 600. Description 13px / `--text-dim`. Action button on a single line below.

### DualRangeSlider

Domain-agnostic dual-handle slider. Theme-aware thumbs. `value: [number, number]`, `onChange`, `min/max/step`, optional `formatLabel`.
Used for price + sea-distance + size filters. **Do not** add a "fastShown" pricing prop or any domain awareness.

### ProGate

Wraps content that's Pro-only. Free tier sees a centered Card with `Sparkles` icon, title, description, and "Перейти на Pro" CTA that opens `UpgradePrompt`.
Used by `CashflowForecast` and `RentalPortfolio`. Don't use for inline upsells where a button-side Pro badge would suffice — that's a different pattern.

### UpgradePrompt

Modal with default feature list (currently aspirational — see [positioning-voice.md](positioning-voice.md) and Phase 15 honesty pass). Props allow overriding `title`, `description`, `features`, `ctaLabel`, `onUpgrade`.
**Never advertise a Pro feature here that isn't implemented.** This is a brand-trust commitment, not a UX preference.

### ErrorBoundary

Shared body for all per-segment `error.tsx` files. Renders icon + title + description + reset button. In development, logs the error to console.

## Planned primitives

### ConfidenceBadge (Phase 12)

```tsx
<ConfidenceBadge tier="verified" />
<ConfidenceBadge tier="estimated" tooltip="Оценка модели на основе сопоставимых проектов." />
<ConfidenceBadge tier="user-input" />
```

- **Verified** — solid filled pill in `--accent`, check icon, label "Подтверждено".
- **Estimated** — outlined pill in `--text-dim`, sparkles or model icon, label "Оценка".
- **User input** — outlined pill in `--secondary`, edit icon, label "Ввод".

Size: 11px / 500, height ~18px. Used inline next to numbers. Optionally interactive: hover/tap reveals the `tooltip` via the new Tooltip primitive.

This is the centerpiece of Phase 12 — the trust-and-differentiation move borrowed from the Solgt.no benchmark. Surface it on:
- Project cards (per-project `dataConfidence`)
- Calculator output rows (per-metric derivation)
- Map markers (subtle outline ring colored by confidence)
- Analytics chart legends (when aggregates lean on sparse data)

### Tooltip (Phase 11)

Floating-UI based. Props: `content` (string or ReactNode), `placement` (`top` / `bottom` / `left` / `right`), `delay` (default 300ms open / 150ms close).
Replaces ad-hoc `tooltip` string prop on `CalcInput` and forthcoming `ConfidenceBadge`. Keyboard-accessible (focus reveal, Esc dismiss).

### Sheet / Drawer (Phase 11)

Side-mounted on desktop (right edge, ~400–520px wide), bottom-mounted on mobile (full width, ~75vh tall, drag-to-dismiss).
Focus-trapped, themed. Replaces the centered-Modal pattern for:
- Mobile filter panel (currently uses `Modal` — Phase 1 decision-log carry-over)
- Compare drawer (Phase 13)
- Mobile calculator results pill → opens Sheet
- Mobile booking / contact form (Phase 13+)

Props: `open`, `onClose`, `side` (`right` / `bottom` / `auto`), `title`, `children`.
"`auto`" picks `right` on `lg+` and `bottom` on `<lg`.

### CompareLauncher + CompareDrawer (Phase 13)

`CompareLauncher` — floating bottom-right button visible whenever `compareIds.length > 0`, showing "Сравнить ({n})". Click opens `CompareDrawer`.
`CompareDrawer` — a Sheet (right side on desktop, bottom on mobile) rendering the side-by-side comparison of projects via an adapted `ComparisonTable`. Includes a "Очистить" action and per-item remove buttons.

### AdSlot (Phase 15)

Placeholder slot for ad inventory. Props: `location` (`'listings-inline' | 'filter-top' | 'project-bottom'`), `size`. Renders nothing if no ad provider is configured. **Never** renders on calculator results, analytics charts, account pages, or project Apartments tab.

## Composition rules

- **Feature components compose `ui/` primitives — never reverse.** `ProjectCard` imports `Card`, `Badge`, `Button` from `ui/`. `Card` never imports from `projects/`.
- **Feature components own domain mapping.** `ProjectCard` is allowed to read `STATUS_COLORS[p.status]` and pass it to a generic `Badge color={...}`. `Badge` itself doesn't know `STATUS_COLORS` exists.
- **Pages are thin.** `app/*/page.tsx` does data fetching + composes feature components + handles routing. No domain logic.

## What to avoid

- Inventing new primitives for one-off use cases. If you find yourself needing one, propose adding it to this file in the same PR.
- Letting a primitive "leak" domain logic via prop shape (e.g., `Badge color="status-projected"` is fine; `Badge type="projectStatus"` is not).
- Skipping `forwardRef` on primitives that wrap a focusable native element.
- Building a tooltip ad-hoc instead of using the Tooltip primitive once it exists.

## Open questions

- Whether `EmptyState` should expand to support a two-action variant (primary + secondary). So far one action is enough.
- Whether to add a `Stat` primitive for the KPI-card lockup (label / number / hint). Currently inlined in `KPIDashboard` and `CalcResultsSummary` and `RentalPortfolio` — already mild duplication. Promote if a fourth instance appears.
