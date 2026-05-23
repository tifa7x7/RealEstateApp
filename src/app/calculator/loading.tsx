import { CalcSkeleton } from '@/components/ui/Skeletons';

export default function CalculatorLoading() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 max-w-7xl mx-auto">
      <CalcSkeleton />
    </div>
  );
}
