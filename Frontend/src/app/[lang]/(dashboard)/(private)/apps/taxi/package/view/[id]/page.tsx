import React from 'react';

import type { Locale } from '@/configs/i18n';

import ClientView from '@/views/apps/taxi/package/view';
import { getDictionary } from '@/utils/getDictionary';

const ClientViews = async ({ params }: { params: { lang: Locale, id: string; } }) => {
  const dictionary = await getDictionary(params.lang);

  // Static data to be passed to the DocumentExpiryTable
  const clientData = [
    { Name: 'vikram', clientCode: '1234567', Startdate: '1', Enddate: '10', status: "active" },
    { Name: 'karthi', clientCode: '098765', Startdate: '1', Enddate: '10', status: "expiry soon" },
    { Name: 'John Doe', clientCode: '345678', Startdate: '1', Enddate: '10', status: "expiry soon"  }
  ];

  return (
    <ClientView dictionary={dictionary} staticGroup={clientData} />
  );
};

export default ClientViews;
