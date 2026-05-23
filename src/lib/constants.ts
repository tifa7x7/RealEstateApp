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

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  'Проектируется': '#3b82f6',
  'Строится': '#f59e0b',
  'Ввод в эксплуатацию': '#a855f7',
  'Сдан': '#00d4aa',
};

export const CLASS_COLORS: Record<ProjectClass, string> = {
  'Эконом': '#8893a7',
  'Комфорт': '#3b82f6',
  'Бизнес': '#f59e0b',
  'Премиум': '#a855f7',
};

export const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
  'в продаже': '#00d4aa',
  'бронь': '#f59e0b',
  'продано': '#ef4444',
};
