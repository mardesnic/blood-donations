import { getTranslations } from 'next-intl/server';

// "<title> | <app name>" in the current language.
export async function pageTitle(title?: string | null) {
  const t = await getTranslations('app');
  return title ? `${title} | ${t('title')}` : t('title');
}
