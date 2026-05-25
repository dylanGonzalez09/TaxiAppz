import React from 'react';

import type { Locale } from '@/configs/i18n';

import RentalZoneListTable from '@/views/apps/taxi/rentalmaster/rentalzonelist/rentalzonelist';
import { getDictionary } from '@/utils/getDictionary';
import { getRentalZones } from '@/app/api/apps/taxi/rental';


const RentalZoneList = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);
  const zoneData = await getRentalZones();

  return (
    <RentalZoneListTable
      dictionary={dictionary}
      staticGroup={zoneData}
    />
  );
};

export default RentalZoneList;
