/* eslint-disable import/no-unresolved */
// React Imports
import type { ReactElement } from 'react';

import dynamic from 'next/dynamic';

import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

// Next Imports

// Component Imports
import RequestRideLater from '@/views/apps/taxi/request/rideNow';
import { getRequestWithPagination } from '@/app/api/apps/taxi/request';

const PendingTab = dynamic(() => import('@/views/apps/taxi/request/rideLater/pending'));
const AcceptedTab = dynamic(() => import('@/views/apps/taxi/request/rideLater/accepted'));
const ArrivedTab = dynamic(() => import('@/views/apps/taxi/request/rideLater/arrived'));
const CancelledTab = dynamic(() => import('@/views/apps/taxi/request/rideLater/cancelled'));
const CompletedTab = dynamic(() => import('@/views/apps/taxi/request/rideLater/completed'));
const StartedTab = dynamic(() => import('@/views/apps/taxi/request/rideLater/started'));

// Vars
const tabContentList = async ({ params }: { params: { lang: Locale } }): Promise<{ [key: string]: ReactElement }> => {
  const dictionary = await getDictionary(params.lang);

  // Fetch all data in parallel using Promise.all
  const [pending, rideNowAccepted, rideNowArrived, rideNowstarted, rideNowCancelled, rideNowcompleted] = await Promise.all([
    getRequestWithPagination("", 1, 10, "RIDE_LATER", ""),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isDriverStarted"),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isDriverArrived"),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isTripStart"),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isCancelled"),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isCompleted")
  ]);

  return {
    pending: <PendingTab PendingData={pending} dictionary={dictionary} />,
    accepted: <AcceptedTab AcceptedData={rideNowAccepted} dictionary={dictionary} />,
    arrived: <ArrivedTab ArrivedData={rideNowArrived} dictionary={dictionary} />,
    cancelled: <CancelledTab CancelledData={rideNowCancelled} dictionary={dictionary} />,
    completed: <CompletedTab CompletedData={rideNowcompleted} dictionary={dictionary} />,
    started: <StartedTab StartedData={rideNowstarted} dictionary={dictionary} />
  };

};

const RequestRideLaterPage = async ({ params }: { params: { lang: Locale } }) => {
  const contentList = await tabContentList({ params });

  return <RequestRideLater tabContentList={contentList} dictionary={await getDictionary(params.lang)}/>;

};

export default RequestRideLaterPage;
