/* eslint-disable @typescript-eslint/ban-types */
import React from 'react';

import type { Locale } from '@/configs/i18n';

import DriverWalletTable from '@/views/apps/taxi/reports/driverwallet/driverwallet';
import { getDictionary } from '@/utils/getDictionary';
import { getDriverWallet } from '@/app/api/apps/taxi/driver';

interface DriverWallet{
  driverName: string;
  phoneNumber: string;
  walletBalance: Number;
}

const DriverWallet = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);


  const drivers = await getDriverWallet();

  return (
    <DriverWalletTable
      dictionary={dictionary}
      staticGroup={drivers}
    />
  );
};

export default DriverWallet;
