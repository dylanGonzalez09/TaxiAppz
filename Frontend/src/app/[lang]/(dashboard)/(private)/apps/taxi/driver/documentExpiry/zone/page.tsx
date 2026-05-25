import React from 'react';

import type { Locale } from '@/configs/i18n';

import DriverZoneListTable from '@/views/apps/taxi/driver/documentExpiry/zone/driverZoneList';
import { getDictionary } from '@/utils/getDictionary';
import { getZones } from '@/app/api/apps/taxi/driver';


const DriverZoneList = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);
  const zoneData = await getZones();

  return (
    <DriverZoneListTable
      dictionary={dictionary}
      staticGroup={zoneData}
    />
  );
};

export default DriverZoneList;
