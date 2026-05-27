'use client';

import { type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFilters } from '@/hooks/useFilters';
import { useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { ProjectClass, ProjectStatus } from '@/lib/types';

const STATUSES: readonly ProjectStatus[] = [
  'Проектируется',
  'Строится',
  'Ввод в эксплуатацию',
  'Сдан',
];

const CLASSES: readonly ProjectClass[] = ['Эконом', 'Комфорт', 'Бизнес', 'Премиум'];

function Pill({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-2.5 py-1 rounded-full text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      style={
        active
          ? {
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              color,
              border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            }
          : {
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
            }
      }
    >
      {children}
    </button>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mr-1">
        {label}
      </span>
      {children}
    </div>
  );
}

export function MapFilters() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { toggleArrayFilter, reset } = useFilters();

  const selectedStatuses = (searchParams.get('statuses') ?? '').split(',').filter(Boolean);
  const selectedClasses = (searchParams.get('classes') ?? '').split(',').filter(Boolean);
  const activeCount = selectedStatuses.length + selectedClasses.length;

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
      <Section label={t.filters.status}>
        {STATUSES.map((s) => (
          <Pill
            key={s}
            active={selectedStatuses.includes(s)}
            color={STATUS_COLORS[s]}
            onClick={() => toggleArrayFilter('statuses', s)}
          >
            {s}
          </Pill>
        ))}
      </Section>
      <Section label={t.filters.class}>
        {CLASSES.map((c) => (
          <Pill
            key={c}
            active={selectedClasses.includes(c)}
            color={CLASS_COLORS[c]}
            onClick={() => toggleArrayFilter('classes', c)}
          >
            {c}
          </Pill>
        ))}
      </Section>
      {activeCount > 0 && (
        <button
          type="button"
          onClick={reset}
          className="sm:ml-auto text-[12px] text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {t.filters.clearAll}
        </button>
      )}
    </div>
  );
}
