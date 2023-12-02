import { usePlacesContext } from '@/context/PlacesContext';
import { Box, Button, Stack, TextField } from '@mui/material';
import { Place } from '@prisma/client';
import React from 'react';
import { MdAdd } from 'react-icons/md';

export const PlaceCreateForm = () => {
  const { closeDialog, createPlace, isLoading } = usePlacesContext();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await createPlace({
      title: data.get('title'),
    } as Place);
    closeDialog();
  };

  return (
    <Box component='form' onSubmit={onSubmit} noValidate>
      <TextField label='Title' name='title' />
      <Stack direction='row' justifyContent='flex-end'>
        <Button type='submit' startIcon={<MdAdd />} disabled={isLoading}>
          Create
        </Button>
      </Stack>
    </Box>
  );
};
