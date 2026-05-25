# Brand Identity & Design System

This folder is the single source of truth for everything visual, tonal, and stylistic about RealEstateApp. CLAUDE.md governs architecture, code rules, and product strategy; this folder governs **how the app looks, sounds, and feels**.

When you're about to write a component, pick a color, choose a headline, or design an interaction, **start here**.

## Files

| File | What it covers |
|---|---|
| [positioning-voice.md](positioning-voice.md) | Brand voice, tone, headline templates, microcopy patterns. "Decision tool, not price ticker." |
| [colors.md](colors.md) | Color tokens, semantic mappings, light/dark themes, confidence-tier colors, usage rules. |
| [typography.md](typography.md) | Font stack, type scale, hierarchy by context, tabular-nums policy. |
| [spacing.md](spacing.md) | 4px grid, container padding, breakpoints. |
| [components.md](components.md) | Visual specs for `ui/` primitives — current and planned. |
| [motion.md](motion.md) | Easing, durations, when to animate and when not to. |
| [accessibility.md](accessibility.md) | WCAG 2.1 AA contract, focus, ARIA patterns, contrast targets. |

## Living document

These files reflect both the current implementation and the *intended* design system that Phases 10–16 will fully ship. When you find a gap between what's documented here and what exists in the codebase, prefer the docs — the gap is the work.

When the design system evolves, update these files in the same PR as the code change.

## Out of scope

- Product strategy and positioning *hierarchy* (decision → search → market intel) lives in [`CLAUDE.md`](../CLAUDE.md) because it dictates feature ordering and information architecture, not just appearance. The brand *voice* derived from that positioning lives in [positioning-voice.md](positioning-voice.md).
- Code rules (`lib/` purity, server/client split, no `any`, etc.) live in [`CLAUDE.md`](../CLAUDE.md).
- Phase-by-phase deliverables and decision log live in [`IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md).
