import { useState, useEffect } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { useForm } from 'react-hook-form';

import { updateCountry } from '@apis/country';

type countryType = {
  id: string;
  name: string;
  dial_code: string;
  currency_code: string;
  currency_symbol: string;
  status: boolean;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  countryData: countryType[];
  setData: (data: countryType[]) => void;
  initialData?: FormValues; // Optional initial data for editing
};

type FormValues = {
  id: string,
  name: string;
  dial_code: string;
  currency_code: string;
  currency_symbol: string;
  status: boolean;
};

const EditCountryDialog = (props: Props,dictionary: any) => {
  const { open, handleClose, countryData, setData, initialData } = props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState(true);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    control,
    reset,
    handleSubmit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: initialData || {
      name: '',
      dial_code: '',
      currency_code: '',
      currency_symbol: '',
      status: true
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setStatus(initialData.status);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    if (initialData) {
      const updatedCountryInfo = removeId(data);

      const updateCountryStatus = {
        status: !updatedCountryInfo.status
      }

      const updateCountryData = await updateCountry(data.id, updateCountryStatus);

      const updatedData: countryType[] = countryData.map((item) =>
        item.id === updateCountryData.id
          ? {
            ...item,
            name: updateCountryData.name,
            dial_code: updateCountryData.dial_code,
            currency_code: updateCountryData.currency_code,
            currency_symbol: updateCountryData.currency_symbol,
            status: updateCountryData.status
          }
          : item
      );

      setData(updatedData);
    }

    handleReset();
  };

  const removeId = (obj: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = obj;


return rest;
  };

  const handleReset = () => {
    handleClose();
    reset({
      name: '',
      dial_code: '',
      currency_code: '',
      currency_symbol: '',
      status: true
    });
    setStatus(true);
  };


  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle>
        <div className='flex items-center justify-between'>
          {dictionary['navigation'].EditLanguage}
        </div>
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          {/* <Controller
            name='name'
            control={control}
            rules={{ required: 'Language is required.' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Language'
                placeholder='Enter Language'
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
              />
            )}
          />
          <Controller
            name='code'
            control={control}
            rules={{ required: 'Language Code is required.' }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Language Code'
                placeholder='Enter a Language code...'
                error={!!errors.code}
                helperText={errors.code ? errors.code.message : ''}
              />
            )}
          />
          <CustomTextField
            select
            fullWidth
            label='Status'
            value={status}
            onChange={handleStatusChange}
          >
            <MenuItem value='true'>Active</MenuItem>
            <MenuItem value='false'>Inactive</MenuItem>
          </CustomTextField> */}

          <div className='flex items-center gap-4'>
            <Button variant='contained' onClick={handleSubmit(handleFormSubmit)}>
              {dictionary['navigation'].Save}
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary['navigation'].Discard}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCountryDialog;
