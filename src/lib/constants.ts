import type { ProjectClass, ProjectStatus, Region, UnitStatus } from './types';

export const MARKET_DATA = {
  matkapital: { full: 963243, topUp1st: 234321, for1st: 728922, programEnd: 2030 },
  subsidy450k: { amount: 450000, programEnd: '31.12.2030' },
  mortgage: { familyRate: 6, limit: 6000000, minDownPct: 20, marketRate: 21 },
  cbRate: 16,
  taxes: {
    selfEmployed: 4,
    propertyMin: 0.1,
    propertyMax: 0.3,
    incomeSale: 13,
    saleDeduction: 1000000,
    minHoldYears: 5,
  },
  simferopol: {
    avgPriceSqm: 197000,
    avgRenovation: 15000,
    byType: {
      '1K': { priceSqm: 247000, total: 10000000 },
      '2K': { priceSqm: 171000, total: 11700000 },
      '3K': { priceSqm: 169000, total: 13000000 },
    },
    rent: { '1K': 33200, '2K': 40600, '3K': 52600 },
    priceGrowth: '6-8%',
  },
  depositRate: 16,
  rubUsd: 0.011,
} as const;

export const REGIONS_DATA: readonly Region[] = [
  {
    id: 'crimea',
    name: 'Республика Крым',
    nameEn: 'Republic of Crimea',
    cities: ['Ялта', 'Симферополь', 'Алушта', 'Евпатория', 'Севастополь', 'Феодосия', 'Керчь', 'Судак', 'Бахчисарай'],
  },
  { id: 'moscow', name: 'Москва и МО', nameEn: 'Moscow Region' },
  { id: 'spb', name: 'Санкт-Петербург и ЛО', nameEn: 'St. Petersburg Region' },
  { id: 'krasnodar', name: 'Краснодарский край', nameEn: 'Krasnodar Krai' },
  { id: 'rostov', name: 'Ростовская область', nameEn: 'Rostov Oblast' },
  { id: 'tatarstan', name: 'Республика Татарстан', nameEn: 'Republic of Tatarstan' },
  { id: 'sverdlovsk', name: 'Свердловская область', nameEn: 'Sverdlovsk Oblast' },
  { id: 'novosibirsk', name: 'Новосибирская область', nameEn: 'Novosibirsk Oblast' },
  { id: 'nizhny', name: 'Нижегородская область', nameEn: 'Nizhny Novgorod Oblast' },
  { id: 'samara', name: 'Самарская область', nameEn: 'Samara Oblast' },
  { id: 'chelyabinsk', name: 'Челябинская область', nameEn: 'Chelyabinsk Oblast' },
  { id: 'bashkortostan', name: 'Республика Башкортостан', nameEn: 'Republic of Bashkortostan' },
  { id: 'perm', name: 'Пермский край', nameEn: 'Perm Krai' },
  { id: 'voronezh', name: 'Воронежская область', nameEn: 'Voronezh Oblast' },
  { id: 'volgograd', name: 'Волгоградская область', nameEn: 'Volgograd Oblast' },
  { id: 'tyumen', name: 'Тюменская область', nameEn: 'Tyumen Oblast' },
  { id: 'krasnoyarsk', name: 'Красноярский край', nameEn: 'Krasnoyarsk Krai' },
  { id: 'saratov', name: 'Саратовская область', nameEn: 'Saratov Oblast' },
  { id: 'dagestan', name: 'Республика Дагестан', nameEn: 'Republic of Dagestan' },
  { id: 'primorsky', name: 'Приморский край', nameEn: 'Primorsky Krai' },
  { id: 'irkutsk', name: 'Иркутская область', nameEn: 'Irkutsk Oblast' },
  { id: 'tula', name: 'Тульская область', nameEn: 'Tula Oblast' },
  { id: 'stavropol', name: 'Ставропольский край', nameEn: 'Stavropol Krai' },
  { id: 'omsk', name: 'Омская область', nameEn: 'Omsk Oblast' },
  { id: 'kaliningrad', name: 'Калининградская область', nameEn: 'Kaliningrad Oblast' },
];

