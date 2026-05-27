/* eslint-disable react-hooks/rules-of-hooks */
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
  Box,
  FormControlLabel,
  Switch,
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
  currency?: any;
  dictionary?: any;
  vehicleZonePriceActive?: Record<string, boolean>;
  onVehicleZonePriceActiveChange?: (vehicleId: string, active: boolean) => void;
}

const RideNow: React.FC<StepProps> = ({
  control,
  unit,
  setValue,
  existingValues,
  selectedVehicles,
  isRideNow,
  onPricingChange,
  currency,
  dictionary,
  vehicleZonePriceActive = {},
  onVehicleZonePriceActiveChange,
}) => {
  useEffect(() => {
    if (existingValues) {
      selectedVehicles.forEach((vehicle) => {
        const vehicleId = String(vehicle.id ?? vehicle._id ?? '');

        if (!vehicleId) return;

        Object.keys(existingValues[vehicleId] || {}).forEach((name) => {
          setValue(`vehicleDetails.${vehicleId}.${name}`, existingValues[vehicleId][name]);
        });
      });
    }
  }, [existingValues, selectedVehicles, setValue]);

  return (
    <Grid container spacing={3}>
      {selectedVehicles.map((vehicle) => {
        const vid = String(vehicle.id ?? vehicle._id ?? '');
        const isActive = vehicleZonePriceActive[vid] !== false;

        // UseWatch at the top level of the map to keep it stable
        const fields = [
          { labelKey: 'baseDistance', name: isRideNow ? 'ridenowBaseDistance' : 'ridelaterBaseDistance', sm: 3, required: true, validate: validateNumber, hasCurrency: false, labelNeedsUnit: true },
          { labelKey: 'basePrice', name: isRideNow ? 'ridenowBasePrice' : 'ridelaterBasePrice', sm: 3, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: true },
          { labelKey: 'pricePerDistance', name: isRideNow ? 'ridenowPricePerDistance' : 'ridelaterPricePerDistance', sm: 3, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: true },
          { labelKey: 'pricePerTime', name: isRideNow ? 'ridenowPricePerTime' : 'ridelaterPricePerTime', sm: 3, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: false },
          { labelKey: 'freeWaitingTime', name: isRideNow ? 'ridenowFreeWaitingTime' : 'ridelaterFreeWaitingTime', sm: 4, required: true, validate: validateNumber, hasCurrency: false, labelNeedsUnit: false },
          { labelKey: 'freeWaitingTimeAfterStart', name: isRideNow ? 'ridenowFreeWaitingTimeAfterStart' : 'ridelaterFreeWaitingTimeStart', sm: 4, required: true, validate: validateNumber, hasCurrency: false, labelNeedsUnit: false },
          { labelKey: 'waitingCharge', name: isRideNow ? 'ridenowWaitingCharge' : 'ridelaterWaitingCharge', sm: 4, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: false },
          { labelKey: 'adminCommissionType', name: isRideNow ? 'ridenowAdminCommissionType' : 'ridelaterAdminCommissionType', select: true, options: ['Fixed', 'Percentage'], sm: 6, required: true, hasCurrency: false, labelNeedsUnit: false },
          { labelKey: 'adminCommission', name: isRideNow ? 'ridenowAdminCommission' : 'ridelaterAdminCommission', sm: 6, required: true, validate: validateNumber, hasCurrency: true, labelNeedsUnit: false },
        ];

        return (
          <React.Fragment key={vid}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                <Typography variant="subtitle1" fontWeight="bold">
                  {vehicle.vehicleName.toUpperCase()}
                </Typography>
                {onVehicleZonePriceActiveChange && (
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={isActive}
                        onChange={(_, checked) => onVehicleZonePriceActiveChange(vid, checked)}
                        color="primary"
                      />
                    )}
                    label={dictionary?.navigation?.ZoneVehicleActive ?? (isActive ? 'Enabled' : 'Disabled')}
                    labelPlacement="start"
                  />
                )}
              </Box>
            </Grid>

            {fields.map((f) => {
              const baseLabel = dictionary?.navigation?.[f.labelKey] || f.labelKey;
              const label = f.labelNeedsUnit ? `${baseLabel} (${unit})` : baseLabel;

              return (
                <Grid item xs={12} sm={f.sm} key={f.name}>
                  <Controller
                    name={`vehicleDetails.${vid}.${f.name}`}
                    control={control}
                    rules={{
                      required: isActive && f.required ? `${label} is required` : false,
                      ...(f.validate
                        ? {
                            validate: (value: string) =>
                              !isActive || f.validate!(value, dictionary),
                          }
                        : {}),
                    }}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        select={f.select}
                        fullWidth
                        disabled={!isActive}
                        label={label}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        onChange={(e) => {
                          const val = e.target.value;

                          field.onChange(e);

                          setValue(`vehicleDetails.${vid}.${f.name}`, val);
                          onPricingChange(vid, f.name, val);
                        }}
                        InputProps={f.hasCurrency ? {
                          startAdornment: <InputAdornment position="start">{currency}</InputAdornment>
                        } : undefined}
                      >
                        {f.select && f.options?.map((opt) => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
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
        );
      })}
    </Grid>
  );
};

export default RideNow;
