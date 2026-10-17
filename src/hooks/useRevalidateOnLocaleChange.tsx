import { useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';

// Validation messages are translated when they are created, so errors already
// on screen would stay in the old language; validate again after a switch.
export const useRevalidateOnLocaleChange = (
  formik: { validateForm: () => unknown } | null | undefined
) => {
  const locale = useLocale();
  const previous = useRef(locale);
  useEffect(() => {
    if (previous.current !== locale) {
      previous.current = locale;
      formik?.validateForm();
    }
  }, [locale, formik]);
};
