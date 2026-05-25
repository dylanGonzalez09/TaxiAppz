/* eslint-disable @next/next/no-async-client-component */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

// MUI Imports
import { useEffect } from 'react';

import Grid from '@mui/material/Grid'

// Components Imports
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder'

import { useSettings } from '@/@core/hooks/useSettings';

// import useFCM from '@/libs/hooks/useFCM'
import { createClientToken } from '@/app/api/apps/taxi/client';

const StatisticsCard = ({ data }) => {

  const { updateSettings, settings } = useSettings();

  // const { messages, fcmToken } = useFCM();



  // if (fcmToken != null && fcmToken != "null") {
  //   let updatedData = { deviceInfoHash: "" + fcmToken }

  //   createClientToken(updatedData);
  // }

  return (
    data && (
      <Grid container spacing={6}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <HorizontalWithBorder {...item} />
          </Grid>
        ))}
      </Grid>
    )
  );
}

export default StatisticsCard
