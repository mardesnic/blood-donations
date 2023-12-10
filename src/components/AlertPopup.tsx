'use client';

import { Alert, Snackbar } from '@mui/material';
import { useAlertContext } from '@/context/AlertContext';

export const AlertPopup = () => {
  const { text, type, open, hideAlert } = useAlertContext();

  if (!text || !type) {
    return null;
  }
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={hideAlert}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert severity={type}>{text}</Alert>
    </Snackbar>
  );
};
