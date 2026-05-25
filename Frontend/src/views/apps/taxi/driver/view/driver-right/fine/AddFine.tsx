import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';

import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField';
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'; // Import your date picker

type FineType = {
  driverName: string;
  fineAmount: string;
  description: string;
  date: string; // Use string for date
};

type Props = {
  open: boolean;
  handleClose: () => void;
  setData: (fine: FineType) => void;
};

const AddFineDrawer = (props: Props,dictionary: any) => {
  const [loading, setLoading] = useState(false);
  const { open, handleClose, setData } = props;
  const { checkDemoStatus } = useIsDemoUser();

  const { control, reset, handleSubmit, formState: { errors } } = useForm({
    mode: 'all',
    defaultValues: {
      driverName: '',
      fineAmount: '',
      description: '',
      date: null,
    }
  });

  const handleFormSubmit = async (data: any) => {
    setLoading(true);

    try {
      const newFine = {
        driverName: data.driverName,
        fineAmount: data.fineAmount,
        description: data.description,
        date: data.date ? data.date.toISOString().split('T')[0] : '', // Convert Date to string
      };

      setData(newFine); // Send the new fine object to parent
      toast.success('Fine added successfully');
      handleReset();
    } catch (error) {
      toast.error('Error adding fine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    handleClose();
    reset();
  };

  const isSubmitDisabled = checkDemoStatus() || loading;

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pl-6 pt-5 pb-3'>
        <Typography variant='h5'>{dictionary['navigation'].AddNewFine}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <div className='p-6'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='driverName'
            control={control}
            rules={{ required: dictionary['navigation'].DriverNameisrequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].DriverName}
                placeholder={dictionary['navigation'].EnterDriverName}
                error={!!errors.driverName}
                helperText={errors.driverName ? errors.driverName.message : ''}
              />
            )}
          />
          <Controller
            name='fineAmount'
            control={control}
            rules={{ required: dictionary['navigation'].FineAmountisrequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].FineAmount}
                placeholder={dictionary['navigation'].EnterFineAmount}
                error={!!errors.fineAmount}
                helperText={errors.fineAmount ? errors.fineAmount.message : ''}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].Description}
                placeholder='Enter description'
              />
            )}
          />
          <Controller
            name='date'
            control={control}
            render={({ field: { onChange, value } }) => (
              <AppReactDatepicker
                selected={value} // Set the selected date
                id='date-input'
                onChange={onChange} // Update the form state on date change
                placeholderText={dictionary['navigation'].ClicktoSelectaDate}
                customInput={<CustomTextField label='Date' fullWidth />} // Use CustomTextField for styling
              />
            )}
          />

          <div className='flex items-center gap-4'>
            <Button
              variant='contained'
              color='primary'
              type='submit'
              disabled={isSubmitDisabled}
              endIcon={loading && <CircularProgress size={20} color='inherit' />}
            >
              {loading ? dictionary['navigation'].submitting : dictionary['navigation'].submit}
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              { dictionary['navigation'].Discard}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddFineDrawer;
