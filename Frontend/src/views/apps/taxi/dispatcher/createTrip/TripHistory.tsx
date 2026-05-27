/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import { Avatar, Typography, Button, Grid } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';

interface TripHistoryProps {
  completedTrips: number;
  cancelledTrips: number;
  dictionary:any;

  // tripIds: string[];
}

const TripHistory: React.FC<TripHistoryProps> = ({ completedTrips, cancelledTrips,dictionary }) => {
  const tripData = [
    { title:dictionary['navigation'].CompletedTrips || 'Completed Trips', value: completedTrips, color: 'green', icon: <CheckIcon /> },
    { title:dictionary['navigation'].CancelledTrips || 'Cancelled Trips', value: cancelledTrips, color: 'info', icon: <CancelIcon /> },
  ];

  return (
    <div className="mb-4">
      <Typography variant="body2" style={{ color: 'rgba(47, 43, 61, 0.9)' }}>
        {dictionary['navigation'].TripHistory || 'Trip History'}
      </Typography>

      <Grid container spacing={2} className="mt-2 mb-2">
        {tripData.map((item, i) => (
          <Grid item xs={12} sm={6} key={i} className="flex gap-1">
            <Avatar variant="rounded" sx={{ bgcolor: item.color === 'green' ? 'green.500' : 'red.500' }}>
              {item.value}
            </Avatar>
            <div>
              <Typography className="mt-3 font-medium" style={{ fontSize: '85%' }} >{item.title}</Typography>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* <div className="flex flex-wrap gap-2 mt-5">
        {tripIds.map((tripId) => (
          <Button
            key={tripId}
            variant="contained"
            color="primary"
            className="bg-primary-500 hover:bg-primary-900"
            style={{ padding: '4px 5px', fontSize: '0.55rem' }}
          >
            {tripId}
          </Button>
        ))}
      </div> */}
    </div>
  );
};

export default TripHistory;
