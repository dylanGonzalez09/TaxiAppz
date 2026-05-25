/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import Drawer from '@mui/material/Drawer';

import {
  validateTextOnly, validateNumber
} from '@/utils/validation';


import CustomTextField from '@core/components/mui/TextField';
import { updateSubScription } from '@/app/api/apps/taxi/subscription';

type subScriptionType = {
  id: string,
  name: string;
  validityPeriod: string;
  unit: string;
  description: string;
  amount: string;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  subScriptionData: subScriptionType[];
  dictionary: any;
  setData: (data: subScriptionType[]) => void;
  initialData?: FormValues; // Optional initial data for editing
};

type FormValues = {
  id: string,
  name: string;
  validityPeriod: string;
  unit: string;
  description: string;
  amount: string;
};

const EditSubScriptionDrawer = (props: Props) => {
  const { open, handleClose, subScriptionData, setData, initialData, dictionary } = props;
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode: "all",
    defaultValues: initialData || {
      name: '',
      description: '',
      amount: '',
      validityPeriod: '',
      unit:''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setCategory(initialData.unit);
    }
  }, [initialData, reset]);


  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {

      if (initialData) {
        const updatedSubScriptionInfo = removeId(data);


        const newUpdateData: any = {
          name: data.name,
          amount: data.amount,
          description: data.description,
          validityPeriod:data.validityPeriod,
          unit: category
        };

        const updateSubScriptionData = await updateSubScription(data.id, newUpdateData);

        const updatedData: subScriptionType[] = subScriptionData.map((item) =>
          item.id === updateSubScriptionData.id
            ? {
              ...item,
              name: updateSubScriptionData.name,
              amount: updateSubScriptionData.amount,
              description: updateSubScriptionData.description,
              validityPeriod:updateSubScriptionData.validityPeriod,
              unit: category
            }
            : item
        );

        setData(updatedData);

        toast.success(dictionary['navigation'].SubScriptionupdatedsuccessfully);
      } else {
        toast.error(dictionary['navigation'].InitialdataismissingUnabletoupdateSubScription);
      }

      handleReset();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorupdatingSubScriptionPleasetryagain);
    }finally{
      setLoading(false); // Start loading

    }
  };



  const removeId = (obj: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = obj;


    return rest;
  };

  const handleReset = () => {
    handleClose();
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
        <Typography variant='h5'>Edit SubScription</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>

          <Controller
            name='name'
            control={control}
            rules={{ required: dictionary['navigation'].Nameisrequired, validate: value => validateTextOnly(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].name}
                placeholder={dictionary['navigation'].entername}
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
              />
            )}
          />

             <Controller
            name='validityPeriod'
            control={control}
            rules={{ required: dictionary['navigation'].validityPeriod, validate: value => validateNumber(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].validityPeriod}
                placeholder={dictionary['navigation'].validityPeriod}
                error={!!errors.validityPeriod}
                helperText={errors.validityPeriod ? errors.validityPeriod.message : ''}
              />
            )}
          />

          <CustomTextField
            select
            fullWidth
            label={dictionary['navigation'].unit}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required // Add this line to make the field required
          >
            <MenuItem value="DAY"> {dictionary['navigation'].Day}</MenuItem>
            <MenuItem value="WEEK"> {dictionary['navigation'].Week}</MenuItem>
            <MenuItem value="MONTH"> {dictionary['navigation'].Month}</MenuItem>
            <MenuItem value="YEAR"> {dictionary['navigation'].Year}</MenuItem>
          </CustomTextField>

          <Controller
            name='amount'
            control={control}
            rules={{ required: dictionary['navigation'].Enteramount, validate: value => validateNumber(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].amount}
                placeholder={dictionary['navigation'].Enteramount}
                error={!!errors.amount}
                helperText={errors.amount ? errors.amount.message : ''}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            rules={{ required: dictionary['navigation'].Descriptionisrequired}}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                label={dictionary['navigation'].description}
                placeholder={dictionary['navigation'].enterdescription}
                error={!!errors.description}
                helperText={errors.description ? errors.description.message : ''}
              />
            )}
          />

          <div className='flex items-center gap-4'>
          <Button
          variant="contained"
          color="primary"
          type="submit"
           disabled={loading} // Disable button when loading
          endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
        >
          {loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update}
        </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary['navigation'].discard}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default EditSubScriptionDrawer;
