'use client';

import { Bell, BellOff } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useFavorites } from '@/hooks/useFavorites';
import { useTranslations } from '@/hooks/useTranslations';
import { ALERTS_DEFAULT_THRESHOLD_PCT } from '@/hooks/usePaywall';
import { useAppStore } from '@/store/app-store';

export interface AlertToggleButtonProps {
  projectId: number;
  /** Pass null/undefined for project-level alerts, a unit id for unit-level. */
  unitId?: string | null;
  /** Compact icon-only variant for badges / dense rows. */
  compact?: boolean;
}

/**
 * Phase 17 — alerts are now per-LIST, not per-item. This button keeps the
 * per-item entry point users learned in Phase 16 by:
 *
 *   1. Adding the item to the user's default `Избранное` list (idempotent).
 *   2. Toggling whether an alert exists on that list.
 *
 * Pressed state = "an alert exists on my default list AND this item is in
 * it." The granularity is at the list level — turning on alerts for one
 * item turns on alerts for every item in `Избранное`. Phase 17 Session 2
 * will surface multi-list management properly; this preserves the muscle
 * memory until then.
 */
export function AlertToggleButton({
  projectId,
  unitId = null,
  compact = false,
}: AlertToggleButtonProps) {
  const t = useTranslations();
  const { hasAlert, toggle } = useAlerts();
  const { toggleFavorite, toggleFavUnit, isFavorite, isFavUnit } = useFavorites();
  const defaultListId = useAppStore((s) => s.defaultListId);

  const inDefault = unitId ? isFavUnit(projectId, unitId) : isFavorite(projectId);
  const alertOn = defaultListId ? hasAlert(defaultListId) : false;
  const on = inDefault && alertOn;

  const label = on
    ? unitId
      ? t.alerts.removeForUnit
      : t.alerts.removeForProject
    : unitId
      ? t.alerts.addForUnit
      : t.alerts.addForProject;

  const handleClick = () => {
    if (!defaultListId) return;
    // Ensure the item is in Избранное before toggling alerts. If we're
    // turning alerts OFF the item stays put — only the alert flips.
    if (!inDefault) {
      if (unitId) toggleFavUnit(projectId, unitId);
      else toggleFavorite(projectId);
    }
    void toggle({ listId: defaultListId, thresholdPct: ALERTS_DEFAULT_THRESHOLD_PCT });
  };

  const className =
    'inline-flex items-center gap-2 rounded-lg text-[13px] font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
    (compact ? 'px-2 py-2' : 'px-3 py-2 ') +
    (on
      ? 'bg-[var(--accent-surface)] text-[var(--accent)] border border-[var(--accent)]/40'
      : 'bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/40');

  const Icon = on ? Bell : BellOff;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={on}
      aria-label={label}
      title={label}
      className={className.replace(/\s+/g, ' ').trim()}
    >
      <Icon size={14} aria-hidden="true" className={on ? 'fill-current' : ''} />
      {!compact && <span>{on ? t.alerts.enabled : t.alerts.enable}</span>}
    </button>
  );
}
