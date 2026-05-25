import React from 'react';

import type { Locale } from '@/configs/i18n';

import RentalListTable from '@/views/apps/taxi/rental/rentallist/rentallist';
import { getDictionary } from '@/utils/getDictionary';
import { getRentalList } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const RentalList = async ({ params }: { params: { lang: Locale, id: string; } }) => {

  const dictionary = await getDictionary(params.lang);
  const rentalData = await getRentalList();
  
  // Static data to be passed to the DocumentExpiryTable

//   const rentalData = [
//     {
//         requestId: 'REQ001',
//         driverName: 'John Doe',
//         userName: 'Alice Johnson',
//         date: '2024-10-10T00:00:00',
//         tripFrom: '123 Main St',
//         tripTo: '456 Elm St',
//         status: 'Completed',
//     },
//     {
//         requestId: 'REQ002',
//         driverName: 'Jane Smith',
//         userName: 'Bob Williams',
//         date: '2024-10-11T00:00:00',
//         tripFrom: '789 Pine St',
//         tripTo: '321 Oak St',
//         status: 'Completed',
//     },
//     {
//         requestId: 'REQ003',
//         driverName: 'Sam Brown',
//         userName: 'Emily Davis',
//         date: '2024-10-12T00:00:00',
//         tripFrom: '654 Maple St',
//         tripTo: '987 Birch St',
//         status: 'In Progress',
//     },
//     {
//         requestId: 'REQ004',
//         driverName: 'Lucy Green',
//         userName: 'Michael Brown',
//         date: '2024-10-13T00:00:00',
//         tripFrom: '135 Cedar St',
//         tripTo: '246 Spruce St',
//         status: 'Completed',
//     },
//     {
//         requestId: 'REQ005',
//         driverName: 'Tom White',
//         userName: 'Sarah Johnson',
//         date: '2024-10-14T00:00:00',
//         tripFrom: '100 Oak St',
//         tripTo: '200 Pine St',
//         status: 'Cancelled',
//     },
//     {
//         requestId: 'REQ006',
//         driverName: 'Alice Blue',
//         userName: 'David Clark',
//         date: '2024-10-15T00:00:00',
//         tripFrom: '300 Cedar St',
//         tripTo: '400 Maple St',
//         status: 'Scheduled',
//     },
// ];

  return (
    <RentalListTable
      dictionary={dictionary}
      staticGroup={rentalData}
    />
  );
};

export default RentalList;
