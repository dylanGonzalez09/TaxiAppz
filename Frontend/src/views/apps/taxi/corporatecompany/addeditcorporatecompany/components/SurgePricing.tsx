
import React, { useState, useEffect, useRef } from 'react';

import { Box, Grid, Typography, IconButton, Divider, InputAdornment } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

import CustomTextField from '@core/components/mui/TextField';
import CustomAutocomplete from '@core/components/mui/Autocomplete';

import type { VehicleType, SurgePriceData } from '../CorporateCompanyForm';

// Days of the week
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface SurgePricingProps {
  selectedVehicles: VehicleType[];
  onSurgePriceChange: (surgePriceData: Record<string, SurgePriceData[]>) => void;
  initialData?: Record<string, SurgePriceData[]>;
  dictionary: Record<string, any>;
}

const SurgePricing: React.FC<SurgePricingProps> = ({ 
  selectedVehicles, 
  onSurgePriceChange, 
  initialData,
  dictionary
}) => {
  // Track if this is the first render
  const isFirstRender = useRef(true);
  const prevInitialData = useRef<Record<string, SurgePriceData[]> | undefined>(initialData);
  
  // Store surge pricing data
  const [surgePriceData, setSurgePriceData] = useState<Record<string, SurgePriceData[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get currency symbol from dictionary if available
  const currency = dictionary?.currency?.symbol || '';
  
  // Initialize data structure from props or create new - ONLY on first render or when vehicles/initialData actually change
  useEffect(() => {
    // Skip if it's not the first render and initialData hasn't changed
    if (!isFirstRender.current && 
        JSON.stringify(prevInitialData.current) === JSON.stringify(initialData)) {
      return;
    }
    
    const validVehicles = selectedVehicles.filter(v => v && v.id);
    
    if (initialData && Object.keys(initialData).length > 0) {
      // Filter out any entries for vehicles that no longer exist
      const cleanedData = { ...initialData };
     
      Object.keys(cleanedData).forEach(key => {

        if (!validVehicles.some(v => v.id === key)) {
          delete cleanedData[key];
        }
     
      });
      
      // Add any new vehicles that don't have data yet
      validVehicles.forEach(vehicle => {
        if (!cleanedData[vehicle.id]) {
          cleanedData[vehicle.id] = [createEmptyRow()];
        }
      });
      
      setSurgePriceData(cleanedData);
      
      // Only notify parent on first render initialization, not on every update
      if (isFirstRender.current) {
        onSurgePriceChange(cleanedData);
      }
    } else {
      const newData: Record<string, SurgePriceData[]> = {};
      
      validVehicles.forEach(vehicle => {
        if (!newData[vehicle.id]) {
          newData[vehicle.id] = [createEmptyRow()];
        }
      });
      
      if (Object.keys(newData).length > 0) {
        setSurgePriceData(newData);
        
        // Only notify parent on first render initialization
        if (isFirstRender.current) {
          onSurgePriceChange(newData);
        }
      }
    }
    
    // Update refs for next render
    isFirstRender.current = false;
    prevInitialData.current = initialData;
  }, [initialData, selectedVehicles, onSurgePriceChange]);
  
  // Create an empty row
  const createEmptyRow = (): SurgePriceData => ({
    surgePrice: '',
    surgeDistancePrice: '',
    startTime: '',
    endTime: '',
    availableDays: []
  });
  
  // Add a new row for a vehicle
  const addRow = (vehicleId: string) => {
    setSurgePriceData(prev => {
      const updatedData = { ...prev };
      
      if (!updatedData[vehicleId]) {
        updatedData[vehicleId] = [];
      }
      
      updatedData[vehicleId] = [...updatedData[vehicleId], createEmptyRow()];
      
      // Notify parent of change
      setTimeout(() => onSurgePriceChange(updatedData), 0);
      
      return updatedData;
    });
  };
  
  // Remove a row
  const removeRow = (vehicleId: string, rowIndex: number) => {
    if (!surgePriceData[vehicleId] || surgePriceData[vehicleId].length <= 1) return;
    
    setSurgePriceData(prev => {
      const updatedData = { ...prev };
      
      updatedData[vehicleId] = updatedData[vehicleId].filter((_, i) => i !== rowIndex);
      
      // Notify parent of change
      setTimeout(() => onSurgePriceChange(updatedData), 0);
      
      return updatedData;
    });
  };
  
  // Update a field value
  const updateField = (vehicleId: string, rowIndex: number, field: keyof SurgePriceData, value: any) => {
    setSurgePriceData(prev => {
      const updatedData = { ...prev };
      
      if (!updatedData[vehicleId]) {
        updatedData[vehicleId] = [createEmptyRow()];
      }
      
      const updatedRows = [...updatedData[vehicleId]];
      
      updatedRows[rowIndex] = {


        ...updatedRows[rowIndex],
        [field]: value
      };
      
      // Validate time fields
      if ((field === 'startTime' || field === 'endTime') && 
          updatedRows[rowIndex].startTime && 
          updatedRows[rowIndex].endTime &&
          updatedRows[rowIndex].startTime >= updatedRows[rowIndex].endTime) {
        setErrors({
          ...errors,
          [`${vehicleId}-${rowIndex}-time`]: dictionary?.validation?.EndTimeMustBeAfterStartTime || "End time must be after start time"
        });
      } else if (field === 'startTime' || field === 'endTime') {
        const newErrors = { ...errors };
        
        delete newErrors[`${vehicleId}-${rowIndex}-time`];
        setErrors(newErrors);
      }
      
      updatedData[vehicleId] = updatedRows;
      
      // Notify parent of change (with a small delay to avoid state update conflicts)
      setTimeout(() => onSurgePriceChange(updatedData), 0);
      
      return updatedData;
    });
  };
  
  // Check if a row has a time error
  const hasTimeError = (vehicleId: string, rowIndex: number): boolean => {
    return !!errors[`${vehicleId}-${rowIndex}-time`];
  };

  // Get error message for a specific field
  const getErrorMessage = (vehicleId: string, rowIndex: number, field: string): string => {
    if (field === 'time') {
      return errors[`${vehicleId}-${rowIndex}-time`] || '';
    }
    

    return '';
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Header row with labels */}
      <Grid container spacing={2} sx={{ mb: 2, display: { xs: 'none', md: 'flex' } }}>
        <Grid item md={2} />
        <Grid item md={1.5}><Typography fontWeight="bold">{dictionary?.navigation?.SurgePrice || 'Surge Price'}</Typography></Grid>
        <Grid item md={1.5}><Typography fontWeight="bold">{dictionary?.navigation?.DistancePrice || 'Distance Price'}</Typography></Grid>
        <Grid item md={1.4}><Typography fontWeight="bold">{dictionary?.navigation?.StartTime || 'Start Time'}</Typography></Grid>
        <Grid item md={1.4}><Typography fontWeight="bold">{dictionary?.navigation?.EndTime || 'End Time'}</Typography></Grid>
        <Grid item md={3.5}><Typography fontWeight="bold">{dictionary?.navigation?.AvailableDays || 'Available Days'}</Typography></Grid>
      </Grid>

      {/* Render a section for each selected vehicle */}
      {selectedVehicles.map((vehicle, vehicleIndex) => (
        <Box key={vehicle.id} sx={{ mb: 1 }}>
          {surgePriceData[vehicle.id]?.map((row, rowIndex) => (
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
                      sx={{ color: 'success.main' }}
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
                  {dictionary?.navigation?.SurgePrice || 'Surge Price'}
                </Typography>
                <CustomTextField
                  fullWidth
                  placeholder={dictionary?.navigation?.SurgePrice || 'Surge Price'}
                  value={row.surgePrice}
                  onChange={(e) => updateField(vehicle.id, rowIndex, 'surgePrice', e.target.value)}
                  InputProps={{
                    startAdornment: currency ? (
                      <InputAdornment position="start">{currency}</InputAdornment>
                    ) : undefined,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={1.5} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary?.navigation?.DistancePrice || 'Distance Price'}
                </Typography>
                <CustomTextField
                  fullWidth
                  placeholder={dictionary?.navigation?.DistancePrice || 'Distance Price'}
                  value={row.surgeDistancePrice}
                  onChange={(e) => updateField(vehicle.id, rowIndex, 'surgeDistancePrice', e.target.value)}
                  InputProps={{
                    startAdornment: currency ? (
                      <InputAdornment position="start">{currency}</InputAdornment>
                    ) : undefined,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={1.4} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary?.navigation?.StartTime || 'Start Time'}
                </Typography>
                <CustomTextField
                  fullWidth
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateField(vehicle.id, rowIndex, 'startTime', e.target.value)}
                  error={hasTimeError(vehicle.id, rowIndex)}
                />
              </Grid>

              <Grid item xs={12} md={1.4} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary?.navigation?.EndTime || 'End Time'}
                </Typography>
                <CustomTextField
                  fullWidth
                  type="time"
                  value={row.endTime}
                  onChange={(e) => updateField(vehicle.id, rowIndex, 'endTime', e.target.value)}
                  error={hasTimeError(vehicle.id, rowIndex)}
                  helperText={getErrorMessage(vehicle.id, rowIndex, 'time')}
                />
              </Grid>

              <Grid item xs={12} md={3.5} sx={{ mb: { xs: 2, md: 0 } }}>
                <Typography variant="caption" sx={{ display: { xs: 'block', md: 'none' }, mb: 0.5 }}>
                  {dictionary?.navigation?.AvailableDays || 'Available Days'}
                </Typography>
                <CustomAutocomplete
                  multiple
                  limitTags={2}
                  options={DAYS_OF_WEEK}
                  value={row.availableDays || []}
                  onChange={(_, value) => updateField(vehicle.id, rowIndex, 'availableDays', value)}
                  renderInput={(params) => <CustomTextField {...params} placeholder={dictionary?.navigation?.SelectDays || "Select Days"} />}
                />
              </Grid>

              <Grid item xs={12} md={0.3} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' } }}>
                <IconButton 
                  onClick={() => removeRow(vehicle.id, rowIndex)} 
                  sx={{ color: 'error.main' }}
                  disabled={!surgePriceData[vehicle.id] || surgePriceData[vehicle.id].length <= 1}
                >
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