'use client';

import { useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { useCalculator } from '@/hooks/useCalculator';
import { usePaywall } from '@/hooks/usePaywall';
import { useTranslations } from '@/hooks/useTranslations';

export function ObjectTabs() {
  const t = useTranslations();
  const {
    objects,
    activeIndex,
    setActiveIndex,
    addObject,
    removeObject,
    canAdd,
    canRemove,
  } = useCalculator();
  const { allowed: canAddMore } = usePaywall('multi-object');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleAdd = () => {
    if (!canAddMore) {
      setUpgradeOpen(true);
      return;
    }
    if (canAdd) addObject();
  };

  return (
    <>
      <div
        role="tablist"
        aria-label={t.calc.title}
        className="flex items-center gap-1 overflow-x-auto"
      >
        {objects.map((obj, i) => {
          const active = i === activeIndex;
          const label = obj.name.trim() || `Объект ${i + 1}`;
          return (
            <div
              key={i}
              className={
                'inline-flex items-center rounded-md transition-colors ' +
                (active
                  ? 'bg-[var(--accent-surface)] text-[var(--accent)]'
                  : 'text-[var(--text-dim)] hover:bg-[var(--bg-elevated)]')
              }
            >
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveIndex(i)}
                className="px-3 py-1.5 text-[13px] font-medium whitespace-nowrap max-w-[180px] truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
              >
                {label}
              </button>
              {canRemove && (
                <button
                  type="button"
                  onClick={() => removeObject(i)}
                  aria-label={`Удалить ${label}`}
                  className="pl-0.5 pr-1.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={handleAdd}
          disabled={canAddMore && !canAdd}
          aria-label={t.calc.addObject}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] whitespace-nowrap"
        >
          <Plus size={13} aria-hidden="true" />
          {t.calc.addObject}
          {!canAddMore && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase inline-flex items-center gap-0.5"
              style={{
                background: 'color-mix(in srgb, var(--premium) 15%, transparent)',
                color: 'var(--premium)',
              }}
            >
              <Sparkles size={9} aria-hidden="true" />
              {t.common.pro}
            </span>
          )}
        </button>
      </div>

      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        description="Добавляйте до 5 объектов и сравнивайте их в Pro."
      />
    </>
  );
}
