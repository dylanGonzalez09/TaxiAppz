import React from 'react';

import type { Locale } from '@/configs/i18n';

import EmailTable from '@/views/apps/taxi/promotion/email';
import { getDictionary } from '@/utils/getDictionary';
import { fetchEmailNotifications } from '@/app/api/apps/taxi/notification';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const Email = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {

  const dictionary = await getDictionary(params.lang);

  // Static data to be passed to the DocumentExpiryTable

//  const { zoneId } = params;
  const emailData = await fetchEmailNotifications();

  // const driverDocument = await fetchExpiryDocument()


  return (
    <EmailTable
      dictionary={dictionary}
      staticGroup={emailData}
    />
  );
};

export default Email;
