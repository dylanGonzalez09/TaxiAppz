// MUI Imports
'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useSession } from 'next-auth/react'

import { useIsDemoUser } from '@/utils/demoUser'


const TotalAmount = ({ todayAmountData,dictionary} ) => {
      const { data: session } = useSession()
      const report = todayAmountData;

  const { checkDemoStatus } = useIsDemoUser();


  return (
    <Card>
      <Grid container sx={{ border: ` solid`, borderColor: 'primary.main' }}>
        <Grid item xs={8}>
          <CardContent>
            <Typography variant='h5' className='mbe-0.5'>
              {dictionary['navigation'].WelcomeBack} {session?.user?.image?.firstName || ''}🎉
            </Typography>
            <Typography variant='subtitle1' className='mbe-2'>
              {dictionary['navigation'].TodayEarnings}
            </Typography>
            <Typography variant='h4' color='primary.main' className='mbe-1'>
              {checkDemoStatus()
                ? report?.totalRevenue ? `$ ${report.totalRevenue.toFixed(2)}` : "$ 0.00"
                : report?.currency && report?.totalRevenue
                  ? `${report?.currency} ${report?.totalRevenue.toFixed(2)}`
                  : `${report?.currency} 0.00`}
            </Typography>

            <Button variant='contained' color='primary' >
              {dictionary['navigation'].TotalEarnings}
            </Button>
          </CardContent>
        </Grid>
        <Grid item xs={4}>
          <div className='relative bs-full is-full'>
            <img
              alt='Congratulations John'
              src='/images/illustrations/characters/8.png'
              className='max-bs-[150px] absolute block-end-0 inline-end-6 max-is-full'
            />
          </div>
        </Grid>
      </Grid>
      
    </Card>
  )
}

export default TotalAmount
