export const LOCALES = ['en', 'hr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
// Remembers the language the user picked.
export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  hr: 'Hrvatski',
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

// The language to show: the one the user picked, else the first supported
// language the browser asks for, else the default.
export function resolveLocale(
  cookie: string | null | undefined,
  acceptLanguage: string | null | undefined
): Locale {
  if (isLocale(cookie)) {
    return cookie;
  }
  const preferred = (acceptLanguage || '')
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return {
        language: tag.trim().toLowerCase().split('-')[0],
        quality: q ? Number(q.trim().slice(2)) : 1,
      };
    })
    .filter((entry) => entry.language && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);
  return (
    (preferred.find((entry) => isLocale(entry.language))?.language as
      | Locale
      | undefined) ?? DEFAULT_LOCALE
  );
}
