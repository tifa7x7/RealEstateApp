import { SingleListView } from '@/components/product/account/SingleListView';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Список',
  path: '/account/lists',
});

interface ListDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const { id } = await params;
  return <SingleListView listId={id} />;
}
