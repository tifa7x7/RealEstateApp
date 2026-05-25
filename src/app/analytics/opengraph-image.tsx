import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from '@/lib/og-image';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Аналитика рынка новостроек Крыма';

export default function Image() {
  return renderOgImage({
    eyebrow: 'Аналитика',
    title: 'Рынок новостроек Крыма в цифрах',
    subtitle:
      'Цены по классам, портфели застройщиков, влияние удобств. Бесплатно.',
  });
}
