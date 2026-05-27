'use client';

import {
  Bell,
  Building2,
  Car,
  Check,
  Dumbbell,
  Eye,
  type LucideIcon,
  Sparkles,
  ToyBrick,
  Trees,
  Waves,
  Wine,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslations } from '@/hooks/useTranslations';

const AMENITY_ICON: Record<string, LucideIcon> = {
  Паркинг: Car,
  Бассейн: Waves,
  'Вид на море': Eye,
  Фитнес: Dumbbell,
  Консьерж: Bell,
  'Детская площадка': ToyBrick,
  Коммерция: Building2,
  Спа: Sparkles,
  'Винный погреб': Wine,
  Зелень: Trees,
};

export interface ProjectAmenitiesProps {
  amenities: string[];
}

export function ProjectAmenities({ amenities }: ProjectAmenitiesProps) {
  const t = useTranslations();

  if (amenities.length === 0) return null;

  return (
    <Card>
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-3">
        {t.detail.amenities}
      </h2>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {amenities.map((name) => {
          const Icon = AMENITY_ICON[name] ?? Check;
          return (
            <li
              key={name}
              className="flex items-center gap-2 text-[13px] text-[var(--text)]"
            >
              <Icon
                size={16}
                aria-hidden="true"
                className="text-[var(--accent)] shrink-0"
              />
              <span>{name}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
