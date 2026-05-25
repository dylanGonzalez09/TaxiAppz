/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState } from 'react';

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
import { styled } from '@mui/material/styles';

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


const TaxiRideOverview = ({staticData,dictionary}) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentData, setCurrentData] = useState(staticData.week1);
  const { checkDemoStatus } = useIsDemoUser();


  const formatCurrency = (value) => {
    return checkDemoStatus()
      ? `$ ${(value ?? 0).toFixed(2)}`
      : `${currentData?.currency ?? ''} ${(value ?? 0).toFixed(2)}`;
  };


  const handleWeekChange = (event) => {
    const week = event.target.value;

    setSelectedWeek(week);
    setCurrentData(staticData[week]);
  };

  const generateDashboardData = () => {
    const dashboardData1 = [
      { 
        heading: dictionary['navigation'].TotalPayments,
        amount: formatCurrency(currentData.TotalPayments), 
        icon: 'tabler-progress-check', 
        progressColor: '#6366F1', 
        bgColor: '#EEF2FF' 
      },
      { 
        heading: dictionary['navigation'].CashPayments,
        amount: formatCurrency(currentData.cashPayments), 
        icon: 'tabler-cash', 
        progressColor: '#10B981', 
        bgColor: '#ECFDF5' 
      },
      { 
        heading: dictionary['navigation'].CardPayments, 
        amount: formatCurrency(currentData.cardPayments), 
        icon: 'tabler-credit-card-pay', 
        progressColor: '#3B82F6', 
        bgColor: '#EFF6FF' 
      },
      { 
        heading: dictionary['navigation'].WalletPayments, 
        amount: formatCurrency(currentData.walletPayments), 
        icon: 'tabler-wallet', 
        progressColor: '#F59E0B', 
        bgColor: '#FFFBEB' 
      }
    ];

    const dashboardData2 = [
      { 
        heading: dictionary['navigation'].CompletedRides,
        progressData: currentData.completed, 
        color: '#10B981',  
        icon: 'tabler-progress-check',
        progressColor: '#10B981'
      },
      { 
        heading: dictionary['navigation'].CancelledRides,
        progressData: currentData.cancelled, 
        color: '#EF4444',  
        icon: 'tabler-circle-x',
        progressColor: '#EF4444'
      }
    ];

    return { dashboardData1, dashboardData2 };
  };

  const { dashboardData1, dashboardData2 } = generateDashboardData();


  return (
    <StyledCard>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>{dictionary['navigation'].WeeklyOverview}</Typography>}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="week-select-label">{dictionary['navigation'].Week}</InputLabel>
              <Select
                labelId="week-select-label"
                id="week-select"
                value={selectedWeek}
                onChange={handleWeekChange}
                label={dictionary['navigation'].Week}
                sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.15)' } }}
              >
                {Object.keys(staticData).map((week) => (
                  <MenuItem key={week} value={week}>
                    {week}
                  </MenuItem>
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
              <StatsCard sx={{ bgcolor: `${item.progressColor}10`, borderLeft: `4px solid ${item.progressColor}` }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {item.heading}
                    </Typography>
                      <CustomAvatar color={item.progressColor} variant='rounded' size={40} skin='light'>
                        <i className={item.icon}></i>
                      </CustomAvatar>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.amount}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3} className="mt-2">
          {dashboardData1.slice(2, 4).map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <StatsCard sx={{ bgcolor: `${item.progressColor}10`, borderLeft: `4px solid ${item.progressColor}` }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {item.heading}
                    </Typography>
                    <CustomAvatar color={item.progressColor} variant='rounded' size={40} skin='light'>
                        <i className={item.icon}></i>
                      </CustomAvatar>                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.amount}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3} className="mt-2">
          {dashboardData2.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <StatsCard sx={{ bgcolor: `${item.color}10`, borderLeft: `4px solid ${item.color}` }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {item.heading}
                    </Typography>
                    <CustomAvatar color={item.progressColor} variant='rounded' size={40} skin='light'>
                        <i className={item.icon}></i>
                      </CustomAvatar>                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {item.progressData}
                  </Typography>
                </CardContent>
              </StatsCard>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default TaxiRideOverview;
