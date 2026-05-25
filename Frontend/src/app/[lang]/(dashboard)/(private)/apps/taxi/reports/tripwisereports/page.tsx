import React from 'react';

import type { Locale } from '@/configs/i18n';

import TripWiseReportsTable from '@/views/apps/taxi/reports/tripwisereports/tripwisereports';
import { getDictionary } from '@/utils/getDictionary';
import { getTripWiseReports } from '@/app/api/apps/taxi/request';


const DriverReports = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);


  const tripData = await getTripWiseReports()



  return (
    <TripWiseReportsTable
      dictionary={dictionary}
      staticGroup={tripData}
    />
  );
};

export default DriverReports;
