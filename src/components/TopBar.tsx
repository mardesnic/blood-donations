'use client';

import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import React from 'react';
import { UserDropdown } from './UserDropdown';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';
import { APP_TITLE } from '@/lib/const';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

export const TopBar = () => {
  const pathname = usePathname();
  const page = pathname.split('/')?.[1] || 'home';

  return (
    <AppBar position='sticky'>
      <Toolbar>
        <WaterDropIcon />

        <Typography
          variant='h3'
          sx={{ mx: '16px', textTransform: 'uppercase' }}
          component='div'
        >
          <Link href={ROUTE_PATHS.PROTECTED.DONORS.path}>{APP_TITLE}</Link>
        </Typography>
        <>
          <Box display={{ xs: 'none', md: 'flex' }} sx={{ flexGrow: 1, ml: 2 }}>
            {Object.values(ROUTE_PATHS.PROTECTED).map((route) => (
              <Link href={route.path} key={`${route.path}`}>
                <Button
                  variant='text'
                  size='medium'
                  className={
                    route.label.toLowerCase().includes(page) ? 'active' : ''
                  }
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
                  {route.label}
                </Button>
              </Link>
            ))}
          </Box>
          <Box sx={{ ml: 'auto' }} display={{ xs: 'none', md: 'flex' }}>
            <UserDropdown />
          </Box>
          <Box sx={{ ml: 'auto' }} display={{ md: 'none' }}>
            <Sidebar />
          </Box>
        </>
      </Toolbar>
    </AppBar>
  );
};
