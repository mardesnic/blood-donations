'use client';

import { Button, ButtonGroup } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LOCALES, LOCALE_NAMES } from '@/i18n/config';
import { setLocale } from '@/i18n/actions';

// EN | HR buttons. The choice is saved in a cookie and the page re-rendered
// on the server in the new language.
export const LanguageSwitcher = ({
  color = 'inherit',
}: {
  color?: 'inherit' | 'secondary';
}) => {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const change = (next: string) => {
    if (next === locale) {
      return;
    }
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <ButtonGroup
      size='small'
      variant='text'
      color={color}
      aria-label={t('language')}
      disabled={isPending}
    >
      {LOCALES.map((option) => (
        <Button
          key={option}
          onClick={() => change(option)}
          aria-pressed={option === locale}
          title={LOCALE_NAMES[option]}
          lang={option}
          sx={{
            fontSize: 14,
            fontWeight: option === locale ? 700 : 400,
            opacity: option === locale ? 1 : 0.7,
            minWidth: 40,
          }}
        >
          {option.toUpperCase()}
        </Button>
      ))}
    </ButtonGroup>
  );
};
