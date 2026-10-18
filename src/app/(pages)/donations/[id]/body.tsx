'use client';

import { Card } from '@mui/material';
import { DonationCreateUpdateForm } from '../forms/createUpdate';
import { DonationWithDonor } from '@/context/DonationsContext';
interface Props {
  donation: DonationWithDonor;
}

export default function UpdateDonationBody({ donation }: Props) {
  return (
    <Card
      // Less padding on phones, so the fields get the width.
      sx={{ mt: '30px', p: { xs: '24px 16px', sm: '30px 24px' } }}
      raised={true}
    >
      <DonationCreateUpdateForm donation={donation} />
    </Card>
  );
}
