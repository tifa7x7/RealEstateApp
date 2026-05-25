'use client';

import { type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { useTranslations } from '@/hooks/useTranslations';
import { REGIONS_DATA } from '@/lib/constants';

/**
 * Above-the-fold homepage hero: value-prop headline, subhead, a single large
 * search input, and a city pill row. This is the new product entry per the
 * positioning hierarchy ("decision tool first"). KPI cards are demoted below
 * the fold in a collapsible `MarketSnapshot` strip.
 */
export function HomeHero() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { setSearch, toggleArrayFilter } = useFilters();

  const currentQuery = searchParams.get('q') ?? '';
  const selectedCities = (searchParams.get('cities') ?? '')
    .split(',')
    .filter(Boolean);

  // Pin to Crimea since it's the only region with seed data; once we expand
  // (Phase 15+) this becomes a derived list from REGIONS_DATA + URL region.
  const crimea = REGIONS_DATA.find((r) => r.id === 'crimea');
  const cities = crimea?.cities ?? [];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = (data.get('q') ?? '').toString().trim();
    setSearch(q);
  };

  return (
    <section className="flex flex-col gap-5 md:gap-6 py-4 md:py-8">
      <div className="flex flex-col gap-3 max-w-3xl">
        <h1
          className="text-[28px] md:text-[36px] lg:text-[40px] font-semibold leading-[1.15] tracking-tight"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {t.hero.headline}
        </h1>
        <p className="text-[14px] md:text-[16px] text-[var(--text-dim)] leading-relaxed max-w-2xl">
          {t.hero.subhead}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="search"
            name="q"
            defaultValue={currentQuery}
            placeholder={t.hero.searchPlaceholder}
            aria-label={t.hero.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[15px] outline-none bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>
      </form>

      {cities.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
            {t.hero.cityPillsLabel}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => {
              const active = selectedCities.includes(city);
              const style = active
                ? {
                    background:
                      'color-mix(in srgb, var(--accent) 12%, transparent)',
                    color: 'var(--accent)',
                    border:
                      '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                  }
                : {
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-dim)',
                  };
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleArrayFilter('cities', city)}
                  aria-pressed={active}
                  className="px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  style={style}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
