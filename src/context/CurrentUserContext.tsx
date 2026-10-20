'use client';

import React, { createContext, useContext } from 'react';
import { Role } from '@/generated/prisma/browser';
import { isAdmin } from '@/lib/users';

export interface CurrentUserInfo {
  id: string;
  email: string;
  name: string;
  role: Role;
}

const CurrentUserContext = createContext<CurrentUserInfo | null>(null);

// The signed-in user, loaded by the pages layout, for showing their name
// and hiding what their role can't do (the API checks again).
export const CurrentUserProvider = ({
  user,
  children,
}: {
  user: CurrentUserInfo;
  children: React.ReactNode;
}) => (
  <CurrentUserContext.Provider value={user}>
    {children}
  </CurrentUserContext.Provider>
);

export const useCurrentUser = () => {
  const user = useContext(CurrentUserContext);
  return { user, isAdmin: isAdmin(user) };
};
