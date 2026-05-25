/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect } from 'react';

import {
  Drawer,
  IconButton,
  Divider,
  Button,
  InputAdornment,
  Typography,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';

import { useForm, Controller } from 'react-hook-form';

import { getSession } from 'next-auth/react';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';
import CustomAutocomplete from '@core/components/mui/Autocomplete';

import { createNotification } from '@/app/api/apps/taxi/notification';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';


// Define types
interface AddPushNotificationDrawerProps {
  open: boolean;
  handleClose: () => void;
  dictionary: { [key: string]: { [key: string]: string } };
  setData: React.Dispatch<React.SetStateAction<PushNotificationType[]>>;
}

interface PushNotificationType {
  title: string;
  subTitle: string;
  zones: { id: string; name: string }[];
  users: any;
  drivers: any;
  message: string;
}
interface FormValues {
  title: string;
  subTitle: string;
  zones: { id: string; name: string }[];
  users: any;
  drivers: any;
  message: string;
  image: FileList | null;
}

const AddPushNotificationDrawer: React.FC<AddPushNotificationDrawerProps> = ({
  open,
  handleClose,
  dictionary,
  setData,
}) => {
  const [loading, setLoading] = useState(false);
  const [zoneOptions, setZoneOptions] = useState<{ id: string; name: string }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;
  const [userData, setUserData] = useState<any>([]);
  const [driverData, setDriverData] = useState<any>([]);

  const { handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      title: '',
      subTitle: '',
      zones: [],
      message: '',
      image: null,
    }

  });

  // Fetch users and drivers data

  const getClientId = async () => {


    const session = await getSession();

    const clientId = session?.user?.image?.clientId; // Access clientId
    const companyId = session?.user?.image?.companyId; // Access companyId

    return { clientId, companyId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const dropDownData = await fetch(ENDPOINTS.notification.dropDownList(clientId));

        const data = await dropDownData.json();

        setUserData(data.data.Userdata);
        setDriverData(data.data.Driverdata);
        setZoneOptions(data.data.zonedata.zone.map((zone: any) => ({
          id: zone.id,
          name: zone.zoneName,
        })));

      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);



  // Handle image file change
  const handleImageChange = (file: File) => {
    setImageName(file.name);  // Store only the image name
    setImagePreview(URL.createObjectURL(file));  // Preview image
  };

  const handleFormSubmit = async (data: FormValues) => {
    if (!data.image || data.image.length === 0) {
      return;
    }

    setLoading(true);

    try {


      const payload: any = {
        title: data.title,
        subTitle: data.subTitle,
        zoneIds: data.zones.map(zone => zone.id),
        userIds: data.users.map((user: any) => user.id),
        driverIds: data.drivers.map((driver: any) => driver.id),
        message: data.message,
        imageName: imageName,
      };

      const response = await createNotification(payload);

      if (response) {
        const newData: any = {
          title: data.title,
          subTitle: data.subTitle,
          zones: data.zones,
          message: data.message,
        };

        setData((prevData) => [...prevData, newData]);
        toast.success('Notification added successfully');
        reset();
        handleClose();
      } else {
        throw new Error(dictionary['navigation'].apiResponseError);
      }
    } catch (error) {
      console.error('Failed to submit notification:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, padding: 2 } }}
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>{dictionary['navigation'].addNotification}</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x text-textPrimary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="zones"
              control={control}
              render={({ field, fieldState }) => {
                const isAllSelected = field.value.length === zoneOptions.length;

                const handleZoneChange = (event: any, selected: any[]) => {
                  // Check if "Select All" was just clicked
                  const wasSelectAllClicked = selected.find((item) => item.id === 'all');

                  if (wasSelectAllClicked) {
                    if (isAllSelected) {
                      field.onChange([]); // Deselect all
                    } else {
                      field.onChange(zoneOptions); // Select all
                    }
                  } else {
                    field.onChange(selected); // Normal selection
                  }
                };

                return (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    disableCloseOnSelect

                    options={[
                      { id: 'all', name: isAllSelected ? 'Deselect All' : 'Select All' },
                      ...zoneOptions,
                    ]}
                    id="autocomplete-zones"
                    getOptionLabel={(option) => option.name}
                    value={field.value || []}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        label={dictionary['navigation'].selectZones || 'Select Zones'}
                        placeholder={dictionary['navigation'].zones || 'Zones'}
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
                    onChange={handleZoneChange}
                  />
                );
              }}
            />
          </Grid>


          <Grid item xs={12}>
            <Controller
              name="users"
              control={control}
              defaultValue={[]}
              render={({ field, fieldState }) => {
                const fieldValue = field.value || [];
                const isAllSelected = fieldValue.length > 0 && fieldValue.length === userData.length;

                const handleUserChange = (event: any, selected: any[]) => {
                  const wasSelectAllClicked = selected.some(item => item.id === 'all');

                  if (wasSelectAllClicked) {
                    field.onChange(isAllSelected ? [] : [...userData]);
                  } else {
                    field.onChange(selected.filter(item => item.id !== 'all'));
                  }
                };

                return (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    disableCloseOnSelect
                    options={[
                      { id: 'all', firstName: isAllSelected ? 'Deselect All' : 'Select All' },
                      ...userData,
                    ]}
                    id="autocomplete-users"
                    getOptionLabel={(option) => option.firstName || ''}
                    value={fieldValue}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        label={dictionary['navigation']?.selectUsers || 'Select Users'}
                        placeholder={dictionary['navigation']?.users || 'users'}
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
                    onChange={handleUserChange}
                  />
                );
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="drivers"
              control={control}
              defaultValue={[]}
              render={({ field, fieldState }) => {
                const fieldValue = field.value || [];
                const isAllSelected = fieldValue.length > 0 && fieldValue.length === driverData.length;

                const handleDriverChange = (event: any, selected: any[]) => {
                  const wasSelectAllClicked = selected.some(item => item.id === 'all');

                  if (wasSelectAllClicked) {
                    field.onChange(isAllSelected ? [] : [...driverData]);
                  } else {
                    field.onChange(selected.filter(item => item.id !== 'all'));
                  }
                };

                return (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    disableCloseOnSelect
                    options={[
                      { id: 'all', firstName: isAllSelected ? 'Deselect All' : 'Select All' },
                      ...driverData,
                    ]}
                    id="autocomplete-drivers"
                    getOptionLabel={(option) => option.firstName || ''}
                    value={fieldValue}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        label={dictionary['navigation']?.selectDrivers || 'Select Drivers'}
                        placeholder={dictionary['navigation']?.drivers || 'drivers'}
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
                    onChange={handleDriverChange}
                  />
                );
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='title'
              control={control}
              rules={{ required: dictionary['navigation'].titleRequired }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].title}
                  placeholder={dictionary['navigation'].enterTitle}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name='subTitle'
              control={control}
              rules={{ required: dictionary['navigation'].subTitleRequired }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].subTitle}
                  placeholder={dictionary['navigation'].enterSubTitle}
                  error={!!errors.subTitle}
                  helperText={errors.subTitle?.message}
                />
              )}
            />
          </Grid>

          {/* Users Multi-select */}
          {/* <Grid item xs={12}>
            <Controller
              name="users"
              control={control}
              render={({ field, fieldState }) => (
                <CustomAutocomplete
                  multiple
                  limitTags={2}
                  options={userOptions}
                  id="autocomplete-users"
                  getOptionLabel={(option) => {
                    // Make sure to never return undefined from getOptionLabel
                    return option && option.name ? option.name : '';
                  }}
                  value={field.value || []}
                  isOptionEqualToValue={(option, value) => {
                    return option.id === value.id;
                  }}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label="Select Users"
                      placeholder="Users"
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
                  onChange={(event, value) => field.onChange(value)}
                />
              )}
            />
          </Grid> */}

          {/* Drivers Multi-select */}
          {/* <Grid item xs={12}>
            <Controller
              name="drivers"
              control={control}
              render={({ field, fieldState }) => (
                <CustomAutocomplete
                  multiple
                  limitTags={2}
                  options={zoneOptions}
                  id="autocomplete-drivers"
                  getOptionLabel={(option) => option.name}
                  value={field.value || []}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      label="Select Drivers"
                      placeholder="Drivers"
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
                  onChange={(event, value) => field.onChange(value)}
                />
              )}
            />
          </Grid> */}

          <Grid item xs={12}>
            <Controller
              name='message'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  rows={4}
                  fullWidth
                  multiline
                  label={dictionary['navigation'].message}
                  placeholder={dictionary['navigation'].message}
                  error={!!errors.message}
                  helperText={errors.message ? 'This field is required.' : ''}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            {imagePreview && (
              <img src={imagePreview} alt="Image" style={{ width: '100px', height: 'auto', borderRadius: '4px', marginTop: '10px' }} />
            )}

            <Controller
              name="image"
              control={control}
              rules={{
                required: dictionary['navigation'].Imageisrequired || 'Image is required',
                validate: value => {
                  const file = value?.[0];

                  if (file) {
                    const isImage = file.type.startsWith('image/');
                    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

                    if (!isImage || !allowedExtensions.test(file.name)) {
                      return dictionary['navigation'].Onlyimagefilesareallowed || 'Only image files are allowed.';
                    }
                  }


                  return true;
                },
              }}
              render={({ field: { onChange }, fieldState }) => (
                <CustomTextField
                  type="file"
                  fullWidth
                  label={dictionary['navigation'].Image}
                  margin="normal"
                  inputProps={{ accept: 'image/*' }}
                  onChange={(e) => {
                    const fileInput = e.target as HTMLInputElement;
                    const file = fileInput.files?.[0];

                    if (file) {
                      const isImage = file.type.startsWith('image/');
                      const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

                      if (!isImage || !allowedExtensions.test(file.name)) {
                        // Clear file input and prevent preview
                        fileInput.value = '';
                        toast.error(dictionary['navigation'].Onlyimagefilesareallowed || 'Only image files are allowed.');

                        return;
                      }

                      onChange(fileInput.files); // update react-hook-form value
                      handleImageChange(file);   // show preview
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
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />


          </Grid>
        </Grid>
        <div className='flex justify-end mt-4'>
          <Button variant='contained' type='submit' disabled={isSubmitDisabled}>
            {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].Submit}
            {loading && <CircularProgress size={24} color="inherit" />}
          </Button>
          <Button
            onClick={handleClose}
            variant='outlined'
            color='secondary'
            style={{ marginLeft: '10px' }}
          >
            {dictionary['navigation'].cancel}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default AddPushNotificationDrawer;
