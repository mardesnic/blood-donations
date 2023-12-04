export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/((?!login).*)', // This regex matches all routes except '/login'
  ],
};
