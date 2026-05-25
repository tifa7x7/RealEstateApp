import { MapPageClient } from '@/components/map/MapPageClient';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Карта объектов',
  description: 'Интерактивная карта новостроек с фильтрами по статусу и классу.',
  path: '/map',
});

export default function MapPage() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto flex flex-col gap-4">
      <h1
        className="text-[22px] md:text-[28px] font-semibold"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Карта объектов
      </h1>
      <MapPageClient />
    </div>
  );
}
