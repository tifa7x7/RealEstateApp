'use client';

import { useState } from 'react';
import { LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { NotificationsSection } from '@/components/account/NotificationsSection';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { useTranslations } from '@/hooks/useTranslations';
import { useAppStore } from '@/store/app-store';

/**
 * Account settings surface. Profile read-out + tier status + sign-out.
 *
 * Phase 15: the tier toggle that previously lived here was a debug aid that
 * let users self-promote to Pro by clicking a button. It's gone. Real tier
 * now flows from `profiles.tier` → store via `useSupabaseUserDataSync`.
 * Upgrades go through `UpgradePrompt` → billing checkout.
 *
 * In dev without Supabase, tier stays at the store default ('free'). For
 * local Pro feature testing, edit `localStorage['real-estate-app']`
 * directly — there's no UI affordance.
 */
export function SettingsForm() {
  const t = useTranslations();
  const tier = useAppStore((s) => s.currentTier);
  const userName = useAppStore((s) => s.userName);
  const userEmail = useAppStore((s) => s.userEmail);
  const logout = useAppStore((s) => s.logout);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isPro = tier === 'pro';

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Card>
        <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3 inline-flex items-center gap-1.5">
          <UserIcon size={13} aria-hidden="true" />
          {t.auth.myAccount}
        </h2>
        <dl className="text-[13px] flex flex-col gap-2">
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--text-muted)]">{t.auth.name}</dt>
            <dd className="font-medium">{userName || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--text-muted)]">{t.auth.email}</dt>
            <dd className="font-medium">{userEmail || '—'}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3 inline-flex items-center gap-1.5">
          <Sparkles size={13} aria-hidden="true" />
          Тариф
        </h2>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="text-[14px] font-medium inline-flex items-center gap-2">
              {isPro ? t.common.pro : 'Free'}
              {isPro && (
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    background:
                      'color-mix(in srgb, var(--premium) 18%, transparent)',
                    color: 'var(--premium)',
                  }}
                >
                  Pro
                </span>
              )}
            </div>
            <div className="text-[12px] text-[var(--text-dim)] mt-0.5">
              {isPro
                ? 'Все функции открыты'
                : 'Базовый поиск, до 25 избранных, 3 сохранённых расчёта'}
            </div>
          </div>
          {!isPro && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setUpgradeOpen(true)}
            >
              Перейти на Pro
            </Button>
          )}
        </div>
      </Card>

      <NotificationsSection />

      <Button variant="danger" onClick={logout} className="self-start">
        <LogOut size={14} aria-hidden="true" />
        {t.auth.signOut}
      </Button>

      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />
    </div>
  );
}
