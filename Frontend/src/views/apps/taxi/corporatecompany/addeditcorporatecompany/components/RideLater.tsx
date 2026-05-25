import React from 'react';

import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { Grid, MenuItem, Divider, Typography } from '@mui/material';

import { validateNumeric } from '@/utils/validation';
import CustomTextField from '@core/components/mui/TextField';
import type { VehicleType } from '../CorporateCompanyForm';

interface RideLaterProps {
  control: Control<any>
  selectedVehicles: VehicleType[]
  isRideNow: boolean
}

interface FieldConfig {
  label: string
  name: string
  options?: string[]
  select?: boolean
  sm: number
  required: boolean
  validate?: (value: string) => boolean | string
}

const RideLater: React.FC<RideLaterProps> = ({ control, selectedVehicles, isRideNow }) => {
  // Common field configuration
  const fields: FieldConfig[] = [
    { 
      label: 'Base KM*', 
      name: isRideNow ? 'ridenowBaseDistance' : 'ridelaterBaseDistance', 
      options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '20', '25', '30'], 
      select: true, 
      sm: 3, 
      required: true 
    },
    { 
      label: 'Base Price (Kilometer)*', 
      name: isRideNow ? 'ridenowBasePrice' : 'ridelaterBasePrice', 
      sm: 3, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Price per Distance (Kilometer)*', 
      name: isRideNow ? 'ridenowPricePerDistance' : 'ridelaterPricePerDistance', 
      sm: 3, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Price per Time*', 
      name: isRideNow ? 'ridenowPricePerTime' : 'ridelaterPricePerTime', 
      sm: 3, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Free Waiting Time (Minutes)*', 
      name: isRideNow ? 'ridenowFreeWaitingTime' : 'ridelaterFreeWaitingTime', 
      sm: 4, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Free Waiting Time After Start (Minutes)*', 
      name: isRideNow ? 'ridenowFreeWaitingTimeAfterStart' : 'ridelaterFreeWaitingTimeStart', 
      sm: 4, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Waiting Charge*', 
      name: isRideNow ? 'ridenowWaitingCharge' : 'ridelaterWaitingCharge', 
      sm: 4, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Cancellation Fee After Accept*', 
      name: isRideNow ? 'ridenowCancellationFeeAfterAccept' : 'ridelaterCancellationFeeAfterAccept', 
      sm: 4, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Cancellation Fee After Arrive*', 
      name: isRideNow ? 'ridenowCancellationFeeAfterArrive' : 'ridelaterCancellationFeeAfterArrive', 
      sm: 4, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Cancellation Fee After Start*', 
      name: isRideNow ? 'ridenowCancellationFeeAfterStart' : 'ridelaterCancellationFeeAfterStart', 
      sm: 4, 
      required: true,
      validate: validateNumeric 
    },
    { 
      label: 'Admin Commission Type*', 
      name: isRideNow ? 'ridenowAdminCommissionType' : 'ridelaterAdminCommissionType', 
      select: true, 
      options: ['Fixed', 'Percentage'], 
      sm: 6, 
      required: true 
    },
    { 
      label: 'Admin Commission*', 
      name: isRideNow ? 'ridenowAdminCommission' : 'ridelaterAdminCommission', 
      sm: 6, 
      required: true,
      validate: validateNumeric 
    }
  ];

  return (
    <Grid container spacing={3}>
      {selectedVehicles.map((vehicle) => (
        <React.Fragment key={vehicle.id}>
          {/* Vehicle Name Header */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold">
              {vehicle.vehicleName.toUpperCase()}
            </Typography>
          </Grid>
          
          {/* Form Fields */}
          {fields.map(({ label, name, select, options, sm, required, validate }) => (
            <Grid item xs={12} sm={sm} key={name}>
              <Controller
                name={`vehicleDetails.${vehicle.id}.${name}`}
                control={control}
                rules={{
                  required: required ? `${label} is required` : false,
                  ...(validate ? { validate } : {})
                }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select={select}
                    fullWidth
                    label={label}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {select && options?.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default RideLater;