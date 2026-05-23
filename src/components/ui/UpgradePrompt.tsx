'use client';

import { Check, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

export interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  features?: readonly string[];
  ctaLabel?: string;
  onUpgrade?: () => void;
}

const DEFAULT_FEATURES = [
  'Сравнение до 5 объектов с рейтингом по метрикам',
  'Прогноз денежного потока на 10 лет',
  'Портфель сдаваемой недвижимости',
  'Экспорт расчётов в PDF/Excel',
  'Без рекламы',
] as const;

export function UpgradePrompt({
  open,
  onClose,
  title = 'Обновитесь до Pro',
  description = 'Эта функция доступна в Pro-тарифе.',
  features = DEFAULT_FEATURES,
  ctaLabel = 'Перейти на Pro',
  onUpgrade,
}: UpgradePromptProps) {
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

        <div className="flex gap-2 justify-end mt-2">
          <Button variant="ghost" onClick={onClose}>
            Позже
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onUpgrade?.();
              onClose();
            }}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
