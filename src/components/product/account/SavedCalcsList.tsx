'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, Save, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { useSavedCalcs } from '@/hooks/useSavedCalcs';
import { fmt } from '@/lib/formatters';

export function SavedCalcsList() {
  const router = useRouter();
  const t = useTranslations();
  const { locale } = useLocale();
  const { saved, limit, load, remove } = useSavedCalcs();

  const handleLoad = (id: number | string) => {
    load(id);
    router.push('/calculator');
  };

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Save}
        title="Нет сохранённых расчётов"
        description="Сохраните расчёт из калькулятора, чтобы вернуться к нему позже."
        action={{
          label: t.calc.title,
          onClick: () => router.push('/calculator'),
          variant: 'secondary',
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {Number.isFinite(limit) && (
        <p className="text-[12px] text-[var(--text-dim)] inline-flex items-center gap-1.5">
          <Sparkles size={12} aria-hidden="true" className="text-[var(--premium)]" />
          {saved.length} / {limit} — для большего количества нужен {t.common.pro}
        </p>
      )}

      {saved.map((calc) => {
        const obj = calc.objects[0];
        if (!obj) return null;
        return (
          <Card key={calc.id} padded={false}>
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[14px] truncate">
                  {obj.name || 'Без названия'}
                </h3>
                <div className="text-[12px] text-[var(--text-dim)] flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  <span>{calc.date}</span>
                  <span className="tabular-nums">
                    {fmt.price(obj.price, locale)}
                  </span>
                  {obj.area > 0 && (
                    <span className="tabular-nums">
                      {obj.area} {t.common.sqm}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleLoad(calc.id)}
                  aria-label="Открыть в калькуляторе"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <ExternalLink size={12} aria-hidden="true" />
                  Открыть
                </button>
                <button
                  type="button"
                  onClick={() => remove(calc.id)}
                  aria-label="Удалить расчёт"
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
