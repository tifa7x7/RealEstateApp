'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { useProjects } from '@/hooks/useProjects';
import { useTranslations } from '@/hooks/useTranslations';

interface Row {
  name: string;
  units: number;
  projects: number;
}

const CHART_GRID = '#1f2937';
const CHART_TICK = '#8893a7';
const BAR_COLOR = '#00d4aa';

export function DevPortfolioChart() {
  const t = useTranslations();
  const { projects } = useProjects();

  const data = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    for (const p of projects) {
      const existing = map.get(p.developer);
      if (existing) {
        existing.units += p.totalUnits;
        existing.projects += 1;
      } else {
        map.set(p.developer, { name: p.developer, units: p.totalUnits, projects: 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.units - a.units);
  }, [projects]);

  const renderTooltip = (props: TooltipContentProps) => {
    const { active, payload } = props;
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload as Row | undefined;
    if (!row) return null;
    return (
      <div className="px-3 py-2 rounded-lg text-[12px] shadow-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]">
        <div className="font-semibold">{row.name}</div>
        <div className="text-[var(--text-muted)] mt-0.5 tabular-nums">
          {row.units.toLocaleString('ru-RU')} квартир · {row.projects} {t.analytics.projects}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {t.analytics.devPortfolio}
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis type="number" tick={{ fontSize: 11, fill: CHART_TICK }} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: CHART_TICK }}
              width={120}
            />
            <RTooltip content={renderTooltip} cursor={{ fill: 'rgba(127,127,127,0.05)' }} />
            <Bar dataKey="units" fill={BAR_COLOR} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
