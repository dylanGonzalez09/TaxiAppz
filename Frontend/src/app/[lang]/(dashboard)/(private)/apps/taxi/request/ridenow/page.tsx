// React Imports
import type { ReactElement } from 'react';

import dynamic from 'next/dynamic';

import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

// Next Imports

// Component Imports
import RequestRideNow from '@/views/apps/taxi/request/rideNow';
import { getRequestWithPagination } from '@/app/api/apps/taxi/request';


const PendingTab = dynamic(() => import('@/views/apps/taxi/request/rideNow/pending'));
const AcceptedTab = dynamic(() => import('@/views/apps/taxi/request/rideNow/accepted'));
const ArrivedTab = dynamic(() => import('@/views/apps/taxi/request/rideNow/arrived'));
const CancelledTab = dynamic(() => import('@/views/apps/taxi/request/rideNow/cancelled'));
const CompletedTab = dynamic(() => import('@/views/apps/taxi/request/rideNow/completed'));
const StartedTab = dynamic(() => import('@/views/apps/taxi/request/rideNow/started'));

// Vars
const tabContentList = async ({ params }: { params: { lang: Locale } }): Promise<{ [key: string]: ReactElement }> => {
  const dictionary = await getDictionary(params.lang);

  // Fetch all data
  const [rideNowcompleted, pending, rideNowAccepted, rideNowArrived, rideNowCancelled, rideNowstarted] = await Promise.all([
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isCompleted"),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", ""),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isDriverStarted"),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isDriverArrived"),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isCancelled"),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isTripStart")
  ]);

  return {
    completed: <CompletedTab CompletedData={rideNowcompleted} dictionary={dictionary} />,
    pending: <PendingTab PendingData={pending} dictionary={dictionary} />,
    accepted: <AcceptedTab AcceptedData={rideNowAccepted} dictionary={dictionary} />,
    arrived: <ArrivedTab ArrivedData={rideNowArrived} dictionary={dictionary} />,
    cancelled: <CancelledTab CancelledData={rideNowCancelled} dictionary={dictionary} />,
    started: <StartedTab StartedData={rideNowstarted} dictionary={dictionary} />
  };
};

const RequestRideNowPage = async ({ params }: { params: { lang: Locale } }) => {
  const contentList = await tabContentList({ params });

  return <RequestRideNow tabContentList={contentList} dictionary={await getDictionary(params.lang)} />;
};

export default RequestRideNowPage;
