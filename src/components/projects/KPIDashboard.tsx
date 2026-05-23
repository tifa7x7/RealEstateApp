'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { PROJECTS } from '@/data/projects';
import { useProjects } from '@/hooks/useProjects';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { getMarketStats } from '@/lib/filters';
import { fmt } from '@/lib/formatters';

function KPICard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">
        {label}
      </div>
      <div
        className="text-[22px] font-semibold mb-1 tabular-nums"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {value}
      </div>
      <div className="text-[11px] text-[var(--text-dim)] truncate">{hint}</div>
    </Card>
  );
}

export function KPIDashboard() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { projects } = useProjects();

  const stats = useMemo(() => getMarketStats(projects), [projects]);
  const availableUnits = useMemo(
    () =>
      projects.reduce(
        (s, p) => s + p.units.filter((u) => u.status === 'в продаже').length,
        0,
      ),
    [projects],
  );

  if (projects.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPICard
        label={t.kpi.found}
        value={String(stats.count)}
        hint={t.kpi.ofTotal.replace('{n}', String(PROJECTS.length))}
      />
      <KPICard
        label={t.kpi.units}
        value={String(availableUnits)}
        hint={t.kpi.inProjects.replace('{n}', String(stats.count))}
      />
      <KPICard
        label={t.kpi.avgPrice}
        value={fmt.priceSqm(stats.avgPrice, locale)}
        hint={t.kpi.fromTo
          .replace('{min}', fmt.price(stats.minPrice, locale))
          .replace('{max}', fmt.price(stats.maxPrice, locale))}
      />
      <KPICard
        label={t.kpi.avgSea}
        value={fmt.dist(stats.avgSea, locale)}
        hint={t.kpi.nearSea.replace('{n}', String(stats.nearSea))}
      />
    </div>
  );
}
