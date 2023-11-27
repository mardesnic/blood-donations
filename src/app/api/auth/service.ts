import { Session, getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]/authOptions';

export async function getCurrentSession(): Promise<Session | null> {
  // getting session on server
  return getServerSession(authOptions);
}
