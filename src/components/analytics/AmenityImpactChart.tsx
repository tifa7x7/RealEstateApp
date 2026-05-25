'use client';

import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { useChartColors } from '@/hooks/useChartColors';
import { useProjects } from '@/hooks/useProjects';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';

interface Row {
  amenity: string;
  avg: number;
  impact: number;
  count: number;
}

const MIN_SAMPLES = 2;

export function AmenityImpactChart() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { projects } = useProjects();
  const chart = useChartColors();

  const data = useMemo<Row[]>(() => {
    if (projects.length === 0) return [];
    const overall = projects.reduce((s, p) => s + p.pricePerSqm, 0) / projects.length;
    const amenitySet = new Set<string>();
    for (const p of projects) for (const a of p.amenities) amenitySet.add(a);
    const rows: Row[] = [];
    for (const amenity of amenitySet) {
      const matching = projects.filter((p) => p.amenities.includes(amenity));
      if (matching.length < MIN_SAMPLES) continue;
      const avg = matching.reduce((s, p) => s + p.pricePerSqm, 0) / matching.length;
      rows.push({
        amenity,
        avg: Math.round(avg),
        impact: Math.round(avg - overall),
        count: matching.length,
      });
    }
    return rows.sort((a, b) => b.impact - a.impact);
  }, [projects]);

  const renderTooltip = (props: TooltipContentProps) => {
    const { active, payload } = props;
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload as Row | undefined;
    if (!row) return null;
    const sign = row.impact >= 0 ? '+' : '';
    return (
      <div className="px-3 py-2 rounded-lg text-[12px] shadow-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]">
        <div className="font-semibold">{row.amenity}</div>
        <div className="text-[var(--text-muted)] mt-0.5 tabular-nums">
          {sign}
          {fmt.priceSqm(row.impact, locale)} vs средняя
        </div>
        <div className="text-[var(--text-muted)] tabular-nums">
          {row.count} {t.analytics.projects}
        </div>
      </div>
    );
  };

  if (data.length === 0) return null;

  const height = Math.max(220, data.length * 28 + 40);

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {t.analytics.amenityImpact}
      </h2>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: chart.tick }}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            />
            <YAxis
              dataKey="amenity"
              type="category"
              tick={{ fontSize: 11, fill: chart.tick }}
              width={130}
            />
            <RTooltip content={renderTooltip} cursor={{ fill: 'rgba(127,127,127,0.05)' }} />
            <ReferenceLine x={0} stroke={chart.tick} />
            <Bar dataKey="impact" radius={[0, 3, 3, 0]}>
              {data.map((e, i) => (
                <Cell key={i} fill={e.impact >= 0 ? chart.accent : chart.danger} fillOpacity={0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-[var(--text-dim)] mt-3">
        Отклонение средней цены/м² от общей средней, по наличию удобства.
      </p>
    </Card>
  );
}
