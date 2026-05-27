'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function CalculatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      title="Калькулятор недоступен"
      description="Не удалось загрузить калькулятор. Ваши сохранённые расчёты в безопасности — попробуйте обновить страницу."
      error={error}
      reset={reset}
    />
  );
}
