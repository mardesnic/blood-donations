'use client';

import { Card } from '@mui/material';
import { DonationCreateUpdateForm } from '../forms/createUpdate';

export default function CreateDonationBody() {
  return (
    <Card
      // Less padding on phones, so the fields get the width.
      sx={{ mt: '30px', p: { xs: '24px 16px', sm: '30px 24px' } }}
      raised={true}
    >
      <DonationCreateUpdateForm />
    </Card>
  );
}
