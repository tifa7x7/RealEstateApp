import { ListsIndex } from '@/components/product/account/ListsIndex';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Списки',
  path: '/account/lists',
});

export default function ListsPage() {
  return <ListsIndex />;
}
