import React from 'react';

import type { Locale } from '@/configs/i18n';

import DriverSummaryTable from '@/views/apps/taxi/reports/driversummary/driversummary';
import { getDictionary } from '@/utils/getDictionary';
import { getDriverSummary } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const DriverSummary = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);
const requests = await getDriverSummary();



  return (
    <DriverSummaryTable
      dictionary={dictionary}
      staticGroup={requests}
    />
  );
};

export default DriverSummary;
