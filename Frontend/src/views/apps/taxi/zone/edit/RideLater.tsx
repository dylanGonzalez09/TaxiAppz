/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';


import React, { useEffect } from 'react';

import { Controller } from 'react-hook-form';

import {
  Grid,
  MenuItem,
  Divider,
  Typography,
  InputAdornment,
} from '@mui/material';

import { validateNumber } from '@/utils/validation';
import CustomTextField from '@core/components/mui/TextField';

interface StepProps {
  control: any;
  unit: any;
  setValue: any;
  selectedVehicles: any[];
  isRideNow: boolean;
  existingValues?: Record<string, any>;
  onPricingChange: (vehicleId: string, name: string, value: string) => void;
  dictionary: any;
  currency?: any;
}

const RideLater: React.FC<StepProps> = ({
  control,
  unit,
  setValue,
  existingValues,
  selectedVehicles,
  isRideNow,
  onPricingChange,
  dictionary,
  currency,
}) => {
  useEffect(() => {
    if (existingValues) {
      selectedVehicles.forEach((vehicle) => {
        const vehicleId = vehicle.id;
        
        Object.keys(existingValues[vehicleId] || {}).forEach((name) => {
          setValue(`vehicleDetails.${vehicleId}.${name}`, existingValues[vehicleId][name]);
        });
      });
    }
  }, [existingValues, selectedVehicles, setValue]);

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
            { labelKey: 'baseDistance', name: isRideNow ? 'ridenowBaseDistance' : 'ridelaterBaseDistance', sm: 3, required: true, validate: validateNumber, hasCurrency: false, labelNeedsUnit: true },
            { labelKey: 'basePrice', name: isRideNow ? 'ridenowBasePrice' : 'ridelaterBasePrice', sm: 3, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: true },
            { labelKey: 'pricePerDistance', name: isRideNow ? 'ridenowPricePerDistance' : 'ridelaterPricePerDistance', sm: 3, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: true },
            { labelKey: 'pricePerTime', name: isRideNow ? 'ridenowPricePerTime' : 'ridelaterPricePerTime', sm: 3, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: false },
            { labelKey: 'freeWaitingTime', name: isRideNow ? 'ridenowFreeWaitingTime' : 'ridelaterFreeWaitingTime', sm: 4, required: true, validate: validateNumber, hasCurrency: false, labelNeedsUnit: false },
            { labelKey: 'freeWaitingTimeAfterStart', name: isRideNow ? 'ridenowFreeWaitingTimeAfterStart' : 'ridelaterFreeWaitingTimeStart', sm: 4, required: true, validate: validateNumber, hasCurrency: false, labelNeedsUnit: false },
            { labelKey: 'waitingCharge', name: isRideNow ? 'ridenowWaitingCharge' : 'ridelaterWaitingCharge', sm: 4, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: false },
            { labelKey: 'adminCommissionType', name: isRideNow ? 'ridenowAdminCommissionType' : 'ridelaterAdminCommissionType', select: true, options: ['Fixed', 'Percentage'], sm: 6, required: true, hasCurrency: false, labelNeedsUnit: false },
            { labelKey: 'adminCommission', name: isRideNow ? 'ridenowAdminCommission' : 'ridelaterAdminCommission', sm: 6, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: false },
          ].map(({ labelKey, name, select, options, sm, required, validate, hasCurrency, labelNeedsUnit }) => {
            const baseLabel = dictionary?.navigation?.[labelKey] || labelKey;
            const label = labelNeedsUnit ? `${baseLabel} (${unit})` : baseLabel;

            return (
              <Grid item xs={12} sm={sm} key={name}>
                <Controller
                  name={`vehicleDetails.${vehicle.id}.${name}`}
                  control={control}
                  rules={{
                    required: required ? `${label} is required` : false,
                    ...(validate ? { validate: (value) => validate(value, dictionary) } : {}),
                  }}
                  render={({ field, fieldState }) => {
                    const inputProps = hasCurrency
                      ? {
                          startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                        }
                      : undefined;

                    return (
                      <CustomTextField
                        {...field}
                        select={select}
                        fullWidth
                        label={label}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        onChange={(e) => {
                          const value = e.target.value;
                          
                          field.onChange(value);
                          setValue(`vehicleDetails.${vehicle.id}.${name}`, value);
                          onPricingChange(vehicle.id, name, value);
                        }}
                        InputProps={inputProps}
                      >
                        {select &&
                          options?.map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                      </CustomTextField>
                    );
                  }}
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
};

export default RideLater;
