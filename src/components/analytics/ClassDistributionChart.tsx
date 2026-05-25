'use client';

import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
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
import type { ProjectClass } from '@/lib/types';

interface Row {
  name: ProjectClass;
  count: number;
  avgPrice: number;
}

const CLASSES: readonly ProjectClass[] = ['Эконом', 'Комфорт', 'Бизнес', 'Премиум'];

export function ClassDistributionChart() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { projects } = useProjects();
  const chart = useChartColors();

  const data = useMemo<Row[]>(
    () =>
      CLASSES.map((cls) => {
        const matching = projects.filter((p) => p.classType === cls);
        return {
          name: cls,
          count: matching.length,
          avgPrice: matching.length
            ? Math.round(matching.reduce((s, p) => s + p.pricePerSqm, 0) / matching.length)
            : 0,
        };
      }),
    [projects],
  );

  const renderTooltip = (props: TooltipContentProps) => {
    const { active, payload } = props;
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload as Row | undefined;
    if (!row) return null;
    return (
      <div className="px-3 py-2 rounded-lg text-[12px] shadow-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)]">
        <div className="font-semibold">{row.name}</div>
        <div className="text-[var(--text-muted)] mt-0.5 tabular-nums">
          {row.count} {t.analytics.projects}
        </div>
        {row.avgPrice > 0 && (
          <div className="text-[var(--text-muted)] tabular-nums">
            {fmt.priceSqm(row.avgPrice, locale)} {t.analytics.avgPrice}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {t.analytics.classDistribution}
      </h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: chart.tick }} />
            <YAxis yAxisId="l" tick={{ fontSize: 11, fill: chart.tick }} width={30} />
            <YAxis
              yAxisId="r"
              orientation="right"
              tick={{ fontSize: 11, fill: chart.tick }}
              tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
              width={40}
            />
            <RTooltip content={renderTooltip} cursor={{ fill: 'rgba(127,127,127,0.05)' }} />
            <Bar yAxisId="l" dataKey="count" radius={[3, 3, 0, 0]}>
              {data.map((e, i) => (
                <Cell key={i} fill={chart.class[e.name]} fillOpacity={0.7} />
              ))}
            </Bar>
            <Line
              yAxisId="r"
              type="monotone"
              dataKey="avgPrice"
              stroke={chart.warning}
              strokeWidth={2}
              dot={{ r: 3, fill: chart.warning }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
