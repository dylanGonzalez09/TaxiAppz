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

  // const pendingParams = getTabParams('pending');
  // const acceptedParams = getTabParams('accepted');
  // const arrivedParams = getTabParams('arrived');
  // const startedParams = getTabParams('started');
  // const cancelledParams = getTabParams('cancelled');
  // const completedParams = getTabParams('completed');

  // Fetch all data in parallel using Promise.all
  
  const [pending, rideNowAccepted, rideNowArrived, rideNowstarted, rideNowCancelled, rideNowcompleted] = await Promise.all([
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "", "All","","",zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isDriverStarted","All", "","",zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isDriverArrived", "All","","",zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isTripStart","All", "","",zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isCancelled", "All","","",zoneId),
    getRequestWithPagination("", 1, 10, "RIDE_LATER", "isCompleted", "All","","",zoneId)
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

const VALID_TABS = ['completed', 'pending', 'accepted', 'arrived', 'started', 'cancelled']

const RequestRideLaterPage = async ({
  params,
  searchParams
}: {
  params: { lang: Locale, zoneId: string };
  searchParams?: { tab?: string; page?: string; pageSize?: string; search?: string };
}) => {
  const contentList = await tabContentList({ params, searchParams });
  const tab = searchParams?.tab;
  const defaultTab = tab && VALID_TABS.includes(tab) ? tab : 'completed'

  return <RequestRideLater tabContentList={contentList} dictionary={await getDictionary(params.lang)} defaultTab={defaultTab} />;

};

export default RequestRideLaterPage;
