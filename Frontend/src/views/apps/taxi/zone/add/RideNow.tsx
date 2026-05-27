/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';


import { Controller , useWatch } from 'react-hook-form';

import { Grid, MenuItem, Divider, InputAdornment, Typography } from '@mui/material';



import { validateNumber } from '@/utils/validation';
import CustomTextField from '@core/components/mui/TextField'; // Adjust path if needed


interface StepProps {
  control: any;
  unit: string;
  selectedVehicles: any[];
  isRideNow: boolean;
  currency?: any;
  dictionary: any;
}

const RideNow: React.FC<StepProps> = ({
  control,
  unit,
  selectedVehicles,
  isRideNow,
  currency,
  dictionary,
}) => {

  return (
    <Grid container spacing={3}>
      {selectedVehicles.map((vehicle) => (
        <React.Fragment key={vehicle.id}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold">
              {vehicle.vehicleName.toUpperCase()}
            </Typography>
          </Grid>

       {[
  { labelKey: 'baseDistance', name: isRideNow ? 'ridenowBaseDistance' : 'ridelaterBaseDistance', sm: 3, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: false, labelNeedsUnit: true },
  { labelKey: 'basePrice', name: isRideNow ? 'ridenowBasePrice' : 'ridelaterBasePrice', sm: 3, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: true, labelNeedsUnit: true },
  { labelKey: 'pricePerDistance', name: isRideNow ? 'ridenowPricePerDistance' : 'ridelaterPricePerDistance', sm: 3, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: true, labelNeedsUnit: true },
  { labelKey: 'pricePerTime', name: isRideNow ? 'ridenowPricePerTime' : 'ridelaterPricePerTime', sm: 3, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: true, labelNeedsUnit: false },
  { labelKey: 'freeWaitingTime', name: isRideNow ? 'ridenowFreeWaitingTime' : 'ridelaterFreeWaitingTime', sm: 4, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: false, labelNeedsUnit: false },
  { labelKey: 'freeWaitingTimeAfterStart', name: isRideNow ? 'ridenowFreeWaitingTimeAfterStart' : 'ridelaterFreeWaitingTimeStart', sm: 4, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: false, labelNeedsUnit: false },
  { labelKey: 'waitingCharge', name: isRideNow ? 'ridenowWaitingCharge' : 'ridelaterWaitingCharge', sm: 4, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: true, labelNeedsUnit: false },
  { labelKey: 'adminCommissionType', name: isRideNow ? 'ridenowAdminCommissionType' : 'ridelaterAdminCommissionType', select: true, options: ['Fixed', 'Percentage'], sm: 6, required: true, hasCurrency: false, labelNeedsUnit: false },
  { labelKey: 'adminCommission', name: isRideNow ? 'ridenowAdminCommission' : 'ridelaterAdminCommission', sm: 6, required: true, validate: (value: string | undefined) => validateNumber(value, dictionary), hasCurrency: true, labelNeedsUnit: false },
]
  .map(({ labelKey, name, select, options, sm, required, validate, hasCurrency, labelNeedsUnit }) => {
    const label = (dictionary?.navigation?.[labelKey] || labelKey) + (labelNeedsUnit ? ` (${unit})` : '');

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
            ...(validate ? { validate: validate } : {}),
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

  {/* 👇 Conditionally render Special Admin Commission Type and Value if special price is Yes */}
{(() => {
  const specialPriceValue = useWatch({
    control,
    name: `vehicleDetails.${vehicle.id}.${isRideNow ? 'ridenowSpecialPrice' : 'ridelaterSpecialPrice'}`
  });

  const specialAdminType = useWatch({
    control,
    name: `vehicleDetails.${vehicle.id}.${isRideNow ? 'ridenowSpecialAdminCommissionType' : 'ridelaterSpecialAdminCommissionType'}`
  });

  if (specialPriceValue === 'Yes') {
    const commissionName = `vehicleDetails.${vehicle.id}.${isRideNow ? 'ridenowSpecialAdminCommission' : 'ridelaterSpecialAdminCommission'}`;
    const typeName = `vehicleDetails.${vehicle.id}.${isRideNow ? 'ridenowSpecialAdminCommissionType' : 'ridelaterSpecialAdminCommissionType'}`;

    return (
      <>
        {/* Admin Commission Type */}
        <Grid item xs={12} sm={4}>
          <Controller
            name={typeName}
            control={control}
            rules={{ required: 'Admin Commision Type is required' }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label={dictionary['navigation'].AdminCommisionType}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                <MenuItem value="Fixed">Fixed</MenuItem>
                <MenuItem value="Percentage">Percentage</MenuItem>
              </CustomTextField>
            )}
          />
        </Grid>

        {/* Admin Commission Value */}
        <Grid item xs={12} sm={4}>
          <Controller
            name={commissionName}
            control={control}
            rules={{
              required: 'Admin Commision is required',
              validate: (value) => {
                if (!validateNumber(value, dictionary)) return 'Invalid number';

                if (specialAdminType === 'Percentage' && parseFloat(value) > 100) {
                  return 'Percentage must be 100 or below';
                }

                return true;
              },
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].AdminCommision}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {specialAdminType === 'Percentage' ? '%' : currency}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </>
    );
  }

  return null;
})()}


          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default RideNow;
