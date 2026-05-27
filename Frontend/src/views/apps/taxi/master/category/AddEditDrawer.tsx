/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent} from 'react';
import React, { useEffect, useState } from 'react';

import {
  Drawer,
  IconButton,
  Divider,
  Button,
  InputAdornment,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

import { toast } from 'react-toastify';

import { getSession } from 'next-auth/react';  // For client-side
import MenuItem from '@mui/material/MenuItem';

import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField';
import { createCategory, updateCategory } from '@apis/category';

import { BASE_IMAGE_URL , ENDPOINTS } from '@apis/endpoint';

import type { CategoryType } from '@/types/apps/masterType';

import { validateTextOnly, validateImage } from '@/utils/validation';

interface AddCategoryDrawerProps {
  open: boolean;
  handleClose: () => void;
  categoryData: CategoryType[];
  dictionary: { [key: string]: { [key: string]: string } };
  editData?: CategoryType;
  setData: React.Dispatch<React.SetStateAction<CategoryType[]>>;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  zoneId?: any;
}

interface FormValues {
  category: string;
  categoryImage: FileList | null;
  zoneId: string;
}

const AddCategoryDrawer: React.FC<AddCategoryDrawerProps> = ({
  open,
  handleClose,
  categoryData,
  dictionary,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  zoneId
}) => {
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [zones, setZones] = useState<any[]>([]); // State for storing zones
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

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

        const dropDownData = await fetch(ENDPOINTS.zone.dropDownList(clientId,zoneId));
        const data = await dropDownData.json();

        setZones(data.data.zone);

      } catch (error) {
        toast.error(dictionary['navigation'].Failedtofetchdata);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, [dictionary,zoneId]);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      category: '',
      categoryImage: null,
      zoneId: '',
    },
  });

  useEffect(() => {
    if (editData) {
      setValue('category', editData.category || '');
      setValue('zoneId', editData.zoneId);
      setCategoryImagePreview(editData.categoryImage ? `${BASE_IMAGE_URL}${editData.categoryImage}` : null);
    } else {
      reset();
      setCategoryImagePreview(null);
    }
  }, [editData, setValue, reset]);


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
    onPageChange(dummyEvent,  1);
  };


  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      const formData = new FormData();

      formData.append('category', data.category);
      formData.append('zoneId', data.zoneId);

      if (data.categoryImage?.[0]) {
        formData.append('categoryImage', data.categoryImage[0]);
      }

      let response;

      if (editData) {
        response = await updateCategory(editData.id, formData);
      } else {
        formData.append('status', 'true');
        response = await createCategory(formData);


      }

      if (response) {
        const newData: CategoryType = {
          id: response.id,
          category: response.category,
          categoryImage: `${response.categoryImage}`,
          zoneId: response.zoneId,
          zoneName: zones.find(zone => zone.id === response.zoneId)?.zoneName || 'Unknown Zone',
          status: response.status,
        };

        const updatedCategoryData = editData
          ? categoryData.map(item => item.id === newData.id ? newData : item)
          : [newData,...categoryData];

          setData(updatedCategoryData);
          handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);


        // if (rowsPerPage != categoryData.length || editData) {
        //   setData(updatedCategoryData);
        // } else {
        //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        // }

        toast.success(editData ? dictionary['navigation'].Categoryupdatedsuccessfully : dictionary['navigation'].Categorycreatedsuccessfully);
        reset();
        handleClose();
      } else {
        throw new Error('API response error');
      }
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingcategoryPleasetryagain);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleReset = () => {
    handleClose();
    reset();
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, padding: 2 } }}
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditCategory : dictionary['navigation'].AddCategory}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textPrimary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='category'
                control={control}
                rules={{ required: dictionary['navigation'].Categoryisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].Category}
                    placeholder={dictionary['navigation'].Entercategory}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              {categoryImagePreview && (
                <img
                  src={categoryImagePreview}
                  alt="Category Image Preview"
                  style={{ width: '100px', height: '100px', borderRadius: '4px', marginTop: '10px' }}
                />
              )}
              <Controller
                name='categoryImage'
                control={control}
                rules={{ required: dictionary['navigation'].Categoryimageisrequired,validate: value => validateImage(value, dictionary) }}
                render={({ field: { onChange } }) => (
                  <CustomTextField
                    type="file"
                    fullWidth
                    label={dictionary['navigation'].CategoryImage}
                    margin="normal"
                    onChange={e => {
                      const input = e.target as HTMLInputElement;

                      onChange(input.files);

                      if (input.files && input.files[0]) {
                        setCategoryImagePreview(URL.createObjectURL(input.files[0]));
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton>
                            <i className='tabler-image' />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.categoryImage}
                    helperText={errors.categoryImage?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="zoneId"
                control={control}
                rules={{ required: dictionary['navigation'].ZoneTypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Zone}
                    {...field}
                    error={!!errors.zoneId}
                    helperText={errors.zoneId?.message}
                  >
                    {zones.map((zone) => (
                      <MenuItem key={zone.id} value={zone.id}>
                        {zone.zoneName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
          </Grid>
          <div className='flex justify-end mt-4 gap-5'>
            <Button variant='contained' type='submit' disabled={isSubmitDisabled} sx={{ position: 'relative' }}>
              {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].Submit}
              {loading && (
                <CircularProgress size={24} color="inherit" />

              )}
            </Button>
            <Button
              onClick={handleReset}
              variant='outlined'
              color='error'
              style={{ marginLeft: '10px' }}
            >
              {dictionary['navigation'].cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddCategoryDrawer;
