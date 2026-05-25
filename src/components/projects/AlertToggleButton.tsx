'use client';

import { Bell, BellOff } from 'lucide-react';
import { useAlerts } from '@/hooks/useAlerts';
import { useTranslations } from '@/hooks/useTranslations';
import { ALERTS_DEFAULT_THRESHOLD_PCT } from '@/hooks/usePaywall';

export interface AlertToggleButtonProps {
  projectId: number;
  /** Pass null/undefined for project-level alerts, a unit id for unit-level. */
  unitId?: string | null;
  /** Compact icon-only variant for badges / dense rows. */
  compact?: boolean;
}

/**
 * Phase 16 — one-tap toggle for a price alert on a project or unit. Reuses
 * `useAlerts.toggle` so tier-aware limits and toast feedback live in one
 * place. Pressed state mirrors `hasAlert(scope)`.
 */
export function AlertToggleButton({
  projectId,
  unitId = null,
  compact = false,
}: AlertToggleButtonProps) {
  const t = useTranslations();
  const { hasAlert, toggle } = useAlerts();

  const on = hasAlert(projectId, unitId);
  const label = on
    ? unitId
      ? t.alerts.removeForUnit
      : t.alerts.removeForProject
    : unitId
      ? t.alerts.addForUnit
      : t.alerts.addForProject;

  const handleClick = () => {
    void toggle({
      projectId,
      unitId,
      thresholdPct: ALERTS_DEFAULT_THRESHOLD_PCT,
    });
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
