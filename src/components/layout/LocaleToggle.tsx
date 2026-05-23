'use client';

import { useLocale } from '@/hooks/useTranslations';
import type { Locale } from '@/lib/types';

const NEXT_LOCALE: Record<Locale, Locale> = { ru: 'en', en: 'ru' };
const LABEL: Record<Locale, string> = { ru: 'RU', en: 'EN' };
const ARIA: Record<Locale, string> = {
  ru: 'Switch to English',
  en: 'Переключить на русский',
};

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      type="button"
      onClick={() => setLocale(NEXT_LOCALE[locale])}
      aria-label={ARIA[locale]}
      title={ARIA[locale]}
      className="px-2 py-1.5 rounded-lg text-[11px] font-semibold tabular-nums text-[var(--text-dim)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] uppercase tracking-wider min-w-[36px]"
    >
      {LABEL[locale]}
    </button>
  );
}
