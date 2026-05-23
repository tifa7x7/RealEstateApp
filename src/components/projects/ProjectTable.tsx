'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { ProjectSortColumn } from '@/lib/filters';
import { fmt } from '@/lib/formatters';
import type { Project } from '@/lib/types';

export interface ProjectTableProps {
  projects: Project[];
  className?: string;
}

interface Col {
  key: ProjectSortColumn;
  label: string;
  align?: 'left' | 'right';
}

export function ProjectTable({ projects, className = '' }: ProjectTableProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const searchParams = useSearchParams();

  const currentSort = (searchParams.get('sort') ?? 'name') as ProjectSortColumn;
  const currentDir = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';

  const cols: Col[] = [
    { key: 'name', label: t.table.name },
    { key: 'developer', label: t.table.developer },
    { key: 'city', label: t.table.city },
    { key: 'status', label: t.table.status },
    { key: 'classType', label: t.table.class },
    { key: 'totalUnits', label: t.table.units, align: 'right' },
    { key: 'pricePerSqm', label: t.table.priceSqm, align: 'right' },
    { key: 'minPrice', label: t.table.minPrice, align: 'right' },
    { key: 'distSea', label: t.table.sea, align: 'right' },
    { key: 'completion', label: t.table.completion },
  ];

  const sortHref = (column: ProjectSortColumn): string => {
    const params = new URLSearchParams(searchParams.toString());
    const nextDir =
      currentSort === column && currentDir === 'asc' ? 'desc' : 'asc';
    params.set('sort', column);
    params.set('dir', nextDir);
    return `/?${params.toString()}`;
  };

  return (
    <div
      className={`overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg-card)] ${className}`.trim()}
    >
      <table
        className="w-full text-[13px]"
        style={{ borderCollapse: 'separate', borderSpacing: 0 }}
      >
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)]/40">
            {cols.map((col) => {
              const active = currentSort === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3 py-2 text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <Link
                    href={sortHref(col.key)}
                    className="inline-flex items-center gap-1 hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
                    aria-sort={
                      active
                        ? currentDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                  >
                    {col.label}
                    {active &&
                      (currentDir === 'asc' ? (
                        <ChevronUp
                          size={11}
                          className="text-[var(--accent)]"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronDown
                          size={11}
                          className="text-[var(--accent)]"
                          aria-hidden="true"
                        />
                      ))}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)]/40 transition-colors"
            >
              <td className="px-3 py-2.5">
                <Link
                  href={`/projects/${p.id}`}
                  className="font-medium hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline"
                >
                  {p.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-[var(--text-dim)]">{p.developer}</td>
              <td className="px-3 py-2.5 text-[var(--text-dim)] whitespace-nowrap">
                {p.city}
              </td>
              <td className="px-3 py-2.5">
                <Badge color={STATUS_COLORS[p.status]} size="sm">
                  {p.status}
                </Badge>
              </td>
              <td className="px-3 py-2.5">
                <Badge color={CLASS_COLORS[p.classType]} size="sm">
                  {p.classType}
                </Badge>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{p.totalUnits}</td>
              <td className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                {fmt.priceSqm(p.pricePerSqm, locale)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                {fmt.price(p.minPrice, locale)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                {fmt.dist(p.distSea, locale)}
              </td>
              <td className="px-3 py-2.5 text-[var(--text-dim)] whitespace-nowrap">
                {p.completion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
