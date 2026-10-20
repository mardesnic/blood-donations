'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { MdAdd, MdEdit, MdLockReset } from 'react-icons/md';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Role } from '@/generated/prisma/browser';
import { formatAppDateTime } from '@/lib/dates';
import { useAlertContext } from '@/context/AlertContext';
import { useCurrentUser } from '@/context/CurrentUserContext';
import { UserDialog, UserFormValues } from './userDialog';
import { TemporaryPasswordDialog } from './temporaryPasswordDialog';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const USERS_KEY = ['USERS'];

async function send(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // The server's code (e.g. DUPLICATE_EMAIL) when it sends one.
    throw new Error(data?.code || 'REQUEST_FAILED');
  }
  return data;
}

// The users list with adding, editing and password resets.
export const UsersList = () => {
  const t = useTranslations();
  const { user: me } = useCurrentUser();
  const { showAlert } = useAlertContext();
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => (await send('/api/users', 'GET')).users as UserRow[],
  });
  // null: closed; 'new': adding; a user: editing them.
  const [editing, setEditing] = React.useState<UserRow | 'new' | null>(null);
  // Resetting stops the old password working, so it is confirmed first.
  const [confirmReset, setConfirmReset] = React.useState<UserRow | null>(null);
  const [temporary, setTemporary] = React.useState<{
    user: { name: string; email: string };
    password: string;
  } | null>(null);

  const errorText = (error: Error) =>
    t.has(`users.errors.${error.message}`)
      ? t(`users.errors.${error.message}`)
      : t('users.errors.REQUEST_FAILED');

  const save = useMutation({
    mutationFn: (values: UserFormValues) =>
      editing === 'new'
        ? send('/api/users', 'POST', values)
        : send(`/api/users/${(editing as UserRow).id}`, 'PUT', values),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      if (editing === 'new') {
        setTemporary({ user: result.user, password: result.temporaryPassword });
      } else {
        showAlert(t('users.saved'), 'success');
      }
      setEditing(null);
    },
    onError: (error: Error) => showAlert(errorText(error), 'error'),
  });

  const reset = useMutation({
    mutationFn: (user: UserRow) =>
      send(`/api/users/${user.id}/reset-password`, 'POST'),
    onSuccess: (result, user) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      setConfirmReset(null);
      setTemporary({ user, password: result.temporaryPassword });
    },
    onError: (error: Error) => showAlert(errorText(error), 'error'),
  });

  return (
    <>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        flexWrap='wrap'
        gap={2}
        mb={1}
      >
        <Typography variant='h1' sx={{ mb: 0 }}>
          {t('users.title')}
        </Typography>
        <Button
          color='secondary'
          size='medium'
          startIcon={<MdAdd />}
          onClick={() => setEditing('new')}
        >
          {t('users.add')}
        </Button>
      </Stack>
      <Typography color='text.secondary' sx={{ mb: 3 }}>
        {t('users.intro')}
      </Typography>

      {isLoading && <CircularProgress />}
      {isError && (
        <Typography color='error.main'>{t('users.errors.LOAD')}</Typography>
      )}

      {data && (
        <Card elevation={2}>
          {data.map((user, index) => (
            <React.Fragment key={user.id}>
              {index > 0 && <Divider />}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent='space-between'
                alignItems={{ xs: 'stretch', sm: 'center' }}
                gap={1.5}
                sx={{ p: 2, opacity: user.active ? 1 : 0.6 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction='row'
                    alignItems='center'
                    flexWrap='wrap'
                    gap={1}
                  >
                    <Typography variant='h3' component='span'>
                      {user.name || user.email}
                    </Typography>
                    <Chip
                      size='small'
                      color={user.role === 'ADMIN' ? 'secondary' : 'default'}
                      label={t(`nav.roles.${user.role}`)}
                    />
                    {!user.active && (
                      <Chip
                        size='small'
                        variant='outlined'
                        label={t('users.inactive')}
                      />
                    )}
                    {user.id === me?.id && (
                      <Chip
                        size='small'
                        variant='outlined'
                        label={t('users.you')}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {user.email}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {user.mustChangePassword
                      ? t('users.temporaryPasswordSet')
                      : user.lastLoginAt
                        ? t('users.lastLogin', {
                            date: formatAppDateTime(user.lastLoginAt),
                          })
                        : t('users.neverSignedIn')}
                  </Typography>
                </Box>
                <Stack direction='row' gap={1} sx={{ flexShrink: 0 }}>
                  <Button
                    variant='outlined'
                    color='inherit'
                    startIcon={<MdEdit />}
                    onClick={() => setEditing(user)}
                  >
                    {t('common.edit')}
                  </Button>
                  {user.id !== me?.id && (
                    <Button
                      variant='outlined'
                      color='inherit'
                      startIcon={<MdLockReset />}
                      onClick={() => setConfirmReset(user)}
                    >
                      {t('users.resetPassword')}
                    </Button>
                  )}
                </Stack>
              </Stack>
            </React.Fragment>
          ))}
        </Card>
      )}

      {editing && (
        <UserDialog
          user={editing === 'new' ? null : editing}
          isSelf={editing !== 'new' && editing.id === me?.id}
          saving={save.isPending}
          onClose={() => setEditing(null)}
          onSave={(values) => save.mutate(values)}
        />
      )}
      {confirmReset && (
        <Dialog open onClose={() => setConfirmReset(null)}>
          <DialogTitle>{t('users.resetTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('users.resetText', {
                name: confirmReset.name || confirmReset.email,
              })}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => setConfirmReset(null)}
              disabled={reset.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              color='secondary'
              onClick={() => reset.mutate(confirmReset)}
              disabled={reset.isPending}
            >
              {t('users.resetConfirm')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {temporary && (
        <TemporaryPasswordDialog
          name={temporary.user.name || temporary.user.email}
          email={temporary.user.email}
          password={temporary.password}
          onClose={() => setTemporary(null)}
        />
      )}
    </>
  );
};
