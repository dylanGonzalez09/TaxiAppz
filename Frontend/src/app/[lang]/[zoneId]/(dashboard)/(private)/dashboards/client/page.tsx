/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
// MUI Imports

import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'

import TotalAmount from '@views/apps/taxi/dashboard/clientdashboard/TotalAmount'
import TodayCard from '@views/apps/taxi/dashboard/clientdashboard/TodayCard'
import { getDictionary } from '@/utils/getDictionary'

// Component Imports
import StatisticsCard from '@views/apps/taxi/dashboard/clientdashboard/StatisticsCard'

// import IncomeStatistics from '@views/apps/taxi/dashboard/clientdashboard/IncomeStatistics'
import EarningReports from '@views/apps/taxi/dashboard/clientdashboard/EarningReports'
import LogisticsDeliveryExceptions from '@views/apps/taxi/dashboard/clientdashboard/DeliveryExceptions'
import TotalEarning from '@views/apps/taxi/dashboard/clientdashboard/TotalEarning'
import LastRequestTable from '@views/apps/taxi/dashboard/clientdashboard/OverviewTable'
import TopBoard from '@views/apps/taxi/dashboard/clientdashboard/TopBoard'
import Weekly from '@views/apps/taxi/dashboard/clientdashboard/Weekly'
import TripOverview from '@views/apps/taxi/dashboard/clientdashboard/TripOverview'

import { getDashboardByCount, getLogisticalCounts } from '@/app/api/apps/taxi/user'

import { getByLastTrips, getByTripCount, getLogisticsByEarnings, getByTotalEarnings,getByTodayEarnings, getByTodayReport,getWeeklyReport,getMonthlyReport, getYearlyRevenue, getTripsByDriver, getTripsByUser } from '@/app/api/apps/taxi/request'



const originalStructure = [
  { title: 'User', avatarIcon: 'tabler-user', color: 'error', href: 'apps/taxi/user/list' },
  { title: 'Admin', avatarIcon: 'tabler-user-check', color: 'primary', href: 'apps/taxi/admin/list' },
  { title: 'Driver', avatarIcon: 'tabler-truck', color: 'warning', href: 'apps/taxi/driver/list' },
  { title: 'Zone', avatarIcon: 'tabler-world', color: 'info', href: 'apps/taxi/zone/list' }
]


// Dashboard Component

const DashboardClient: any = async ({ params }: { params: { lang: Locale; zoneId: string } }) => {

  const { lang, zoneId } = params

  const dictionary = await getDictionary(lang)
  const data = await getDashboardByCount(zoneId)
  const tripCount = await getByTripCount(zoneId)
  const lastRequests = await getByLastTrips(zoneId)
  const logisticsEarnings = await getLogisticsByEarnings(zoneId)
  const totalEarnings = await getByTotalEarnings(zoneId)
  const todayAmountData= await getByTodayEarnings(zoneId)
  const todayReport= await getByTodayReport(zoneId)
  const weeklyData = await getWeeklyReport(zoneId);
  const monthlyData = await getMonthlyReport(zoneId);
  const revenue = await getYearlyRevenue(zoneId)
  const driverData= await getTripsByDriver(zoneId)
  const userData= await getTripsByUser(zoneId)
  const logisticalCounts = await getLogisticalCounts(zoneId)



  const structureMap = new Map(originalStructure.map(item => [item.title.toLowerCase(), item]))

  const locale = params.lang

  const statsArray = Object.entries(data).map(([key, stats]) => {
    const matchingItem = structureMap.get(key.toLowerCase())

    return {
      title: dictionary['navigation'][`${matchingItem?.title}`] || matchingItem?.title || key,
      stats,
      trendNumber: 0,
      avatarIcon: matchingItem?.avatarIcon || '',
      color: matchingItem?.color || '',
      href: matchingItem?.href ? `/${locale}/${zoneId}/${matchingItem.href}` : undefined
    }
  })

  return (
    <Grid container spacing={6}>
      {/* Statistics Card Section */}

      <Grid item xs={12}>
        <StatisticsCard data={statsArray} />
      </Grid>
      <Grid item xs={12} md={4}>
        <TotalAmount todayAmountData={todayAmountData} dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={8}>
        <TodayCard todayReport={todayReport}  dictionary={dictionary} locale={locale} zoneId={zoneId}/>
      </Grid>
      {/* Main Dashboard Sections */}
      <Grid item xs={12} md={6}>
        <Weekly staticData = {weeklyData}  dictionary={dictionary} locale={locale} zoneId={zoneId}/>

      </Grid>

      <Grid item xs={12} md={6}>
      <TripOverview sampleData={monthlyData}  dictionary={dictionary} locale={locale} zoneId={zoneId}/>

      </Grid>
      <Grid item xs={12}>
        <TotalEarning revenue = {revenue} dictionary={dictionary} />
      </Grid>
      {/* <IncomeStatistics /> */}
      <Grid item xs={12} md={6}>
        <TopBoard  type="driver" data={driverData} dictionary = {dictionary}/>
      </Grid>
      <Grid item xs={12} md={6}>
      <TopBoard  type="user" data={userData} dictionary = {dictionary}/>


      </Grid>


      <Grid item xs={12} md={4}>
        <LogisticsDeliveryExceptions type="user" logisticalCounts={logisticalCounts}  dictionary={dictionary}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <LogisticsDeliveryExceptions type="driver" logisticalCounts={logisticalCounts} dictionary={dictionary} />
      </Grid>
      <Grid item xs={12} md={4}>
        <LogisticsDeliveryExceptions type="zone" logisticalCounts={logisticalCounts} dictionary={dictionary} />
      </Grid>





      {/* This component will need to be implemented */}
      <Grid item xs={12}>
        <LastRequestTable lastRequests={lastRequests} dictionary={dictionary} zoneId={zoneId} />
      </Grid>


    </Grid>
  )
}

export default DashboardClient
