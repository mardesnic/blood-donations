'use client';

import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import React from 'react';
import { UserDropdown } from './UserDropdown';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';

export const TopBar = () => {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <AppBar position='sticky'>
      <Toolbar>
        <WaterDropIcon />

        <Typography
          variant='h3'
          sx={{ mx: '16px', textTransform: 'uppercase' }}
          component='div'
        >
          <Link href={ROUTE_PATHS.PROTECTED.DONORS.path} className='tap-target'>
            {t('app.title')}
          </Link>
        </Typography>
        <>
          <Box display={{ xs: 'none', md: 'flex' }} sx={{ flexGrow: 1, ml: 2 }}>
            {Object.values(ROUTE_PATHS.PROTECTED).map((route) => (
              <Link href={route.path} key={`${route.path}`}>
                <Button
                  variant='text'
                  size='medium'
                  className={pathname.startsWith(route.path) ? 'active' : ''}
                  disableRipple
                  sx={{
                    color: 'white',
                    textTransform: 'none',
                    '&.active': {
                      textDecoration: 'underline',
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '16px',
                    },
                  }}
                >
                  {t(`nav.${route.labelKey}`)}
                </Button>
              </Link>
            ))}
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <LanguageSwitcher />
          </Box>
          <Box display={{ xs: 'none', md: 'flex' }}>
            <UserDropdown />
          </Box>
          <Box display={{ md: 'none' }}>
            <Sidebar />
          </Box>
        </>
      </Toolbar>
    </AppBar>
  );
};
