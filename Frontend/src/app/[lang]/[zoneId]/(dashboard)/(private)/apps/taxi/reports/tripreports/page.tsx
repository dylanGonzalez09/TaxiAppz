import React from 'react';

import type { Locale } from '@/configs/i18n';

import TripReportsTable from '@/views/apps/taxi/reports/tripreports/tripreports';
import { getDictionary } from '@/utils/getDictionary';
import { getTripByReports } from '@/app/api/apps/taxi/request';

const DriverReports = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const tripData = await getTripByReports(zoneId);

  return (
    <TripReportsTable
      dictionary={dictionary}
      data={tripData}
    />
  );
};

export default DriverReports;
