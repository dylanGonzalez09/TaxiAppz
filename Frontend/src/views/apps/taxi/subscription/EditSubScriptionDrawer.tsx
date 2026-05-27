/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FocusEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import Drawer from '@mui/material/Drawer';

import {
  validateTextOnly, validateNumber
} from '@/utils/validation';


import CustomTextField from '@core/components/mui/TextField';
import CustomAutocomplete from '@core/components/mui/Autocomplete';
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
  onOfDrivers?: number;
};

type UnitOption = { id: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'; label: string };

const EditSubScriptionDrawer = (props: Props) => {
  const { open, handleClose, subScriptionData, setData, initialData, dictionary } = props;
  const [loading, setLoading] = useState(false); // Loading state

  const {
    control,
    reset,
    handleSubmit,
    trigger,
  } = useForm<FormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: initialData || {
      id: '',
      name: '',
      description: '',
      amount: '',
      validityPeriod: '',
      unit: ''
    }
  });

  const unitOptions: UnitOption[] = useMemo(
    () => [
      { id: 'DAY', label: dictionary['navigation'].Day },
      { id: 'WEEK', label: dictionary['navigation'].Week },
      { id: 'MONTH', label: dictionary['navigation'].Month },
      { id: 'YEAR', label: dictionary['navigation'].Year }
    ],
    [dictionary]
  );

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        amount: initialData.amount || '',
        unit: initialData.unit || ''
      });
    }
  }, [initialData, reset]);


  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {

      if (initialData) {
        const newUpdateData: any = {
          name: data.name,
          description: data.description
        };

        const updateSubScriptionData = await updateSubScription(data.id, newUpdateData);

        const updated = updateSubScriptionData as {
          id?: string;
          name?: string;
          amount?: number;
          description?: string;
          validityPeriod?: string;
          unit?: string;
        };

        const updatedData: subScriptionType[] = subScriptionData.map((item) =>
          item.id === data.id
            ? {
              ...item,
              name: updated.name ?? data.name,
              description: updated.description ?? data.description
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
        <form
          noValidate
          autoComplete='off'
          onSubmit={handleSubmit(handleFormSubmit)}
          className='flex flex-col gap-5'
        >

          <Controller
            name='name'
            control={control}
            rules={{ required: dictionary['navigation'].Nameisrequired, validate: value => validateTextOnly(value, dictionary) }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={`${dictionary['navigation'].name} *`}
                placeholder={dictionary['navigation'].entername}
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? ''}
                onBlur={() => {
                  field.onBlur();
                  void trigger('name');
                }}
              />
            )}
          />

             <Controller
            name='validityPeriod'
            control={control}
            rules={{
              required: dictionary['navigation'].validityPeriodisrequired,
              validate: value => validateNumber(value, dictionary)
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={`${dictionary['navigation'].validityPeriod} *`}
                placeholder={dictionary['navigation'].validityPeriod}
                disabled
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? ''}
                onBlur={() => {
                  field.onBlur();
                  void trigger('validityPeriod');
                }}
              />
            )}
          />

          <Controller
            name='unit'
            control={control}
            rules={{ required: dictionary['navigation'].Unitisrequired }}
            render={({ field, fieldState }) => (
              <CustomAutocomplete<UnitOption, false, false, false>
                id='subscription-edit-unit'
                options={unitOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={unitOptions.find((o) => o.id === field.value) ?? null}
                disabled
                onChange={(_, newValue) => {
                  field.onChange(newValue?.id ?? '');
                  void trigger('unit');
                }}
                onBlur={field.onBlur}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    label={`${dictionary['navigation'].unit} *`}
                    placeholder={
                      dictionary['navigation'].typeToSearchUnit || 'Type to search unit'
                    }
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message ?? ''}
                    onBlur={(e) => {
                      params.inputProps.onBlur?.(e as FocusEvent<HTMLInputElement>);
                      field.onBlur();
                      void trigger('unit');
                    }}
                  />
                )}
              />
            )}
          />

          <Controller
            name='amount'
            control={control}
            rules={{ required: dictionary['navigation'].Enteramount, validate: value => validateNumber(value, dictionary) }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={`${dictionary['navigation'].amount} *`}
                placeholder={dictionary['navigation'].Enteramount}
                disabled
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? ''}
                onBlur={() => {
                  field.onBlur();
                  void trigger('amount');
                }}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            rules={{ required: dictionary['navigation'].Descriptionisrequired}}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                label={`${dictionary['navigation'].description} *`}
                placeholder={dictionary['navigation'].enterdescription}
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? ''}
                onBlur={() => {
                  field.onBlur();
                  void trigger('description');
                }}
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
