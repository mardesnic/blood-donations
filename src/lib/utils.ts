import { APP_TITLE } from '@/lib/const';

export function generatePageTitle(title: string = '') {
  return `${title ? `${title} | ` : ''}${APP_TITLE}`;
}

export function getDisplayName(input: string[]): string {
  return input.filter(Boolean).join(' ');
}
