// MUI Imports
'use client'

import Link from 'next/link'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

import { useIsDemoUser } from '@/utils/demoUser'


import CustomAvatar from '@core/components/mui/Avatar'

const TotalCard = ({ todayReport, dictionary, locale, zoneId }) => {
  const { checkDemoStatus } = useIsDemoUser()


const report = todayReport

  const formatCurrency = (value) => {
    return checkDemoStatus()
      ? `$ ${(value ?? 0).toFixed(2)}`
      : `${report?.currency ?? ''} ${(value ?? 0).toFixed(2)}`;
  };

  const base = locale ? `/${locale}/${zoneId}/apps/taxi/request` : `/${zoneId}/apps/taxi/request`

  const data = [
    {
      stats: report?.completed ?? 0,
      title: dictionary['navigation'].Completed,
      color: 'primary',
      icon: 'tabler-progress-check',
      href: `${base}/ridenow?tab=completed`
    },
    {
      color: 'error',
      stats: report?.cancelled ?? 0,
      title: dictionary['navigation'].Cancelled,
      icon: 'tabler-circle-x',
      href: `${base}/ridenow?tab=cancelled`
    },
    {
      color: 'info',
      stats: report?.ongoing ?? 0,
      title: dictionary['navigation'].OnGoing,
      icon: 'tabler-clock-cancel',
      href: `${base}/ridenow?tab=started`
    },
    {
      stats: report?.pendingAmount ?? 0,
      color: 'success',
      title: dictionary['navigation'].Pending,
      icon: 'tabler-parking-circle',
      href: `${base}/ridenow?tab=pending`
    },
    {
      color: 'info',
      stats: formatCurrency(report?.cashPayments),
      title: dictionary['navigation'].Cash,
      icon: 'tabler-cash',
      href: `${base}/payments?tab=cash`
    },
    {
      color: 'error',
      stats: formatCurrency(report?.cardPayments),
      title: dictionary['navigation'].Card,
      icon: 'tabler-credit-card-pay',
      href: `${base}/payments?tab=card`
    },
    {
      stats: formatCurrency(report?.walletPayments),
      color: 'success',
      title: dictionary['navigation'].Wallet,
      icon: 'tabler-wallet',
      href: `${base}/payments?tab=wallet`
    }
  ]

  return (
    <Card sx={{ border: ` solid`, borderColor: 'primary.main' }}>
      <CardHeader
        title={dictionary['navigation'].TodayReports}
        action={
          <Typography variant='h6' color='info'>
            {dictionary['navigation'].Statistics}
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={4} className='mbe-1'>
          {data.map((item, index) => {
            const cell = (
              <Box className='flex items-center gap-4' sx={{ cursor: item.href ? 'pointer' : 'default' }}>
                <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                  <i className={item.icon}></i>
                </CustomAvatar>
                <div className='flex flex-col'>
                  <Typography variant='h5'>{item.stats}</Typography>
                  <Typography variant='body2'>{item.title}</Typography>
                </div>
              </Box>
            )

            return (
              <Grid key={index} item xs={12} sm={index < 4 ? 3 : 4}>
                {item.href ? (
                  <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {cell}
                  </Link>
                ) : (
                  cell
                )}
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default TotalCard
