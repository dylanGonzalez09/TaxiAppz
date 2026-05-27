/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';


import { useState, useEffect, useCallback } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip
} from '@mui/material';
import { toast } from 'react-toastify';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';

import { getSession } from 'next-auth/react';

import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField'; // Adjust path as necessary
import CustomAutocomplete from '@core/components/mui/Autocomplete'; // Adjust path as necessary
import DialogCloseButton from '@/components/dialogs/DialogCloseButton'; // Adjust path as necessary
import { fetchActiveLanguage } from '@apis/language';
import { fetchRoles } from '@apis/role';
import { createDispatcher, updateDispatcher } from '@apis/dispatcher';
import {
  validateTextOnly,
  validateEmail,
  validatePhoneNumber,
  validateImage
} from '@/utils/validation';
import { BASE_IMAGE_URL, ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

// Type Definitions
type AddUserInfoData = {
  id?: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  language?: string;
  zoneId?: string;
  status?: boolean;
  serviceType?: string[];
  image: FileList | null;
};

type DispatcherType = {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  language?: string;
  zoneId?: string;
  active?: boolean;
  serviceType?: string[];
  image?: FileList | null;
};

interface AddDispatcherDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: DispatcherType[];
  setData: (data: DispatcherType[]) => void;
  handleClose: () => void;
  editDispatcher: DispatcherType | null;
  setEditDispatcher: (dispatcher: DispatcherType | null) => void;
  dictionary:any
}

const serviceTypes = [
  { id: 'local', name: 'Local' },
  { id: 'rental', name: 'Rental' },
  { id: 'outstation', name: 'Outstation' },
];

