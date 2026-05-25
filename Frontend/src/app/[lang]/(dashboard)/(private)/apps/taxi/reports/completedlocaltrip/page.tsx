import React from 'react';

import type { Locale } from '@/configs/i18n';

import CompletedLocalTripTable from '@/views/apps/taxi/reports/completedlocaltrip/completedlocaltrip';
import { getDictionary } from '@/utils/getDictionary';
import { getCompletedLocalTrip } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const CompletedLocalTrip = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);


  const requests = await getCompletedLocalTrip();

  return (
    <CompletedLocalTripTable
      dictionary={dictionary}
      staticGroup={requests}
    />
  );
};

export default CompletedLocalTrip;
