'use client';

import { type MouseEvent } from 'react';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { Project } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

export interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project: p, className = '' }: ProjectCardProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFav = favorites.includes(p.id);

  const handleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(p.id);
  };

  return (
    <Card interactive padded={false} className={`overflow-hidden ${className}`.trim()}>
      <Link href={`/projects/${p.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-[15px] leading-tight">{p.name}</h3>
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={isFav ? t.detail.removeFav : t.detail.addFav}
            aria-pressed={isFav}
            className="shrink-0 -mr-1 -mt-1 p-1.5 rounded hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Heart
              size={16}
              aria-hidden="true"
              className={
                isFav
                  ? 'fill-[var(--accent)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)]'
              }
            />
          </button>
        </div>
        <p className="text-[12px] text-[var(--text-dim)] mb-3">{p.developer}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge color={STATUS_COLORS[p.status]} size="sm">
            {p.status}
          </Badge>
          <Badge color={CLASS_COLORS[p.classType]} size="sm">
            {p.classType}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              {t.table.priceSqm}
            </div>
            <div className="font-semibold tabular-nums">
              {fmt.priceSqm(p.pricePerSqm, locale)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              {t.table.minPrice}
            </div>
            <div className="font-semibold tabular-nums">
              {fmt.price(p.minPrice, locale)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[var(--text-dim)]">
            <MapPin size={11} aria-hidden="true" />
            <span className="truncate">
              {p.city} · {fmt.dist(p.distSea, locale)}
            </span>
          </div>
          <div className="text-[var(--text-dim)] text-right whitespace-nowrap">
            {p.completion}
          </div>
        </div>
      </Link>
    </Card>
  );
}
