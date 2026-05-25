'use client';

import { useState } from 'react';
import { Bell, BellOff, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { useAlerts } from '@/hooks/useAlerts';
import { useTranslations } from '@/hooks/useTranslations';
import { ALERTS_DEFAULT_THRESHOLD_PCT } from '@/hooks/usePaywall';

const THRESHOLDS = [3, 5, 10, 15] as const;

/**
 * Phase 16 — notifications block on `/account/settings`. Lists active price
 * alerts, lets the user adjust threshold or disable each row, and links to
 * Pro upgrade for the real-time tier.
 */
export function NotificationsSection() {
  const t = useTranslations();
  const { alerts, isPro, setThreshold, setActive, remove } = useAlerts();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const activeCount = alerts.filter((a) => a.active).length;

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3 inline-flex items-center gap-1.5">
        <Bell size={13} aria-hidden="true" />
        {t.alerts.sectionTitle}
      </h2>
      <p className="text-[12px] text-[var(--text-dim)] mb-3 leading-relaxed">
        {t.alerts.sectionHint}
      </p>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4 text-[12px] text-[var(--text-dim)]">
        <span>
          {t.alerts.activeOn}: <span className="font-semibold text-[var(--text)] tabular-nums">{activeCount}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles size={12} className="text-[var(--premium)]" aria-hidden="true" />
          {isPro ? t.alerts.proRealtime : t.alerts.freeWeeklyDigest}
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)] py-3">{t.alerts.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] flex-wrap"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-medium">
                  {a.unitId
                    ? `${t.alerts.unit} ${a.unitId} · ЖК #${a.projectId}`
                    : `${t.alerts.wholeProject} · ЖК #${a.projectId}`}
                </span>
                <span className="text-[11px] text-[var(--text-dim)] tabular-nums">
                  {a.lastNotifiedAt
                    ? `${t.alerts.lastNotified} ${new Date(a.lastNotifiedAt).toLocaleDateString()}`
                    : t.alerts.lastNotifiedNever}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-[var(--text-dim)] inline-flex items-center gap-1">
                  ≥
                  <select
                    value={Math.round(a.thresholdPct)}
                    onChange={(e) => void setThreshold(a.id, Number(e.target.value))}
                    className="bg-[var(--bg)] border border-[var(--border)] rounded px-1.5 py-1 text-[12px] tabular-nums"
                    aria-label={t.alerts.thresholdLabel}
                  >
                    {THRESHOLDS.map((th) => (
                      <option key={th} value={th}>
                        {th}%
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void setActive(a.id, !a.active)}
                  aria-label={a.active ? t.alerts.disable : t.alerts.enable}
                  title={a.active ? t.alerts.disable : t.alerts.enable}
                >
                  {a.active ? <Bell size={14} /> : <BellOff size={14} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void remove(a.id)}
                  aria-label={t.alerts.deleteAlert}
                  title={t.alerts.deleteAlert}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isPro && (
        <div
          className="mt-4 p-3 rounded-md text-[12px] leading-relaxed flex items-start gap-2"
          style={{
            background: 'color-mix(in srgb, var(--premium) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--premium) 30%, transparent)',
          }}
        >
          <Sparkles
            size={14}
            className="text-[var(--premium)] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="mb-2">{t.alerts.upgradeForRealtime}</p>
            <Button variant="primary" size="sm" onClick={() => setUpgradeOpen(true)}>
              {t.common.pro}
            </Button>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-[var(--text-dim)]">
        {t.alerts.thresholdHint} {t.alerts.thresholdLabel}: ≥{' '}
        {ALERTS_DEFAULT_THRESHOLD_PCT}%
      </p>

      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title={t.alerts.upgradeForRealtime}
        description={t.alerts.proRealtime}
      />
    </Card>
  );
}
