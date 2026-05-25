import React from 'react';

import type { Locale } from '@/configs/i18n';

import InvoiceQuestionTable from '@/views/apps/taxi/reports/invoicequestion/invoicequestion';
import { getDictionary } from '@/utils/getDictionary';
import { getQuestionsDetails } from '@/app/api/apps/taxi/invoice';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const QuestionReports = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const id = String(params.id);
  const dictionary = await getDictionary(params.lang);

  const driverRequests = await getQuestionsDetails(id);

  // Static data to be passed to the DocumentExpiryTable

//   const driverRequests = [
//     {
//         driver: "John Doe\n+1234567890",
//         requestId: "TAXI_000001",
//         answer: "accepted"
//     },
//     {
//         driver: "Jane Smith\n+0987654321",
//         requestId: "TAXI_000002",
//         answer: "declined"
//     },
//     {
//         driver: "Alice Johnson\n+1122334455",
//         requestId: "TAXI_000003",
//         answer: "accepted"
//     },
//     {
//         driver: "Bob Brown\n+2233445566",
//         requestId: "TAXI_000004",
//         answer: "declined"
//     },
//     {
//         driver: "Charlie Davis\n+3344556677",
//         requestId: "TAXI_000005",
//         answer: "accepted"
//     },
//     {
//         driver: "Emily White\n+4455667788",
//         requestId: "TAXI_000006",
//         answer: "declined"
//     }
// ];

  return (
    <InvoiceQuestionTable
      dictionary={dictionary}
      staticGroup={driverRequests}
    />
  );
};

export default QuestionReports;
