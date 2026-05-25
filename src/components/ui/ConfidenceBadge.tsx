'use client';

import { type ReactNode } from 'react';
import { CheckCircle2, HelpCircle, Pencil, Sparkles } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { useTranslations } from '@/hooks/useTranslations';

export type ConfidenceTier = 'verified' | 'estimated' | 'user-input' | 'unverified';

export interface ConfidenceBadgeProps {
  tier: ConfidenceTier;
  /**
   * Tooltip body override. If omitted, falls back to the per-tier hint
   * from i18n (`confidence.*Hint`). Pass a string or ReactNode for richer
   * contextual explanations (e.g., "Rate sourced from MARKET_DATA").
   */
  tooltip?: ReactNode;
  /** Compact mode: icon only, label hidden. Used in dense rows. */
  compact?: boolean;
  /** Override the label text. */
  label?: string;
  className?: string;
}

interface TierStyle {
  color: string;
  bg: string;
  borderTint: string;
  Icon: typeof CheckCircle2;
}

const TIER_STYLES: Record<ConfidenceTier, TierStyle> = {
  verified: {
    color: 'var(--confidence-verified)',
    bg: 'color-mix(in srgb, var(--confidence-verified) 12%, transparent)',
    borderTint:
      '1px solid color-mix(in srgb, var(--confidence-verified) 30%, transparent)',
    Icon: CheckCircle2,
  },
  estimated: {
    color: 'var(--confidence-estimated)',
    bg: 'color-mix(in srgb, var(--confidence-estimated) 10%, transparent)',
    borderTint:
      '1px solid color-mix(in srgb, var(--confidence-estimated) 25%, transparent)',
    Icon: Sparkles,
  },
  'user-input': {
    color: 'var(--confidence-user-input)',
    bg: 'color-mix(in srgb, var(--confidence-user-input) 12%, transparent)',
    borderTint:
      '1px solid color-mix(in srgb, var(--confidence-user-input) 25%, transparent)',
    Icon: Pencil,
  },
  unverified: {
    color: 'var(--warning)',
    bg: 'color-mix(in srgb, var(--warning) 10%, transparent)',
    borderTint:
      '1px solid color-mix(in srgb, var(--warning) 30%, transparent)',
    Icon: HelpCircle,
  },
};

/**
 * Surface every number's provenance. Per CLAUDE.md "Data confidence is a
 * first-class UI concept", any computed or stored value the user sees should
 * be tagged with a tier:
 *
 *   - `verified`     — developer-confirmed (or catalog-sourced calc input)
 *   - `estimated`    — model output / market-average default
 *   - `user-input`   — user explicitly overrode a default
 *   - `unverified`   — explicitly flagged as not confirmed (project-level only)
 *
 * Renders as a small outlined pill with an icon + label, with a Tooltip
 * explaining the tier in plain language.
 */
export function ConfidenceBadge({
  tier,
  tooltip,
  compact = false,
  label,
  className = '',
}: ConfidenceBadgeProps) {
  const t = useTranslations();
  const style = TIER_STYLES[tier];
  const Icon = style.Icon;

  const fallbackLabel: Record<ConfidenceTier, string> = {
    verified: t.confidence.verifiedLabel,
    estimated: t.confidence.estimatedLabel,
    'user-input': t.confidence.userInputLabel,
    unverified: t.confidence.unverifiedLabel,
  };
  const fallbackHint: Record<ConfidenceTier, string> = {
    verified: t.confidence.verifiedHint,
    estimated: t.confidence.estimatedHint,
    'user-input': t.confidence.userInputHint,
    unverified: t.confidence.unverifiedHint,
  };

  const resolvedLabel = label ?? fallbackLabel[tier];
  const resolvedTooltip = tooltip ?? fallbackHint[tier];

  return (
    <Tooltip content={resolvedTooltip}>
      <span
        className={
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium tabular-nums whitespace-nowrap ' +
          className
        }
        style={{
          background: style.bg,
          border: style.borderTint,
          color: style.color,
        }}
      >
        <Icon size={11} aria-hidden="true" />
        {!compact && <span>{resolvedLabel}</span>}
        {compact && <span className="sr-only">{resolvedLabel}</span>}
      </span>
    </Tooltip>
  );
}

/**
 * Map a project's stored `dataConfidence` (which uses the schema vocabulary)
 * to a `ConfidenceTier` for the badge. Projects can be `verified` /
 * `estimated` / `unverified` / undefined. Undefined collapses to `estimated`
 * (the safest default — we have data but haven't validated it).
 */
export function projectDataConfidenceToTier(
  value: string | undefined | null,
): ConfidenceTier {
  if (value === 'verified') return 'verified';
  if (value === 'unverified') return 'unverified';
  return 'estimated';
}
