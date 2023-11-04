import { Session, getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]/authOptions';

export async function getCurrentSession(): Promise<Session> {
  // getting session on server
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('No current user in session.');
  }
  return session;
}
