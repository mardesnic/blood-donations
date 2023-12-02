import { usePlacesContext } from '@/context/PlacesContext';
import { Box, Button, Stack, TextField } from '@mui/material';
import { Place } from '@prisma/client';
import React from 'react';
import { MdEdit } from 'react-icons/md';

interface Props {
  place: Place;
}

export const PlaceUpdateForm = ({ place }: Props) => {
  const { closeDialog, updatePlace, isLoading } = usePlacesContext();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await updatePlace({
      id: data.get('id'),
      title: data.get('title'),
    } as Place);
    closeDialog();
  };

  return (
    <Box component='form' onSubmit={onSubmit} noValidate>
      <input type='hidden' name='id' value={place.id} />
      <TextField label='Title' name='title' defaultValue={place?.title} />
      <Stack direction='row' justifyContent='flex-end' gap={2}>
        <Button onClick={closeDialog} variant='outlined' disabled={isLoading}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading} startIcon={<MdEdit />}>
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
};
