'use client';

import React from 'react';
import Link from 'next/link';
import { MdAccountCircle } from 'react-icons/md';
import {
  Divider,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
} from '@mui/material';
import { ROUTE_PATHS } from '@/routes';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/context/CurrentUserContext';

export const UserDropdown = () => {
  const router = useRouter();
  const t = useTranslations('nav');
  const { user } = useCurrentUser();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();

    await signOut({ redirect: false });
    router.push(ROUTE_PATHS.PUBLIC.LOGIN.path);
  };

  return (
    <div>
      <Stack direction='row' alignItems='center' onClick={handleMenu}>
        <IconButton size='large' color='inherit' aria-label={t('account')}>
          <MdAccountCircle />
        </IconButton>
      </Stack>
      <Menu
        id='menu-appbar'
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {user && (
          <MenuItem disabled sx={{ '&.Mui-disabled': { opacity: 1 } }}>
            <ListItemText
              primary={user.name || user.email}
              secondary={t(`roles.${user.role}`)}
            />
          </MenuItem>
        )}
        {user && <Divider />}
        <MenuItem
          component={Link}
          href={ROUTE_PATHS.ACCOUNT.PASSWORD.path}
          onClick={handleClose}
        >
          {t('changePassword')}
        </MenuItem>
        <MenuItem onClick={handleSignOut}>{t('signOut')}</MenuItem>
      </Menu>
    </div>
  );
};
