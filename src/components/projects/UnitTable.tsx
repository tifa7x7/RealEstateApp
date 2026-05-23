'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { UNIT_STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { Unit } from '@/lib/types';

type UnitSortColumn = 'id' | 'building' | 'floor' | 'rooms' | 'area' | 'price';
type SortDirection = 'asc' | 'desc';

export interface UnitTableProps {
  units: Unit[];
  projectId: number;
}

interface Col {
  key: UnitSortColumn;
  label: string;
  align?: 'left' | 'right';
}

export function UnitTable({ units, projectId }: UnitTableProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const [sortCol, setSortCol] = useState<UnitSortColumn>('floor');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');

  const cols: Col[] = [
    { key: 'id', label: t.project.aptId },
    { key: 'building', label: t.project.building },
    { key: 'floor', label: t.project.floor, align: 'right' },
    { key: 'rooms', label: t.project.rooms, align: 'right' },
    { key: 'area', label: t.project.area, align: 'right' },
    { key: 'price', label: t.project.price, align: 'right' },
  ];

  const sorted = useMemo(() => {
    return [...units].sort((a, b) => {
      const va = a[sortCol];
      const vb = b[sortCol];
      if (typeof va === 'string' && typeof vb === 'string') {
        const cmp = va.localeCompare(vb);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [units, sortCol, sortDir]);

  const handleSort = (col: UnitSortColumn) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
      <table className="w-full text-[13px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/40">
            {cols.map((col) => {
              const active = sortCol === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3 py-2 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  aria-sort={
                    active ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                  >
                    {col.label}
                    {active &&
                      (sortDir === 'asc' ? (
                        <ChevronUp size={11} className="text-[var(--accent)]" aria-hidden="true" />
                      ) : (
                        <ChevronDown size={11} className="text-[var(--accent)]" aria-hidden="true" />
                      ))}
                  </button>
                </th>
              );
            })}
            <th
              scope="col"
              className="px-3 py-2 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-left"
            >
              {t.project.status}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((u) => {
            const roomsLabel =
              u.rooms === 0 ? (locale === 'en' ? 'Studio' : 'Студия') : `${u.rooms}К`;
            return (
              <tr
                key={u.id}
                className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]/40 transition-colors"
              >
                <td className="px-3 py-2.5 tabular-nums">
                  <Link
                    href={`/projects/${projectId}/units/${encodeURIComponent(u.id)}`}
                    className="font-medium hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline"
                  >
                    {u.id}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-[var(--text-dim)] whitespace-nowrap">
                  {u.building}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{u.floor}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{roomsLabel}</td>
                <td className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                  {u.area} {t.common.sqm}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap font-medium">
                  {fmt.price(u.price, locale)}
                </td>
                <td className="px-3 py-2.5">
                  <Badge color={UNIT_STATUS_COLORS[u.status]} size="sm">
                    {u.status}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
