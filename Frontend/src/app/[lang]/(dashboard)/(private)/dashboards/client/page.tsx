/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
// MUI Imports
import Grid from '@mui/material/Grid'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

// Component Imports
import TotalAmount from '@views/apps/taxi/dashboard/clientdashboard/TotalAmount'
import TodayCard from '@views/apps/taxi/dashboard/clientdashboard/TodayCard'
import StatisticsCard from '@views/apps/taxi/dashboard/clientdashboard/StatisticsCard'
import EarningReports from '@views/apps/taxi/dashboard/clientdashboard/EarningReports'
import LogisticsDeliveryExceptions from '@views/apps/taxi/dashboard/clientdashboard/DeliveryExceptions'
import TotalEarning from '@views/apps/taxi/dashboard/clientdashboard/TotalEarning'
import LastRequestTable from '@views/apps/taxi/dashboard/clientdashboard/OverviewTable'
import TopBoard from '@views/apps/taxi/dashboard/clientdashboard/TopBoard'
import Weekly from '@views/apps/taxi/dashboard/clientdashboard/Weekly'
import TripOverview from '@views/apps/taxi/dashboard/clientdashboard/TripOverview'

// API Imports
import { 
  getDashboardByCount, 
  getLogisticalCounts 
} from '@/app/api/apps/taxi/user'
import { 
  getByLastTrips, 
  getByTripCount, 
  getLogisticsByEarnings, 
  getByTotalEarnings,
  getByTodayEarnings, 
  getByTodayReport,
  getWeeklyReport,
  getMonthlyReport, 
  getYearlyRevenue, 
  getTripsByDriver, 
  getTripsByUser 
} from '@/app/api/apps/taxi/request'

// Cache setup
import { cache } from 'react'

// Cached API calls
const cachedDashboardByCount = cache(getDashboardByCount);
const cachedLogisticalCounts = cache(getLogisticalCounts);
const cachedLastTrips = cache(getByLastTrips);
const cachedTripCount = cache(getByTripCount);
const cachedLogisticsEarnings = cache(getLogisticsByEarnings);
const cachedTotalEarnings = cache(getByTotalEarnings);
const cachedTodayEarnings = cache(getByTodayEarnings);
const cachedTodayReport = cache(getByTodayReport);
const cachedWeeklyReport = cache(getWeeklyReport);
const cachedMonthlyReport = cache(getMonthlyReport);
const cachedYearlyRevenue = cache(getYearlyRevenue);
const cachedTripsByDriver = cache(getTripsByDriver);
const cachedTripsByUser = cache(getTripsByUser);

// Original structure for stats cards
const originalStructure = [
  { title: 'User', avatarIcon: 'tabler-user', color: 'error' },
  { title: 'Admin', avatarIcon: 'tabler-user-check', color: 'primary' },
  { title: 'Driver', avatarIcon: 'tabler-truck', color: 'warning' },
  { title: 'Zone', avatarIcon: 'tabler-world', color: 'info' },
];

// Dashboard Component
const DashboardClient = async ({ params }: { params: { lang: Locale } }) => {
  // Fetch all data in parallel
  const [
    data, 
    tripCount, 
    lastRequests, 
    logisticsEarnings, 
    totalEarnings, 
    todayAmountData, 
    todayReport, 
    weeklyData, 
    monthlyData, 
    revenue, 
    driverData, 
    userData, 
    logisticalCounts, 
    dictionary
  ] = await Promise.all([
    cachedDashboardByCount(),
    cachedTripCount(),
    cachedLastTrips(),
    cachedLogisticsEarnings(),
    cachedTotalEarnings(),
    cachedTodayEarnings(),
    cachedTodayReport(),
    cachedWeeklyReport(),
    cachedMonthlyReport(),
    cachedYearlyRevenue(),
    cachedTripsByDriver(),
    cachedTripsByUser(),
    cachedLogisticalCounts(),
    getDictionary(params.lang)
  ]);

  // Optimized statsArray creation with O(1) lookup
  const structureMap = new Map(
    originalStructure.map(item => [item.title.toLowerCase(), item])
  );

  const statsArray = Object.entries(data).map(([key, stats]) => {
    const matchingItem = structureMap.get(key.toLowerCase());
    
    return {
      title: matchingItem?.title || key,
      stats,
      trendNumber: 0,
      avatarIcon: matchingItem?.avatarIcon || '',
      color: matchingItem?.color || '',
    };
  });
   
  return (
    <Grid container spacing={6}>
      {/* Statistics Card Section */}
      <Grid item xs={12}>
        <StatisticsCard data={statsArray} />
      </Grid>
      
      {/* Today's Summary Section */}
      <Grid item xs={12} md={4}>
        <TotalAmount todayAmountData={todayAmountData} dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={8}>
        <TodayCard todayReport={todayReport} dictionary={dictionary}/>
      </Grid>
      
      {/* Weekly and Monthly Overview */}
      <Grid item xs={12} md={6}>
        <Weekly staticData={weeklyData} dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <TripOverview sampleData={monthlyData} dictionary={dictionary}/>
      </Grid>
      
      {/* Revenue Section */}
      <Grid item xs={12}>
        <TotalEarning revenue={revenue} dictionary={dictionary}/>
      </Grid>
      
      {/* Top Performers Section */}
      <Grid item xs={12} md={6}>
        <TopBoard type="driver" data={driverData} dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <TopBoard type="user" data={userData} dictionary={dictionary}/>
      </Grid>
      
      {/* Logistics Exceptions Section */}
      <Grid item xs={12} md={4}>
        <LogisticsDeliveryExceptions type="user" logisticalCounts={logisticalCounts} dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <LogisticsDeliveryExceptions type="driver" logisticalCounts={logisticalCounts} dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <LogisticsDeliveryExceptions type="zone" logisticalCounts={logisticalCounts} dictionary={dictionary}/>
      </Grid>
      
      {/* Recent Requests Table */}
      <Grid item xs={12}>
        <LastRequestTable lastRequests={lastRequests} dictionary={dictionary}/>
      </Grid>
    </Grid>
  )
}

// Revalidate data every hour (3600 seconds)
export const revalidate = 3600;

export default DashboardClient