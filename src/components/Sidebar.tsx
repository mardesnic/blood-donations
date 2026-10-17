'use client';

import { ROUTE_PATHS } from '@/routes';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  styled,
} from '@mui/material';
import React, { useState } from 'react';
import { MdMenu } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

const DRAWER_WIDTH = 200;

const DrawerContent = styled(Box)(() => ({
  width: `${DRAWER_WIDTH}px`,
  padding: '0 12px',
}));

export const Sidebar = () => {
  const router = useRouter();
  const t = useTranslations('nav');
  const [showDrawer, setShowDrawer] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push(ROUTE_PATHS.PUBLIC.LOGIN.path);
  };

  return (
    <>
      <IconButton
        size='medium'
        color='inherit'
        aria-label={t('menu')}
        onClick={() => setShowDrawer((prev) => !prev)}
      >
        <MdMenu />
      </IconButton>
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        anchor='right'
      >
        <DrawerContent>
          <List>
            {Object.values(ROUTE_PATHS.PROTECTED).map((page, i) => (
              <ListItem key={`${i}${page.path}`} disablePadding>
                <ListItemButton
                  component={Link}
                  href={page.path}
                  onClick={() => setShowDrawer(false)}
                >
                  <ListItemText primary={t(page.labelKey)} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 2 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleSignOut}>
                <ListItemText primary={t('signOut')} />
              </ListItemButton>
            </ListItem>
          </List>
        </DrawerContent>
      </Drawer>
    </>
  );
};
