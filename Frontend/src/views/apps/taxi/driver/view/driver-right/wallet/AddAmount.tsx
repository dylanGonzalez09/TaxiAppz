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

type Props = {
  open: boolean;
  handleClose: () => void;
  setData: (amount: number) => void; // Expecting amount as number
};

type FormValues = {
  amount: string; // Single field for amount
};

const AddAmountDrawer = (props: Props,dictionary: any) => {
  const [loading, setLoading] = useState(false);
  const { open, handleClose, setData } = props;
  const { checkDemoStatus } = useIsDemoUser();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      amount: ''
    }
  });

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true);

    try {

      const amount = parseFloat(data.amount); // Convert to number
      
      setData(amount); // Send the amount to parent
      toast.success(dictionary['navigation'].Amountsubmittedsuccessfully);
      handleReset();

    } catch (error) {

      toast.error(dictionary['navigation'].ErrorsubmittingamountPleasetryagain);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    handleClose();
    reset({ amount: '' });
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
        <Typography variant='h5'>{dictionary['navigation'].NewAmount}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <div className='p-6'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='amount'
            control={control}
            rules={{ required: dictionary['navigation'].Amountisrequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].Amount}
                placeholder={dictionary['navigation'].Enteramount}
                error={!!errors.amount}
                helperText={errors.amount ? errors.amount.message : ''}
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
              {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].Submit}
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary['navigation'].Discard}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddAmountDrawer;
