import React from 'react';

import type { Locale } from '@/configs/i18n';
import QuestionReportsTable from '@/views/apps/taxi/reports/questionreports/questionreports';
import { getDictionary } from '@/utils/getDictionary';
import { getQuestionsReport } from '@/app/api/apps/taxi/invoice';

const QuestionReports = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const questions = await getQuestionsReport(zoneId);

  return (
    <QuestionReportsTable
      dictionary={dictionary}
      staticGroup={questions}
      zoneId={zoneId}
    />
  );
};

export default QuestionReports;
