'use client';

import { type ReactNode, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import { DualRangeSlider } from '@/components/ui/DualRangeSlider';
import { PROJECTS } from '@/data/projects';
import { useFilters } from '@/hooks/useFilters';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, REGIONS_DATA, STATUS_COLORS } from '@/lib/constants';
import { getFilterOptions } from '@/lib/filters';
import { fmt } from '@/lib/formatters';
import type { ProjectClass, ProjectStatus } from '@/lib/types';

function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-wider font-semibold mb-2 text-[var(--text-muted)]">
      {children}
    </div>
  );
}

function Pill({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const c = color ?? 'var(--accent)';
  const activeStyle = {
    background: `color-mix(in srgb, ${c} 12%, transparent)`,
    color: c,
    border: `1px solid color-mix(in srgb, ${c} 25%, transparent)`,
  } as const;
  const inactiveStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-dim)',
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-2.5 py-1 rounded-full text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      style={active ? activeStyle : inactiveStyle}
    >
      {children}
    </button>
  );
}

export function FilterPanel() {
  const t = useTranslations();
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const { toggleArrayFilter, setRange, setRegion, reset } = useFilters();
  const options = useMemo(() => getFilterOptions(PROJECTS), []);

  const search = searchParams.get('q') ?? '';
  const selectedRegion = searchParams.get('region') ?? 'crimea';
  const selectedCities = (searchParams.get('cities') ?? '').split(',').filter(Boolean);
  const selectedStatuses = (searchParams.get('statuses') ?? '').split(',').filter(Boolean);
  const selectedClasses = (searchParams.get('classes') ?? '').split(',').filter(Boolean);

  const priceMin = Number(searchParams.get('priceMin') ?? options.priceRange[0]);
  const priceMax = Number(searchParams.get('priceMax') ?? options.priceRange[1]);
  const seaMin = Number(searchParams.get('seaMin') ?? 0);
  const seaMax = Number(searchParams.get('seaMax') ?? Math.ceil(options.seaRange[1]));

  const activeCount =
    (search ? 1 : 0) +
    (selectedCities.length > 0 ? 1 : 0) +
    (selectedStatuses.length > 0 ? 1 : 0) +
    (selectedClasses.length > 0 ? 1 : 0);

  const regionConfig = REGIONS_DATA.find((r) => r.id === selectedRegion);
  const regionCities = regionConfig?.cities ?? [];

  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-dim)] inline-flex items-center gap-1.5">
          <SlidersHorizontal size={13} aria-hidden="true" />
          {t.filters.search.split(' ')[0]}
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--accent-surface)] text-[var(--accent)]">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="text-[11px] hover:underline text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {t.filters.clearAll}
          </button>
        )}
      </div>

      <div>
        <Label>{t.filters.region}</Label>
        <select
          value={selectedRegion}
          onChange={(e) => setRegion(e.target.value)}
          aria-label={t.filters.region}
          className="w-full px-3 py-2 rounded-lg text-[13px] bg-[var(--bg-elevated)] text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ border: '1px solid var(--border)' }}
        >
          {REGIONS_DATA.map((r) => (
            <option key={r.id} value={r.id}>
              {locale === 'ru' ? r.name : r.nameEn}
              {r.id !== 'crimea' ? ` (${t.filters.comingSoon})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedRegion === 'crimea' && regionCities.length > 0 && (
        <div>
          <Label>
            {t.filters.city}{' '}
            <span className="text-[var(--text-dim)] normal-case">
              {selectedCities.length} {t.filters.of} {regionCities.length}
            </span>
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {regionCities.map((c) => (
              <Pill
                key={c}
                active={selectedCities.includes(c)}
                onClick={() => toggleArrayFilter('cities', c)}
              >
                {c}
              </Pill>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label>{t.filters.status}</Label>
        <div className="flex flex-wrap gap-1.5">
          {options.statuses.map((s) => (
            <Pill
              key={s}
              active={selectedStatuses.includes(s)}
              color={STATUS_COLORS[s as ProjectStatus]}
              onClick={() => toggleArrayFilter('statuses', s)}
            >
              {s}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <Label>{t.filters.class}</Label>
        <div className="flex flex-wrap gap-1.5">
          {options.classes.map((c) => (
            <Pill
              key={c}
              active={selectedClasses.includes(c)}
              color={CLASS_COLORS[c as ProjectClass]}
              onClick={() => toggleArrayFilter('classes', c)}
            >
              {c}
            </Pill>
          ))}
        </div>
      </div>

      <div>
        <Label>{t.filters.priceRange}</Label>
        <DualRangeSlider
          min={options.priceRange[0]}
          max={options.priceRange[1]}
          step={1000}
          value={[priceMin, priceMax]}
          onChange={(v) => setRange('priceRange', v)}
          formatLabel={(n) => fmt.priceSqm(n, locale)}
        />
      </div>

      <div>
        <Label>{t.filters.seaRange}</Label>
        <DualRangeSlider
          min={0}
          max={Math.ceil(options.seaRange[1])}
          step={0.5}
          value={[seaMin, seaMax]}
          onChange={(v) => setRange('seaRange', v)}
          formatLabel={(n) => fmt.dist(n, locale)}
        />
      </div>
    </div>
  );
}
