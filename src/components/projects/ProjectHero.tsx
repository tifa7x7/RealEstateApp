'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, MapPin, Scale } from 'lucide-react';
import { AlertToggleButton } from '@/components/projects/AlertToggleButton';
import { Badge } from '@/components/ui/Badge';
import {
  ConfidenceBadge,
  projectDataConfidenceToTier,
} from '@/components/ui/ConfidenceBadge';
import { UpgradePrompt } from '@/components/ui/UpgradePrompt';
import { useCompare } from '@/hooks/useCompare';
import { useFavorites } from '@/hooks/useFavorites';
import { useTranslations } from '@/hooks/useTranslations';
import { CLASS_COLORS, STATUS_COLORS } from '@/lib/constants';
import type { Project } from '@/lib/types';

export interface ProjectHeroProps {
  project: Project;
}

export function ProjectHero({ project: p }: ProjectHeroProps) {
  const t = useTranslations();
  const { isFavorite, toggleFavorite } = useFavorites();
  const compare = useCompare();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const isFav = isFavorite(p.id);
  const inCompare = compare.isInCompare(p.id);

  const handleCompare = () => {
    const result = compare.toggle(p.id);
    if (!result.ok && result.reason === 'limit-reached') {
      setUpgradeOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-dim)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:underline w-fit"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {t.project.backToList}
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-[22px] md:text-[28px] font-semibold leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {p.name}
          </h1>
          <div className="flex items-center gap-2 text-[13px] text-[var(--text-dim)] flex-wrap">
            <span>{p.developer}</span>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} aria-hidden="true" />
              {p.city}, {p.district}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <Badge color={STATUS_COLORS[p.status]} size="sm">
              {p.status}
            </Badge>
            <Badge color={CLASS_COLORS[p.classType]} size="sm">
              {p.classType}
            </Badge>
            <Badge size="sm">{p.buildingType}</Badge>
            <ConfidenceBadge tier={projectDataConfidenceToTier(p.dataConfidence)} />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AlertToggleButton projectId={p.id} />
          <button
            type="button"
            onClick={handleCompare}
            aria-pressed={inCompare}
            aria-label={inCompare ? t.compare.clear : t.detail.addCompare}
            className={
              'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
              (inCompare
                ? 'bg-[var(--accent-surface)] text-[var(--accent)] border border-[var(--accent)]/40'
                : 'bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/40')
            }
          >
            <Scale size={14} aria-hidden="true" />
            {t.detail.addCompare}
          </button>
          <button
            type="button"
            onClick={() => toggleFavorite(p.id)}
            aria-pressed={isFav}
            aria-label={isFav ? t.detail.removeFav : t.detail.addFav}
            className={
              'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ' +
              (isFav
                ? 'bg-[var(--accent-surface)] text-[var(--accent)] border border-[var(--accent)]/40'
                : 'bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/40')
            }
          >
            <Heart
              size={14}
              aria-hidden="true"
              className={isFav ? 'fill-current' : ''}
            />
            {isFav ? t.detail.removeFav : t.detail.addFav}
          </button>
        </div>
      </div>
      <UpgradePrompt
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        description={`Free-тариф позволяет сравнивать до ${compare.limit} объектов. Pro расширяет до 5 и открывает сравнение по всем метрикам.`}
      />
    </div>
  );
}
