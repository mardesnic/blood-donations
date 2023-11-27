'use client';

import React from 'react';
import { MdAccountCircle } from 'react-icons/md';
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export const UserDropdown = () => {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Stack direction='row' alignItems='center' onClick={handleMenu}>
        <Typography
          display={{ xs: 'none', sm: 'inline' }}
          sx={{ cursor: 'pointer' }}
        >
          {session?.user?.email}
        </Typography>
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
        <MenuItem onClick={handleClose}>
          <Link href={ROUTE_PATHS.PUBLIC.LOGOUT.path}>Sign Out</Link>
        </MenuItem>
      </Menu>
    </div>
  );
};
