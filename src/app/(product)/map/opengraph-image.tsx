import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from '@/lib/og-image';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Карта новостроек Крыма';

export default function Image() {
  return renderOgImage({
    eyebrow: 'Карта',
    title: 'Новостройки на карте Крыма',
    subtitle:
      'Фильтры по классу, статусу, удалённости от моря. Аналитика по районам.',
  });
}
