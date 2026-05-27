/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent } from 'react';
import React, { useState, useMemo } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify'; // Import toast
import CircularProgress from '@mui/material/CircularProgress';

import Drawer from '@mui/material/Drawer';

import { useIsDemoUser } from '@/utils/demoUser'


import CustomTextField from '@core/components/mui/TextField';
import CustomAutocomplete from '@core/components/mui/Autocomplete';

import {
  validateTextOnly, validateNumber
} from '@/utils/validation';


import { createSubScriptions } from '@/app/api/apps/taxi/subscription';

type SubScriptionType = {
  id?: string;
  name: string;
  validityPeriod: string;
  description: string;
  amount: string;
  unit: string;
  status?: boolean;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  subScriptionData: SubScriptionType[];
  dictionary: any;
  setData: React.Dispatch<React.SetStateAction<SubScriptionType[]>>;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  zoneId: string;
};

type FormValues = {
  name: string;
  validityPeriod: string;
  description: string;
  amount: string;
  unit: string;
};

type UnitOption = { id: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'; label: string };

const AddSubScriptionDrawer = (props: Props) => {
  const { open, handleClose, subScriptionData, setData, dictionary, count,
    page,
    onPageChange,
    rowsPerPage,
    zoneId } = props;

  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const {
    control,
    reset,
    handleSubmit,
    trigger,
  } = useForm<FormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      name: '',
      validityPeriod: '',
      description: '',
      amount: '',
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

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      const amount = parseFloat(String(data.amount).replace(/[^\d.-]/g, '')) || 0;

      const newData = {
        name: data.name,
        description: data.description,
        validityPeriod: data.validityPeriod,
        amount,
        unit: data.unit,
        zoneId
      };

      const createData = await createSubScriptions(newData);

      if (!createData) {
        toast.error(dictionary['navigation'].ErrorcreatingsubscriptionPleasetryagain);

        return;
      }

      const created = createData as {
        id?: string;
        _id?: string;
        name: string;
        validityPeriod: string;
        description: string;
        amount?: number;
        unit?: string;
        status?: boolean;
      };

      const id = created.id ?? created._id;

      setData((prev) => [
        ...prev,
        {
          id: String(id),
          name: created.name,
          validityPeriod: created.validityPeriod,
          description: created.description,
          amount: String(created.amount ?? data.amount),
          unit: created.unit ?? data.unit,
          status: created.status ?? true
        }
      ]);
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      toast.success(dictionary['navigation'].Subscriptioncreatedsuccessfully);

      handleReset();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorcreatingsubscriptionPleasetryagain);
    } finally {
      setLoading(false); // Start loading

    }
  };

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
    onPageChange(dummyEvent, 1);
  };


  const handleReset = () => {
    handleClose();
    reset({
      name: '',
      validityPeriod: '',
      description: '',
      amount: '',
      unit: ''
    });
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
        <Typography variant='h5'>{dictionary['navigation'].NewSubscription}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <div className='p-6'>
        {/* noValidate: use React Hook Form + helperText only (avoid browser "Please fill out this field") */}
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
                placeholder={dictionary['navigation'].name}
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
                id='subscription-add-unit'
                options={unitOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={unitOptions.find((o) => o.id === field.value) ?? null}
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
                      params.inputProps.onBlur?.(e as React.FocusEvent<HTMLInputElement>);
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
            rules={{ required: dictionary['navigation'].Descriptionisrequired }}
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
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
            >
              {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].Submit}
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

export default AddSubScriptionDrawer;
