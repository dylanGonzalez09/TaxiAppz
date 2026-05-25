import React from 'react';

import type { Locale } from '@/configs/i18n';

import DriverReportsTable from '@/views/apps/taxi/reports/driverreports/driverreports';
import { getDictionary } from '@/utils/getDictionary';
import { getDriverReport } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const DriverReports = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);
  const requests = await getDriverReport();
  
  // Static data to be passed to the DocumentExpiryTable



  return (
    <DriverReportsTable
      dictionary={dictionary}
      staticGroup={requests}
    />
  );
};

export default DriverReports;
