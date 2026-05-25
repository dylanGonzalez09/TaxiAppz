/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState, useEffect, useCallback } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

// Third-party Imports
import { styled } from '@mui/material/styles';

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar';

import { useIsDemoUser } from '@/utils/demoUser'

// Style Imports
const StyledCard = styled(Card)({
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  height: '100%',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  },
});

const StatsCard = styled(Box)(({ theme, bgcolor }) => ({
  borderRadius: 16,
  padding: theme.spacing(2.5),
  backgroundColor: bgcolor || '#F5F5F5',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

// Utility Function to Generate Dashboard Data


const LogisticsVehicleOverview = ({sampleData,dictionary}) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyData, setMonthlyData] = useState(sampleData);
  const { checkDemoStatus } = useIsDemoUser();

  const generateDashboardData = (currentData, isDemo) => {
    // If currentData is undefined or missing, ensure values default to 0
    if (!currentData) {
      currentData = {
        completed: 0,
        cancelled: 0,
        cashPayments: 0,
        cardPayments: 0,
        walletPayments: 0,
        TotalPayments: 0,
        currency: '₹',
      };
    }
  
    const formatCurrency = (value) => {
      return isDemo
        ? `$ ${(value ?? 0).toFixed(2)}`
        : `${currentData?.currency ?? '₹'} ${(value ?? 0).toFixed(2)}`;
    };
  
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
      },
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
      },
    ];
  
    return { dashboardData1, dashboardData2 };
  };


  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Generate list of months up to the current month
  const months = Array.from({ length: currentDate.getMonth() + 1 }, (_, index) => {
    const date = new Date(currentYear, index, 1);

    
return date.toLocaleString('default', { month: 'long' });
  });

  // Set default selected month to current month
  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  // Handle month change
  const handleMonthChange = useCallback((event) => {
    const month = event.target.value;

    setSelectedMonth(month);
    setMonthlyData(sampleData);
  }, [sampleData]);

  // Get the dashboard data for the selected month
  const { dashboardData1, dashboardData2 } = generateDashboardData(monthlyData[selectedMonth], checkDemoStatus());

  return (
    <StyledCard>
      <CardHeader
        title={<Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>{dictionary['navigation'].MonthlyOverview}</Typography>}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="month-select-label">{dictionary['navigation'].Month}</InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={selectedMonth}
                onChange={handleMonthChange}
                label={dictionary['navigation'].Month}
                sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.15)' } }}
              >
                {months.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
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
                    <CustomAvatar color={item.progressColor} variant="rounded" size={40} skin="light">
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
                    <CustomAvatar color={item.progressColor} variant="rounded" size={40} skin="light">
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
          {dashboardData2.map((item, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <StatsCard sx={{ bgcolor: `${item.color}10`, borderLeft: `4px solid ${item.color}` }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {item.heading}
                    </Typography>
                    <CustomAvatar color={item.color} variant="rounded" size={40} skin="light">
                      <i className={item.icon}></i>
                    </CustomAvatar>
                  </Box>
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

export default LogisticsVehicleOverview;