'use client';

import { useEffect } from 'react';
import { useLocale } from '@/hooks/useTranslations';

/**
 * Mirrors the current locale into `<html lang="...">` so screen readers
 * and translation tools pick up language changes. Renders nothing.
 */
export function LocaleHtmlLang(): null {
  const { locale } = useLocale();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
