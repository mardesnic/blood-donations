'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { MdDelete } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { contactSummary } from '@/lib/callList';
import {
  CALL_LIST_KEY,
  contactHistoryKey,
  useContactHistory,
  useDeleteContact,
  useLogContact,
} from '@/hooks/useContacts';
import { useAlertContext } from '@/context/AlertContext';
import { useCurrentUser } from '@/context/CurrentUserContext';
import { ContactDialog } from '@/components/ContactDialog';
import { InfoSection } from '@/components/InfoSection';

interface Props {
  donorId: string;
  donorName: string;
  hasPhone: boolean;
}

// The donor's latest contacts, to log a new one or remove a mistake.
export const ContactLog = ({ donorId, donorName, hasPhone }: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertContext();
  const { user, isAdmin } = useCurrentUser();
  const { data: contacts, isLoading } = useContactHistory(donorId);
  const logContact = useLogContact();
  const deleteContact = useDeleteContact();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // "Last contacted" on this page is rendered on the server.
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: contactHistoryKey(donorId) });
    queryClient.invalidateQueries({ queryKey: [CALL_LIST_KEY] });
    router.refresh();
  };

  return (
    <InfoSection title={t('contacts.history')}>
      {isLoading && <CircularProgress size={24} />}
      {contacts && !contacts.length && t('contacts.none')}
      {!!contacts?.length && (
        <List disablePadding dense>
          {contacts.map((contact) => (
            <ListItem
              key={contact.id}
              disableGutters
              // Volunteers remove only contacts they logged; admins any.
              secondaryAction={
                (isAdmin || contact.createdById === user?.id) && (
                  <Tooltip title={t('contacts.delete')}>
                    <IconButton
                      edge='end'
                      aria-label={t('contacts.delete')}
                      disabled={deleteContact.isPending}
                      onClick={() =>
                        deleteContact.mutate(contact.id, {
                          onSuccess: () => {
                            refresh();
                            showAlert(t('contacts.deleted'), 'success');
                          },
                          onError: () =>
                            showAlert(t('contacts.deleteError'), 'error'),
                        })
                      }
                    >
                      <MdDelete />
                    </IconButton>
                  </Tooltip>
                )
              }
            >
              <ListItemText
                primary={contactSummary(contact, t)}
                secondary={contact.note}
                slotProps={{
                  secondary: { sx: { whiteSpace: 'pre-line' } },
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
      <Button
        color='secondary'
        onClick={() => setDialogOpen(true)}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('contacts.log')}
      </Button>
      {dialogOpen && (
        <ContactDialog
          open
          donorName={donorName}
          defaultType={hasPhone ? 'CALL' : 'EMAIL'}
          saving={logContact.isPending}
          onClose={() => setDialogOpen(false)}
          onSave={(type, note) =>
            logContact.mutate(
              { donorId, type, note },
              {
                onSuccess: () => {
                  setDialogOpen(false);
                  refresh();
                  showAlert(t('contacts.saved'), 'success');
                },
                onError: () => showAlert(t('contacts.saveError'), 'error'),
              }
            )
          }
        />
      )}
    </InfoSection>
  );
};
