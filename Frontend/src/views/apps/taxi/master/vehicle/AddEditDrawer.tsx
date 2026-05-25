/* eslint-disable react-hooks/exhaustive-deps */
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
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';


import CustomTextField from '@core/components/mui/TextField'; // Adjust path as necessary
import { fetchCategories } from '@apis/category';
import { createVehicle, updateVehicle } from '@apis/vehicle';
import { BASE_IMAGE_URL } from '@apis/endpoint';
import { useIsDemoUser } from '@/utils/demoUser' 

import { validateTextOnly, validateImage, validateNumeric, validateAtLeastOneChecked,checkOrder } from '@/utils/validation';

interface AddVehicleDrawerProps {
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
}

interface FormValues {
  vehicleName: string;
  vehicleimage: FileList | null;
  imageHighlight: FileList | null;
  capacity: string;
  category: string;
  sortOrder: string;
  serviceType: string[];
}

const AddVehicleDrawer: React.FC<AddVehicleDrawerProps> = ({
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
  rowsPerPage
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null);
  const [imageHighlightPreview, setImageHighlightPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;
  const vehicleImageRef = useRef<HTMLInputElement | null>(null);
  const imageHighlightRef = useRef<HTMLInputElement | null>(null);

  const { handleSubmit, control, reset, setValue, getValues, formState: { errors } } = useForm<FormValues>({
    mode: 'all',

    defaultValues: {
      vehicleName: '',
      vehicleimage: null,
      imageHighlight: null,
      capacity: '',
      category: '',
      sortOrder: '',
      serviceType: [],
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetchCategories();

        setCategories(response);
      } catch (error) {
        toast.error(dictionary['navigation'].Failedtoloadcategories);
      }
    };

    fetchCategory();

    if (editData) {
      setValue('vehicleName', editData.vehicleName || '');
      setValue('capacity', editData.capacity?.toString() || '');

      // setValue('category', editData.categoryId || '');
      setValue('sortOrder', editData.sortingorder?.toString() || '');

      let parsedServiceType: string[] = [];

      if (typeof editData.serviceType === 'string') {
        try {
          parsedServiceType = JSON.parse(editData.serviceType);
        } catch (error) {
          console.warn('Failed to parse serviceType:', editData.serviceType, error);
          parsedServiceType = [];
        }
      } else if (Array.isArray(editData.serviceType)) {
        parsedServiceType = editData.serviceType;
      }

      setValue('serviceType', parsedServiceType);

      setVehicleImagePreview(editData.image ? `${BASE_IMAGE_URL}/uploads/vehicles/${editData.image}` : null);
      setImageHighlightPreview(editData.highlightImage ? `${BASE_IMAGE_URL}/uploads/vehicles/${editData.highlightImage}` : null);
    } else {
      reset();
      
      if (vehicleImageRef.current) {
        vehicleImageRef.current.value = ''; 
      }
      
      if (imageHighlightRef.current) {
        imageHighlightRef.current.value = '';
      }
      
      setVehicleImagePreview(null);
      setImageHighlightPreview(null);
    }
  }, [editData, setValue, reset, setVehicleImagePreview, setImageHighlightPreview]);


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

    onPageChange(dummyEvent, 1);
  };

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      const formData = new FormData();

      formData.append('vehicleName', data.vehicleName);
      formData.append('capacity', data.capacity || '');

      // formData.append('categoryId', data.category || '');
      formData.append('sortingorder', data.sortOrder || '');
      formData.append('serviceType', JSON.stringify(data.serviceType));

      if (data.vehicleimage?.[0]) {
        formData.append('image', data.vehicleimage[0]);
      }

      if (data.imageHighlight?.[0]) {
        formData.append('highlightImage', data.imageHighlight[0]);
      }

      let response;

      if (editData) {
        response = await updateVehicle(editData.id, formData);
      } else {
        formData.append('status', 'true');

        response = await createVehicle(formData);
      }

      if (response) {
        const newitem = {
          id: response.id,
          vehicleName: response.vehicleName,
          image: response.image,
          capacity: response.capacity,

          // categoryId: response.categoryId,
          serviceType: JSON.parse(response.serviceType),
          sortingorder: response.sortingorder,
          highlightImage: response.highlightImage,
          status: response.status,
        };

        const updatedVehicleData = editData
          ? vehicleData.map((item: { id: string }) => (item.id === newitem.id ? newitem : item))
          : [newitem, ...vehicleData];

        setData(updatedVehicleData);
        handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

        // if (rowsPerPage != vehicleData.length || editData) {
        //   setData(updatedVehicleData);
        // } else {
        //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        // }

        toast.success(editData ? 'Vehicle updated successfully' : 'Vehicle created successfully');
        reset();
        
        if (vehicleImageRef.current) {
          vehicleImageRef.current.value = ''; 
        }
        
        if (imageHighlightRef.current) {
          imageHighlightRef.current.value = '';
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleServiceTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const currentValue = getValues('serviceType');

    setValue('serviceType', currentValue.includes(value)
      ? currentValue.filter(item => item !== value)
      : [...currentValue, value]);
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
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5'>
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditVehicle : dictionary['navigation'].AddVehicle}</Typography>
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
      <Divider />
      <div >
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='vehicleName'
                control={control}
                rules={{ required: dictionary['navigation'].VehicleNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].VehicleName}                    
                    error={!!errors.vehicleName}
                    helperText={errors.vehicleName?.message}
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
                name='vehicleimage'
                control={control}
                rules={{ 
                  validate: {
                    required: (value) => {
                      const isEditMode = !!editData;
                      const hasExistingImage = !!editData?.image && editData.image !== 'undefined';
                      const needsValidation = !isEditMode || (isEditMode && !hasExistingImage);

                      if (needsValidation) {
                        return value && value.length > 0
                        ? true
                        : dictionary['navigation'].VehicleImageisrequired;
                      }

                      return true;
                    },

                    customValidation: (value) => {
                      if (value && value.length > 0) {
                      
                        return validateImage(value, dictionary); // Runs only if a file is selected
                      }
                     
                      return true;
                    }
                  }
                }}
                render={({ field: { onChange } }) => (
                  <CustomTextField
                    type="file"
                    fullWidth
                    label={dictionary['navigation'].VehicleImage}
                    margin="normal"
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
                    error={!!errors.vehicleimage}
                    helperText={errors.vehicleimage?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              {imageHighlightPreview && (
                <img
                  src={imageHighlightPreview}
                  alt="Image Highlight"
                  style={{ width: '100px', height: 'auto', borderRadius: '4px', marginTop: '10px' }}
                />
              )}
              <Controller
                name='imageHighlight'
                control={control}
                rules={{ 
                  validate: {
                    required: (value) => {
                      const isEditMode = !!editData;
                      const hasExistingImage = !!editData?.highlightImage && editData.highlightImage !== 'undefined';
                      const needsValidation = !isEditMode || (isEditMode && !hasExistingImage);

                      if (needsValidation) {
                        return value && value.length > 0
                        ? true
                        : dictionary['navigation'].ImageHighlightisrequired;
                      }

                      
                      return true;
                    
                    },
                  
                    customValidation: (value) => {
                      if (value && value.length > 0) {
                        
                        return validateImage(value, dictionary); // Runs only if a file is selected
                      }
                      
                      return true;
                    }
                  }
                }}

                render={({ field: { onChange } }) => (
                  <CustomTextField
                    type="file"
                    fullWidth
                    label={dictionary['navigation'].ImageHighlight}
                    margin="normal"
                    onChange={e => {
                      const input = e.target as HTMLInputElement;

                      onChange(input.files);

                      if (input.files && input.files[0]) {
                        setImageHighlightPreview(URL.createObjectURL(input.files[0]));
                      }
                    }}
                    inputRef={imageHighlightRef}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton>
                            <i className="tabler-image" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.imageHighlight}
                    helperText={errors.imageHighlight?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='capacity'
                control={control}
                rules={{ required: dictionary['navigation'].Capacityisrequired,validate: value => validateNumeric(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].capacity}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    {...field}
                    error={!!errors.capacity}
                    helperText={errors.capacity?.message}
                  />
                )}
              />
            </Grid>
            {/* <Grid item xs={12}>
              <Controller
                name='category'
                control={control}
                rules={{ required: dictionary['navigation'].Categoryisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Category}
                    margin="normal"
                    variant="outlined"
                    {...field}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.category}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid> */}
            <Grid item xs={12}>
              <Controller
                name='sortOrder'
                control={control}
                rules={{validate: value => checkOrder(value,editData ? editData.id:null,vehicleData,dictionary)}}
                render={({ field }) => (
                  <CustomTextField
                    type="number"
                    label={dictionary['navigation'].SortOrder}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    {...field}
                    error={!!errors.sortOrder}
                    helperText={errors.sortOrder?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Typography variant="subtitle1">{dictionary['navigation'].ServiceType}</Typography>
                <Controller
                  name="serviceType"
                  control={control}
                  rules={{ validate: value => validateAtLeastOneChecked(value, dictionary) }}
                  render={({ field }) => (
                    <FormGroup>
                      {[dictionary['navigation'].Rental, dictionary['navigation'].Local].map((type) => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              value={type}
                              checked={field.value.includes(type)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, type]
                                  : field.value.filter((item) => item !== type);

                                field.onChange(newValue);
                              }}
                            />
                          }
                          label={type}
                        />
                      ))}
                    </FormGroup>
                  )}
                />
                {errors.serviceType && <p style={{ color: 'red' }}>{errors.serviceType.message}</p>}
              </FormControl>
            </Grid>
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
                
                if (imageHighlightRef.current) {
                  imageHighlightRef.current.value = '';
                }
                
                setVehicleImagePreview(null);
               
                setImageHighlightPreview(null);
             
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

export default AddVehicleDrawer;
