'use client';

import { Card } from '@mui/material';
import { DonationCreateUpdateForm } from '../forms/createUpdate';
import { DonationWithDonor } from '@/context/DonationsContext';
interface Props {
  donation: DonationWithDonor;
}

export default function UpdateDonationBody({ donation }: Props) {
  return (
    <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
      <DonationCreateUpdateForm donation={donation} />
    </Card>
  );
}
