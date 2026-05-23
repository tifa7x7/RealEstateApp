'use client';

import { en } from '@/i18n/en';
import { ru } from '@/i18n/ru';
import type { Translations } from '@/i18n/types';
import type { Locale } from '@/lib/types';
import { useAppStore } from '@/store/app-store';

const TRANSLATIONS: Record<Locale, Translations> = { ru, en };

export function useTranslations(): Translations {
  const locale = useAppStore((s) => s.locale);
  return TRANSLATIONS[locale];
}

export function useLocale() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  return { locale, setLocale };
}
