import React from 'react';

import type { Locale } from '@/configs/i18n';
import QuestionReportsTable from '@/views/apps/taxi/reports/questionreports/questionreports';
import { getDictionary } from '@/utils/getDictionary';
import { getQuestionsReport } from '@/app/api/apps/taxi/invoice';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const QuestionReports = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);

  // Static data to be passed to the DocumentExpiryTable

  const questions = await getQuestionsReport()


  // const driverDocument = await fetchExpiryDocument()


  return (
    <QuestionReportsTable
      dictionary={dictionary}
      staticGroup={questions}
    />
  );
};

export default QuestionReports;
