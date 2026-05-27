// @ts-nocheck — Deno edge-function shared helper.
//
// Locale-aware HTML email templates for price-drop alerts. Kept dependency
// free so the edge function bundle stays small.

export interface AlertEmailRow {
  /** Name of the list this alert is configured on (Phase 17). */
  listName: string;
  projectName: string;
  city: string;
  unitId: string | null;
  previousPrice: number;
  currentPrice: number;
  deltaPct: number;
  projectUrl: string;
  unsubscribeUrl: string;
}

interface Copy {
  subjectSingle: (project: string, pct: string) => string;
  subjectDigest: (count: number) => string;
  greeting: string;
  intro: (tier: 'free' | 'pro') => string;
  rowLine: (row: AlertEmailRow) => string;
  cta: string;
  unsubscribe: string;
  footer: string;
}

const RU: Copy = {
  subjectSingle: (project, pct) => `Цена на ${project} изменилась на ${pct}%`,
  subjectDigest: (count) => `${count} обновлений цен по вашим спискам`,
  greeting: 'Здравствуйте,',
  intro: (tier) =>
    tier === 'pro'
      ? 'По вашим спискам цены изменились:'
      : 'Еженедельная сводка изменений цен по вашим спискам:',
  rowLine: (row) => {
    const direction = row.deltaPct < 0 ? 'снизилась' : 'выросла';
    const pct = Math.abs(row.deltaPct).toFixed(1);
    const unit = row.unitId ? ` · кв. ${row.unitId}` : '';
    const oldP = formatRub(row.previousPrice);
    const newP = formatRub(row.currentPrice);
    return `<em>${escapeHtml(row.listName)}</em> — <strong>${escapeHtml(row.projectName)}</strong>${escapeHtml(unit)} (${escapeHtml(row.city)}) — цена ${direction} на ${pct}%: ${oldP} → <strong>${newP}</strong>`;
  },
  cta: 'Посмотреть объект',
  unsubscribe: 'Отписаться от этого уведомления',
  footer: 'Вы получили это письмо, потому что включили уведомления на ваш список. RealEstateApp.',
};

const EN: Copy = {
  subjectSingle: (project, pct) => `${project} price changed by ${pct}%`,
  subjectDigest: (count) => `${count} price updates on your lists`,
  greeting: 'Hello,',
  intro: (tier) =>
    tier === 'pro'
      ? 'Prices have changed on lists you watch:'
      : 'Weekly digest of price changes on your lists:',
  rowLine: (row) => {
    const direction = row.deltaPct < 0 ? 'dropped' : 'rose';
    const pct = Math.abs(row.deltaPct).toFixed(1);
    const unit = row.unitId ? ` · unit ${row.unitId}` : '';
    const oldP = formatRub(row.previousPrice);
    const newP = formatRub(row.currentPrice);
    return `<em>${escapeHtml(row.listName)}</em> — <strong>${escapeHtml(row.projectName)}</strong>${escapeHtml(unit)} (${escapeHtml(row.city)}) — price ${direction} ${pct}%: ${oldP} → <strong>${newP}</strong>`;
  },
  cta: 'View property',
  unsubscribe: 'Unsubscribe from this alert',
  footer: 'You received this because you opted into list price alerts. RealEstateApp.',
};

function formatRub(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderAlertEmail(
  locale: 'ru' | 'en',
  rows: AlertEmailRow[],
  tier: 'free' | 'pro',
): { subject: string; html: string } {
  const copy = locale === 'en' ? EN : RU;
  const subject =
    rows.length === 1
      ? copy.subjectSingle(rows[0].projectName, Math.abs(rows[0].deltaPct).toFixed(1))
      : copy.subjectDigest(rows.length);

  const items = rows
    .map(
      (r) => `
      <li style="margin-bottom: 14px; line-height: 1.55; font-size: 14px; color: #1a1d24;">
        ${copy.rowLine(r)}
        <div style="margin-top: 6px;">
          <a href="${r.projectUrl}" style="color: #0fb5a8; text-decoration: none; font-weight: 600;">${copy.cta} →</a>
          &nbsp;·&nbsp;
          <a href="${r.unsubscribeUrl}" style="color: #6b7280; font-size: 12px;">${copy.unsubscribe}</a>
        </div>
      </li>`,
    )
    .join('');

  const html = `<!doctype html>
<html>
<body style="margin:0; padding:24px; background:#f5f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:28px 24px;">
    <p style="margin:0 0 12px; font-size:15px; color:#1a1d24;">${copy.greeting}</p>
    <p style="margin:0 0 18px; font-size:14px; color:#4b5563;">${copy.intro(tier)}</p>
    <ul style="list-style:none; padding:0; margin:0 0 20px;">${items}</ul>
    <p style="margin:24px 0 0; font-size:11px; color:#9ca3af; line-height:1.5;">${copy.footer}</p>
  </div>
</body>
</html>`;

  return { subject, html };
}
