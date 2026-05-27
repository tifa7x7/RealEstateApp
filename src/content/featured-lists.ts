/**
 * Phase 17 — seed editorial "featured" lists shown on `/account/lists`.
 *
 * These are NOT real database rows yet. They're local content seeds the UI
 * surfaces as inspiration / discovery prompts. When the editorial pipeline
 * grows (Solgt's pattern of named curated lists owned by staff accounts),
 * seed these into Supabase as public `lists` rows owned by a service
 * account and follow them like any other public list.
 *
 * For now, tapping a featured list opens a filtered preview surface — not
 * a real follow relationship. Wiring is deferred to a follow-up.
 */
import type { LucideIcon } from 'lucide-react';
import { Award, Sparkles, TrendingDown, Waves } from 'lucide-react';

export interface FeaturedList {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Projects this list would contain. Predicate-driven, computed client-side. */
  predicate: 'sea-near' | 'price-drop' | 'matkapital' | 'top-roi';
  /** Whether following this list requires Pro tier. */
  proOnly?: boolean;
}

export const FEATURED_LISTS: readonly FeaturedList[] = [
  {
    id: 'sea-near',
    name: 'У моря',
    description: 'ЖК в пешей доступности от моря — меньше 1 км',
    icon: Waves,
    predicate: 'sea-near',
  },
  {
    id: 'matkapital',
    name: 'Под маткапитал',
    description: 'Квартиры, где маткапитал закрывает большую часть ПВ',
    icon: Award,
    predicate: 'matkapital',
  },
  {
    id: 'price-drop',
    name: 'Цена снижена',
    description: 'Цены, упавшие за последний месяц',
    icon: TrendingDown,
    predicate: 'price-drop',
    proOnly: true,
  },
  {
    id: 'top-roi',
    name: 'Высокая доходность',
    description: 'Топ по прогнозу Cash-on-Cash при сдаче в аренду',
    icon: Sparkles,
    predicate: 'top-roi',
    proOnly: true,
  },
] as const;
