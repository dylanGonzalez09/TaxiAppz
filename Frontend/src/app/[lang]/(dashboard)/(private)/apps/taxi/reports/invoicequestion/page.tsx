import React from 'react';

import type { Locale } from '@/configs/i18n';

import InvoiceQuestionTable from '@/views/apps/taxi/reports/invoicequestion/invoicequestion';
import { getDictionary } from '@/utils/getDictionary';
import { getInvoiceQuestionReport } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const QuestionReports = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);


  const driverRequests = await getInvoiceQuestionReport()


  // const driverDocument = await fetchExpiryDocument()


  return (
    <InvoiceQuestionTable
      dictionary={dictionary}
      staticGroup={driverRequests}
    />
  );
};

export default QuestionReports;
