'use client';

import { type MouseEvent } from 'react';
import Link from 'next/link';
import { Building2, Heart, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  ConfidenceBadge,
  projectDataConfidenceToTier,
} from '@/components/ui/ConfidenceBadge';
import { useFavorites } from '@/hooks/useFavorites';
import { useLocale, useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import { fmt } from '@/lib/formatters';
import type { Project } from '@/lib/types';

export interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project: p, className = '' }: ProjectCardProps) {
  const t = useTranslations();
  const { locale } = useLocale();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(p.id);

  const handleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(p.id);
  };

  // Placeholder image area tinted by the project class. The tint is drawn via
  // `color-mix` from the class CSS variable so it follows theme + locks the
  // image area to the brand palette. Real media replaces this surface later.
  const classColor = CLASS_COLORS[p.classType];
  const placeholderBg = {
    background: [
      'radial-gradient(circle at 80% 20%,',
      `color-mix(in srgb, ${classColor} 28%, transparent),`,
      'transparent 60%),',
      'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)',
    ].join(' '),
  };

  return (
    <Card interactive padded={false} className={`overflow-hidden ${className}`.trim()}>
      <Link href={`/projects/${p.id}`} className="block">
        <div
          className="relative aspect-[16/9] w-full overflow-hidden border-b border-[var(--border)]"
          style={placeholderBg}
          aria-hidden="true"
        >
          <Building2
            size={42}
            className="absolute inset-0 m-auto text-[var(--text-muted)] opacity-40"
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Badge color={STATUS_COLORS[p.status]} size="sm">
              {p.status}
            </Badge>
            <ConfidenceBadge
              tier={projectDataConfidenceToTier(p.dataConfidence)}
              compact
            />
          </div>
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={isFav ? t.detail.removeFav : t.detail.addFav}
            aria-pressed={isFav}
            className="absolute top-2 left-2 p-1.5 rounded-lg bg-[var(--bg-card)]/80 backdrop-blur hover:bg-[var(--bg-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Heart
              size={14}
              aria-hidden="true"
              className={
                isFav
                  ? 'fill-[var(--accent)] text-[var(--accent)]'
                  : 'text-[var(--text-dim)]'
              }
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-[15px] leading-tight">{p.name}</h3>
            <Badge color={CLASS_COLORS[p.classType]} size="sm">
              {p.classType}
            </Badge>
          </div>
          <p className="text-[12px] text-[var(--text-dim)] mb-3">{p.developer}</p>

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
        </div>
      </Link>
    </Card>
  );
}
