/**
 * Centralised metadata helpers. Each route imports `buildMetadata` (or the
 * pre-baked constants) to keep titles, descriptions, OpenGraph, and Twitter
 * cards consistent.
 *
 * `NEXT_PUBLIC_SITE_URL` should be set in production to the canonical origin
 * (e.g. https://real-estate-app.ru). It feeds `metadataBase` so relative
 * paths resolve correctly in OG / Twitter URLs.
 */
import type { Metadata } from 'next';

export const SITE_NAME = 'RealEstateApp';
export const SITE_TITLE_DEFAULT =
  'RealEstateApp — Найди квартиру и просчитай инвестицию';
export const SITE_DESCRIPTION =
  'Цены застройщиков, ипотека, аренда и срок окупаемости — в одном калькуляторе. Новостройки Крыма, без брокера, без таблиц Excel.';

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
export const SITE_URL = RAW_SITE_URL.replace(/\/$/, '');

export interface BuildMetadataInput {
  title: string;
  description?: string;
  /** Path relative to SITE_URL, e.g. '/calculator'. Used for canonical + og:url. */
  path?: string;
  /** Override og:type (default 'website'; project pages use 'article'). */
  ogType?: 'website' | 'article';
}

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = '/',
  ogType = 'website',
}: BuildMetadataInput): Metadata {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      url,
      title: fullTitle,
      description,
      locale: 'ru_RU',
      alternateLocale: ['en_US'],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
