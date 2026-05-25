import React from 'react';

import type { Locale } from '@/configs/i18n';

import CompletedRentalTripTable from '@/views/apps/taxi/reports/completedrentaltrip/completedrentaltrip';
import { getDictionary } from '@/utils/getDictionary';
import { getCompletedRentalTrips } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const CompletedRentalTrip = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);

  // Static data to be passed to the DocumentExpiryTable

  const requests = await getCompletedRentalTrips()


  return (
    <CompletedRentalTripTable
      dictionary={dictionary}
      staticGroup={requests}
    />
  );
};

export default CompletedRentalTrip;
