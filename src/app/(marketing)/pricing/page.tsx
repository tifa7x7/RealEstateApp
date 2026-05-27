import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { MarketingCTAPair } from '@/components/marketing/MarketingCTAPair';
import { MarketingSlab } from '@/components/marketing/MarketingSlab';
import { PricingTable } from '@/components/marketing/PricingTable';
import { ru } from '@/i18n/ru';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Тарифы',
  description:
    'Поиск и калькулятор — бесплатно. Pro Monthly или Pro Yearly со скидкой 20% открывают сравнение, прогноз на 10 лет и мгновенные уведомления о ценах.',
  path: '/pricing',
});

const t = ru.marketing;

/**
 * Phase 19 — standalone /pricing page. Hero + 3-tier table (with
 * Monthly/Yearly toggle) + FAQ + final CTA pair. Deep-linked from
 * UpgradePrompt via `?from=<feature-key>` so a future iteration can
 * highlight the specific feature that triggered the visit.
 */
export default function PricingPage() {
  return (
    <>
      <MarketingSlab
        eyebrow="Тарифы"
        headline={t.pricingTitle}
        subhead={t.pricingSubtitle}
        layout="centered"
        background="gradient"
        paddingClassName="pt-16 pb-8 md:pt-20 md:pb-10"
      />

      <section className="pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <PricingTable />
        </div>
      </section>

      <MarketingSlab
        eyebrow="FAQ"
        headline="Вопросы про подписку"
        layout="text-only"
        background="tinted"
      >
        <FAQAccordion items={PRICING_FAQ} />
      </MarketingSlab>

      <MarketingSlab
        layout="centered"
        headline="Начните бесплатно"
        subhead="Регистрация занимает 30 секунд. Pro можно подключить позже, в любой момент."
        actions={<MarketingCTAPair primaryLabel={t.ctaPairPrimary} secondaryLabel="Сравнить тарифы" secondaryHref="#" />}
        background="gradient"
      />
    </>
  );
}

const PRICING_FAQ = [
  {
    question: 'Можно ли отменить Pro в любой момент?',
    answer:
      'Да. Подписка не возобновится автоматически после отмены. До конца оплаченного периода Pro-функции остаются доступны, потом аккаунт переходит в Free — без потери данных.',
  },
  {
    question: 'Чем Pro Monthly отличается от Pro Yearly?',
    answer:
      'Только ценой. Pro Yearly — то же самое, но при оплате на год вы экономите 20%. Функции одинаковые: мультиобъектный калькулятор, 10-летний прогноз, безлимитные списки, мгновенные оповещения о ценах.',
  },
  {
    question: 'Что произойдёт с моими данными, если я не продлю Pro?',
    answer:
      'Ничего не пропадёт. Списки, расчёты и портфель остаются на месте. Если у вас было больше одного списка, они сохраняются, но создавать новые на Free нельзя — пока не вернёте Pro.',
  },
  {
    question: 'Есть ли скидка для семьи / нескольких пользователей?',
    answer:
      'Пока нет, но мы думаем об этом. Если вам интересен совместный доступ — напишите на support@realestate.app, добавим в список ранних запросов.',
  },
  {
    question: 'Принимаете ли вы оплату с карт российских банков?',
    answer:
      'Да. Оплата проходит через российский эквайринг (YooKassa / CloudPayments — финализируется к запуску). Чек приходит на email.',
  },
  {
    question: 'Есть ли возврат, если Pro не подошёл?',
    answer:
      'Да. Если в первые 14 дней Pro вам не подошёл, вернём деньги без вопросов. Напишите на support@realestate.app — оформим возврат.',
  },
];
