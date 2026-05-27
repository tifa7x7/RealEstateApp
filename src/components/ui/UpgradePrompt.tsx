'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { useToast } from '@/components/providers/ToastProvider';

export interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  features?: readonly string[];
  ctaLabel?: string;
  /** Plan key passed to the billing checkout. Default 'pro-monthly'. */
  plan?: 'pro-monthly' | 'pro-yearly';
  /** Override the default checkout call (e.g. for tests). */
  onUpgrade?: () => void;
}

// Phase 15 — both PDF export and ad-free are now architecturally shipped:
//   - PDF export: print stylesheet + "Сохранить PDF" Pro button on calculator results
//   - Ad-free: AdSlot primitive returns null for Pro users by default
// (The ad inventory itself requires a real provider, see AdSlot.tsx.)
const DEFAULT_FEATURES = [
  'Сравнение до 5 объектов с рейтингом по метрикам',
  'Прогноз денежного потока на 10 лет',
  'Портфель сдаваемой недвижимости',
  'Безлимитное сохранение расчётов',
  'Экспорт расчёта в PDF',
  'Без рекламы',
] as const;

export function UpgradePrompt({
  open,
  onClose,
  title = 'Обновитесь до Pro',
  description = 'Эта функция доступна в Pro-тарифе.',
  features = DEFAULT_FEATURES,
  ctaLabel = 'Перейти на Pro',
  plan = 'pro-monthly',
  onUpgrade,
}: UpgradePromptProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleUpgrade = async () => {
    if (onUpgrade) {
      onUpgrade();
      onClose();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = (await res.json()) as {
        data: { checkoutUrl?: string } | null;
        error: string | null;
      };
      if (res.ok && json.data?.checkoutUrl) {
        window.location.assign(json.data.checkoutUrl);
        return;
      }
      // 501 / 401 / 503 — billing not yet configured or user not signed in.
      // Surface the server's message via toast; keep the modal open so the
      // user can read it. Pre-launch this is the expected path.
      toast.info(
        json.error ??
          'Оплата временно недоступна. Мы запустим биллинг ближе к публичному релизу.',
        { duration: 4500 },
      );
    } catch {
      toast.error('Не удалось связаться с оплатой. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
            style={{ background: 'color-mix(in srgb, var(--premium) 15%, transparent)' }}
          >
            <Sparkles size={20} className="text-[var(--premium)]" aria-hidden="true" />
          </div>
          <p className="text-[13px] text-[var(--text-dim)] leading-relaxed">{description}</p>
        </div>

        <ul className="flex flex-col gap-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px]">
              <Check
                size={16}
                aria-hidden="true"
                className="text-[var(--accent)] shrink-0 mt-0.5"
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2 justify-end items-center mt-2">
          <Link
            href="/pricing"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--text-dim)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline"
          >
            <span>Сравнить тарифы</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Button variant="ghost" onClick={onClose}>
            Позже
          </Button>
          <Button variant="primary" onClick={handleUpgrade} disabled={submitting}>
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
