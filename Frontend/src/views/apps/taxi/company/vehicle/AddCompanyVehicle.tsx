/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, MenuItem, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';

import CustomTextField from '@core/components/mui/TextField';
import { createCompanyVehicle, updateCompanyVehicle, fetchVehiclesByZone } from '@apis/companyVehicle';
import { getByVehicleModelByVehicleId } from '@/app/api/apps/taxi/vehiclemodel';
import DialogCloseButton from '@/components/dialogs/DialogCloseButton';
import { validateNumeric } from '@/utils/validation';
import { useIsDemoUser } from '@/utils/demoUser';

// Type Definitions
type AddCompanyVehicleData = {
  registrationNumber: string;
  color?: string;
  seatingCapacity: string;
  vehicleId: string;
  vehicleModelId: string;
};

type CompanyVehicleType = {
  _id?: string;
  registrationNumber: string;
  color?: string;
  seatingCapacity: string | number;
  vehicleId: string;
  vehicleModelId: string;
  vehicleType?: string;
  vehicleModel?: string;
};

interface AddCompanyVehicleDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: CompanyVehicleType[];
  setData: (data: CompanyVehicleType[]) => void;
  handleClose: () => void;
  editVehicle: any | null;
  setEditVehicle: (vehicle: CompanyVehicleType | null) => void;
  count: number;
  page: number;
  onPageChange: (event: any, newPage: number) => void;
  rowsPerPage: number;
  dictionary: any;
}

