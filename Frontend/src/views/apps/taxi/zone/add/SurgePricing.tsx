/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect } from 'react';

import { Box, Grid, Typography, IconButton, Divider, InputAdornment } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

// Custom components (Adjust paths if needed)
import CustomTextField from '@core/components/mui/TextField';
import CustomAutocomplete from '@core/components/mui/Autocomplete';
import { validateNumber } from '@/utils/validation';

// List of days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Interfaces for SurgePriceRow and SurgePricingProps
interface SurgePriceRow {
  surgePrice?: string;
  surgeDistancePrice?: string;
  startTime?: string;
  endTime?: string;
  availableDays?: string[];
  surgePriceError?: string; // For error handling
  surgeDistancePriceError?: string; // For error handling
  startTimeError?: string; // For start time validation error
  endTimeError?: string; // For end time validation error
}

interface SurgePricingProps {
  selectedVehicles: any[];
  onSurgePriceChange: (surgePriceData: Record<string, SurgePriceRow[]>) => void;
  dictionary?: any;
  currency?: string; // Currency symbol
}

const SurgePricing: React.FC<SurgePricingProps> = ({ selectedVehicles, onSurgePriceChange, dictionary, currency }) => {
  const [surgePriceRows, setSurgePriceRows] = useState<Record<string, SurgePriceRow[]>>({});

  // Initialize surge price rows when selectedVehicles changes
  useEffect(() => {
    const initialSurgePriceRows = selectedVehicles.reduce((acc, vehicle) => ({
      ...acc,
      [vehicle.id]: surgePriceRows[vehicle.id] || [{}] // Default to an empty row
    }), {});

    setSurgePriceRows(initialSurgePriceRows);
  }, [selectedVehicles]);

  // Notify parent component of changes to surgePriceRows
  useEffect(() => {
    onSurgePriceChange(surgePriceRows);
  }, [surgePriceRows, onSurgePriceChange]);

  // Add a new row for the specified vehicle
  const addRow = useCallback((vehicleId: string) => {
    setSurgePriceRows(prevData => ({
      ...prevData,
      [vehicleId]: [...(prevData[vehicleId] || []), {}] // Append an empty row
    }));
  }, []);

  // Remove a row for the specified vehicle
  const removeRow = useCallback((vehicleId: string, rowIndex: number) => {
    setSurgePriceRows(prevData => ({
      ...prevData,
      [vehicleId]: prevData[vehicleId].filter((_, i) => i !== rowIndex) // Remove row by index
    }));
  }, []);

  // Update a field value for a specific row and vehicle
  const updateRow = useCallback((vehicleId: string, rowIndex: number, field: string, value: any) => {
    const newRow = { ...surgePriceRows[vehicleId][rowIndex], [field]: value };

    // Validate numeric fields
    if (field === 'surgePrice') {
      const validation = validateNumber(value);

      newRow.surgePriceError = validation === true ? undefined : validation;
    } else if (field === 'surgeDistancePrice') {
      const validation = validateNumber(value);

      newRow.surgeDistancePriceError = validation === true ? undefined : validation;
    }

    // Validate time fields
  if (field === 'startTime' || field === 'endTime') {
  const startTime = field === 'startTime' ? value : newRow.startTime;
  const endTime = field === 'endTime' ? value : newRow.endTime;

  if (startTime && endTime) {
    if (startTime >= endTime) {
      newRow.startTimeError = "Start Time must be less than End Time.";
      newRow.endTimeError = "End Time must be after Start Time.";
    } else {
      newRow.startTimeError = undefined;
      newRow.endTimeError = undefined;
    }
  } else {
    newRow.startTimeError = undefined;
    newRow.endTimeError = undefined;
  }
}


    // Update the state with the new row data
    setSurgePriceRows(prevData => ({
      ...prevData,
      [vehicleId]: prevData[vehicleId].map((row, i) =>
        i === rowIndex ? newRow : row // Update the specific row
      )
    }));
  }, [surgePriceRows]);

  return (
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Header row with labels */}
      <Grid container spacing={2} sx={{ mb: 2, display: { xs: 'none', md: 'flex' } }}>
        <Grid item md={2} />
        <Grid item md={1.5}><Typography fontWeight="bold">{dictionary['navigation'].SurgePrice}</Typography></Grid>
        <Grid item md={1.5}><Typography fontWeight="bold">{dictionary['navigation'].DistancePrice}</Typography></Grid>
        <Grid item md={1.4}><Typography fontWeight="bold">{dictionary['navigation'].StartTime}</Typography></Grid>
        <Grid item md={1.4}><Typography fontWeight="bold">{dictionary['navigation'].EndTime}</Typography></Grid>
        <Grid item md={3.5}><Typography fontWeight="bold">{dictionary['navigation'].AvailableDays}</Typography></Grid>
      </Grid>

      {/* Render a section for each selected vehicle */}
      {selectedVehicles.map((vehicle, vehicleIndex) => (
        <Box key={vehicle.id} sx={{ mb: 1 }}>
          {surgePriceRows[vehicle.id]?.map((row, rowIndex) => (
            <Grid 
              container 
              spacing={2} 
              alignItems="flex-start" 
              key={`${vehicle.id}-${rowIndex}`} 
              sx={{ 
                mb: 3,
                flexDirection: { xs: 'column', md: 'row' }
              }}
            >
              <Grid item xs={12} md={2.0} sx={{ mb: { xs: 2, md: 0 } }}>
                {rowIndex === 0 && (
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent={{ xs: 'flex-start', md: 'center' }}
                    sx={{ height: '100%', textAlign: 'center' }}
                  >
                    <IconButton
                      onClick={() => addRow(vehicle.id)}
                      sx={{ color: 'green' }}
                    >
                      <AddCircleOutlineIcon sx={{ fontSize: { xs: 40, md: 60 } }} />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                      {vehicle.vehicleName.toUpperCase()}
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={1.5} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary['navigation'].SurgePrice}
                </Typography>
                <CustomTextField
                  fullWidth
                  placeholder={dictionary['navigation'].SurgePrice}
                  value={row.surgePrice}
                  onChange={(e) => updateRow(vehicle.id, rowIndex, 'surgePrice', e.target.value)}
                  error={Boolean(row.surgePriceError)}
                  helperText={row.surgePriceError}
                  InputProps={{
                    startAdornment: currency && (
                      <InputAdornment position="start">{currency}</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={1.5} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary['navigation'].DistancePrice}
                </Typography>
                <CustomTextField
                  fullWidth
                  placeholder={dictionary['navigation'].SurgeDistancePrice}
                  value={row.surgeDistancePrice}
                  onChange={(e) => updateRow(vehicle.id, rowIndex, 'surgeDistancePrice', e.target.value)}
                  error={Boolean(row.surgeDistancePriceError)}
                  helperText={row.surgeDistancePriceError}
                  InputProps={{
                    startAdornment: currency && (
                      <InputAdornment position="start">{currency}</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={1.4} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary['navigation'].StartTime}
                </Typography>
                <CustomTextField
                  fullWidth
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateRow(vehicle.id, rowIndex, 'startTime', e.target.value)}
                  error={Boolean(row.startTimeError)}
                  helperText={row.startTimeError}
                />
              </Grid>

              <Grid item xs={12} md={1.4} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary['navigation'].EndTime}
                </Typography>
                <CustomTextField
                  fullWidth
                  type="time"
                  value={row.endTime}
                  onChange={(e) => updateRow(vehicle.id, rowIndex, 'endTime', e.target.value)}
                  error={Boolean(row.endTimeError)}
                  helperText={row.endTimeError}
                />
              </Grid>

              <Grid item xs={12} md={3.5} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary['navigation'].AvailableDays}
                </Typography>
                <CustomAutocomplete
                  multiple
                  limitTags={2}
                  options={daysOfWeek}
                  value={row.availableDays || []}
                  onChange={(event, newValue) => updateRow(vehicle.id, rowIndex, 'availableDays', newValue)}
                  renderInput={(params) => <CustomTextField {...params} placeholder="Select Days" />}
                />
              </Grid>

              <Grid item xs={12} md={0.3} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' } }}>
                <IconButton onClick={() => removeRow(vehicle.id, rowIndex)} sx={{ color: 'red' }}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          {vehicleIndex < selectedVehicles.length - 1 && (
            <Divider sx={{ my: 3 }} />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default SurgePricing;
