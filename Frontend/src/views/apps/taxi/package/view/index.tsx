import React from 'react';

import Grid from '@mui/material/Grid';

import LineChartProfit from './LineChartProfit';
import CardStatVertical from './RadialBarChart';
import PackageTable from './packageList';

const PackageList = ({ staticGroup, dictionary }: { staticGroup: any[], dictionary: any }) => {
  return (
    <Grid container spacing={6}>
      {/* First Section: LineChart and Cards */}
      <Grid item xs={12} xl={4}>
        <Grid container spacing={6}>
          {/* Line Chart */}
          <Grid item xs={12} sm={6}>
            <LineChartProfit />
          </Grid>

          {/* Card 1 - Total Clients */}
          <Grid item xs={12} sm={6} md={3}>
            <CardStatVertical
              title='Total Clients'
              subtitle='in this package'
              stats='1000'
              avatarColor='error'
              avatarIcon='tabler-credit-card'
              avatarSkin='light'
              avatarSize={44}
              avatarIconSize={28}
               chipText={''}       
            />
          </Grid>

          {/* Card 2 - Nearby Renewals */}
          <Grid item xs={12} sm={6} md={3}>
            <CardStatVertical
              title='Nearby Renewals'
              subtitle='Near 10 days'
              stats='1000'
              avatarColor='success'
              avatarIcon='tabler-currency-dollar'
              avatarSkin='light'
              avatarSize={44}
              avatarIconSize={28}
              chipText={''}       

         
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Package Table */}
      <Grid item xs={12}>
        <PackageTable dictionary={dictionary} staticGroup={staticGroup} />
      </Grid>
    </Grid>
  );
};

export default PackageList;