const AddCompanyVehicleDrawer = ({ 
  open, 
  setOpen, 
  data, 
  setData, 
  handleClose, 
  editVehicle, 
  setEditVehicle, 
  count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary 
}: AddCompanyVehicleDrawerProps) => {
  const { control, handleSubmit, reset, setValue, formState: { errors }, watch } = useForm<AddCompanyVehicleData>({
    mode: 'all',
    defaultValues: {
      registrationNumber: '',
      color: '',
      seatingCapacity: '',
      vehicleId: '',
      vehicleModelId: ''
    }
  });

  const { checkDemoStatus } = useIsDemoUser();

  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const watchedVehicleId = watch('vehicleId');

  // Fetch vehicle types when drawer opens
  useEffect(() => {
    if (open) {
      const getVehicleTypes = async () => {
        try {
          setLoading(true);
          const response = await fetchVehiclesByZone();

          setVehicleTypes(response || []);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching vehicle types:", error);
          toast.error(dictionary['navigation']?.fetchDataError || 'Failed to fetch vehicle types');
          setVehicleTypes([]);
          setLoading(false);
        }
      };
      
      getVehicleTypes();
    }
  }, [open, dictionary]);

  // Fetch vehicle models when vehicle type changes
  useEffect(() => {
    if (!watchedVehicleId) {
      setVehicleModels([]);
      
return;
    }
    
    const getVehicleModels = async () => {
      try {
        setLoading(true);
        const response = await getByVehicleModelByVehicleId(watchedVehicleId);

        setVehicleModels(response || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicle models:", error);
        toast.error(dictionary['navigation']?.fetchVehicleModelsError || 'Failed to fetch vehicle models');
        setVehicleModels([]);
        setLoading(false);
      }
    };
    
    getVehicleModels();
  }, [watchedVehicleId, dictionary]);

  // Set form values when editing
  useEffect(() => {
    if (open && editVehicle) {
      reset({
        registrationNumber: editVehicle.registrationNumber || '',
        color: editVehicle.color || '',
        seatingCapacity: editVehicle.seatingCapacity?.toString() || '',
        vehicleId: editVehicle.vehicleId || '',
        vehicleModelId: editVehicle.vehicleModelId || ''
      });
    } else if (open) {
      reset({
        registrationNumber: '',
        color: '',
        seatingCapacity: '',
        vehicleId: '',
        vehicleModelId: ''
      });
    }
  }, [open, editVehicle, reset]);

  const onSubmit = async (formData: AddCompanyVehicleData) => {
    setLoading(true);

    try {
      // Create regular JSON object instead of FormData
      const vehicleData = {
        registrationNumber: formData.registrationNumber,
        color: formData.color || '',
        seatingCapacity: parseInt(formData.seatingCapacity), // Convert to number as backend expects
        vehicleId: formData.vehicleId,
        vehicleModelId: formData.vehicleModelId
      };

      if (editVehicle && editVehicle._id) {
        // Update existing vehicle
        const updatedVehicle = await updateCompanyVehicle(editVehicle._id, vehicleData);
        
        if (updatedVehicle) {
          const vehicleType = vehicleTypes.find(v => v.id === formData.vehicleId);
          const vehicleModel = vehicleModels.find(m => m.id === formData.vehicleModelId);

          const displayVehicle = {
            ...updatedVehicle,
            vehicleName: vehicleType?.vehicleName || updatedVehicle.vehicleType || '',
            vehicleModelName: vehicleModel?.modelname || updatedVehicle.vehicleModel || '',
          };
          
          setData(data.map((vehicle) => 
            vehicle._id === editVehicle._id ? displayVehicle : vehicle
          ));
          
          toast.success(dictionary['navigation']?.vehicleUpdatedSuccessfully || 'Vehicle updated successfully');
        }
      } else {
        // Create new vehicle
        const newVehicle = await createCompanyVehicle(vehicleData);
        
        if (newVehicle) {
          const vehicleType = vehicleTypes.find(v => v.id === formData.vehicleId);
          const vehicleModel = vehicleModels.find(m => m.id === formData.vehicleModelId);

          const displayVehicle = {
            ...newVehicle,
            vehicleName: vehicleType?.vehicleName || '',
            vehicleModelName: vehicleModel?.modelname || '',
          };
          
          setData([displayVehicle, ...data]);
          toast.success(dictionary['navigation']?.vehicleCreatedSuccessfully || 'New Vehicle created successfully');
          
          // Handle pagination if needed
          if (data.length >= rowsPerPage) {
            const newPage = Math.floor((count + 1) / rowsPerPage);

            onPageChange(null, newPage);
          }
        }
      }

      handleCloseDrawer();
    } catch (error) {
      console.error("Error submitting vehicle data:", error);
      toast.error(dictionary['navigation']?.errorProcessingRequest || 'An error occurred while processing the request');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setOpen(false);
    setEditVehicle(null);
    reset();
    setLoading(false);
  };

  const isSubmitDisabled = checkDemoStatus() || loading;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleCloseDrawer}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleCloseDrawer} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {editVehicle 
          ? (dictionary['navigation']?.editVehicle || 'Edit Vehicle Information') 
          : (dictionary['navigation']?.addVehicle || 'Add Vehicle Information')}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='registrationNumber'
                control={control}
                rules={{ required: dictionary['navigation']?.registrationNumberRequired || 'Registration Number is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation']?.registrationNumber || 'Registration Number *'}
                    placeholder={dictionary['navigation']?.enterRegistrationNumber || 'Enter registration number'}
                    error={!!errors.registrationNumber}
                    helperText={errors.registrationNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='color'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation']?.color || 'Color'}
                    placeholder={dictionary['navigation']?.enterColor || 'Enter color'}
                    error={!!errors.color}
                    helperText={errors.color?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='seatingCapacity'
                control={control}
                rules={{ 
                  required: dictionary['navigation']?.seatingCapacityRequired || 'Seating Capacity is required',
                  validate: value => validateNumeric(value, dictionary)
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation']?.seatingCapacity || 'Seating Capacity *'}
                    placeholder={dictionary['navigation']?.enterSeatingCapacity || 'Enter seating capacity'}
                    error={!!errors.seatingCapacity}
                    helperText={errors.seatingCapacity?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="vehicleId"
                control={control}
                rules={{ required: dictionary['navigation'].VehicleTypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].VehicleType}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setValue('vehicleModelId', ''); // Reset model when type changes
                    }}
                    error={!!errors.vehicleId}
                    helperText={errors.vehicleId?.message}
                  >
                    {vehicleTypes.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicleName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="vehicleModelId"
                control={control}
                rules={{ required: dictionary['navigation'].VehicleIsrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].VehicleModel}
                    {...field}
                    error={!!errors.vehicleModelId}
                    helperText={errors.vehicleModelId?.message}
                    disabled={!watch('vehicleId')}
                  >
                    {vehicleModels.length > 0 ? (
                      vehicleModels.map((vehicleModel) => (
                        <MenuItem key={vehicleModel.id} value={vehicleModel.id}>
                          {vehicleModel.modelname}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{dictionary['navigation'].Novehiclemodelsavailable}</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='gap-4 px-6 pb-4'>
          <Button variant='outlined' onClick={handleCloseDrawer}>
            {dictionary['navigation']?.cancel || 'Cancel'}
          </Button>

          <Button
            variant='contained'
            type='submit'
            disabled={isSubmitDisabled}
            sx={{ position: 'relative' }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }} />
                {dictionary['navigation']?.submitting || 'Submitting...'}
              </>
            ) : (
              editVehicle ? (dictionary['navigation']?.update || 'Update') : (dictionary['navigation']?.submit || 'Submit')
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCompanyVehicleDrawer;