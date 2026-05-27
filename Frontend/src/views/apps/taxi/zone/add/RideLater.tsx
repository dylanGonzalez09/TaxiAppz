/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';

import { Controller } from 'react-hook-form';

import { Grid, MenuItem, Divider, Typography, InputAdornment } from '@mui/material';

import { validateNumber } from '@/utils/validation';

import CustomTextField from '@core/components/mui/TextField'; // Adjust path if needed

interface StepProps {
  control: any;
  unit:string;
  selectedVehicles: any[];
  isRideNow: boolean;
  dictionary?: any;
  currency?: any; // Currency symbol
}

const RideLater: React.FC<StepProps> = ({ control,unit,selectedVehicles, isRideNow ,dictionary,currency}) => (
  <Grid container spacing={3}>
    {selectedVehicles.map(vehicle => (
      <React.Fragment key={vehicle.id}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold">
            {vehicle.vehicleName.toUpperCase()}
          </Typography>
        </Grid>
   {[
  { labelKey: `baseDistance`, name: isRideNow ? 'ridenowBaseDistance' : 'ridelaterBaseDistance',  sm: 3, required: true ,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:false,labelNeedsUnit: true },
  { labelKey: `basePrice`, name: isRideNow ? 'ridenowBasePrice' : 'ridelaterBasePrice', sm: 3, required: true ,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:true,labelNeedsUnit: true},
  { labelKey: `pricePerDistance`, name: isRideNow ? 'ridenowPricePerDistance' : 'ridelaterPricePerDistance', sm: 3, required: true ,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:true,labelNeedsUnit: true},
  { labelKey: 'pricePerTime', name: isRideNow ? 'ridenowPricePerTime' : 'ridelaterPricePerTime', sm: 3, required: true ,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:true,labelNeedsUnit: false},
  { labelKey: 'freeWaitingTime', name: isRideNow ? 'ridenowFreeWaitingTime' : 'ridelaterFreeWaitingTime', sm: 4, required: true ,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:false,labelNeedsUnit: false,},
  { labelKey: 'freeWaitingTimeAfterStart', name: isRideNow ? 'ridenowFreeWaitingTimeAfterStart' : 'ridelaterFreeWaitingTimeStart', sm: 4, required: true,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:false,labelNeedsUnit: false, },
  { labelKey: 'waitingCharge', name: isRideNow ? 'ridenowWaitingCharge' : 'ridelaterWaitingCharge', sm: 4, required: true,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:true,labelNeedsUnit: false, },
  { labelKey: 'adminCommissionType', name: isRideNow ? 'ridenowAdminCommissionType' : 'ridelaterAdminCommissionType', select: true, options: ['Fixed', 'Percentage'], sm: 6, required: true,hasCurrency:false,labelNeedsUnit: false, },
  { labelKey: 'adminCommission', name: isRideNow ? 'ridenowAdminCommission' : 'ridelaterAdminCommission', sm: 6, required: true,validate: (value: string | undefined) => validateNumber(value, dictionary),hasCurrency:true,labelNeedsUnit: false,  },
]
.map(({ labelKey, name, select, options, sm, required, validate, hasCurrency, labelNeedsUnit }) => {
  const label =
    (dictionary?.navigation?.[labelKey] || labelKey) + (labelNeedsUnit ? ` (${unit})` : '');

  const inputProps = hasCurrency
    ? {
        startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
      }
    : undefined;

  return (
    <Grid item xs={12} sm={sm} key={name}>
      <Controller
        name={`vehicleDetails.${vehicle.id}.${name}`}
        control={control}
        rules={{
          required: required ? `${label} is required` : false,
          ...(validate ? { validate } : {}),
        }}
        render={({ field, fieldState }) => (
          <CustomTextField
            {...field}
            select={select}
            fullWidth
            label={label}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            InputProps={inputProps}
          >
            {select &&
              options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
          </CustomTextField>
        )}
      />
    </Grid>
  );
})}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>
      </React.Fragment>
    ))}
  </Grid>
);

export default RideLater;
