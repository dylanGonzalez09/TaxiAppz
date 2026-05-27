/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';

import { toast } from 'react-toastify';
import {
  IconButton,
  Divider,
  Button,
  Drawer,
  Typography,
  Grid,
  MenuItem,
  CircularProgress,
  InputAdornment,
} from '@mui/material';

import { getSession } from 'next-auth/react';

import { useForm, Controller } from 'react-hook-form';

import CustomTextField from '@core/components/mui/TextField';



import { validateTextOnly, validateImage } from '@/utils/validation';
import { ENDPOINTS,BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint';
import { createAdvertisement, updateAdvertisement } from '@apis/advertisement';

interface AdvertisementType {
  id?: string;
  title: string;
  zoneId: string;
  userType: string;
  isPermanent: string;
  image: string;
  status?: boolean;
}

interface AddAdvertisementDrawerProps {
  open: boolean;
  handleClose: () => void;
  advertisementData: AdvertisementType[];
  dictionary: any;
  editData?: AdvertisementType;
  setData: React.Dispatch<React.SetStateAction<AdvertisementType[]>>;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPage: number;
  zoneId: any;
}

const AddAdvertisementDrawer: React.FC<AddAdvertisementDrawerProps> = ({
  open,
  handleClose,
  advertisementData,
  dictionary,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  zoneId
}) => {
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    mode: 'all',
    defaultValues: {
      title: '',
      userType: 'driver',
      isPermanent: 'temporary',
      zoneId: zoneId,
      image: '',
      status: true,
    },
  });

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

        const dropDownData = await fetch(ENDPOINTS.zone.dropDownList(clientId, zoneId));
        const data = await dropDownData.json();

        setZones(data.data.zone);
      } catch (error) {
        toast.error(dictionary['navigation'].Failedtofetchdata);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [dictionary, zoneId]);

  useEffect(() => {
    if (editData) {
      setValue('title', editData.title);
      setValue('userType', editData.userType || 'driver');
      setValue('zoneId', editData.zoneId);
      setValue('isPermanent', editData.isPermanent || 'temporary');
      setValue('status', editData.status ?? true);

      if (editData.image && editData.image !== 'undefined') {
        setImagePreview(editData.image ? `${BASE_IMAGE_URL}${editData.image}` : null);

      }
    } else {
      reset();
      setImagePreview(null);
    }
  }, [zoneId , editData, setValue, reset]);

  const handleFormSubmit = async (data: any) => {
    setLoading(true);

    try {
      const formData = new FormData();

      // Append form fields
      formData.append('title', data.title);
      formData.append('userType', data.userType);
      formData.append('isPermanent', data.isPermanent);
      formData.append('zoneId', data.zoneId);
      formData.append('status', data.status?.toString() || 'true');

      // Handle image upload
      if (data.image && data.image.length > 0) {
        formData.append('image', data.image[0]);
      }

      let response: any = {};

      if (editData) {
        response = await updateAdvertisement(editData.id!, formData, zoneId);
      } else {
        response = await createAdvertisement(formData, zoneId);
      }


     if (response && response.success) {
      const newData: AdvertisementType = {
        ...data,
        id: response.data.id || editData?.id,
        image: response.data.image || editData?.image,
      };

      const updated = editData
        ? advertisementData.map(item => (item.id === newData.id ? newData : item))
        : [newData, ...advertisementData];

      setData(updated);
      onPageChange({} as any, 1);
      toast.success(editData ? 'Advertisement updated successfully' : 'Advertisement created successfully');
      handleClose();
      reset();
      setImagePreview(null);
    } else {
      // Handle API error responses
      const errorMessage = response?.message ||  'Error saving advertisement';

      toast.error(errorMessage);
    }
  } catch (error: any) {
    console.error('Error saving advertisement:', error);

    // Handle network errors or other exceptions
    if (error.response?.status === 409 || error.message?.includes('already exists')) {
      toast.error(error.response?.data?.message || error.message || 'Only one active advertisement per user type is allowed');
    } else {
      toast.error('Error saving advertisement');
    }
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    handleClose();
    reset();
    setImagePreview(null);

    if (imageRef.current) {
      imageRef.current.value = '';
    }
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={handleReset}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between p-5">
       <Typography variant="h5">
  {editData
    ? dictionary['navigation'].EditAdvertisement
    : dictionary['navigation'].AddAdvertisement}
</Typography>
        <IconButton size="small" onClick={handleReset}>
          <i className="tabler-x text-textSecondary text-2xl" />
        </IconButton>
      </div>
      <Divider />
      <div className="p-5">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: dictionary['navigation'].Titleisrequired||'Title is required',
                  validate: (value) => validateTextOnly(value, dictionary)
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].title}
                    placeholder={dictionary['navigation'].Enteradvertisementtitle || "Enter advertisement title"}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="userType"
                control={control}
                rules={{ required: 'User type is required' }}
                render={({ field }) => (
                  <CustomTextField select fullWidth label={dictionary['navigation'].UserType} {...field}>
                    <MenuItem value="user">{dictionary['navigation'].User}</MenuItem>
                    <MenuItem value="driver">{dictionary['navigation'].Driver}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="isPermanent"
                control={control}
                render={({ field }) => (
                  <CustomTextField select fullWidth label={dictionary['navigation'].Type} {...field}>
                      <MenuItem value="permanent">{dictionary['navigation'].Permanent}</MenuItem>
                      <MenuItem value="temporary">{dictionary['navigation'].Temporary}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
{/*
            <Grid item xs={12}>
              <Controller
                name="zoneId"
                control={control}
                rules={{ required: 'Zone is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Zone}
                    {...field}
                    error={!!errors.zoneId}
                    helperText={errors.zoneId?.message}
                  >
                    {zones.map(zone => (
                      <MenuItem key={zone.id} value={zone.id}>
                        {zone.zoneName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid> */}

            <Grid item xs={12}>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt={dictionary['navigation']?.image || 'Image'}
                  style={{ width: '100px', height: 'auto', borderRadius: '4px', marginBottom: '10px' }}
                />
              )}

              <Controller
                name='image'
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
                        : dictionary['navigation']?.imageisrequired || 'Image is required';
                      }

                      return true;
                    },

                    customValidation: (value: FileList | string) => {
                      if (value && typeof value !== 'string' && (value as FileList).length > 0) {
                        return validateImage(value, dictionary);
                      }

                      return true;
                    }
                  }
                }}
                render={({ field: { onChange } }) => (
                  <CustomTextField
                    type="file"
                    fullWidth
                    label={dictionary['navigation']?.image || 'Image'}
                    margin="normal"
                    onChange={e => {
                      const input = e.target as HTMLInputElement;

                      onChange(input.files);

                      if (input.files && input.files[0]) {
                        setImagePreview(URL.createObjectURL(input.files[0]));
                      }
                    }}
                    inputRef={imageRef}
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
          </Grid>

          <div className="flex justify-end mt-4 gap-5">
            <Button
              onClick={handleReset}
              variant="outlined"
              color="error"
              style={{ marginRight: '10px' }}
            >
              {dictionary['navigation'].cancel}
            </Button>
           <Button
                type="submit"
                variant="contained"
                color="primary"
                endIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
  {editData
    ? (loading ? dictionary['navigation'].updating : dictionary['navigation'].update)
    : (loading ? dictionary['navigation'].creating : dictionary['navigation'].Create)}
</Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddAdvertisementDrawer;
