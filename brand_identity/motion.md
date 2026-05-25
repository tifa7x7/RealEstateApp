# Motion

The product feels calm and premium. Motion supports state changes and reveals; it does not entertain.

## Easing

Single ease for the whole app:

```css
cubic-bezier(0.25, 0.1, 0.25, 1)
```

This is roughly iOS-spring — quick-out, gentle-in. Use it for everything except instantaneous state flips (`transition-colors` on hover, which can stay default).

For Tailwind, declare a utility:

```js
// tailwind.config or globals.css
--ease-spring: cubic-bezier(0.25, 0.1, 0.25, 1);
```

## Duration tiers

| Tier | Duration | Use |
|---|---|---|
| Instant | 0ms | State changes that must feel immediate: sort, filter toggle, tab switch. |
| Quick | 100ms | Hover color shifts, button press, badge variant flips. |
| Standard | 150ms | Modal/Sheet open + close, dropdown reveal, tooltip in/out. |
| Slow | 200–250ms | Drawer slide-in/out, route transitions where used. |
| **Never** | >300ms | If a motion takes longer than 300ms in app chrome, it's wrong. |

Defaults already in the codebase (`transition-colors`) are fine for hover treatments. Apply the spring ease + standard duration only when an element changes position or visibility.

## When to animate

- **Modal/Sheet/Drawer open/close.** Fade + 8–12px translate from the mount edge. Standard duration.
- **Toast appearance.** Fade + 6px translate down. Quick duration. Auto-dismiss with a matching fade-out.
- **Skeleton → content.** 100ms cross-fade so the layout doesn't snap. Phase 10 deliverable.
- **Favorite heart toggle.** Quick 1.0 → 1.15 → 1.0 scale on fill change. Quick duration. Single-shot, no looping.
- **Confidence badge reveal on hover** (Phase 12). Quick fade.
- **Sort indicator (chevron) flip.** Quick rotation.

## When NOT to animate

- Every hover state. `transition-colors` is enough.
- Layout changes from filter results. The new set should appear; transitioning row positions feels gimmicky.
- Map pan/zoom is handled by Leaflet; don't override.
- Numbers ticking up. We're a decision tool, not a Stripe billing demo.
- Confetti, sparkles, ambient backgrounds, anything that draws attention away from data.

## Reduced motion

Honor `prefers-reduced-motion: reduce`. Disable all motion utilities that translate or scale; keep colour transitions.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    transition-timing-function: linear !important;
  }
}
```

This belongs in `globals.css` once the motion utilities are in active use.

## Performance

Animate `transform` and `opacity` only. Never `top`, `left`, `width`, `height`, `box-shadow` (use `filter: drop-shadow` if you must).

If an animation drops below 60fps in DevTools on a mid-range Android (target: Redmi Note 9 class), simplify or remove it.

## Open questions

- Whether the route-transition fade should be cross-fade or wipe. Currently no route transitions; Phase 14 might revisit if loading.tsx skeletons feel jarring.