/**
 * Domain → CSS-variable maps. Components consume these via `var(--token)`,
 * NOT raw hex. The actual hex values live in `src/styles/globals.css` and
 * support both dark and light themes plus future re-skinning.
 *
 * When you need the *resolved* hex (e.g. for an SVG `fill` attribute that
 * doesn't interpolate CSS variables), use the `useChartColors()` hook in
 * `src/hooks/useChartColors.ts` — it reads `getComputedStyle` and is
 * theme-aware.
 */
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'Проектируется': 'var(--status-projected)',
  'Строится': 'var(--status-construction)',
  'Ввод в эксплуатацию': 'var(--status-handover)',
  'Сдан': 'var(--status-completed)',
};

export const CLASS_COLORS: Record<ProjectClass, string> = {
  'Эконом': 'var(--class-economy)',
  'Комфорт': 'var(--class-comfort)',
  'Бизнес': 'var(--class-business)',
  'Премиум': 'var(--class-premium)',
};

export const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
  'в продаже': 'var(--unit-available)',
  'бронь': 'var(--unit-reserved)',
  'продано': 'var(--unit-sold)',
};

/**
 * CSS-variable names (without the `var(...)` wrapper) for each domain key.
 * `useChartColors()` reads these to resolve theme-aware hex for SVG fills.
 */
export const STATUS_COLOR_VARS: Record<ProjectStatus, string> = {
  'Проектируется': '--status-projected',
  'Строится': '--status-construction',
  'Ввод в эксплуатацию': '--status-handover',
  'Сдан': '--status-completed',
};

export const CLASS_COLOR_VARS: Record<ProjectClass, string> = {
  'Эконом': '--class-economy',
  'Комфорт': '--class-comfort',
  'Бизнес': '--class-business',
  'Премиум': '--class-premium',
};

export const UNIT_STATUS_COLOR_VARS: Record<UnitStatus, string> = {
  'в продаже': '--unit-available',
  'бронь': '--unit-reserved',
  'продано': '--unit-sold',
};

/**
 * Finishing-grade options for the calculator's renovation field. Each grade
 * has a typical ₽/m² range; the calculator UI uses the midpoint to pre-fill
 * the `renovation` field as `area × pricePerSqm`. Users can still override
 * the resulting number freely.
 *
 * Source: Crimean market reference data for 2026 — Simferopol avgRenovation
 * is 15 000 ₽/m² (see MARKET_DATA.simferopol.avgRenovation); the other tiers
 * are derived industry estimates.
 */
export type FinishingGradeId =
  | 'none'
  | 'pre-rough'
  | 'rough'
  | 'finished'
  | 'white-box'
  | 'turn-key';

export interface FinishingGrade {
  id: FinishingGradeId;
  labelRu: string;
  labelEn: string;
  /** Typical ₽/m² for this finishing tier. */
  pricePerSqm: number;
  /** One-line explanation for the user (Russian). */
  hintRu: string;
  /** One-line explanation for the user (English). */
  hintEn: string;
}

export const FINISHING_GRADES: readonly FinishingGrade[] = [
  {
    id: 'none',
    labelRu: 'Без ремонта',
    labelEn: 'None',
    pricePerSqm: 0,
    hintRu: 'Принимаете квартиру как есть.',
    hintEn: 'Take the apartment as-is.',
  },
  {
    id: 'pre-rough',
    labelRu: 'Черновая',
    labelEn: 'Pre-rough',
    pricePerSqm: 6000,
    hintRu: 'Стяжка, штукатурка, подведённые коммуникации.',
    hintEn: 'Screed, plaster, utility hook-ups.',
  },
  {
    id: 'rough',
    labelRu: 'Предчистовая',
    labelEn: 'Rough',
    pricePerSqm: 12000,
    hintRu: 'Готовые стены и пол под обои/ламинат.',
    hintEn: 'Walls and floors ready for wallpaper / laminate.',
  },
  {
    id: 'finished',
    labelRu: 'Чистовая',
    labelEn: 'Finished',
    pricePerSqm: 22000,
    hintRu: 'Полная отделка, мебель и техника — отдельно.',
    hintEn: 'Full finishing; furniture and appliances separate.',
  },
  {
    id: 'white-box',
    labelRu: 'White-box',
    labelEn: 'White-box',
    pricePerSqm: 35000,
    hintRu: 'Готовая отделка под собственный дизайн.',
    hintEn: 'Finished surfaces ready for your own design.',
  },
  {
    id: 'turn-key',
    labelRu: 'Под ключ',
    labelEn: 'Turn-key',
    pricePerSqm: 55000,
    hintRu: 'Полностью готовая квартира с мебелью и техникой.',
    hintEn: 'Fully equipped — furniture and appliances included.',
  },
] as const;
