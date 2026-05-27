import React from 'react';

import type { Locale } from '@/configs/i18n';

import CompletedLocalTripTable from '@/views/apps/taxi/reports/completedlocaltrip/completedlocaltrip';
import { getDictionary } from '@/utils/getDictionary';
import { getCompletedLocalTrip } from '@/app/api/apps/taxi/request';

const CompletedLocalTrip = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const requests = await getCompletedLocalTrip(zoneId);

  return (
    <CompletedLocalTripTable
      dictionary={dictionary}
      staticGroup={requests}
      zoneId={zoneId}
    />
  );
};

export default CompletedLocalTrip;
