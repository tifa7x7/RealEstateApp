'use client';

import { useTranslations } from '@/hooks/useTranslations';

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px] text-[var(--text-muted)]">
        <p>{t.common.disclaimer}</p>
        <p>{t.common.sources}</p>
      </div>
    </footer>
  );
}