const AddDispatcherDrawer = ({
  open,
  setOpen,
  data,
  setData,
  handleClose,
  editDispatcher,
  dictionary
}: AddDispatcherDrawerProps) => {

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { control, handleSubmit, setValue, reset, trigger, formState: { errors } } = useForm<AddUserInfoData>({
    mode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      language: '',
      zoneId: '',
      serviceType: [],
      image: null,
    }
  });

  const [roles, setRoles] = useState<{ id: string; role: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<any[]>([]);
  const { checkDemoStatus } = useIsDemoUser();

  const getClientId = async () => {


    const session = await getSession();

    const clientId = session?.user?.image?.clientId; // Access clientId

    return { clientId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const dropDownData = await fetch(ENDPOINTS.dispatcher.dropDownList(clientId));

        const data = await dropDownData.json();

        setRoles(data.data.role);
        setLanguages(data.data.language);
        setZones(data.data.zones)
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);



  const resetForm = useCallback(() => {
    reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      language: '',
      serviceType: []
    });
  }, [reset]);

  useEffect(() => {
    if (open) {
      if (editDispatcher) {

        setImagePreview(editDispatcher.image ? `${BASE_IMAGE_URL}/uploads/dispatcher/${editDispatcher.image}` : null);
        Object.keys(editDispatcher).forEach(key => {
          setValue(key as keyof AddUserInfoData, editDispatcher[key as keyof DispatcherType] || '');
        });
      } else {
        resetForm();
      }
    }
  }, [open, editDispatcher, setValue, resetForm]);

  const onSubmit: SubmitHandler<AddUserInfoData> = async (formData) => {
    setLoading(true);

    try {
      const formDataObject = new FormData();

      formDataObject.append('firstName', formData.firstName || '');
      formDataObject.append('lastName', formData.lastName || '');
      formDataObject.append('email', formData.email || '');
      formDataObject.append('phoneNumber', formData.phoneNumber || '');
      formDataObject.append('language', formData.language || '');
      formDataObject.append('password', formData.password || '');
      formDataObject.append('zoneId', formData.zoneId || '');
      formDataObject.append('active', 'true');
      formDataObject.append('serviceType', formData.serviceType ? formData.serviceType.join(',') : '');

      if (formData.image?.[0]) {
        formDataObject.append('image', formData.image[0]);
      }

      if (editDispatcher) {

        await updateDispatcher(String(editDispatcher.id), formDataObject);

        const updatedDispatcher = { id: editDispatcher.id, ...formData };

        const updatedDispatcherList = data.map((dispatcher: DispatcherType) =>
          dispatcher.id === editDispatcher.id ? updatedDispatcher : dispatcher
        );

        setData(updatedDispatcherList);

        toast.success('Dispatcher updated successfully');
      } else {
        const filteredIds = roles.filter(item => item.role === "Dispatchers").map(item => item.id);

        formDataObject.append('roleIds', filteredIds.join(','));

        const createData = await createDispatcher(formDataObject);
        
        if (createData.success===false) {
          toast.error(createData.message);
        }else{
        formData.image = createData.profilePic;

        const newDispatcher = { id: createData.id, ...formData, status: true };

        setData([...data, newDispatcher]);

        toast.success('New dispatcher created successfully');
        handleClose();
      }
    }
    } catch (error) {
      toast.error('An error occurred while processing the request');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setIsPasswordShown(prev => !prev);
  };

  const handleCloseDrawer = () => {
    setOpen(false);
    resetForm();
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
      <DialogTitle variant='h4'>
        {editDispatcher ? 'Edit Dispatcher Information' : 'Add Dispatcher Information'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='firstName'
                control={control}
                rules={{ required: 'First Name is required', validate: value => validateTextOnly(value, dictionary) }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='First Name *'
                    placeholder='John'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('firstName')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: 'Last Name is required', validate: value => validateTextOnly(value, dictionary) }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Last Name *'
                    placeholder='Doe'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('lastName')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: 'Email is required', validate: value => validateEmail(value, dictionary) }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Email *'
                    placeholder='Enter email'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('email')}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='phoneNumber'
                control={control}
                rules={{ required: 'Phone Number is required',validate: value => validatePhoneNumber(value, dictionary) }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Phone Number *'
                    placeholder='+1-555-555-5555'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('phoneNumber')}
                  />
                )}
              />
            </Grid>

            {editDispatcher === null && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={editDispatcher ? 'New Password' : 'Password *'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        type={isPasswordShown ? 'text' : 'password'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton edge='end' onClick={handleClickShowPassword}>
                                <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        onBlur={() => trigger('password')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='confirmPassword'
                    control={control}
                    rules={{
                      required: editDispatcher === null,
                      validate: (value) =>
                        value === control._formValues.password || 'Passwords do not match'
                    }}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={editDispatcher ? 'Confirm New Password' : 'Confirm Password *'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        type={isPasswordShown ? 'text' : 'password'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton edge='end' onClick={handleClickShowPassword}>
                                <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        onBlur={() => trigger('confirmPassword')}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name="zoneId"
                control={control}
                rules={{ required: 'Zone is required.' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label="Zone"
                    {...field}
                    error={!!errors.zoneId}
                    helperText={errors.zoneId?.message}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (value) =>
                        value === '' ? <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Enter zone</span> : zones.find((zone) => zone._id === value)?.zoneName,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  >
                    {zones.map((zone) => (
                      <MenuItem key={zone._id} value={zone._id}>
                        {zone.zoneName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name='language'
                control={control}
                rules={{ required: 'Language is required' }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label='Language *'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    SelectProps={{
                      displayEmpty: true
                    }}
                    onBlur={() => trigger('language')}
                  >
                    {languages.map((languageItem) => (
                      <MenuItem key={languageItem.id} value={languageItem.id}>
                        {languageItem.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* <Grid item xs={6}>
              <Controller
                name='location'
                control={control}
                rules={{ required: 'Location is required' }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Service Location *'
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    placeholder='Enter dispatcher location'
                    onBlur={() => trigger('location')}
                  />
                )}
              />
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceType"
                control={control}
                render={({ field, fieldState }) => (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    options={serviceTypes}
                    id="autocomplete-service-types"
                    getOptionLabel={(option) => option.name || ''}
                    value={(field.value || []).map((serviceId) =>
                      serviceTypes.find(service => service.id === serviceId) || { id: serviceId, name: serviceId }
                    )} // Ensure field.value is in the correct format
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        label="Defalut Service Type *"
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message || ''}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip
                          label={option.name}
                          {...getTagProps({ index })}
                          key={option.id}
                          size="small"
                        />
                      ))
                    }
                    onChange={(event, value) => {
                      field.onChange(value.map(item => item.id)); // Ensure to save only the IDs
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt=" Image Preview"
                    style={{ width: '100px', height: '100px' }} // Use marginRight for spacing
                  />
                )}
                <Controller
                  name="image"
                  control={control}
                  rules={{ required: 'image is required.' }}
                  render={({ field: { onChange } }) => (
                    <CustomTextField
                      type="file"
                      fullWidth
                      label="Image"
                      margin="normal"
                      onChange={e => {
                        const input = e.target as HTMLInputElement;

                        onChange(input.files);

                        if (input.files && input.files[0]) {
                          setImagePreview(URL.createObjectURL(input.files[0]));
                        }
                      }}
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
              </div>
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions className='pli-16 pbe-16'>
          <Button variant='outlined' color='secondary' onClick={handleCloseDrawer}>
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            type='submit'
            disabled={isSubmitDisabled}
            startIcon={loading && <CircularProgress size='1rem' />}
          >
            {editDispatcher ? 'Update Dispatcher' : 'Add Dispatcher'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddDispatcherDrawer;
