import React from 'react';

import type { Locale } from '@/configs/i18n';

import PushNotificationTable from '@/views/apps/taxi/notification/pushnotification';
import { getDictionary } from '@/utils/getDictionary';
import { fetchNotifications } from '@/app/api/apps/taxi/notification';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const PushNotification = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const data = await fetchNotifications();

  const dictionary = await getDictionary(params.lang);


  // const driverDocument = await fetchExpiryDocument()


  return (
    <PushNotificationTable
      dictionary={dictionary}
      staticGroup={data}
    />
  );
};

export default PushNotification;
