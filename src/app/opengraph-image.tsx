import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from '@/lib/og-image';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'RealEstateApp — Аналитика инвестиций в новостройки';

export default function Image() {
  return renderOgImage({
    title: 'Найди квартиру и просчитай инвестицию',
    subtitle:
      'Цены застройщиков, ипотека, аренда и срок окупаемости — в одном калькуляторе.',
  });
}
