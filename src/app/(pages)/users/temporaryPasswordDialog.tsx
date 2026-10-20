'use client';

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { MdContentCopy } from 'react-icons/md';
import { useTranslations } from 'next-intl';

interface Props {
  name: string;
  email: string;
  password: string;
  onClose: () => void;
}

// Shown once after adding a user or resetting a password: the admin passes
// the temporary password on (in person or by phone), and the user replaces
// it after signing in. It isn't stored anywhere it could be shown again.
export const TemporaryPasswordDialog = ({
  name,
  email,
  password,
  onClose,
}: Props) => {
  const t = useTranslations('users');
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the password is on screen to copy by hand.
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle>{t('temporaryTitle', { name })}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('temporaryText', { email })}</DialogContentText>
        <Box
          sx={{
            my: 2,
            p: 2,
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: 24,
            letterSpacing: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            userSelect: 'all',
            wordBreak: 'break-all',
          }}
        >
          {password}
        </Box>
        <DialogContentText variant='body2'>
          {t('temporaryOnce')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant='outlined'
          color='inherit'
          startIcon={<MdContentCopy />}
          onClick={copy}
        >
          {copied ? t('copied') : t('copy')}
        </Button>
        <Button color='secondary' onClick={onClose}>
          {t('done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
