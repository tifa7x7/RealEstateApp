'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useLocale } from '@/hooks/useTranslations';
import { FilterPanel } from './FilterPanel';

export function MobileFilterButton() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const label = locale === 'en' ? 'Filters' : 'Фильтры';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        aria-label={label}
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        {label}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={label} size="md">
        <FilterPanel />
      </Modal>
    </>
  );
}
