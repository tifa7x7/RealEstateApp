import { MARKET_DATA } from './constants';
import type { Currency, Locale } from './types';

const LOCALE_TAG: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
};

function tag(locale: Locale): string {
  return LOCALE_TAG[locale];
}

export function price(val: number, locale: Locale = 'ru', currency: Currency = 'RUB'): string {
  if (currency === 'USD') {
    const u = val * MARKET_DATA.rubUsd;
    if (u >= 1e6) return `$${(u / 1e6).toFixed(2)}M`;
    if (u >= 1e3) return `$${(u / 1e3).toFixed(0)}K`;
    return `$${u.toFixed(0)}`;
  }
  if (locale === 'en') {
    if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M ₽`;
    if (val >= 1e3) return `${Math.round(val / 1e3)}K ₽`;
    return `${val} ₽`;
  }
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)} млн ₽`;
  if (val >= 1e3) return `${Math.round(val / 1e3)} тыс ₽`;
  return `${val} ₽`;
}

export function priceSqm(val: number, locale: Locale = 'ru', currency: Currency = 'RUB'): string {
  if (currency === 'USD') {
    return `$${Math.round(val * MARKET_DATA.rubUsd).toLocaleString(LOCALE_TAG.en)}`;
  }
  return `${val.toLocaleString(tag(locale))} ₽`;
}

export function n(val: number, locale: Locale = 'ru'): string {
  return Math.round(val).toLocaleString(tag(locale));
}

export function dist(val: number, locale: Locale = 'ru'): string {
  const kmUnit = locale === 'en' ? 'km' : 'км';
  const mUnit = locale === 'en' ? 'm' : 'м';
  if (val >= 1) return `${val.toFixed(1)} ${kmUnit}`;
  return `${Math.round(val * 1000)} ${mUnit}`;
}

export const fmt = { price, priceSqm, n, dist };
