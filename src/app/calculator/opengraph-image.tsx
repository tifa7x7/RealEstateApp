import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgImage,
} from '@/lib/og-image';

export const runtime = 'edge';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Калькулятор инвестиций в новостройку';

export default function Image() {
  return renderOgImage({
    eyebrow: 'Калькулятор',
    title: 'Просчитай инвестицию за минуту',
    subtitle:
      'Ипотека, маткапитал, аренда, прогноз доходности на 10 лет. Без таблиц Excel.',
  });
}
