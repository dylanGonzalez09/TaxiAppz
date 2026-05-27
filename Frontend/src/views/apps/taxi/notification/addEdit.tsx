/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, useRef } from 'react'; // IMPORT useRef HERE

import { useParams, useRouter } from 'next/navigation'

import { getSession } from 'next-auth/react';

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

import { useForm, Controller, useWatch } from 'react-hook-form';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';
import CustomAutocomplete from '@core/components/mui/Autocomplete';

import { createNotification, fetchDropDownByZone } from '@/app/api/apps/taxi/notification';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

import {validateInputContent} from '@/utils/validation'


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
  const [formResetKey, setFormResetKey] = useState(0);

  // CREATE REF FOR FILE INPUT
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;
  const [userData, setUserData] = useState<any>([]);
  const [driverData, setDriverData] = useState<any>([]);
  const { lang: locale, zoneId } = useParams()
  const router = useRouter()


  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
      defaultValues: {
        title: '',
        subTitle: '',
        zones: [],
        users: [],
        drivers:[],
        message: '',
        image: null,
      }
  });



  const watchedZones = useWatch({
    control,
    name: 'zones'
  });

  // Fetch users and drivers data
  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId;

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

        const currentZoneId = typeof zoneId === 'string' ? zoneId : Array.isArray(zoneId) ? zoneId[0] : '';
        const dropDownData = await fetch(ENDPOINTS.notification.dropDownList(clientId, currentZoneId));

        const data = await dropDownData.json();

        setUserData(data.data.Userdata);
        setDriverData(data.data.Driverdata);
        setZoneOptions(data.data.zonedata.zone.map((zone: any) => ({
          id: zone.id,
          name: zone.zoneName,
        })));

      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, [zoneId]);

  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const dataKey = await getClientId();
        const clientId = dataKey.clientId;

        if (!clientId) return;

        const selectedZoneIds = (watchedZones || []).map((zone: any) => zone.id);
        const data = await fetchDropDownByZone(clientId, selectedZoneIds, zoneId);

        if (!data) return;

        setUserData(data.Userdata || []);
        setDriverData(data.Driverdata || []);

        // Drop selected values that are no longer valid for selected zones.
        const currentUsers = (control as any)._formValues?.users || [];
        const currentDrivers = (control as any)._formValues?.drivers || [];
        const allowedUserIds = new Set((data.Userdata || []).map((u: any) => String(u.id || u._id)));
        const allowedDriverIds = new Set((data.Driverdata || []).map((d: any) => String(d.userId?.id || d.userId?._id || d.id || d._id)));

        const validUsers = currentUsers.filter((u: any) => allowedUserIds.has(String(u.id || u._id)));

        const validDrivers = currentDrivers.filter((d: any) =>
          allowedDriverIds.has(String(d.userId?.id || d.userId?._id || d.id || d._id))
        );

        if (validUsers.length !== currentUsers.length) {
          setValue('users', validUsers);
        }

        if (validDrivers.length !== currentDrivers.length) {
          setValue('drivers', validDrivers);
        }
      } catch (error) {
        toast.error('Failed to fetch users/drivers by zone');
      }
    };

    fetchFilteredData();
  }, [watchedZones, setValue, zoneId]);

  // Handle image file change
  const handleImageChange = (file: File) => {
    setImageName(file.name);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (data: FormValues) => {
    // Prevent double submission (form submit + button click can both fire)
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);

    try {
    const payload: any = {
      title: data.title,
      subTitle: data.subTitle,

      zoneIds: Array.isArray(zoneId)
        ? zoneId
        : [zoneId],

      userIds: data.users.map((user: any) => user.id || user._id),

      driverIds: data.drivers.map(
        (driver: any) =>
          driver.userId?.id ||
          driver.userId?._id ||
          driver.id ||
          driver._id
      ),

      message: data.message,
      imageName: imageName,
    };

      const response = await createNotification(payload);

      if (response) {
        toast.success('Notification added successfully');
        handleResetAll();
        handleClose();

        // Refetch from server instead of optimistic add - prevents duplicate on refresh
        router.refresh();
      } else {
        throw new Error(dictionary['navigation'].apiResponseError);
      }
    } catch (error) {
      console.error('Failed to submit notification:', error);
      toast.error('Failed to submit notification');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResetAll = () => {
    reset({
      title: '',
      subTitle: '',
      zones: [],
      users: [],
      drivers: [],
      message: '',
      image: null,
    });

    // 2. Clear Image Preview States
    setImagePreview(null);
    setImageName(null);

    // 3. CLEAR FILE INPUT DIRECTLY USING useRef
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // 4. Force Re-render of Form (Optional but good for Autocomplete)
    setFormResetKey(prev => prev + 1);
  };

  const handleCloseDrawer = () => {
    handleResetAll();
    handleClose();
  };


  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleCloseDrawer}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, padding: 2 } }}
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>{dictionary['navigation'].addNotification}</Typography>
        <IconButton size='small' onClick={handleCloseDrawer}>
          <i className='tabler-x text-textPrimary text-2xl' />
        </IconButton>
      </div>
      <Divider />

      {/* Use formResetKey to force remount */}
      <form key={formResetKey} onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
        <Grid container spacing={2}>
          {/* <Grid item xs={12}>
            <Controller
              name="zones"
              control={control}
              render={({ field, fieldState }) => {
                const isAllSelected = field.value && field.value.length === zoneOptions.length;

                const handleZoneChange = (event: any, selected: any[]) => {
                  const wasSelectAllClicked = selected.find((item) => item.id === 'all');

                  if (wasSelectAllClicked) {
                    if (isAllSelected) {
                      field.onChange([]);
                    } else {
                      field.onChange(zoneOptions);
                    }
                  } else {
                    field.onChange(selected);
                  }
                };

                return (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    disableCloseOnSelect
                    options={[
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
          </Grid> */}
      {/* <Grid item xs={12}>
            <Controller
              name="zones"
              control={control}
              render={({ field, fieldState }) => {
                const isAllSelected = field.value && field.value.length === zoneOptions.length;

                const handleZoneChange = (event: any, selected: any[]) => {
                  const wasSelectAllClicked = selected.find((item) => item.id === 'all');

                  if (wasSelectAllClicked) {
                    if (isAllSelected) {
                      field.onChange([]);
                    } else {
                      field.onChange(zoneOptions);
                    }
                  } else {
                    field.onChange(selected);
                  }
                };

                return (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    disableCloseOnSelect
                    options={[
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
          </Grid> */}



 <Grid item xs={12}>
  <Controller
    name="users"
    control={control}
    defaultValue={[]}
    render={({ field, fieldState }) => {
      const fieldValue = field.value || [];

      const isAllSelected =
        fieldValue.length > 0 && fieldValue.length === userData.length;

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
            {
              id: 'all',
              userId: {
                firstName: isAllSelected ? 'Deselect All' : 'Select All',
              },
            },
            ...userData,
          ]}
          id="autocomplete-users"
          value={fieldValue}
          isOptionEqualToValue={(option, value) =>
            (option.userId?.id || option.id) ===
            (value.userId?.id || value.id)
          }
          getOptionLabel={(option) => {
            // Select All / Deselect All (no phone)
            if (option.id === 'all') {
              return option.userId?.firstName || 'Select All';
            }

            const name =
              option.userId?.firstName || option.firstName || '';

            const phone =
              option.userId?.phoneNumber || option.phoneNumber || '';

            return phone ? `${name} [${phone}]` : name;
          }}
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
            tagValue.map((option, index) => {
              const name =
                option.userId?.firstName || option.firstName || '';

              const phone =
                option.userId?.phoneNumber || option.phoneNumber || '';

              return (
                <Chip
                  label={phone ? `${name} [${phone}]` : name}
                  {...getTagProps({ index })}
                  key={
                    option.userId?.id || option.id || `user-${index}`
                  }
                  size="small"
                />
              );
            })
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

      const isAllSelected =
        fieldValue.length > 0 && fieldValue.length === driverData.length;

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
            {
              id: 'all',
              userId: {
                firstName: isAllSelected ? 'Deselect All' : 'Select All',
              },
            },
            ...driverData,
          ]}
          id="autocomplete-drivers"
          value={fieldValue}
          isOptionEqualToValue={(option, value) =>
            (option.userId?.id || option.id) ===
            (value.userId?.id || value.id)
          }
          getOptionLabel={(option) => {
            // Select All / Deselect All (no phone)
            if (option.id === 'all') {
              return option.userId?.firstName || 'Select All';
            }

            const name =
              option.userId?.firstName || option.firstName || '';

            const phone =
              option.userId?.phoneNumber || option.phoneNumber || '';

            return phone ? `${name} [${phone}]` : name;
          }}
          renderInput={(params) => (
            <CustomTextField
              {...params}
              label={
                dictionary['navigation']?.selectDrivers || 'Select Drivers'
              }
              placeholder={dictionary['navigation']?.drivers || 'drivers'}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message || ''}
            />
          )}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const name =
                option.userId?.firstName || option.firstName || '';

              const phone =
                option.userId?.phoneNumber || option.phoneNumber || '';

              return (
                <Chip
                  label={phone ? `${name} [${phone}]` : name}
                  {...getTagProps({ index })}
                  key={
                    option.userId?.id || option.id || `driver-${index}`
                  }
                  size="small"
                />
              );
            })
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
              rules={{ required: dictionary['navigation'].titleRequired,
                validate:(value) => validateInputContent(value)
               }}
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
              rules={{ required: dictionary['navigation'].subTitleRequired,
                validate:(value) => validateInputContent(value)
               }}
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

          <Grid item xs={12}>
            <Controller
              name='message'
              control={control}
              rules={{ required: true ,
                validate:(value) => validateInputContent(value)
              }}
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

          {/* <Grid item xs={12}>
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

                  // ATTACH THE REF HERE

                  inputRef={fileInputRef}
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

                      onChange(fileInput.files);
                      handleImageChange(file);
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


          </Grid> */}
        </Grid>
        <div className='flex justify-end mt-4 gap-5'>
          <Button type='submit' variant='contained' disabled={isSubmitDisabled}>
            {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].Submit}
            {loading && <CircularProgress size={24} color="inherit" />}
          </Button>
          <Button
            onClick={handleCloseDrawer}
            variant='outlined'
            color='error'
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
