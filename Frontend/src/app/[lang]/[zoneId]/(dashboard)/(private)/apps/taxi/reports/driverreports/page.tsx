import React from 'react';

import type { Locale } from '@/configs/i18n';

import DriverReportsTable from '@/views/apps/taxi/reports/driverreports/driverreports';
import { getDictionary } from '@/utils/getDictionary';
import { getDriverReport } from '@/app/api/apps/taxi/request';

// import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';




const DriverReports = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {

  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const requests = await getDriverReport(zoneId);
  
  // Static data to be passed to the DocumentExpiryTable
//   const driverData = [
//     {
//         driverName: 'John Doe',
//         vehicleType: 'Sedan',
//         tripCompleted: '1',
//         tripCancelled : '10',
//         phoneNumber : "1234567890",
//         currentStatus: "offline",
//         driverStatus: "inactive",
//         todayWorking: '2024-10-10T08:00:00',   // start time today
//         yesterdayWorking: '2024-10-09T09:00:00', // start time yesterday
//         weeklyWorking: '2024-10-01T08:00:00',   // start time this week
//         monthlyWorking: '2024-09-01T08:00:00',   // start time this month
//     },
//     {
//         driverName: 'Jane Smith',
//         vehicleType: 'SUV',
//         tripCompleted: '13',
//         tripCancelled : '1',
//         phoneNumber : "1234567890",
//         currentStatus: "online",
//         driverStatus: "active",
//         todayWorking: '2024-10-10T09:00:00',
//         yesterdayWorking: '2024-10-09T10:00:00',
//         weeklyWorking: '2024-10-01T09:00:00',
//         monthlyWorking: '2024-09-01T09:00:00',
//     },
//     {
//         driverName: 'Sam Brown',
//         vehicleType: 'Minivan',
//         tripCompleted: '13',
//         tripCancelled : '10',
//         phoneNumber : "1234567890",
//         currentStatus: "online",
//         driverStatus: "inactive",
//         todayWorking: '2024-10-10T10:00:00',
//         yesterdayWorking: '2024-10-09T11:00:00',
//         weeklyWorking: '2024-10-01T10:00:00',
//         monthlyWorking: '2024-09-01T10:00:00',
//     },
//     {
//         driverName: 'Lucy Green',
//         vehicleType: 'Compact',
//         tripCompleted: '14',
//         tripCancelled : '50',
//         phoneNumber : "1234567890",
//         currentStatus: "offline",
//         driverStatus: "active",
//         todayWorking: '2024-10-10T11:00:00',
//         yesterdayWorking: '2024-10-09T12:00:00',
//         weeklyWorking: '2024-10-01T11:00:00',
//         monthlyWorking: '2024-09-01T11:00:00',
//     },
//     {
//         driverName: 'Michael Blue',
//         vehicleType: 'Luxury',
//         tripCompleted: '6',
//         tripCancelled : '0',
//         phoneNumber : "1234567890",
//         currentStatus: "online",
//         driverStatus: "inactive",
//         todayWorking: '2024-10-10T12:00:00',
//         yesterdayWorking: '2024-10-09T13:00:00',
//         weeklyWorking: '2024-10-01T12:00:00',
//         monthlyWorking: '2024-09-01T12:00:00',
//     },
// ];


  return (
    <DriverReportsTable
      dictionary={dictionary}
      staticGroup={requests}
    />
  );
};

export default DriverReports;
