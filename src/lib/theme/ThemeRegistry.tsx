'use client';

import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { enUS as coreEn, hrHR as coreHr } from '@mui/material/locale';
import { enUS as gridEn, hrHR as gridHr } from '@mui/x-data-grid/locales';
import {
  enUS as pickersEn,
  hrHR as pickersHr,
} from '@mui/x-date-pickers/locales';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'dayjs/locale/en-gb';
import 'dayjs/locale/hr';
import React, { ReactNode, useMemo, useState } from 'react';
import { theme } from './theme';
import { Options } from '@emotion/cache';
import { Locale } from '@/i18n/config';

// MUI's built-in texts (pagination, grid menus, pickers) and the date
// pickers' day and month names for each language. English uses en-gb so
// weeks start on Monday.
const MUI_LOCALES = {
  en: { core: coreEn, grid: gridEn, pickers: pickersEn, dayjs: 'en-gb' },
  hr: { core: coreHr, grid: gridHr, pickers: pickersHr, dayjs: 'hr' },
} as const;

interface ThemeRegistryProps {
  children: ReactNode;
  options: Options;
  locale: Locale;
}

export default function ThemeRegistry(props: ThemeRegistryProps) {
  const { options, children, locale } = props;
  const muiLocale = MUI_LOCALES[locale] ?? MUI_LOCALES.en;
  const localizedTheme = useMemo(
    () => createTheme(theme, muiLocale.core, muiLocale.grid, muiLocale.pickers),
    [muiLocale]
  );

  const [{ cache, flush }] = useState(() => {
    const cache = createCache(options);
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={localizedTheme}>
        <CssBaseline />
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale={muiLocale.dayjs}
        >
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
