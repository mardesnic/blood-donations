'use client';

import React, { createContext, useContext, useState } from 'react';
import { AlertColor } from '@mui/material';

interface AlertContextI {
  text: string;
  type: AlertColor | null;
  open: boolean;
  showAlert: (text: string, type: AlertColor | null) => void;
  hideAlert: () => void;
}

const AlertContext = createContext({} as AlertContextI);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState<AlertColor | null>(null);

  const showAlert = (text: string, type: AlertColor | null) => {
    setText(text);
    setType(type);
    setOpen(true);
  };

  const hideAlert = () => setOpen(false);

  const values: AlertContextI = {
    text,
    type,
    open,
    showAlert,
    hideAlert,
  };

  return (
    <AlertContext.Provider value={values}>{children}</AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlertContext must be used within a AlertProvider');
  }
  return context;
};
