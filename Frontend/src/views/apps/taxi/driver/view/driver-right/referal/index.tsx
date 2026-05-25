/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import HorizontalStatisticsCard from './HorizontalStatisticsCard';

import ReferredUsersTable from './ReferredUsersTable';

// Static Data
const statsData = {
  statsHorizontalWithAvatar: [
    {
      stats: '$24,983',
      title: 'Total Earning',
      avatarIcon: 'tabler-currency-dollar',
      avatarColor: 'primary',
    },
    {
      stats: '1000',
      title: 'Total Users',
      avatarIcon: 'tabler-gift',
      avatarColor: 'success',
    },
    {
      stats: '2,367',
      title: 'Total drivers',
      avatarIcon: 'tabler-users',
      avatarColor: 'error',
    },
    {
      stats: 'vikram',
      title: 'refer to the user',
      avatarIcon: 'tabler-infinity',
      avatarColor: 'info',
    },
  ],
};



const eCommerceReferrals = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <HorizontalStatisticsCard data={statsData?.statsHorizontalWithAvatar} />
      </Grid>
      {/* <Grid item xs={12} md={6}>
        <IconStepsCard />
      </Grid>
      <Grid item xs={12} md={6}>
        <InviteAndShare />
      </Grid> */}
      <Grid item xs={12}>
        
        {/* <ReferredUsersTable /> */}
      </Grid>
    </Grid>
  );
};

export default eCommerceReferrals;
