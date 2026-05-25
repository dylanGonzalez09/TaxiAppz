/* eslint-disable @typescript-eslint/no-unused-vars */
import dynamic from 'next/dynamic';

import Grid from '@mui/material/Grid';

import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';

import UserLeftOverview from '@views/apps/taxi/user/view/user-left-overview';
import UserRight from '@views/apps/taxi/user/view/user-right';

import { getWalletTransactionById } from '@/app/api/apps/taxi/wallet';
import { fetchUserData } from '@/app/api/apps/taxi/user';
import { fetchDriverRequestData } from '@/app/api/apps/taxi/request';
import { fetchUserComplaintData } from '@/app/api/apps/taxi/complaints';
import { fetchUserRating } from '@/app/api/apps/taxi/rating';
import { fetchStatsData, fetchUserReferral } from '@/app/api/apps/taxi/referral';
import { getFineWithPagination } from '@/app/api/apps/taxi/fine';

// Dynamic Imports for Tabs
const RequestTripTab = dynamic(() => import('@views/apps/taxi/user/view/user-right/request'));
const WalletTab = dynamic(() => import('@views/apps/taxi/user/view/user-right/wallet'));
const ComplaintTab = dynamic(() => import('@views/apps/taxi/user/view/user-right/complaint'));
const RatingTab = dynamic(() => import('@/views/apps/taxi/user/view/user-right/rating'));
const ReferalTab = dynamic(() => import('@/views/apps/taxi/user/view/user-right/referal'));
const FineTab = dynamic(() => import('@/views/apps/taxi/user/view/user-right/fine'));

// Tab content generator
const tabContentList = (
  userId: string,
  transactions: any,
  walletDetails: any,
  requestData: any,
  complaintData: any,
  ratingData: any,
  referalData: any,
  statsData: any,
  fineData:any,
  dictionary: any
) => ({
  request: <RequestTripTab userId={userId} requestData={requestData} dictionary={dictionary}/>,
  wallet: <WalletTab userId={userId} walletTransactionsData={transactions} walletDetails={walletDetails} addWalletButton={true} dictionary={dictionary}/>,
  complaint: <ComplaintTab userId={userId} complaintData={complaintData} dictionary={dictionary} />,
  rating: <RatingTab userId={userId} ratingData={ratingData} dictionary={dictionary} />,
  referal: <ReferalTab userId={userId} referalData={referalData} stats={statsData} dictionary={dictionary} />,
  fine: <FineTab userId={userId} addFineButton={true} dictionary={dictionary} fineData={fineData} />,
});

// Main page component
const UserViewTab = async ({
  params,
}: {
  params: { section: string; lang: Locale; id: string };
}) => {
  const userId = params.id;
  const dictionary = await getDictionary(params.lang);

  const [walletTransactionsData, userData, requestData, complaintData, ratingData, referalData, statsData,fineData] = await Promise.all([
    getWalletTransactionById(userId),
    fetchUserData(userId),
    fetchDriverRequestData(userId),
    fetchUserComplaintData(userId),
    fetchUserRating(userId),
    fetchUserReferral(userId),
    fetchStatsData(userId),
    getFineWithPagination(userId)
  ]);

  const { walletDetails = {}, transactions = [] } = walletTransactionsData || {};

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={3} md={4}>
        <UserLeftOverview userData={userData} dictionary={dictionary} />
      </Grid>
      <Grid item xs={12} lg={9} md={8}>
        <UserRight
          tabContentList={tabContentList(
            userId,
            transactions,
            walletDetails,
            requestData,
            complaintData,
            ratingData,
            referalData,
            statsData,
            fineData,
            dictionary
          )}
          userId={userId}
          dictionary={dictionary}

        />
      </Grid>
    </Grid>
  );
};

export default UserViewTab;
