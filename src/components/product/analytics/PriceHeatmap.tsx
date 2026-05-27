'use client';

import { Fragment, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useProjects } from '@/hooks/useProjects';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { fmt } from '@/lib/formatters';
import type { ProjectClass } from '@/lib/types';

const CLASSES: readonly ProjectClass[] = ['Эконом', 'Комфорт', 'Бизнес', 'Премиум'];

interface CellData {
  price: number;
  count: number;
}

export function PriceHeatmap() {
  const t = useTranslations();
  const { locale } = useLocale();
  const { projects } = useProjects();

  const { cities, matrix, min, max } = useMemo(() => {
    const citySet = new Set<string>();
    for (const p of projects) citySet.add(p.city);
    const sortedCities = [...citySet].sort();

    const m = new Map<string, Map<ProjectClass, CellData>>();
    for (const city of sortedCities) m.set(city, new Map());
    for (const p of projects) {
      const row = m.get(p.city);
      if (!row) continue;
      const cur = row.get(p.classType);
      if (cur) {
        cur.price = Math.round(
          (cur.price * cur.count + p.pricePerSqm) / (cur.count + 1),
        );
        cur.count += 1;
      } else {
        row.set(p.classType, { price: p.pricePerSqm, count: 1 });
      }
    }

    let lo = Infinity;
    let hi = -Infinity;
    for (const row of m.values()) {
      for (const cell of row.values()) {
        if (cell.price < lo) lo = cell.price;
        if (cell.price > hi) hi = cell.price;
      }
    }

    return {
      cities: sortedCities,
      matrix: m,
      min: Number.isFinite(lo) ? lo : 0,
      max: Number.isFinite(hi) ? hi : 0,
    };
  }, [projects]);

  if (cities.length === 0) return null;

  const intensityFor = (price: number): number => {
    if (max === min) return 0.5;
    return (price - min) / (max - min);
  };

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {t.analytics.priceHeatmap}
      </h2>
      <div className="overflow-x-auto">
        <div
          className="grid gap-1 min-w-[480px]"
          style={{
            gridTemplateColumns: `minmax(120px, auto) repeat(${CLASSES.length}, minmax(90px, 1fr))`,
          }}
          role="table"
          aria-label={t.analytics.priceHeatmap}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] px-2 py-1.5">
            {t.table.city}
          </div>
          {CLASSES.map((cls) => (
            <div
              key={cls}
              className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] px-2 py-1.5 text-center"
            >
              {cls}
            </div>
          ))}
          {cities.map((city) => (
            <Fragment key={city}>
              <div className="text-[12px] font-medium px-2 py-2.5 text-[var(--text)]">
                {city}
              </div>
              {CLASSES.map((cls) => {
                const cell = matrix.get(city)?.get(cls);
                if (!cell) {
                  return (
                    <div
                      key={cls}
                      className="text-[12px] text-center px-2 py-2.5 text-[var(--text-muted)] rounded bg-[var(--bg-elevated)]/40"
                    >
                      —
                    </div>
                  );
                }
                const intensity = intensityFor(cell.price);
                return (
                  <div
                    key={cls}
                    className="text-[12px] text-center px-2 py-2.5 tabular-nums font-medium text-[var(--text)] rounded"
                    style={{
                      background: `color-mix(in srgb, var(--accent) ${Math.round(8 + intensity * 60)}%, transparent)`,
                    }}
                    title={`${cell.count} ${t.analytics.projects}`}
                  >
                    {fmt.priceSqm(cell.price, locale)}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-[var(--text-dim)] mt-3">
        {t.analytics.avgPrice} {fmt.priceSqm(min, locale)} → {fmt.priceSqm(max, locale)}
      </p>
    </Card>
  );
}
