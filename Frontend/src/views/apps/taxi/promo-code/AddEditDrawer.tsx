/* eslint-disable import/no-unresolved */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Divider,
  Button,
  InputAdornment,
  Drawer,
  Typography,
  Grid,
  MenuItem,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  Chip,
} from '@mui/material';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import { Icon360 } from '@tabler/icons-react'; // Import the Tabler Pencil Minus icon

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'


import { useIsDemoUser } from '@/utils/demoUser'


import CustomTextField from '@core/components/mui/TextField'; // Adjust path as necessary


import { validateTextOnly } from '@/utils/validation';
import { fetchZone } from '@/app/api/apps/taxi/zone';
import { fetchUsers } from '@/app/api/apps/taxi/user';
import CustomAutocomplete from '@/@core/components/mui/Autocomplete';
import { createPromoCode, updatePromoCode } from '@/app/api/apps/taxi/promoCode';




interface AddPromoCodeModelDrawerProps {
  open: boolean;
  handleClose: () => void;
  promoData: any;
  dictionary: { [key: string]: { [key: string]: string } };
  editData?: any;
  setData: any;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
}

interface FormValues {
  
  // image: FileList | null;
  
  description: string;
  zoneId: string;
  Type: string;
  PromoType: string;
  userIds: string[];
  promoCode: string;
  totalCount: number;
  reuseCount: number;
  minAmount: number;
  promoAmount: number;
  promoPercentage: number;
  newUser: boolean;
  fromDate: Date | string;
  endDate: Date | string;
}

