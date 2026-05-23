'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { UNIT_STATUS_COLORS } from '@/lib/constants';
import type { Unit, UnitStatus } from '@/lib/types';
import { UnitCard } from './UnitCard';
import { UnitTable } from './UnitTable';

type StatusFilter = 'all' | UnitStatus;

export interface UnitListingsProps {
  units: Unit[];
  projectId: number;
}

export function UnitListings({ units, projectId }: UnitListingsProps) {
  const t = useTranslations();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const counts = useMemo(
    () => ({
      all: units.length,
      'в продаже': units.filter((u) => u.status === 'в продаже').length,
      бронь: units.filter((u) => u.status === 'бронь').length,
      продано: units.filter((u) => u.status === 'продано').length,
    }),
    [units],
  );

  const filtered = useMemo(
    () => (filter === 'all' ? units : units.filter((u) => u.status === filter)),
    [units, filter],
  );

  const pills: { id: StatusFilter; label: string; count: number; color?: string }[] = [
    { id: 'all', label: t.project.allUnits, count: counts.all },
    {
      id: 'в продаже',
      label: t.project.available,
      count: counts['в продаже'],
      color: UNIT_STATUS_COLORS['в продаже'],
    },
    {
      id: 'бронь',
      label: t.project.reserved,
      count: counts['бронь'],
      color: UNIT_STATUS_COLORS['бронь'],
    },
    {
      id: 'продано',
      label: t.project.sold,
      count: counts['продано'],
      color: UNIT_STATUS_COLORS['продано'],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t.project.status}>
        {pills.map((p) => {
          const active = filter === p.id;
          const c = p.color ?? 'var(--accent)';
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(p.id)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              style={
                active
                  ? {
                      background: `color-mix(in srgb, ${c} 12%, transparent)`,
                      color: c,
                      border: `1px solid color-mix(in srgb, ${c} 25%, transparent)`,
                    }
                  : {
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-dim)',
                    }
              }
            >
              {p.label}{' '}
              <span className="opacity-70 tabular-nums">({p.count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[13px] text-[var(--text-dim)] py-6 text-center">
          {t.common.noResults}
        </p>
      ) : (
        <>
          <div className="md:hidden grid gap-3">
            {filtered.map((u) => (
              <UnitCard key={u.id} unit={u} projectId={projectId} />
            ))}
          </div>
          <div className="hidden md:block">
            <UnitTable units={filtered} projectId={projectId} />
          </div>
        </>
      )}
    </div>
  );
}
