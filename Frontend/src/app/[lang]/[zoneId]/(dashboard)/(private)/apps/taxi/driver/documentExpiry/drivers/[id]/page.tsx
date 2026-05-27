import React from 'react';

import type { Locale } from '@/configs/i18n';

import DriversListTable from '@/views/apps/taxi/driver/documentExpiry/drivers/driversList';
import { getDictionary } from '@/utils/getDictionary';
import { getDriversByZone } from '@/app/api/apps/taxi/driver';


const DriversList = async ({ params }: { params: { lang: Locale, zoneId: string; } }) => {

  const dictionary = await getDictionary(params.lang);
  const zoneId = String(params.zoneId);
  const driversData = await getDriversByZone(zoneId,"", 1, 10);

  return (
    <DriversListTable
      dictionary={dictionary}
      staticGroup={driversData}
      zoneId = {zoneId}
    />
  );
};

export default DriversList;
