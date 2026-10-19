'use client';

import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { CONTACT_TYPES, ContactType } from '@/lib/callList';

interface Props {
  open: boolean;
  donorName: string;
  // Preselected: a phone call when the donor has a phone, else an e-mail.
  defaultType: ContactType;
  saving: boolean;
  onClose: () => void;
  onSave: (type: ContactType, note: string) => void;
}

// How a donor was contacted, with an optional note ("coming on Friday").
export const ContactDialog = ({
  open,
  donorName,
  defaultType,
  saving,
  onClose,
  onSave,
}: Props) => {
  const t = useTranslations();
  const [type, setType] = React.useState<ContactType>(defaultType);
  const [note, setNote] = React.useState('');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle>{t('contacts.logTitle', { name: donorName })}</DialogTitle>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(type, note.trim());
          }}
        >
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            {t('contacts.type')}
          </Typography>
          <ToggleButtonGroup
            value={type}
            exclusive
            fullWidth
            color='secondary'
            onChange={(_, value) => value && setType(value)}
            aria-label={t('contacts.type')}
          >
            {CONTACT_TYPES.map((contactType) => (
              <ToggleButton key={contactType} value={contactType}>
                {t(`contacts.types.${contactType}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <TextField
            label={t('contacts.note')}
            placeholder={t('contacts.notePlaceholder')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            justifyContent='flex-end'
            gap={2}
            mt={2}
          >
            <Button
              variant='outlined'
              color='secondary'
              onClick={onClose}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button type='submit' color='secondary' disabled={saving}>
              {t('contacts.save')}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};
