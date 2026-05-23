import { RentalPortfolio } from '@/components/account/RentalPortfolio';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Портфель',
  path: '/account/portfolio',
});

export default function PortfolioPage() {
  return <RentalPortfolio />;
}
