import Link from 'next/link';
import { getCurrentSession } from './api/auth/service';
import { ROUTE_PATHS } from '@/routes';
import { Container } from '@/components/layout/Container';
import { Heading } from '@/components/typography/Heading';
import { Text } from '@/components/typography/Text';
import { Button } from '@/components/form/Button';
import { Stack } from '@/components/layout/Stack';

export default async function Home() {
  const session = await getCurrentSession();
  return (
    <Container>
      <Stack>
        <Heading>Welcome</Heading>
        <Text>{session.user?.email} </Text>
        <Link href={ROUTE_PATHS.PUBLIC.LOGOUT}>
          <Button color='danger'>Sign Out</Button>
        </Link>
      </Stack>
    </Container>
  );
}
