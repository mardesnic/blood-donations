'use client';

import { Card } from '@mui/material';
import { DonorCreateUpdateForm } from '../forms/createUpdate';
import { Donor } from '@prisma/client';

interface Props {
  donor: Donor;
}
export default function UpdateDonorBody({ donor }: Props) {
  return (
    <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
      <DonorCreateUpdateForm donor={donor} />
    </Card>
  );
}
