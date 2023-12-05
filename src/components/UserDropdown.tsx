'use client';

import React from 'react';
import { MdAccountCircle } from 'react-icons/md';
import { IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { ROUTE_PATHS } from '@/routes';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const UserDropdown = () => {
  const router = useRouter();
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
        <IconButton size='large' color='inherit'>
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
        <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
      </Menu>
    </div>
  );
};
