'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { getDonorsListUrl } from '@/lib/donorsListUrl';

// Back arrow to the given page, or to the donors list as the user last left
// it (filters, sort, page).
export const DonorBackLink = ({ href }: { href?: string }) => {
  const t = useTranslations('common');
  const [listUrl, setListUrl] = useState('/donors');
  useEffect(() => {
    // Read after hydration: session storage only exists in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setListUrl(getDonorsListUrl());
  }, []);
  return (
    <Link href={href || listUrl} aria-label={t('back')}>
      <MdArrowBack size={24} />
    </Link>
  );
};
