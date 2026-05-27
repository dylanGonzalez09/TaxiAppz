import React from 'react';

import type { Locale } from '@/configs/i18n';

import DriverSummaryTable from '@/views/apps/taxi/reports/driversummary/driversummary';
import { getDictionary } from '@/utils/getDictionary';
import { getDriverSummary } from '@/app/api/apps/taxi/request';

const DriverSummary = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const requests = await getDriverSummary(zoneId);

  return (
    <DriverSummaryTable
      dictionary={dictionary}
      staticGroup={requests}
      zoneId={zoneId}
    />
  );
};

export default DriverSummary;
