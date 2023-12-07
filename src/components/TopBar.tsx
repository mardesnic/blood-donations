import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { UserDropdown } from './UserDropdown';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';
import { APP_TITLE } from '@/lib/const';
import { Sidebar } from './Sidebar';

export const TopBar = async () => {
  return (
    <AppBar position='sticky'>
      <Toolbar>
        <Typography variant='h3' sx={{ m: 0 }} component='div'>
          <Link href={ROUTE_PATHS.PROTECTED.HOME.path}>{APP_TITLE}</Link>
        </Typography>
        <>
          <Box display={{ xs: 'none', md: 'flex' }} sx={{ flexGrow: 1, ml: 2 }}>
            {Object.values(ROUTE_PATHS.PROTECTED).map((page, i) => (
              <Button
                key={`${page.path}${i}`}
                sx={{ color: 'white' }}
                variant='text'
                size='large'
              >
                <Link href={page.path}>{page.label}</Link>
              </Button>
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
