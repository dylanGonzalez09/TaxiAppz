import React from 'react';

import type { Locale } from '@/configs/i18n';
import RentalListTable from '@/views/apps/taxi/rental/rentallist/rentallist';
import { getDictionary } from '@/utils/getDictionary';
import { getRentalList } from '@/app/api/apps/taxi/request';

const RentalList = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const rentalData = await getRentalList(zoneId);

  return (
    <RentalListTable
      dictionary={dictionary}
      staticGroup={rentalData}
    />
  );
};

export default RentalList;
