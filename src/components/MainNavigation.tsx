import { getCurrentSession } from '@/app/api/auth/service';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import React from 'react';
import { UserDropdown } from './UserDropdown';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';
import { APP_TITLE } from '@/lib/const';

export const MainNavigation = async () => {
  const session = await getCurrentSession();

  return (
    <AppBar position='sticky'>
      <Toolbar>
        <Typography variant='h6' component='div'>
          <Link href={ROUTE_PATHS.PROTECTED.HOME.path}>{APP_TITLE}</Link>
        </Typography>
        {!!session && (
          <>
            <Box
              display={{ xs: 'none', md: 'flex' }}
              sx={{ flexGrow: 1, ml: 2 }}
            >
              {Object.values(ROUTE_PATHS.PROTECTED).map((page) => (
                <Button
                  key={page.path}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                  variant='text'
                >
                  <Link href={page.path}>{page.label}</Link>
                </Button>
              ))}
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <UserDropdown />
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};
