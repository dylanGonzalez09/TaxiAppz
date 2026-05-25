// MUI Imports
'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import { useIsDemoUser } from '@/utils/demoUser'

// Type Imports

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const TotalCard = ({todayReport,dictionary}) => {
  const report = todayReport;
  const { checkDemoStatus } = useIsDemoUser();


  const formatCurrency = (value) => {
    return checkDemoStatus()
      ? `$ ${(value ?? 0).toFixed(2)}`
      : `${report?.currency ?? ''} ${(value ?? 0).toFixed(2)}`;
  };

  const data = [
    {
      stats: report.completed ?? 0,
      title: dictionary['navigation'].Completed,
      color: 'primary',
      icon: 'tabler-progress-check'
    },
    {
      color: 'error',
      stats: report.cancelled ?? 0,
      title: dictionary['navigation'].Cancelled,
      icon: 'tabler-circle-x'
    },
    {
      color: 'info',
      stats: report.ongoing ?? 0,
      title: dictionary['navigation'].OnGoing,
      icon: 'tabler-clock-cancel'
    },
    {
      stats: report.pendingAmount ?? 0,
      color: 'success',
      title: dictionary['navigation'].Pending,
      icon: 'tabler-parking-circle'
    },
    {
      color: 'info',
      stats: formatCurrency(report?.cashPayments),
      title: dictionary['navigation'].Cash,
      icon: 'tabler-cash'
    },
    {
      color: 'error',
      stats: formatCurrency(report?.cardPayments),
      title: dictionary['navigation'].Card,
      icon: 'tabler-credit-card-pay'
    },
    {
      stats: formatCurrency(report?.walletPayments),
      color: 'success',
      title: dictionary['navigation'].Wallet,
      icon: 'tabler-wallet'
    }
  ];


  return (
    <Card  sx={{ border: ` solid`, borderColor: 'primary.main' }}>
      <CardHeader
        title={dictionary['navigation'].TodayReports}
        action={
          <Typography variant='subtitle2' color='text.disabled'>
             {dictionary['navigation'].Statistics}
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={4} className='mbe-1'>
          {data.map((item, index) => (
            <Grid 
              key={index} 
              item 
              xs={12} 
              sm={index < 4 ? 3 : 4} 
              className='flex items-center gap-4'
            >
              <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography variant='body2'>{item.title}</Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TotalCard