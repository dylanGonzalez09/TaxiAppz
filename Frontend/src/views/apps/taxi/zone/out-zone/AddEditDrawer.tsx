import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Divider,
  Button,
  Drawer,
  Typography,
  Grid,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';
import { createOutZone, updateOutZone } from '@apis/outOfZone';

interface OutZoneDataType {
  id?: string;
  kilometer: number;
  price: number;
  status?: boolean;
}

interface AddOutZoneDrawerProps {
  open: boolean;
  handleClose: () => void;
  outZoneData: any[];
  dictionary?: any;
  editData?: any;
  setData: (data: any[]) => void;
  setTotalResults?: React.Dispatch<React.SetStateAction<number>>;
}

interface FormValues {
  kilometer: number;
  price: number;
}

const AddOutZoneDrawer: React.FC<AddOutZoneDrawerProps> = ({
  open,
  handleClose,
  outZoneData,
  editData,
  setData,
  setTotalResults,
  dictionary
}) => {
  const [loading, setLoading] = useState(false);
  const { checkDemoStatus } = useIsDemoUser();

  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      kilometer: 0,
      price: 0,
    },
  });

  useEffect(() => {
    if (editData) {
      setValue('kilometer', editData.kilometer);
      setValue('price', editData.price);
    } else {
      reset();
    }
  }, [editData, setValue, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      let response;

      if (editData) {
        response = await updateOutZone(editData.id, data);
      } else {
        response = await createOutZone(data);
      }

      const newItem = {
        id: response.id,
        kilometer: data.kilometer,
        price: data.price,
        status: editData ? editData.status : true,
      };

      const updatedOutZoneData = editData
        ? outZoneData.map((item: OutZoneDataType) => (item.id === newItem.id ? newItem : item))
        : [...outZoneData, newItem];

      setData(updatedOutZoneData);

      if (!editData && setTotalResults) {
        setTotalResults((prev) => prev + 1);
      }

      toast.success(editData ? dictionary['navigation'].OutZoneupdatedsuccessfully : dictionary['navigation'].OutZonecreatedsuccessfully);
      reset();
      handleClose();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingOutZonePleasetryagain);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = checkDemoStatus() || loading;

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
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditOutZone : dictionary['navigation'].AddOutZone}</Typography>
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
      <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
           <Controller
  name='kilometer'
  control={control}
  rules={{
    required: dictionary['navigation'].Kilometerisrequired,
    min: {
      value: 1,
      message: dictionary['navigation'].Kilometermustbegreaterthanzero || 'Kilometer must be greater than 0',
    },
  }}
  render={({ field }) => (
    <CustomTextField
      {...field}
      fullWidth
      label={dictionary['navigation'].Kilometer}
      placeholder={dictionary['navigation'].EnterKilometer}
      error={!!errors.kilometer}
      helperText={errors.kilometer?.message}
      type='number'
      value={field.value === 0 ? '' : field.value}
      onFocus={() => {
        if (field.value === 0) {
          field.onChange('');
        }
      }}
      onChange={(e) => {
        const val = e.target.value;

        field.onChange(val === '' ? '' : Number(val));
      }}
    />
  )}
/>

              </Grid>
            <Grid item xs={12}>
         <Controller
  name='price'
  control={control}
  rules={{
    required: dictionary['navigation'].Priceisrequired,
    min: {
      value: 1,
      message: dictionary['navigation'].Pricemustbegreaterthanzero || 'Price must be greater than 0',
    },
  }}
  render={({ field }) => (
    <CustomTextField
      {...field}
      fullWidth
      label={dictionary['navigation'].Price}
      placeholder={dictionary['navigation'].EnterPrice}
      error={!!errors.price}
      helperText={errors.price?.message}
      type='number'
      value={field.value === 0 ? '' : field.value}
      onFocus={() => {
        if (field.value === 0) {
          field.onChange('');
        }
      }}
      onChange={(e) => {
        const val = e.target.value;

        field.onChange(val === '' ? '' : Number(val));
      }}
    />
  )}
/>


            </Grid>
          </Grid>
          <div className='flex justify-end mt-4'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled}
              endIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
            </Button>
            <Button
              onClick={() => {
                handleClose();
                reset();
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

export default AddOutZoneDrawer;
