import React from 'react';

import type { Locale } from '@/configs/i18n';

import CompletedRentalTripTable from '@/views/apps/taxi/reports/completedrentaltrip/completedrentaltrip';
import { getDictionary } from '@/utils/getDictionary';
import { getCompletedRentalTrips } from '@/app/api/apps/taxi/request';

const CompletedRentalTrip = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const requests = await getCompletedRentalTrips(zoneId);

  return (
    <CompletedRentalTripTable
      dictionary={dictionary}
      staticGroup={requests}
      zoneId={zoneId}
    />
  );
};

export default CompletedRentalTrip;
