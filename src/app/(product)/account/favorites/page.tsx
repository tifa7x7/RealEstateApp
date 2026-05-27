import { FavoritesList } from '@/components/product/account/FavoritesList';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Избранное',
  path: '/account/favorites',
});

export default function FavoritesPage() {
  return <FavoritesList />;
}
