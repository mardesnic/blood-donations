import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

// Shown inside the page layout (the top bar stays) while the next page is
// rendered on the server.
export default function Loading() {
  const t = useTranslations('common');
  return (
    <Box
      role='status'
      aria-live='polite'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 12,
        color: 'text.secondary',
      }}
    >
      <CircularProgress />
      <Typography>{t('loading')}</Typography>
    </Box>
  );
}
