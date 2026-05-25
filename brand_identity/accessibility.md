# Accessibility

**Target: WCAG 2.1 AA.** No exceptions for marketing surfaces, hero cards, or "the design will look weird otherwise." If it doesn't pass AA, redesign it.

## Contract

Every component author and PR reviewer holds these:

| Concern | Rule |
|---|---|
| **Contrast** | Body text ≥ 4.5:1. Large text (≥ 18px or ≥ 14px bold) ≥ 3:1. Verified with a contrast tool before shipping a new color combination. |
| **Focus** | Every interactive element has a visible focus ring: `focus-visible:ring-2 focus-visible:ring-[var(--accent)]`. Tab order matches visual order. |
| **Keyboard** | Every action must be reachable via keyboard. Modals trap focus. Esc dismisses. Sheets/Drawers behave the same. |
| **Icons** | Icon-only buttons require `aria-label`. Decorative icons inside labeled buttons use `aria-hidden="true"`. |
| **Forms** | Labels associated via `htmlFor`/`id` or wrap-pattern. Required fields use `required`. Errors use `role="alert"` and clear text. |
| **Color independence** | Don't rely on color alone to convey meaning. Status pills carry text. Confidence badges carry icons + labels. Charts have shape + color encoding. |
| **Skip link** | Skip-to-content link at the top of `<body>`. Already present in `layout.tsx`. Don't remove. |

## ARIA patterns in use

- **Tabs** (`ProjectTabs`): `role="tablist"` on container, `role="tab"` + `aria-selected` + `aria-controls` + `tabIndex={active ? 0 : -1}` per tab, `role="tabpanel"` + `aria-labelledby` + `hidden` per panel. Pattern is reusable — copy it if you add another tab strip.
- **Switches** (calculator section toggles): `role="switch"` + `aria-checked`. Prefer `aria-labelledby` pointing to the section title over a custom `aria-label`.
- **Sort indicators** (`ProjectTable`): `aria-sort="ascending" | "descending"` on the active `<th>`.
- **Toggle buttons** (favorite, compare): `aria-pressed`. Label changes between states (e.g., `addFav` ↔ `removeFav`).
- **Modal**: `role="dialog"` + `aria-modal="true"` + labelled title.
- **Alerts**: `role="alert"` on inline error text.

## Required ARIA additions (Phase 12+)

- **Confidence badges**: when interactive (hover/tap to expand), give the trigger an accessible name describing the tier ("Confidence: estimated") and reveal the tooltip via `aria-describedby` once the Tooltip primitive lands.
- **Custom map markers**: `divIcon` HTML must include `role="button"` + `aria-label="{project name}, {city}, {price/m²}"`. Currently no a11y on markers — fold into Phase 13.
- **Compare launcher**: floating button needs `aria-live="polite"` so screen readers announce when the count changes.

## Screen-reader-only content

Use Tailwind's `sr-only` for content that exists for assistive tech but shouldn't render visually. Current uses:
- Skip link (which becomes visible on focus via `focus:not-sr-only`).
- Homepage `<h1 className="sr-only">` so the page has a proper heading hierarchy even though the visible layout starts with KPI cards.

After Phase 10, the homepage `<h1>` becomes visible (it's the hero headline), and the `sr-only` h1 goes away.

## Locale and lang

The `<html lang>` attribute mirrors the active locale via `LocaleHtmlLang.tsx` (a client effect). SSR ships `lang="ru"` (default before hydration). This is acceptable: bots see the dominant locale, the effect corrects for users with a different preference.

If we ever add localized routes, switch to setting `lang` server-side from the URL.

## Forms — what's still owed

- `Input` primitive must auto-associate label and input. Audit before launch.
- Required-field indication should not rely solely on the asterisk colour.
- Password inputs need real strength feedback before launch (currently silent; Phase 15).

## Color independence checks

- Status badges include text, not just color. ✓
- Confidence badges (Phase 12) include an icon, not just color. Mandatory.
- Charts: every series gets a legend AND a distinct shape (dot vs line type) — `dot={{ r: 2.5 }}` is in use, keep it. Don't ship a chart where two series rely only on color difference.
- Toast variants: success / warning / error must include an icon, not just background color.

## Mobile-specific

- Touch targets ≥ 44×44px. Icon-only buttons at `p-2` (8px around a 16-20px icon) hit this; smaller is forbidden.
- Bottom-anchored UI accounts for `env(safe-area-inset-bottom)`.
- Sheet drag-to-dismiss must also be keyboard-dismissable (Esc).

## Testing checklist (pre-launch)

- [ ] Run axe DevTools on each route. Zero serious / critical findings.
- [ ] Lighthouse Accessibility ≥ 95 on every route.
- [ ] Tab through each top-level surface (homepage, project detail, calculator, account). Focus order matches visual order; no traps; visible ring throughout.
- [ ] Verify Russian + English screen reader pronunciations on the project hero, calculator results, and confidence badges.
- [ ] Verify `prefers-reduced-motion` disables all translate/scale motion (see [motion.md](motion.md#reduced-motion)).

## What to avoid

- `aria-label` as a band-aid for an unclear visual label. Fix the visual label.
- Removing focus rings to make a design "cleaner."
- Disabling buttons during async actions without an accessible loading state.
- "ARIA roles for decoration" — only add roles you actually intend.
