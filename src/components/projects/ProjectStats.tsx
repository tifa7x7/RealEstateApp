'use client';

import { Card } from '@/components/ui/Card';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';
import type { Project } from '@/lib/types';

export interface ProjectStatsProps {
  project: Project;
}

interface HeroMetric {
  label: string;
  value: string;
  hint?: string;
}

interface SpecRow {
  label: string;
  value: string;
}

export function ProjectStats({ project: p }: ProjectStatsProps) {
  const t = useTranslations();
  const { locale } = useLocale();

  const availableUnits = p.units.filter((u) => u.status === 'в продаже').length;
  const reservedUnits = p.units.filter((u) => u.status === 'бронь').length;

  const heroMetrics: HeroMetric[] = [
    {
      label: t.table.priceSqm,
      value: fmt.priceSqm(p.pricePerSqm, locale),
    },
    {
      label: t.table.minPrice,
      value: fmt.price(p.minPrice, locale),
    },
    {
      label: t.table.sea,
      value: fmt.dist(p.distSea, locale),
    },
    {
      label: t.table.completion,
      value: p.completion,
    },
  ];

  const specs: SpecRow[] = [
    { label: t.table.buildings, value: String(p.buildings) },
    { label: t.table.floors, value: String(p.floors) },
    {
      label: t.table.units,
      value: `${p.totalUnits} (${availableUnits} ${t.project.available.toLowerCase()})`,
    },
    {
      label: t.table.sizeRange,
      value: `${p.sizeMin}–${p.sizeMax} ${t.common.sqm}`,
    },
    { label: t.project.available, value: String(availableUnits) },
    { label: t.project.reserved, value: String(reservedUnits) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {heroMetrics.map((m) => (
          <Card key={m.label}>
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
              {m.label}
            </div>
            <div
              className="text-[20px] md:text-[22px] font-semibold tabular-nums"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {m.value}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-[13px]">
          {specs.map((s) => (
            <div key={s.label} className="flex justify-between gap-3">
              <dt className="text-[var(--text-muted)]">{s.label}</dt>
              <dd className="font-medium tabular-nums text-right">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
