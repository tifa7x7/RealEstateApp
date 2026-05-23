import { Suspense } from 'react';
import { CalcUrlBootstrap } from '@/components/calculator/CalcUrlBootstrap';
import { CalcWizard } from '@/components/calculator/CalcWizard';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Калькулятор инвестиций',
  description:
    'Ипотека, маткапитал, аренда, прогноз ROI. Рассчитайте доходность инвестиций в новостройку.',
  path: '/calculator',
});

export default function CalculatorPage() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
      <Suspense fallback={null}>
        <CalcUrlBootstrap />
      </Suspense>
      <Suspense fallback={null}>
        <CalcWizard />
      </Suspense>
    </div>
  );
}
