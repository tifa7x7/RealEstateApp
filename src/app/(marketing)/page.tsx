import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CalculatorHeroIllustration } from '@/components/marketing/CalculatorHeroIllustration';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { MarketingCTAPair } from '@/components/marketing/MarketingCTAPair';
import { MarketingSlab } from '@/components/marketing/MarketingSlab';
import { PersonaRow } from '@/components/marketing/PersonaRow';
import { StatStrip } from '@/components/marketing/StatStrip';
import { TestimonialCarousel } from '@/components/marketing/TestimonialCarousel';
import { ru } from '@/i18n/ru';

// Phase 19 — marketing homepage is intentionally a server component with
// statically-loaded Russian copy. We don't run i18n through useTranslations
// here because the marketing surface is SEO-critical and we want crawlers
// to see the copy on first byte, not after a client hydrate. English
// version (and locale switching) is a follow-up.
const t = ru.marketing;

export default function HomePage() {
  return (
    <>
      {/* Slab 1 — Hero: calculator screenshot + serif headline + paired CTA. */}
      <MarketingSlab
        eyebrow={t.heroEyebrow}
        headline={t.heroHeadline}
        subhead={t.heroSubhead}
        image={<CalculatorHeroIllustration />}
        layout="image-right"
        background="gradient"
        paddingClassName="pt-16 pb-12 md:pt-20 md:pb-16"
        actions={<MarketingCTAPair primaryHref="/calculator" primaryLabel={t.heroPrimaryCta} secondaryLabel={t.heroSecondaryCta} align="start" />}
      />

      {/* Slab 2 — Stat strip (big numerals) under the hero. */}
      <section className="py-6 border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <StatStrip
            items={[
              { value: '200+', caption: t.statProjects },
              { value: '5 000', caption: t.statUnits },
              { value: '7', caption: t.statCities },
              { value: '4–28', caption: t.statPriceRange },
            ]}
          />
        </div>
      </section>

      {/* Slab 3 — Value props (3 cards). */}
      <MarketingSlab
        eyebrow={t.valuePropsTitle}
        headline={t.valuePropsSubtitle}
        layout="text-only"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ValuePropCard title={t.vp1Title} body={t.vp1Body} />
          <ValuePropCard title={t.vp2Title} body={t.vp2Body} />
          <ValuePropCard title={t.vp3Title} body={t.vp3Body} />
        </div>
      </MarketingSlab>

      {/* Slab 4 — Feature block: Calculator (image left). */}
      <MarketingSlab
        eyebrow={t.featureCalcEyebrow}
        headline={t.featureCalcHeadline}
        subhead={t.featureCalcBody}
        image={<MiniMockup title="Калькулятор" rows={[['Ипотека', '42 180 ₽/мес'], ['Cap Rate', '8.4%'], ['Окупаемость', '11 лет']]} />}
        layout="image-left"
        background="tinted"
        actions={<LinkAction href="/calculator" label={t.featureCalcCta} />}
      />

      {/* Slab 5 — Feature block: Map (image right). */}
      <MarketingSlab
        eyebrow={t.featureMapEyebrow}
        headline={t.featureMapHeadline}
        subhead={t.featureMapBody}
        image={<MiniMockup title="Карта районов" rows={[['Симферополь', '127 ЖК'], ['Ялта', '34 ЖК'], ['Алушта', '21 ЖК']]} />}
        layout="image-right"
        actions={<LinkAction href="/map" label={t.featureMapCta} />}
      />

      {/* Slab 6 — Feature block: Analytics (image left). */}
      <MarketingSlab
        eyebrow={t.featureAnalyticsEyebrow}
        headline={t.featureAnalyticsHeadline}
        subhead={t.featureAnalyticsBody}
        image={<MiniMockup title="Аналитика рынка" rows={[['Средняя цена/м²', '142 000 ₽'], ['Самый дорогой класс', 'Премиум'], ['Самый активный', 'Симферополь']]} />}
        layout="image-left"
        background="tinted"
        actions={<LinkAction href="/analytics" label={t.featureAnalyticsCta} />}
      />

      {/* Slab 7 — Feature block: Lists + Alerts (image right). */}
      <MarketingSlab
        eyebrow={t.featureListsEyebrow}
        headline={t.featureListsHeadline}
        subhead={t.featureListsBody}
        image={<MiniMockup title="Списки и уведомления" rows={[['Инвестиции', '12 объектов'], ['У моря', '8 объектов'], ['Pro: оповещение', 'мгновенно']]} />}
        layout="image-right"
        actions={<LinkAction href="/account/lists" label={t.featureListsCta} />}
      />

      {/* Slab 8 — Capability summary (centered). */}
      <MarketingSlab
        eyebrow="Всё в одном месте"
        headline={t.capabilityTitle}
        subhead={t.capabilitySubtitle}
        layout="centered"
        background="gradient"
      />

      {/* Slab 9 — Persona row. */}
      <MarketingSlab
        eyebrow={t.personaTitle}
        headline={t.personaSubtitle}
        layout="text-only"
      >
        <PersonaRow />
      </MarketingSlab>

      {/* Slab 10 — Testimonial carousel (placeholder until real ones land). */}
      <section className="py-16 md:py-20 bg-[var(--bg-card)]">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <TestimonialCarousel />
        </div>
      </section>

      {/* Slab 11 — Pricing reference (link to /pricing, not the full table). */}
      <MarketingSlab
        eyebrow="Тарифы"
        headline={t.pricingTitle}
        subhead={t.pricingSubtitle}
        layout="centered"
        actions={
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[15px] font-medium border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-surface)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <span>Посмотреть тарифы</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      />

      {/* Slab 12 — FAQ. */}
      <MarketingSlab
        eyebrow="FAQ"
        headline={t.faqTitle}
        layout="text-only"
        background="tinted"
      >
        <FAQAccordion items={HOMEPAGE_FAQ} />
      </MarketingSlab>

      {/* Slab 13 — Final CTA pair. */}
      <MarketingSlab
        layout="centered"
        headline="Начните прямо сейчас"
        subhead="Зарегистрируйтесь — и через минуту посчитаете, стоит ли квартира своих денег."
        actions={<MarketingCTAPair primaryLabel={t.ctaPairPrimary} secondaryLabel={t.ctaPairSecondary} />}
        background="gradient"
      />
    </>
  );
}

function ValuePropCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <h3 className="text-[16px] font-semibold leading-tight">{title}</h3>
      <p className="text-[13px] text-[var(--text-dim)] leading-relaxed">{body}</p>
    </div>
  );
}

function MiniMockup({
  title,
  rows,
}: {
  title: string;
  rows: ReadonlyArray<readonly [string, string]>;
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 md:p-6"
      style={{
        boxShadow:
          '0 8px 30px -8px color-mix(in srgb, var(--accent) 18%, transparent), 0 2px 4px rgba(0,0,0,0.03)',
      }}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
        <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--text-muted)]">
          {title}
        </span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-30" aria-hidden="true" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-30" aria-hidden="true" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] opacity-30" aria-hidden="true" />
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <li key={label} className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--text-dim)]">{label}</span>
            <span
              className="text-[15px] md:text-[16px] font-semibold tabular-nums"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[14px] font-medium text-[var(--accent)] hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:underline"
    >
      <span>{label}</span>
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  );
}

const HOMEPAGE_FAQ = [
  {
    question: 'Бесплатно ли пользоваться?',
    answer:
      'Да. Поиск, базовый калькулятор и список «Избранное» до 25 объектов — бесплатно навсегда. Pro нужен только для мультиобъектного сравнения, 10-летнего прогноза, безлимитных списков и мгновенных уведомлений о ценах.',
  },
  {
    question: 'Откуда берутся данные?',
    answer:
      'Прямо от застройщиков и из открытых источников (региональный реестр новостроек). Каждый ЖК помечен бейджем точности: «подтверждено», «оценка» или «не проверено» — чтобы вы понимали, насколько доверять цифре.',
  },
  {
    question: 'Считает ли калькулятор семейную ипотеку?',
    answer:
      'Да. И не просто ставку 6% на всю сумму — а правильно: 6 млн ₽ под 6%, а остаток — по рыночной ставке (около 21%). Видно обе части и итоговый платёж. То же для IT-ипотеки и военной (готовится).',
  },
  {
    question: 'Можно ли продавать здесь свою квартиру?',
    answer:
      'Нет. Мы — инструмент для покупателя и инвестора, не маркетплейс. Если вы хотите оценить свою квартиру — используйте калькулятор «обратно»: подставьте свои параметры и посмотрите, что показывает рынок.',
  },
  {
    question: 'Что такое маткапитал и зачем он в калькуляторе?',
    answer:
      'Государственная субсидия (в 2026 — 963 243 ₽), которую можно использовать как первоначальный взнос. Калькулятор сразу показывает, какую долю первоначального взноса маткапитал закроет — для многих семей это разница между «не хватает на ПВ» и «хватает».',
  },
  {
    question: 'Что произойдёт, если я зарегистрируюсь?',
    answer:
      'Сохранятся ваши избранные квартиры, расчёты и портфель — между устройствами. Ничего никуда не отправляем. Можно использовать сервис анонимно — регистрация нужна только если хотите, чтобы данные не пропали.',
  },
];
