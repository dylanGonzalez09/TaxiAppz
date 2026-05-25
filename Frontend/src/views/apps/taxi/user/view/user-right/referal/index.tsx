/* eslint-disable import/no-unresolved */ 
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import HorizontalStatisticsCard from './HorizontalStatisticsCard';
import ReferredUsersTable from './ReferredUsersTable';

type referalListType = {
  userName: string;
  email: string;
  phoneNumber: string;
  amount: string;
  referralCount: number;
  referredUserName: string;
  userId: string; // Add userId here
};

interface ReferalTabProps {
  userId: string;
  referalData: referalListType[];
  stats: {
    totalAmount: number;
    totalUserCount: number;
    totalDriverCount: number;
    referralCode: string;
  };
  dictionary: any;
}
interface stats {
  totalAmount: number;
  totalUserCount: number;
  totalDriverCount: number;
  referralCode: string;
};

const eCommerceReferrals = ({ userId, referalData, stats , dictionary }: ReferalTabProps) => {
  // Find the referral data for the given userId
  // Bind the stats data dynamically using the stats prop
  const statsData = {
    statsHorizontalWithAvatar: [
      {
        stats: `${stats?.totalAmount ?? 0}`,  // Fallback to 0 if undefined
        title: dictionary['navigation'].TotalEarning,
        avatarIcon: 'tabler-currency-dollar',
        avatarColor: 'primary',
      },
      {
        stats: `${stats?.totalUserCount ?? 0}`,   // Fallback to 0 if undefined
        title: dictionary['navigation'].TotalUsers,
        avatarIcon: 'tabler-gift',
        avatarColor: 'success',
      },
      {
        stats:  `${stats?.totalDriverCount ?? 0}`,   // Fallback to 0 if undefined
        title: dictionary['navigation'].Totaldrivers,
        avatarIcon: 'tabler-users',
        avatarColor: 'error',
      },
      {
        stats: `${stats?.referralCode ?? "N/A"}`,  // Fallback to "N/A" if undefined
        title: dictionary['navigation'].ReferralCode,
        avatarIcon: 'tabler-infinity',
        avatarColor: '',
      },
    ],
  };

  
return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <HorizontalStatisticsCard data={statsData?.statsHorizontalWithAvatar} />
      </Grid>
      <Grid item xs={12}>
        <ReferredUsersTable referalData={referalData} dictionary={dictionary} />
      </Grid>
    </Grid>
  );
};

export default eCommerceReferrals;
