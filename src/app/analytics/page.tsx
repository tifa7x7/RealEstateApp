import { AnalyticsContent } from '@/components/analytics/AnalyticsContent';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Аналитика рынка',
  description:
    'Анализ цен по классам, городам и удобствам. Портфели застройщиков. Квадрант ценности.',
  path: '/analytics',
});

export default function AnalyticsPage() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto flex flex-col gap-4">
      <h1
        className="text-[22px] md:text-[28px] font-semibold"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Аналитика рынка
      </h1>
      <AnalyticsContent />
    </div>
  );
}
