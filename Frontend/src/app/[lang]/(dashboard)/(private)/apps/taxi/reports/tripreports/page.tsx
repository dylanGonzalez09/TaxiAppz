import React from 'react';

import type { Locale } from '@/configs/i18n';

import TripReportsTable from '@/views/apps/taxi/reports/tripreports/tripreports';
import { getDictionary } from '@/utils/getDictionary';
import { getTripByReports } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const DriverReports = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);

  // Static data to be passed to the DocumentExpiryTable

  const tripData = await getTripByReports()



  return (
    <TripReportsTable
      dictionary={dictionary}
      data={tripData}
    />
  );
};

export default DriverReports;
