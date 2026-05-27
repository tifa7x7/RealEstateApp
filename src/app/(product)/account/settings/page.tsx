import { SettingsForm } from '@/components/product/account/SettingsForm';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Настройки',
  path: '/account/settings',
});

export default function SettingsPage() {
  return <SettingsForm />;
}
