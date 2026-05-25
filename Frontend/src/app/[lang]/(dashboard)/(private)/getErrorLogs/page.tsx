import React from 'react';

import type { Locale } from '@/configs/i18n';

import ErrorLogTable from '@/views/ErrorLogs';
import { getDictionary } from '@/utils/getDictionary';
import { getErrorLogs } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const ErrorLogs = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);


  const getErrorLog = await getErrorLogs("", 1,10);


  // const driverDocument = await fetchExpiryDocument()


  return (
    <ErrorLogTable
      dictionary={dictionary}
      staticGroup={getErrorLog}
    />
  );
};

export default ErrorLogs;
