'use client';

import { type ChangeEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { useTranslations } from '@/hooks/useTranslations';
import type { ProjectSortColumn, SortDirection } from '@/lib/filters';

interface SortOption {
  column: ProjectSortColumn;
  direction: SortDirection;
  labelKey: keyof ReturnType<typeof useTranslations>['table'];
  /** Inline label override when the table key reads awkwardly with a direction marker. */
  inline?: string;
}

const OPTIONS: readonly SortOption[] = [
  { column: 'name', direction: 'asc', labelKey: 'name', inline: 'А → Я' },
  { column: 'name', direction: 'desc', labelKey: 'name', inline: 'Я → А' },
  { column: 'pricePerSqm', direction: 'asc', labelKey: 'priceSqm', inline: '↑' },
  { column: 'pricePerSqm', direction: 'desc', labelKey: 'priceSqm', inline: '↓' },
  { column: 'minPrice', direction: 'asc', labelKey: 'minPrice', inline: '↑' },
  { column: 'minPrice', direction: 'desc', labelKey: 'minPrice', inline: '↓' },
  { column: 'distSea', direction: 'asc', labelKey: 'sea', inline: '↑' },
  { column: 'distSea', direction: 'desc', labelKey: 'sea', inline: '↓' },
  { column: 'totalUnits', direction: 'desc', labelKey: 'units', inline: '↓' },
];

function optionKey(opt: SortOption): string {
  return `${opt.column}:${opt.direction}`;
}

export function MobileSort() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { setSort } = useFilters();

  const currentColumn = (searchParams.get('sort') ?? 'name') as ProjectSortColumn;
  const currentDir: SortDirection =
    searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const currentKey = `${currentColumn}:${currentDir}`;

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const [column, direction] = e.target.value.split(':') as [
      ProjectSortColumn,
      SortDirection,
    ];
    setSort(column, direction);
  };

  return (
    <label className="md:hidden inline-flex items-center gap-2 text-[12px] text-[var(--text-dim)]">
      <ArrowUpDown size={14} aria-hidden="true" />
      <span className="sr-only">Сортировка</span>
      <select
        value={currentKey}
        onChange={handleChange}
        aria-label="Сортировка"
        className="px-2 py-1.5 rounded-lg text-[12px] bg-[var(--bg-elevated)] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        style={{ border: '1px solid var(--border)' }}
      >
        {OPTIONS.map((opt) => (
          <option key={optionKey(opt)} value={optionKey(opt)}>
            {t.table[opt.labelKey]}
            {opt.inline ? ` ${opt.inline}` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
