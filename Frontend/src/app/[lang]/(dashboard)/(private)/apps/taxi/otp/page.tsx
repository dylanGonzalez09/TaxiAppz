import React from 'react';

import type { Locale } from '@/configs/i18n';

import OtpsTable from '@/views/apps/taxi/otp';
import { getDictionary } from '@/utils/getDictionary';
import { getOtpTable } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const OtpTable = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);


  const otpTable = await getOtpTable("", 1,10);

  // const driverDocument = await fetchExpiryDocument()


  return (
    <OtpsTable
      dictionary={dictionary}
      staticGroup={otpTable}
    />
  );
};

export default OtpTable;
