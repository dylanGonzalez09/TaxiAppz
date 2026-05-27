/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';


import React, { useState, useEffect } from 'react';

import Link from 'next/link'

import moment from 'moment';


import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import CustomAvatar from '@core/components/mui/Avatar'
import { useIsDemoUser } from '@/utils/demoUser'

// Styled Components
const StyledCard = styled(Card)({
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  }
});

const StatsCard = styled(Box)(({ theme, bgcolor }) => ({
  borderRadius: 16,
  padding: theme.spacing(2.5),
  backgroundColor: bgcolor || '#F5F5F5',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
}));

const TaxiRideOverview = ({ staticData, dictionary, locale, zoneId }) => {
  // Default state (fallback)
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentData, setCurrentData] = useState(staticData?.week1 || {});
  const { checkDemoStatus } = useIsDemoUser();

  // offset 0 = Current Week, 1 = Previous Week
  const getWeekRange = (offset = 0) => {
    const start = moment().subtract(offset, 'week').startOf('week').toDate();
    const end = moment().subtract(offset, 'week').endOf('week').toDate();

    return { start, end };
  };

  useEffect(() => {
    const now = new Date();

    // Week 1 (Current Week) Range

    const w1 = getWeekRange(0);

    // Week 2 (Previous Week) Range

    const w2 = getWeekRange(1);

    // Week 3 Range

    const w3 = getWeekRange(2);

    // Week 4 Range

    const w4 = getWeekRange(3);

    let activeWeekKey = 'week1'; // Default

    if (now >= w1.start && now <= w1.end) {
      activeWeekKey = 'week1';
    } else if (now >= w2.start && now <= w2.end) {
      activeWeekKey = 'week2';
    } else if (now >= w3.start && now <= w3.end) {
      activeWeekKey = 'week3';
    } else if (now >= w4.start && now <= w4.end) {
      activeWeekKey = 'week4';
    }

    // Set the state
    setSelectedWeek(activeWeekKey);
    setCurrentData(staticData[activeWeekKey] || staticData?.week1 || {});

  }, [staticData]);

  const formatCurrency = (value) => {
    return checkDemoStatus()
      ? `$ ${(value ?? 0).toFixed(2)}`
      : `${currentData?.currency ?? ''} ${(value ?? 0).toFixed(2)}`;
  };

  const base = locale ? `/${locale}/${zoneId}/apps/taxi/request` : `/${zoneId}/apps/taxi/request`

  const handleWeekChange = event => {
    const week = event.target.value

    setSelectedWeek(week)
    setCurrentData(staticData[week])
  }

  // Helper to show nice names in dropdown
  const getWeekLabel = (key) => {
    if (key === 'week1') return dictionary['navigation'].CurrentWeek || 'Current Week';
    if (key === 'week2') return dictionary['navigation'].PreviousWeek || 'Previous Week';
    if (key === 'week3') return dictionary['navigation']['3rdWeekBack'] || '3rd Week Back';
    if (key === 'week4') return dictionary['navigation']['4thWeekBack'] || '4th Week Back';

    return key;
  };

  const generateDashboardData = () => {
    const dashboardData1 = [
      { heading: dictionary['navigation'].TotalPayments, amount: formatCurrency(currentData.TotalPayments), icon: 'tabler-progress-check', progressColor: '#6366F1', bgColor: '#EEF2FF', href: `${base}/ridenow?tab=completed` },
      { heading: dictionary['navigation'].CashPayments, amount: formatCurrency(currentData.cashPayments), icon: 'tabler-cash', progressColor: '#10B981', bgColor: '#ECFDF5', href: `${base}/payments?tab=cash` },
      { heading: dictionary['navigation'].CardPayments, amount: formatCurrency(currentData.cardPayments), icon: 'tabler-credit-card-pay', progressColor: '#3B82F6', bgColor: '#EFF6FF', href: `${base}/payments?tab=card` },
      { heading: dictionary['navigation'].WalletPayments, amount: formatCurrency(currentData.walletPayments), icon: 'tabler-wallet', progressColor: '#F59E0B', bgColor: '#FFFBEB', href: `${base}/payments?tab=wallet` }
    ]

    const dashboardData2 = [
      { heading: dictionary['navigation'].CompletedRides, progressData: currentData.completed, color: '#10B981', icon: 'tabler-progress-check', progressColor: '#10B981', href: `${base}/ridenow?tab=completed` },
      { heading: dictionary['navigation'].CancelledRides, progressData: currentData.cancelled, color: '#EF4444', icon: 'tabler-circle-x', progressColor: '#EF4444', href: `${base}/ridenow?tab=cancelled` }
    ]

    return { dashboardData1, dashboardData2 }
  }

  const { dashboardData1, dashboardData2 } = generateDashboardData();

  return (
    <StyledCard>
      <CardHeader
        title={
          <Typography variant='h6' sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {dictionary['navigation'].WeeklyOverview}
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size='small' sx={{ minWidth: 140 }}>
              <InputLabel id='week-select-label'>{dictionary['navigation'].Week}</InputLabel>
              <Select
                labelId='week-select-label'
                id='week-select'
                value={selectedWeek}
                onChange={handleWeekChange}
                label={dictionary['navigation'].Week}
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.15)' }
                }}
              >
                {Object.keys(staticData).map(week => (
                  <StyledMenuItem
                    key={week}
                    value={week}
                    selected={selectedWeek === week}
                  >
                    {/* Display nice label instead of 'week1' */}
                    {getWeekLabel(week)}
                  </StyledMenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        }
      />
      <CardContent sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {dashboardData1.slice(0, 2).map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              {item.href ? (
                <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <StatsCard sx={{ bgcolor: `${item.progressColor}10`, borderLeft: `4px solid ${item.progressColor}`, cursor: 'pointer' }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>{item.heading}</Typography>
                        <CustomAvatar color={item.progressColor} variant='rounded' size={40} skin='light'><i className={item.icon}></i></CustomAvatar>
                      </Box>
                      <Typography variant='h4' sx={{ fontWeight: 700 }}>{item.amount}</Typography>
                    </CardContent>
                  </StatsCard>
                </Link>
              ) : (
                <StatsCard sx={{ bgcolor: `${item.progressColor}10`, borderLeft: `4px solid ${item.progressColor}` }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>{item.heading}</Typography>
                      <CustomAvatar color={item.progressColor} variant='rounded' size={40} skin='light'><i className={item.icon}></i></CustomAvatar>
                    </Box>
                    <Typography variant='h4' sx={{ fontWeight: 700 }}>{item.amount}</Typography>
                  </CardContent>
                </StatsCard>
              )}
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3} className='mt-2'>
          {dashboardData1.slice(2, 4).map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              {item.href ? (
                <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <StatsCard sx={{ bgcolor: `${item.progressColor}10`, borderLeft: `4px solid ${item.progressColor}`, cursor: 'pointer'}}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>{item.heading}</Typography>
                        <CustomAvatar color={item.progressColor} variant='rounded' size={40} skin='light'><i className={item.icon}></i></CustomAvatar>
                      </Box>
                      <Typography variant='h4' sx={{ fontWeight: 700 }}>{item.amount}</Typography>
                    </CardContent>
                  </StatsCard>
                </Link>
              ) : (
                <StatsCard sx={{ bgcolor: `${item.progressColor}10`, borderLeft: `4px solid ${item.progressColor}` }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>{item.heading}</Typography>
                      <CustomAvatar color={item.progressColor} variant='rounded' size={40} skin='light'><i className={item.icon}></i></CustomAvatar>
                    </Box>
                    <Typography variant='h4' sx={{ fontWeight: 700 }}>{item.amount}</Typography>
                  </CardContent>
                </StatsCard>
              )}
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3} className='mt-2'>
          {dashboardData2.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              {item.href ? (
                <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <StatsCard sx={{ bgcolor: `${item.color}10`, borderLeft: `4px solid ${item.color}`, cursor: 'pointer' }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>{item.heading}</Typography>
                        <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'><i className={item.icon}></i></CustomAvatar>
                      </Box>
                      <Typography variant='h4' sx={{ fontWeight: 700 }}>{item.progressData}</Typography>
                    </CardContent>
                  </StatsCard>
                </Link>
              ) : (
                <StatsCard sx={{ bgcolor: `${item.color}10`, borderLeft: `4px solid ${item.color}` }}>
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>{item.heading}</Typography>
                      <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'><i className={item.icon}></i></CustomAvatar>
                    </Box>
                    <Typography variant='h4' sx={{ fontWeight: 700 }}>{item.progressData}</Typography>
                  </CardContent>
                </StatsCard>
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </StyledCard>
  )
};

export default TaxiRideOverview;
