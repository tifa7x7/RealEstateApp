'use client';

import Link from 'next/link';
import { MapPin, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { useProjects } from '@/hooks/useProjects';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import { getDistrictStats } from '@/lib/filters';
import { fmt } from '@/lib/formatters';

export interface DistrictPanelProps {
  /** District name as stored on `Project.district`. */
  district: string | null;
  onClose: () => void;
}

/**
 * Side panel that shows aggregates for the district the user just clicked on
 * the map. Reads from the same filtered `useProjects()` result the map uses,
 * so the panel respects the URL filter state.
 *
 * Layout: full-width below the map on `<lg`, fixed right-rail on `lg+`.
 */
export function DistrictPanel({ district, onClose }: DistrictPanelProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const { projects } = useProjects();

  if (!district) return null;

  const stats = getDistrictStats(projects, district, { sampleSize: 5 });

  if (!stats) {
    return (
      <aside className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 text-[13px] text-[var(--text-dim)]">
        {locale === 'ru'
          ? 'Нет данных по этому району под текущими фильтрами.'
          : 'No data for this district under current filters.'}
      </aside>
    );
  }

  return (
    <aside
      role="complementary"
      aria-label={`${stats.district}, ${stats.city}`}
      className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-4 flex flex-col gap-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] inline-flex items-center gap-1.5">
            <MapPin size={11} aria-hidden="true" />
            {stats.city}
          </div>
          <h2
            className="text-[18px] font-semibold leading-tight mt-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {stats.district}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.detail.close}
          className="shrink-0 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </header>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[12px]">
        <Stat
          label={locale === 'ru' ? 'Проектов' : 'Projects'}
          value={String(stats.count)}
        />
        <Stat
          label={locale === 'ru' ? 'Квартир в продаже' : 'Available'}
          value={String(stats.availableUnits)}
        />
        <Stat
          label={locale === 'ru' ? 'Средняя цена/м²' : 'Avg price/m²'}
          value={fmt.priceSqm(stats.avgPricePerSqm, locale)}
        />
        <Stat
          label={locale === 'ru' ? 'До моря' : 'To sea'}
          value={fmt.dist(stats.avgSeaDistance, locale)}
        />
        <Stat
          label={locale === 'ru' ? 'Цена от' : 'From'}
          value={fmt.price(stats.minPrice, locale)}
          spanFull
        />
      </dl>

      <div className="flex flex-col gap-2">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">
          {locale === 'ru' ? 'Проекты района' : 'Projects in district'}
        </div>
        <ul className="flex flex-col divide-y divide-[var(--border)]">
          {stats.sampleProjects.map((p) => (
            <li key={p.id} className="py-2 flex flex-col gap-1">
              <Link
                href={`/projects/${p.id}`}
                className="font-medium text-[13px] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline"
              >
                {p.name}
              </Link>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge color={STATUS_COLORS[p.status]} size="sm">
                  {p.status}
                </Badge>
                <Badge color={CLASS_COLORS[p.classType]} size="sm">
                  {p.classType}
                </Badge>
                <span className="text-[12px] text-[var(--text-dim)] tabular-nums ml-auto">
                  {fmt.priceSqm(p.pricePerSqm, locale)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function Stat({
  label,
  value,
  spanFull = false,
}: {
  label: string;
  value: string;
  spanFull?: boolean;
}) {
  return (
    <div className={spanFull ? 'col-span-2' : ''}>
      <dt className="text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </dt>
      <dd
        className="text-[15px] font-semibold tabular-nums mt-0.5"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {value}
      </dd>
    </div>
  );
}
