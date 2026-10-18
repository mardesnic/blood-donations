'use client';

import { Button } from '@mui/material';
import { MdPrint } from 'react-icons/md';
import { useTranslations } from 'next-intl';

// Opens the browser's print dialog ("Save as PDF" makes a PDF report).
export const PrintButton = () => {
  const t = useTranslations('reports');
  return (
    <Button
      variant='outlined'
      color='inherit'
      size='medium'
      startIcon={<MdPrint />}
      onClick={() => window.print()}
      className='no-print'
    >
      {t('print')}
    </Button>
  );
};
