import React from 'react';

import type { Locale } from '@/configs/i18n';

import InvoiceQuestionTable from '@/views/apps/taxi/reports/invoicequestion/invoicequestion';
import { getDictionary } from '@/utils/getDictionary';
import { getInvoiceQuestionReport } from '@/app/api/apps/taxi/request';

const QuestionReports = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const driverRequests = await getInvoiceQuestionReport(zoneId);

  return (
    <InvoiceQuestionTable
      dictionary={dictionary}
      staticGroup={driverRequests}
    />
  );
};

export default QuestionReports;
