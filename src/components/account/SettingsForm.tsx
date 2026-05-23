'use client';

import { LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslations } from '@/hooks/useTranslations';
import { useAppStore } from '@/store/app-store';

export function SettingsForm() {
  const t = useTranslations();
  const tier = useAppStore((s) => s.currentTier);
  const setTier = useAppStore((s) => s.setTier);
  const userName = useAppStore((s) => s.userName);
  const userEmail = useAppStore((s) => s.userEmail);
  const logout = useAppStore((s) => s.logout);

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
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[14px] font-medium">
              {isPro ? t.common.pro : 'Free'}
            </div>
            <div className="text-[12px] text-[var(--text-dim)]">
              {isPro
                ? 'Все функции открыты'
                : 'Базовый поиск, один сохранённый расчёт'}
            </div>
          </div>
          <Button
            variant={isPro ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setTier(isPro ? 'free' : 'pro')}
          >
            {isPro ? 'Переключить на Free' : 'Включить Pro (тест)'}
          </Button>
        </div>
        <p className="text-[11px] text-[var(--text-dim)] mt-3">
          Локальный переключатель для отладки — в продакшене тариф определяется
          подпиской.
        </p>
      </Card>

      <Button variant="danger" onClick={logout} className="self-start">
        <LogOut size={14} aria-hidden="true" />
        {t.auth.signOut}
      </Button>
    </div>
  );
}
