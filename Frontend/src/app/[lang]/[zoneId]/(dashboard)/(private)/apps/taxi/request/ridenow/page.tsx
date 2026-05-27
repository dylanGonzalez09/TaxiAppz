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
const tabContentList = async ({
  params,

  // searchParams

}: {
  params: { lang: Locale, zoneId: string };
  searchParams?: { tab?: string; page?: string; pageSize?: string; search?: string };
}): Promise<{ [key: string]: ReactElement }> => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  
  // const tab = searchParams?.tab;
  // const parsedPage = Math.max(1, Number(searchParams?.page) || 1);
  // const parsedPageSize = Math.min(100, Math.max(5, Number(searchParams?.pageSize) || 10));
  // const parsedSearch = searchParams?.search || '';

  // const getTabParams = (tabKey: string) =>
  //   tab === tabKey
  //     ? { page: parsedPage, pageSize: parsedPageSize, search: parsedSearch }
  //     : { page: 1, pageSize: 10, search: '' };

  // const completedParams = getTabParams('completed');
  // const pendingParams = getTabParams('pending');
  // const acceptedParams = getTabParams('accepted');
  // const arrivedParams = getTabParams('arrived');
  // const cancelledParams = getTabParams('cancelled');
  // const startedParams = getTabParams('started');

  // Fetch all data

  const [rideNowcompleted, pending, rideNowAccepted, rideNowArrived, rideNowCancelled, rideNowstarted] = await Promise.all([
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isCompleted","All","","", zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "","All","","", zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isDriverStarted","All","","", zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isDriverArrived","All","","", zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isCancelled","All","","", zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_NOW", "isTripStart","All","","", zoneId)
  ]);

  return {
    completed: <CompletedTab CompletedData={rideNowcompleted} dictionary={dictionary}  />,
    pending: <PendingTab PendingData={pending} dictionary={dictionary} />,
    accepted: <AcceptedTab AcceptedData={rideNowAccepted} dictionary={dictionary} />,
    arrived: <ArrivedTab ArrivedData={rideNowArrived} dictionary={dictionary} />,
    cancelled: <CancelledTab CancelledData={rideNowCancelled} dictionary={dictionary} />,
    started: <StartedTab StartedData={rideNowstarted} dictionary={dictionary} />
  };
};

const VALID_TABS = ['completed', 'pending', 'accepted', 'arrived', 'started', 'cancelled']

const RequestRideNowPage = async ({
  params,
  searchParams
}: {
  params: { lang: Locale, zoneId: string };
  searchParams?: { tab?: string; page?: string; pageSize?: string; search?: string };
}) => {
  const contentList = await tabContentList({ params, searchParams })
  const tab = searchParams?.tab
  const defaultTab = tab && VALID_TABS.includes(tab) ? tab : 'completed'

  return (
    <RequestRideNow
      tabContentList={contentList}
      dictionary={await getDictionary(params.lang)}
      defaultTab={defaultTab}
    />
  )
};

export default RequestRideNowPage;
