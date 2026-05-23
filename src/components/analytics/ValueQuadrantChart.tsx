'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip as RTooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { useProjects } from '@/hooks/useProjects';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { ProjectClass } from '@/lib/types';

interface ScatterPoint {
  name: string;
  distSea: number;
  pricePerSqm: number;
  units: number;
  classType: ProjectClass;
}

const CHART_GRID = '#1f2937';
const CHART_TICK = '#8893a7';

export function ValueQuadrantChart() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { projects } = useProjects();

  const data = useMemo<ScatterPoint[]>(
    () =>
      projects.map((p) => ({
        name: p.name.replace('ЖК «', '').replace('»', ''),
        distSea: p.distSea,
        pricePerSqm: p.pricePerSqm,
        units: p.totalUnits,
        classType: p.classType,
      })),
    [projects],
  );

  const renderTooltip = (props: TooltipContentProps) => {
    const { active, payload } = props;
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0]?.payload as ScatterPoint | undefined;
    if (!d) return null;
    return (
      <div className="px-3 py-2 rounded-lg text-[12px] shadow-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]">
        <div className="font-semibold">{d.name}</div>
        <div className="text-[var(--text-muted)] mt-0.5 tabular-nums">
          {fmt.priceSqm(d.pricePerSqm, locale)} · {fmt.dist(d.distSea, locale)}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {t.analytics.valueQuadrant}
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis
              dataKey="distSea"
              type="number"
              tick={{ fontSize: 11, fill: CHART_TICK }}
              tickFormatter={(v: number) => fmt.dist(v, locale)}
            />
            <YAxis
              dataKey="pricePerSqm"
              tick={{ fontSize: 11, fill: CHART_TICK }}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              width={50}
            />
            <RTooltip content={renderTooltip} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data}>
              {data.map((e, i) => (
                <Cell key={i} fill={CLASS_COLORS[e.classType]} fillOpacity={0.7} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center flex-wrap gap-4 mt-2">
        {(Object.entries(CLASS_COLORS) as [ProjectClass, string][]).map(([cls, color]) => (
          <div key={cls} className="flex items-center gap-1.5 text-[11px] text-[var(--text-dim)]">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {cls}
          </div>
        ))}
      </div>
    </Card>
  );
}
