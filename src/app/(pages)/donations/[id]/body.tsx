'use client';

import { Card } from '@mui/material';
import { DonationCreateUpdateForm } from '../forms/createUpdate';

export default function UpdateDonationBody() {
  return (
    <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
      <DonationCreateUpdateForm />
    </Card>
  );
}
