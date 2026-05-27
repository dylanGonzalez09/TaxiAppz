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
  dictionary: any;
  currency?: any;
  vehicleZonePriceActive?: Record<string, boolean>;
  onVehicleZonePriceActiveChange?: (vehicleId: string, active: boolean) => void;
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
  vehicleZonePriceActive = {},
  onVehicleZonePriceActiveChange,
}) => {
  useEffect(() => {
    if (existingValues && selectedVehicles.length > 0) {
      const pricingObj = Array.isArray(existingValues)
        ? Object.fromEntries((existingValues as any[]).map((p: any) => [p.vehicleId || p.vehicle_id, p]))
        : existingValues;

      selectedVehicles.forEach((vehicle) => {
        const vehicleId = vehicle.id ?? vehicle._id;

        if (!vehicleId) return;

        const vehiclePricing = pricingObj[vehicleId]
          ?? Object.entries(pricingObj).find(([k]) => String(k) === String(vehicleId) || String(k) === String(vehicle._id))?.[1];

        if (vehiclePricing) {
          Object.keys(vehiclePricing).forEach((name) => {
            const formName = name;

            let val = vehiclePricing[name];

            if (val !== undefined && val !== null) {
              if (['Fixed', 'Percentage'].includes(String(val))) {
                val = String(val);
              } else if (['fixed', 'percentage'].includes(String(val).toLowerCase())) {
                val = String(val).charAt(0).toUpperCase() + String(val).slice(1).toLowerCase();
              }

              setValue(`vehicleDetails.${vehicleId}.${formName}`, val);
            }
          });
        }
      });
    }
  }, [existingValues, selectedVehicles, setValue, isRideNow]);

  return (
    <Grid container spacing={3}>
      {selectedVehicles.map((vehicle) => {
        const vid = String(vehicle.id ?? vehicle._id ?? '');
        const isActive = vehicleZonePriceActive[vid] !== false;

        // Field definitions
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
                          const value = e.target.value;

                          field.onChange(value);
                          setValue(`vehicleDetails.${vid}.${f.name}`, value);
                          onPricingChange(vid, f.name, value);
                        }}
                        InputProps={f.hasCurrency ? {
                          startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                        } : undefined}
                      >
                        {f.select && f.options?.map((option) => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
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

export default RideLater;