const generatePromoCode = () => {
  // Generate a promo code (example implementation)
  return '' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

const AddPromoCodeModelDrawer: React.FC<AddPromoCodeModelDrawerProps> = ({
  open,
  handleClose,
  promoData,
  dictionary,
  editData,
  setData, count,
  page,
  onPageChange,
  rowsPerPage

}) => {
  const [zones, setZones] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Assuming you have a users API
  // const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(null);
  // const [logo, setLogo] = useState<File | null>(null);
  const [promoCode, setPromoCode] = React.useState(generatePromoCode());
  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;
  const [selectedCurrency, setCurrency] = useState<string | null>(null);

  const { handleSubmit, control, reset, setValue, watch, getValues, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      description: '',
      zoneId: '',
      Type: '',
      PromoType: '',
      userIds: [],
      promoCode: '',
      totalCount: 1,
      reuseCount: 0,
      minAmount: 1,
      promoAmount: 1,
      promoPercentage: 1,
      newUser: false,
      fromDate: '',
      endDate: '',
    },
  });

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


  const handleGeneratePromoCode = () => {
  const code = generatePromoCode();

  setPromoCode(code);
  setValue('promoCode', code);
  };

  // Watch date values to validate end date
  const fromDate = watch('fromDate');
  const endDate = watch('endDate');

  // Validate end date is after start date
  useEffect(() => {
    if (fromDate && endDate && new Date(endDate) <= new Date(fromDate)) {
      setValue('endDate', '');
    }
  }, [fromDate, endDate, setValue]);

  useEffect(() => {
    const fetchZonesData = async () => {
      try {
        const response = await fetchZone();


        setZones(response);
      } catch (error) {
        toast.error('Failed to load zones');
      }
    };

    const fetchUsersData = async () => {
      try {
        const response = await fetchUsers();

        setUsers(response.results);
      } catch (error) {
        toast.error(dictionary['navigation'].Failedtoloadusers);
      }
    };

    fetchZonesData();
    fetchUsersData();

    if (editData) {
      setValue('description', editData.description || '');
      setValue('zoneId', editData.zoneId || '');
      setValue('Type', editData.promoType || '');
      setValue('PromoType', editData.promoCodeType || '');
      setValue('userIds', editData.userId || []);
      setValue('promoCode', editData.promoCode || '');
      setValue('totalCount', editData.totalCount || 0);
      setValue('reuseCount', editData.promoReuseCount || 0);
      setValue('minAmount', editData.targetAmount || 0);
      setValue('promoAmount', editData.amount || 0);
      setValue('promoPercentage', editData.percentage || 0);
      setValue('fromDate', editData.fromDate ? new Date(editData.fromDate).toISOString().split('T')[0] : '');
      
      setValue('endDate', editData.toDate ? new Date(editData.toDate).toISOString().split('T')[0] : '');
      
      // setVehicleImagePreview(editData.banner ? `${BASE_IMAGE_URL}${editData.banner}` : null);
      
      setValue('fromDate', editData.fromDate ? new Date(editData.fromDate) : '');
      setValue('endDate', editData.toDate ? new Date(editData.toDate) : '');
      setCurrency(editData.currency);
    } else {
      reset();
      setCurrency(null);

      // setVehicleImagePreview(null);
    }
  }, [editData, setValue, reset, dictionary]);

  const selectedType = watch('Type');
  const selectedPromoType = watch('PromoType');

  const handleFormSubmit = async (data: FormValues) => {
    // Additional validation to ensure end date is after start date
    if (new Date(data.endDate) <= new Date(data.fromDate)) {
      toast.error(dictionary['navigation'].EndDateMustBeAfterStartDate || 'End date must be after start date');
      
return;
    }

    setLoading(true); // Start loading

    try {
      const formData = new FormData();

      formData.append('description', data.description || '');
      formData.append('zoneId', data.zoneId || '');
      formData.append('promoType', data.Type || '');
      formData.append('promoCodeType', data.PromoType || '');
      formData.append('promoCode', data.promoCode || promoCode || '');
      formData.append('totalCount', data.totalCount.toString());
      formData.append('promoReuseCount', data.reuseCount.toString());
      formData.append('targetAmount', data.minAmount.toString());
      formData.append('newUser', data.newUser ? 'true' : 'false');
      
      // Format dates properly
      const fromDateStr = data.fromDate instanceof Date 
        ? data.fromDate.toISOString().split('T')[0] 
        : typeof data.fromDate === 'string' ? data.fromDate : '';
        
      const endDateStr = data.endDate instanceof Date 
        ? data.endDate.toISOString().split('T')[0] 
        : typeof data.endDate === 'string' ? data.endDate : '';
        
      formData.append('fromDate', fromDateStr);
      formData.append('toDate', endDateStr);

      if (data.userIds && data.userIds.length > 0) {
        data.userIds.forEach(userId => {
          formData.append('userId', userId); 
        });
      }

      if (data.Type === 'fixed') {
        formData.append('amount', data.promoAmount.toString());
      } else if (data.Type === 'percentage') {
        formData.append('percentage', data.promoPercentage.toString());
      }

      // if (data.image?.[0]) {
      //   formData.append('image', data.image[0]);
      // }


      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      let response;

      if (editData) {
        response = await updatePromoCode(editData.id, formData);
      } else {
        formData.append('status', 'true');
        response = await createPromoCode(formData);
      }

      if (response) {

         if (response.error) {
        toast.error(response.error);
        
return;
      }

        const newItem = {
          id: response.id,
          description: response.description,
          zoneId: response.zoneId,
          promoType: response.promoType,
          promoCodeType: response.promoCodeType,
          userId: response.userId,
          promoCode: response.promoCode,
          totalCount: response.totalCount,
          promoReuseCount: response.promoReuseCount,
          targetAmount: response.targetAmount,
          amount: response.amount,
          percentage: response.percentage,
          status: response.status,
          fromDate: response.fromDate,
          toDate: response.toDate
        };

        const updatedVehicleData = editData
          ? promoData.map((item: { id: string }) => (item.id === newItem.id ? newItem : item))
          : [newItem, ...promoData];

        setData(updatedVehicleData);
        handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

        // if (rowsPerPage != promoData.length || editData) {
        //   setData(updatedVehicleData);
        // } else {
        //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        // }


        toast.success(editData ? dictionary['navigation'].PromoCodeupdatedsuccessfully : dictionary['navigation'].PromoCodecreatedsuccessfully);
        reset();
        handleClose();
      } else {
        throw new Error('API response error');
      }
    } catch (error) {
      
      toast.error(dictionary['navigation'].ErrorsavingpromocodePleasetryagain);
    } finally {
      setLoading(false);
    }
  };



  // const handleLogoChange = (files: FileList | null) => {
  //   if (files && files[0]) {
  //     const file = files[0];

  //     setLogo(file);
  //     const reader = new FileReader();

  //     reader.onloadend = () => {
  //       setVehicleImagePreview(reader.result as string);
  //     };

  //     reader.readAsDataURL(file);
  //   }
  // };
  
  const selectedZoneId = watch('zoneId');

  useEffect(() => {
    if (selectedZoneId && zones.length > 0) {
      const selectedZone = zones.find(zone => zone._id === selectedZoneId);
      
      if (selectedZone?.currency) {
        setCurrency(selectedZone.currency);
      } else {
        setCurrency(null);
      }
    }
  }, [selectedZoneId, zones]);

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
      sx={{ '& .MuiDrawer-paper': { width: { xs: 400, sm: 600, md: 800 }, padding: 1 } }} // Adjusted drawer width
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditPromoCode : dictionary['navigation'].AddPromoCode}</Typography>
        <IconButton
          size='small'
          onClick={() => {
            handleClose();
            reset();
          }}
        >
          <i className='tabler-x text-textSecondary text-1xl' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Grid container spacing={1}>

            {/* Zone Selection */}
            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name='zoneId'
                control={control}
                rules={{ required: dictionary['navigation'].Zoneisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].SelectZone}
                    placeholder={dictionary['navigation'].SelectZone}
                    error={!!errors.zoneId}
                    helperText={errors.zoneId?.message}
                  >
                    {zones.map(option => (
                      <MenuItem key={option._id} value={option._id}>
                        {option.zoneName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Promo Type Dropdown */}
            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name="PromoType"
                control={control}
                rules={{ required: dictionary['navigation'].Promotypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].PromoType}
                    error={!!errors.PromoType}
                    helperText={errors.PromoType?.message}
                  >
                    <MenuItem value="newUser">{dictionary['navigation'].NewUser}</MenuItem>
                    <MenuItem value="individual">{dictionary['navigation'].Individual}</MenuItem>
                    <MenuItem value="festival">{dictionary['navigation'].Festival}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Conditionally Rendered Fields */}
            {selectedPromoType === 'individual' && (
              <Grid item xs={12} sm={6} p={4}>
                <Controller
                  name="userIds"
                  control={control}
                  rules={{ required: dictionary['navigation'].AtleastoneUserisrequired }}
                  render={({ field, fieldState }) => (
                    <CustomAutocomplete
                      multiple
                      options={users}
                      id="autocomplete-user-ids"
                      getOptionLabel={(option) => option.firstName || ''}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          label={dictionary['navigation'].AvailableUsers}
                          placeholder={dictionary['navigation'].Type}
                          error={Boolean(fieldState.error)}
                          helperText={fieldState.error?.message || ''}
                        />
                      )}
                      renderTags={(tagValue, getTagProps) =>
                        tagValue.map((option, index) => (
                          <Chip
                            label={option.firstName}
                            {...getTagProps({ index })}
                            key={option.id}
                            size="small"
                          />
                        ))
                      }
                      onChange={(event, value) => {
                        // Set only IDs in the field
                        field.onChange(value.map(user => user.id));
                      }}
                      value={users.filter(user => field.value.includes(user.id))}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name='promoCode'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].PromoCode}
                    placeholder={dictionary['navigation'].EnterPromoCode}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' color='primary' onClick={handleGeneratePromoCode}>
                            <Icon360 />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.promoCode}
                    helperText={errors.promoCode?.message}
                    disabled={!!editData}  
                  />
                )}
              />
            </Grid>


            {/* <Grid item xs={12} sm={6} p={4}>
              <Controller
                name="image" // No validation for required
                control={control}
                render={({ field: { onChange, onBlur, ref, value } }) => (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {vehicleImagePreview && (
                      <div>
                        <img
                          src={vehicleImagePreview}
                          alt={dictionary['navigation'].LogoPreview}
                          style={{
                            maxWidth: '70px',
                            height: '70px',
                            border: '1px solid #ddd',
                            padding: '5px',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].Logo}
                      type="file"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ accept: 'image/*' }}
                      inputRef={ref}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        const files = target.files;

                        if (files) {
                          onChange(files); // Set the files in the form state
                          handleLogoChange(files); // Handle your logo change
                          const file = files[0];

                          if (file) {

                            const previewUrl = URL.createObjectURL(file);

                            setVehicleImagePreview(previewUrl); // Set preview URL

                          }
                        } else {
                          onChange(null); // Clear the value if no file is selected
                          setVehicleImagePreview(null); // Clear preview
                        }
                      }}
                      onBlur={onBlur}
                    />
                  </div>
                )}
              />
            </Grid>

 */}

            {/* From Date */}
            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name='fromDate'
                control={control}
                rules={{ required: dictionary['navigation'].Fromdateisrequired }}
                render={({ field }) => (
                  <AppReactDatepicker
                    id="start-date"
                    selected={field.value instanceof Date ? field.value : typeof field.value === 'string' && field.value ? new Date(field.value) : null}
                    minDate={new Date()} // or a specific start date
                    onChange={(date: Date | null) => {
                      field.onChange(date);

                      // If end date exists and is now invalid, clear it
                      const endDateValue = getValues('endDate');

                      if (endDateValue && date && new Date(endDateValue) <= date) {
                        setValue('endDate', '');
                      }
                    }}
                    customInput={
                      <CustomTextField
                        label={dictionary['navigation'].StartDate}
                        fullWidth
                        error={!!errors.fromDate}
                        helperText={errors.fromDate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name='endDate'
                control={control}
                rules={{ 
                  required: dictionary['navigation'].Enddateisrequired,
                  validate: value => {
                    const fromDateValue = getValues('fromDate');

                    if (!fromDateValue) return true; // If start date is not set, don't validate yet
                    
                    // Ensure end date is greater than start date
                    return new Date(value) > new Date(fromDateValue) || 
                      dictionary['navigation'].EndDateMustBeAfterStartDate || 
                      'End date must be after start date';
                  }
                }}
                render={({ field }) => (
                  <AppReactDatepicker
                    id="end-date"
                    selected={field.value instanceof Date ? field.value : typeof field.value === 'string' && field.value ? new Date(field.value) : null}
                    minDate={fromDate ? new Date(new Date(fromDate).getTime() + 86400000) : new Date()} // min date is day after from date or today
                    onChange={(date: Date | null) => {
                      field.onChange(date);
                    }}
                    customInput={
                      <CustomTextField
                        label={dictionary['navigation'].EndDate}
                        fullWidth
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>

            {/* Additional Fields */}
            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name='totalCount'
                control={control}
                  rules={{
                  required: dictionary['navigation'].Totalcountisrequired,
                  min: { value: 1, message: dictionary['navigation'].valueminimum1 },
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label={dictionary['navigation'].TotalCount}
                    error={!!errors.totalCount}
                    helperText={errors.totalCount?.message}
                    inputProps={{ min: 1 }}

                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name='reuseCount'
                control={control}
                rules={{ required: dictionary['navigation'].Reusecountisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label={dictionary['navigation'].ReuseCount}
                    error={!!errors.reuseCount}
                    helperText={errors.reuseCount?.message}
                  />
                )}
              />
            </Grid>

            {/* Promo Type Dropdown */}
            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name="Type"
                control={control}
                rules={{ required: dictionary['navigation'].Promotypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].Type}
                    error={!!errors.Type}
                    helperText={errors.Type?.message}
                  >
                    <MenuItem value="fixed">{dictionary['navigation'].Fixed}</MenuItem>
                    <MenuItem value="percentage">{dictionary['navigation'].Percentage}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* Min Amount */}
            <Grid item xs={12} sm={6} p={4}>
              <Controller
                name='minAmount'
                control={control}
                 rules={{
                  required: dictionary['navigation'].Minimumamountisrequired,
                  min: { value: 1, message: dictionary['navigation'].valueminimum1 },
                }}

                render={({ field }) => (
                  
                  <CustomTextField
                  InputProps={{
                      endAdornment: selectedCurrency ? (
                        <InputAdornment position="end">{selectedCurrency}</InputAdornment>
                      ) : "$",
                    }}
                    {...field}
                    fullWidth
                    type='number'
                    label={dictionary['navigation'].MinimumAmount}
                    error={!!errors.minAmount}
                    helperText={errors.minAmount?.message}
                   inputProps={{ min: 1 }}
              
                  />
                )}
              />
            </Grid>

            {/* Conditionally Rendered Fields */}
            {selectedType === 'fixed' && (
              <Grid item xs={12} sm={6} p={4}>
                <Controller
                  name="promoAmount"
                  control={control}
                  rules={{ required: dictionary['navigation'].Promoamountisrequiredforfixedpromotype }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type="number"
                      label={dictionary['navigation'].PromoAmount}
                      error={!!errors.promoAmount}
                      helperText={errors.promoAmount?.message}
                    />
                  )}
                />
              </Grid>
            )}

            {selectedType === 'percentage' && (
              <Grid item xs={12} sm={6} p={4}>
                <Controller
                  name="promoPercentage"
                  control={control}
              rules={{
                required: dictionary['navigation'].Promopercentageisrequiredforpercentagepromotype,
                min: { value: 1, message:  dictionary['navigation'].Promopercentagevalidationmin },
                max: { value: 100, message: dictionary['navigation'].Promopercentagevalidationmax }
              }}             
                      render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type="number"
                      label={dictionary['navigation'].PromoPercentage}
                      error={!!errors.promoPercentage}
                      helperText={errors.promoPercentage?.message}
                      inputProps={{ min: 1, max: 100 }}

                    />
                  )}
                />
              </Grid>
            )}

            {/* Description */}
            <Grid item xs={12} sm={12} p={4}>
              <Controller
                name='description'
                control={control}
                rules={{
                  required: dictionary['navigation'].Descriptionisrequired,
                  validate: value => validateTextOnly(value, dictionary),
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].Description}
                    multiline
                    minRows={3}
                    placeholder={dictionary['navigation'].EnterDescription}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <div className='flex items-center gap-4'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
            >
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddPromoCodeModelDrawer;


