import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';

import { useIsDemoUser } from '@/utils/demoUser';
import { createFine } from '@apis/fine';

import CustomTextField from '@core/components/mui/TextField';
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'; // Import your date picker

type FineType = {
  requestNumber: string;

  // name: string;
  fineAmount: string;
  description: string;
  date: Date | null; // Use string for date
};

type Props = {
  open: boolean;
  handleClose: () => void;
  setData: (fine: FineType) => void;
  dictionary: any; 
  userId: string;

  // count: number;
  // page: number;
  // onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  // rowsPerPage: number;
};

const AddFineDrawer = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const { open, handleClose, setData,dictionary,userId } = props;
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { control, reset, handleSubmit, formState: { errors } } = useForm<FineType>({
    mode: 'all',
    defaultValues: {
      requestNumber: '',

      // name: '',
      fineAmount: '',
      description: '',
      date: null,
    }
  });

  const handleFormSubmit = async (data: FineType) => {
    setLoading(true);

    try {
      // const newFine = {
      //   requestId: data.requestId,
      //   driverName: data.driverName,
      //   fineAmount: data.fineAmount,
      //   description: data.description,
      //   date: data.date ? data.date.toISOString().split('T')[0] : '', // Convert Date to string
      // };

      const formData = new FormData();

      formData.append('requestId', data.requestNumber);
      formData.append('userId', userId);
      formData.append('fineAmount', data.fineAmount);
      formData.append('description', data.description);
      const date = data.date;
      const year = date!.getFullYear();
      const month = String(date!.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date!.getDate()).padStart(2, '0');

      const formattedDate = `${year}-${month}-${day}`;

      formData.append('date', formattedDate);

      // setData(newFine); // Send the new fine object to parent
      const createData = await createFine(formData);

      if(createData.message)
      {
        toast.error(createData.message);
      }
      else
      {
        const newFine: any = {
          requestNumber: createData.requestNumber,
          userId: createData.userId,
          fineAmount: createData.fineAmount,
          description: createData.description,
          date: createData.date
        };

        setData(newFine);
        toast.success(dictionary['navigation'].Fineaddedsuccessfully);
        handleReset();
      }
      
    } catch (error) {
      toast.error(dictionary['navigation'].ErroraddingfinePleasetryagain);
    } finally {
      setLoading(false);
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
            name='requestNumber'
            control={control}
            rules={{ required: dictionary['navigation'].requestNumber + ' ' + dictionary['navigation'].isRequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].requestNumber}
                placeholder={dictionary['navigation'].enterRequestId}
                error={!!errors.requestNumber}
                helperText={errors.requestNumber ? errors.requestNumber.message : ''}
              />
            )}
          />
          {/* <Controller
            name='name'
            control={control}
            rules={{ required: dictionary['navigation'].Name + ' ' + dictionary['navigation'].isRequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].Name}
                placeholder={dictionary['navigation'].enterName}
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
              />
            )}
          /> */}
          <Controller
            name='fineAmount'
            control={control}
            rules={{ required: dictionary['navigation'].FineAmount + ' ' + dictionary['navigation'].isRequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].FineAmount}
                placeholder={dictionary['navigation'].Enterfineamount}
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
                placeholder={dictionary['navigation'].Enterdescription}
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
                placeholderText={dictionary['navigation'].ClickToSelectDate}
                customInput={<CustomTextField label={dictionary['navigation'].Date} fullWidth />}
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

export default AddFineDrawer;
