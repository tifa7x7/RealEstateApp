'use client';

import Link from 'next/link';
import { Calculator, Heart } from 'lucide-react';
import { AlertToggleButton } from '@/components/projects/AlertToggleButton';
import { useTranslations } from '@/hooks/useTranslations';
import { useAppStore } from '@/store/app-store';

export interface UnitActionsProps {
  projectId: number;
  unitId: string;
}

export function UnitActions({ projectId, unitId }: UnitActionsProps) {
  const t = useTranslations();
  const favUnits = useAppStore((s) => s.favUnits);
  const toggleFavUnit = useAppStore((s) => s.toggleFavUnit);

  const favKey = `${projectId}__${unitId}`;
  const isFav = favUnits.includes(favKey);

  const calcHref = `/calculator?project=${projectId}&unit=${encodeURIComponent(unitId)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => toggleFavUnit(projectId, unitId)}
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

      <AlertToggleButton projectId={projectId} unitId={unitId} />

      <Link
        href={calcHref}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium bg-[var(--accent)] text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      >
        <Calculator size={14} aria-hidden="true" />
        {t.detail.calculate}
      </Link>
    </div>
  );
}
