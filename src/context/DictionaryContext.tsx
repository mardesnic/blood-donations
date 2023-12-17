'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDictionary, Dictionary } from '@/dictionaries';
import { DEFAULT_LANGUAGE } from '@/lib/const';

interface DictionaryContextI {
  dictionary: Dictionary | null;
  setDictionary: React.Dispatch<React.SetStateAction<Dictionary | null>>;
}

const DictionaryContext = createContext<DictionaryContextI | undefined>(
  undefined
);

export const DictionaryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getDictionary(DEFAULT_LANGUAGE);
        setDictionary(result);
      } catch (error) {
        console.error('Error loading dictionary:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <DictionaryContext.Provider value={{ dictionary, setDictionary }}>
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};
