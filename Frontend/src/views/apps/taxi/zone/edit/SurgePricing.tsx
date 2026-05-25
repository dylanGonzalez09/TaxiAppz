/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useEffect } from 'react';

import { Box, Grid, Typography, IconButton, Divider, InputAdornment } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import DeleteIcon from '@mui/icons-material/Delete';

import { validateNumber } from '@/utils/validation';

import CustomTextField from '@core/components/mui/TextField'; // Adjust path if needed
import CustomAutocomplete from '@core/components/mui/Autocomplete'; // Adjust path if needed
import { deleteByZoneSurgePriceId } from '@/app/api/apps/taxi/zone';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface SurgePriceRow {
  _id?: string;
  surgePrice?: string;
  surgeDistancePrice?: string;
  startTime?: string;
  endTime?: string;
  availableDays?: string[];
  timeError?: string; // For timing validation errors
  surgePriceError?: string; // For error handling
  surgeDistancePriceError?: string; // For error handling

}

interface SurgePricingProps {
  selectedVehicles: any[];
  onSurgePriceChange: (surgePriceData: Record<string, SurgePriceRow[]>) => void;
  existingSurgePrices?: Record<string, SurgePriceRow[]>; // Prop for existing surge prices
  dictionary: any;
  currency?: any;
}

const SurgePricing: React.FC<SurgePricingProps> = ({
  selectedVehicles,
  onSurgePriceChange,
  existingSurgePrices,
  dictionary,
  currency,
}) => {
  const [surgePriceRows, setSurgePriceRows] = useState<Record<string, SurgePriceRow[]>>({});

  const [removedItems, setRemovedItems] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (Object.keys(surgePriceRows).length === 0 && selectedVehicles.length > 0) {
      const initialSurgePriceRows = selectedVehicles.reduce((acc, vehicle) => {
        return {
          ...acc,
          [vehicle.id]: existingSurgePrices?.[vehicle.id]?.map(price => ({
            _id: price._id?.toString(),
            surgePrice: price.surgePrice?.toString(),
            surgeDistancePrice: price.surgeDistancePrice?.toString(),
            startTime: price.startTime || '',
            endTime: price.endTime || '',
            availableDays: price.availableDays || [],
          })) || [{}],
        };
      }, {});

      setSurgePriceRows(initialSurgePriceRows);
    }
  }, [selectedVehicles, existingSurgePrices, surgePriceRows]);

  useEffect(() => {
    if (JSON.stringify(surgePriceRows) !== JSON.stringify(existingSurgePrices)) {
      onSurgePriceChange(surgePriceRows);
    }
  }, [surgePriceRows, onSurgePriceChange, existingSurgePrices]);

  const addRow = useCallback((vehicleId: string) => {
    setSurgePriceRows((prevData) => ({
      ...prevData,
      [vehicleId]: [...(prevData[vehicleId] || []), {}],
    }));
  }, []);

  
  const removeRow = useCallback((vehicleId: string, rowIndex: number) => {
    setSurgePriceRows((prevData) => {
      // Check if vehicle exists and row index is valid
      if (!prevData[vehicleId] || rowIndex < 0 || rowIndex >= prevData[vehicleId].length) {
        return prevData;
      }
  
      // Get the item being removed
      const removedItem = prevData[vehicleId][rowIndex];

      if(removedItem){
         deleteByZoneSurgePriceId(""+removedItem._id);
      }
  
      // Update removed items state
      setRemovedItems((prevRemoved) => ({
        ...prevRemoved,
        [vehicleId]: [...(prevRemoved[vehicleId] || []), removedItem],
      }));
  
      // Return updated rows without the removed item
      return {
        ...prevData,
        [vehicleId]: prevData[vehicleId].filter((_, i) => i !== rowIndex),
      };
    });
  }, []);

  const updateRow = useCallback((vehicleId: string, rowIndex: number, field: string, value: any) => {
    setSurgePriceRows((prevData) => {
      const updatedRows = prevData[vehicleId].map((row, i) => {
        if (i === rowIndex) {
          const newRow = { ...row, [field]: value };

          // Validate numeric fields
          if (field === 'surgePrice') {

            const validation = validateNumber(value, dictionary);

            newRow.surgePriceError = validation === true ? undefined : validation;

          } else if (field === 'surgeDistancePrice') {

            const validation = validateNumber(value, dictionary);

            newRow.surgeDistancePriceError = validation === true ? undefined : validation;

          }


          // Validate time fields
          if (newRow.startTime && newRow.endTime) {
            if (newRow.startTime >= newRow.endTime) {
              newRow.timeError = "End Time must be After Start Time.";
            } else {
              newRow.timeError = undefined; // Clear error if validation passes
            }
          }


          return newRow;
        }


        return row;
      });

      return {
        ...prevData,
        [vehicleId]: updatedRows,
      };
    });
  }, []);

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
                 
                   //  error={Boolean(row.startTimeError)}
                  //  helperText={row.startTimeError}
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
                   error={Boolean(row.timeError)}
                  helperText={row.timeError}
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
