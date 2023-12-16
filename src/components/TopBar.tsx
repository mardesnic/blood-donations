'use client';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { UserDropdown } from './UserDropdown';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';
import { APP_TITLE } from '@/lib/const';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';

export const TopBar = async () => {
  const pathname = usePathname();

  return (
    <AppBar position='sticky'>
      <Toolbar>
        <Typography variant='h3' sx={{ m: 0 }} component='div'>
          <Link href={ROUTE_PATHS.PROTECTED.HOME.path}>{APP_TITLE}</Link>
        </Typography>
        <>
          <Box display={{ xs: 'none', md: 'flex' }} sx={{ flexGrow: 1, ml: 2 }}>
            {Object.values(ROUTE_PATHS.PROTECTED).map((page) => (
              <Link href={page.path} key={`${page.path}`}>
                <Button
                  variant='text'
                  size='large'
                  className={pathname == page.path ? 'active' : ''}
                  sx={{
                    color: 'white',
                    '&.active': {
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {page.label}
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
