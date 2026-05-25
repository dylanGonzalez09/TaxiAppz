/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent} from 'react';
import React, { useEffect, useState, useRef } from 'react';

import {
  IconButton,
  Divider,
  Button,
  InputAdornment,
  Drawer,
  Typography,
  Grid,
  MenuItem,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import CustomTextField from '@core/components/mui/TextField'; // Adjust path as necessary
import { BASE_IMAGE_URL } from '@apis/endpoint';
import { createVehicleModel, updateVehicleModel } from '@apis/vehiclemodel';
import { fetchVehicle } from '@apis/vehicle';
import { useIsDemoUser } from '@/utils/demoUser' 

import { validateTextOnly, validateImage } from '@/utils/validation';

interface AddVehicleModelDrawerProps {
  open: boolean;
  handleClose: () => void;
  vehicleData: any;
  dictionary: { [key: string]: { [key: string]: string } };
  editData?: any;
  setData: any;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  vehicleId: string;
}

interface FormValues {
  modelname: string;
  image: FileList | null;
  vehicleId: string;
}

const AddVehicleModelDrawer: React.FC<AddVehicleModelDrawerProps> = ({
  open,
  handleClose,
  vehicleData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dictionary,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  vehicleId
}) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;
  const vehicleImageRef = useRef<HTMLInputElement | null>(null);

  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      modelname: '',
      image: null,
      vehicleId: ''
    },
  });

 useEffect(() => {
  const fetchVehicles = async () => {
    try {
      const response = await fetchVehicle();

      setVehicles(response);

      // Now that vehicles are loaded, set values if in edit mode
      // if (editData) {
      //   setValue('modelname', editData.modelname || '');
      //   setValue('vehicleId', editData.vehicleId || '');
      //   setVehicleImagePreview(editData.image ? `${BASE_IMAGE_URL}${editData.image}` : null);
      // }
    } catch (error) {
      toast.error('Failed to load vehicles');
    }

    // fetchVehicles();

    if (editData) {
      setValue('modelname', editData.modelname || '');
      setValue('vehicleId', editData.vehicleid || '');
      setVehicleImagePreview(editData.image ? `${BASE_IMAGE_URL}/uploads/vehicleModels/${editData.image}` : null);
    } else {
      reset();
      
      if (vehicleImageRef.current) {
        vehicleImageRef.current.value = ''; 
      
      }
      
      setVehicleImagePreview(null);
    }
  };

  fetchVehicles();

  if
   (!editData) {
    reset();
    
    if (vehicleImageRef.current) {
      vehicleImageRef.current.value = ''; 
    
    }
   
    setVehicleImagePreview(null);
  }
}, [editData, reset, setValue]);

  // Helper function to handle page change logic
  const handlePageChangeForAddRecord = (count: number, rowsPerPage: number, onPageChange: (event: ChangeEvent<unknown>, page: number) => void) => {
    const newPage = Math.floor(count / rowsPerPage);

    // Create a dummy event object
    const dummyEvent = {
      target: {
        value: newPage,
      },
      currentTarget: {
        value: newPage,
      },
      nativeEvent: {} as Event,
      bubbles: false,
    } as unknown as ChangeEvent<unknown>;

    // Trigger onPageChange with the new page
    onPageChange(dummyEvent, 1);
  };

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      const formData = new FormData();

      formData.append('modelname', data.modelname);
      formData.append('vehicleId', vehicleId);

      if (data.image?.[0]) {
        formData.append('image', data.image[0]);
      }

      let response;

      if (editData) {
        formData.append('status', editData.status);
        response = await updateVehicleModel(editData._id, formData);
      } else {
        formData.append('status', 'true');
        response = await createVehicleModel(formData);
      }

      if (response) {
        const newItem = {
          id: response.id,
          modelname: response.modelname,
          image: response.image,
          vehicleId: response.vehicleId,
          status: response.status,
        };

        const updatedVehicleData = editData
          ? vehicleData.map((item: { id: string }) => (item.id === newItem.id ? newItem : item))
          : [newItem,...vehicleData];

          setData(updatedVehicleData);
          handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);


        // if (rowsPerPage != vehicleData.length || editData) {
        //   setData(updatedVehicleData);
        // } else {
        //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        
        // }

        toast.success(editData ? 'VehicleModel updated successfully' : 'VehicleModel created successfully');
        
        reset();
        
        if (vehicleImageRef.current) {
          vehicleImageRef.current.value = ''; 
        }
        
        handleClose();
      } else {
        throw new Error('API response error');
      }
    } catch (error) {
      toast.error('Error saving vehicle. Please try again.');
    } finally {
      setLoading(false); // Start loading

    }
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={() => {
        handleClose();
        reset();
      }}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, padding: 2 } }}
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditVehicleModel : dictionary['navigation'].AddVehicleModel}</Typography>
        <IconButton
          size='small'
          onClick={() => {
            handleClose();
            reset();
          }}
        >
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider/>
      <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='modelname'
                control={control}
                rules={{ required: dictionary['navigation'].ModelNameisrequired, 
                  // validate: value => validateTextOnly(value, dictionary) 
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].ModelName}
                    placeholder={dictionary['navigation'].EnterModelName}
                    error={!!errors.modelname}
                    helperText={errors.modelname?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              {vehicleImagePreview && (
                <img
                  src={vehicleImagePreview}
                  alt={dictionary['navigation'].VehicleImage}
                  style={{ width: '100px', height: 'auto', borderRadius: '4px', marginTop: '10px' }}
                />
              )}
             
 <Controller
  name='image'
  control={control}
  rules={{
   
    required: !editData ? dictionary['navigation'].Imageisrequired : false,
   
    validate: value => {
      if (!editData || (value && value.length > 0)) {
       
        return validateImage(value, dictionary);
      
      }
      
      return true;
    }
  }}
  render={({ field: { onChange } }) => (
    <CustomTextField
      type="file"
      fullWidth
      label={dictionary['navigation'].Image}
      margin="normal"
      inputProps={{ accept: 'image/*' }}  // <-- here is the fix
      onChange={e => {
        const input = e.target as HTMLInputElement;

        onChange(input.files);

        if (input.files && input.files[0]) {
          setVehicleImagePreview(URL.createObjectURL(input.files[0]));
        }
      }}
      inputRef={vehicleImageRef}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton>
              <i className="tabler-image" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      error={!!errors.image}
      helperText={errors.image?.message}
    />
  )}
/>

            </Grid>
       
            {/* <Grid item xs={12}>
              <Controller
                name='vehicleId'
                control={control}
                rules={{ required: dictionary['navigation'].Vehicleisrequired}}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Vehicle}
                    margin="normal"
                    variant="outlined"
                    {...field}
                    error={!!errors.vehicleId}
                    helperText={errors.vehicleId?.message}
                  >
                    {vehicles.map((vehicle: any) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicleName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid> */}
          </Grid>
          <div className='flex justify-end mt-4'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
            >
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
            </Button>
            <Button
              
              onClick={() => {
                
                handleClose();
                reset();
                
                if (vehicleImageRef.current) {
                  vehicleImageRef.current.value = '';
                }
                
                setVehicleImagePreview(null);
              }}
              variant='outlined'
              color='secondary'
              style={{ marginLeft: '10px' }}
            >
              {dictionary['navigation'].Cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddVehicleModelDrawer;
