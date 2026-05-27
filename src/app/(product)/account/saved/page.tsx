import { SavedCalcsList } from '@/components/product/account/SavedCalcsList';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Сохранённые расчёты',
  path: '/account/saved',
});

export default function SavedCalcsPage() {
  return <SavedCalcsList />;
}
