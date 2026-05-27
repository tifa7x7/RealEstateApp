import { FavoritesList } from '@/components/product/account/FavoritesList';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Аккаунт',
  path: '/account',
});

export default function AccountIndexPage() {
  return <FavoritesList />;
}
