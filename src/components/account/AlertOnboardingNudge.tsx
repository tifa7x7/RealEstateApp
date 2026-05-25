'use client';

import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';
import { useAlerts } from '@/hooks/useAlerts';
import { useFavorites } from '@/hooks/useFavorites';
import { useTranslations } from '@/hooks/useTranslations';
import { ALERTS_DEFAULT_THRESHOLD_PCT } from '@/hooks/usePaywall';
import { useAppStore } from '@/store/app-store';

const NUDGE_TRIGGER_COUNT = 3;

/**
 * Phase 16 — inline strip prompting the user to enable price alerts after
 * they've collected enough favorites. Renders once, then disappears
 * permanently (gated by `userPrefs.alertsNudgeDismissed`). Tapping "Enable"
 * bulk-creates default-threshold alerts for every current favorite.
 */
export function AlertOnboardingNudge() {
  const t = useTranslations();
  const { favoriteProjects, favoriteUnits } = useFavorites();
  const { alerts, bulkAdd } = useAlerts();
  const dismissed = useAppStore((s) => s.alertsNudgeDismissed);
  const setDismissed = useAppStore((s) => s.setAlertsNudgeDismissed);
  const toast = useToast();

  const totalFavorites = favoriteProjects.length + favoriteUnits.length;
  const hasAnyAlert = alerts.some((a) => a.active);

  // Only show: 3+ favorites, not yet dismissed, no active alerts already.
  if (dismissed || hasAnyAlert || totalFavorites < NUDGE_TRIGGER_COUNT) {
    return null;
  }

  const handleEnable = async () => {
    const targets = [
      ...favoriteProjects.map((p) => ({
        projectId: p.id,
        unitId: null as string | null,
        thresholdPct: ALERTS_DEFAULT_THRESHOLD_PCT,
      })),
      ...favoriteUnits.map(({ project, unit }) => ({
        projectId: project.id,
        unitId: unit.id,
        thresholdPct: ALERTS_DEFAULT_THRESHOLD_PCT,
      })),
    ];
    const result = await bulkAdd(targets);
    setDismissed(true);
    if (result.ok) {
      toast.success(t.alerts.nudgeEnabled);
    }
  };

  return (
    <div
      className="relative flex items-start gap-3 p-4 rounded-lg border"
      style={{
        background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
        borderColor: 'color-mix(in srgb, var(--accent) 32%, transparent)',
      }}
    >
      <div
        className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
        style={{ background: 'color-mix(in srgb, var(--accent) 18%, transparent)' }}
      >
        <Bell size={16} className="text-[var(--accent)]" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-semibold mb-1">{t.alerts.nudgeTitle}</h3>
        <p className="text-[12px] text-[var(--text-dim)] leading-relaxed mb-3">
          {t.alerts.nudgeBody}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" onClick={() => void handleEnable()}>
            <Bell size={14} aria-hidden="true" />
            {t.alerts.nudgeEnable}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            {t.alerts.nudgeDismiss}
          </Button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t.alerts.nudgeDismiss}
        className="absolute top-2 right-2 p-1 rounded-md text-[var(--text-dim)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
