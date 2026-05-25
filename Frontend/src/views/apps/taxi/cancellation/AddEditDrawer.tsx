/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Divider,
  Button,
  Drawer,
  Typography,
  Grid,
  MenuItem,
} from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';

import { useForm, Controller } from 'react-hook-form';

import { toast } from 'react-toastify';
import { getSession } from 'next-auth/react';  // For client-side

import { ENDPOINTS } from '@apis/endpoint';

import CustomTextField from '@core/components/mui/TextField';

// Import your API functions for creating and updating cancellations

import { createCancellation, updateCancellation } from '@apis/cancellationReason';
import { useIsDemoUser } from '@/utils/demoUser'

interface CancellationDataType {
  id: string;
  reason: string;
  userType: string;
  tripStatus: string;
  payStatus: string;
  status: boolean;
  language:string
}
interface AddCancellationDrawerProps {
  open: boolean;
  handleClose: () => void;
  cancellationData: any;
  editData?: any;
  dictionary?: any;
  setData: (data: CancellationDataType[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  langId:string
}

interface FormValues {
  userType: string;
  reason: string;
  tripStatus: string;
  payStatus: string;
  status: boolean;
  zoneId: string;
  amount?: string;
    language: string;

}

// Static options for selects
const REASON_TYPES = [
  { id: '1', name: 'User' },
  { id: '2', name: 'Driver' },
  { id: '3', name: 'Both' },
];

const TRIP_STATUSES = [
  // { id: '1', name: 'Before Accept' },
  { id: '1', name: 'Before Arrive' },
  { id: '2', name: 'After Arrived' },
];

const PAY_STATUSES = [
  { id: 'Free', name: 'Free' },
  { id: 'Pay', name: 'Pay' },
];

const AddCancellationDrawer: React.FC<AddCancellationDrawerProps> = ({
  open,
  handleClose,
  cancellationData,
  editData,
  setData,
  dictionary,
  count,
  page,
  onPageChange,
  rowsPerPage,
  langId
}) => {
  const [loading, setLoading] = useState(false);
  const { checkDemoStatus } = useIsDemoUser();
  const [zones, setZones] = useState<any[]>([]); // State for storing zones
  const [showAmount, setShowAmount] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('');

  const getClientId = async () => {


    const session = await getSession();

    const clientId = session?.user?.image?.clientId; // Access clientId
    const companyId = session?.user?.image?.companyId; // Access companyId

    return { clientId, companyId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const dropDownData = await fetch(ENDPOINTS.zone.dropDownList(clientId));

        const data = await dropDownData.json();

        setZones(data.data.zone);

      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);


  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      userType: '',
      reason: '',
      tripStatus: '',
      payStatus: '',
      amount: '',
      zoneId: '',
      status: true,
        language: ''
    },
  });

  useEffect(() => {
    if (editData) {
      setValue('userType', editData.userType);
      setValue('reason', editData.reason);
      setValue('tripStatus', editData.tripStatus);
      setValue('payStatus', editData.payStatus);
      setValue('zoneId', editData.zoneId);
      setValue('amount', editData.amount ?? '');
            setValue('language', editData.language);

      setShowAmount(editData.payStatus === 'Pay');

    } else {
      if(langId)
      {
        reset({
          reason: '',
          userType: 'User',
          payStatus: '',
          language: langId,
        });
      }
      
      // reset();
   
    }

  }, [editData, langId,setValue, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      let response;

      const payload = {
        ...data,
        status: editData ? editData.status : true,
      };

      if (editData) {
        response = await updateCancellation(editData.id, payload);
      } else {
        response = await createCancellation(payload);

      }

      const newItem = {
        id: response.id,
        userType: payload.userType,
        reason: payload.reason,
        tripStatus: payload.tripStatus,
        payStatus: payload.payStatus,
        zoneId: payload.zoneId,
        amount: payload.amount,
        status: payload.status,
      };

      const updatedCancellationData = editData
        ? cancellationData.map((item: { id: string }) => (item.id === newItem.id ? newItem : item))
        : [newItem, ...cancellationData];

      setData(updatedCancellationData);

      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);


      // if (rowsPerPage != cancellationData.length) {
      //   const updatedCancellationData = editData
      //     ? cancellationData.map((item: { id: string }) => (item.id === newItem.id ? newItem : item))
      //     : [...cancellationData, newItem];

      //   setData(updatedCancellationData);
      // } else {
      //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      // }
      //

      toast.success(editData ? dictionary['navigation'].Cancellationupdatedsuccessfully : dictionary['navigation'].Cancellationcreatedsuccessfully);
      reset();
      handleClose();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingcancellationPleasetryagain);
    } finally {
      setLoading(false);
    }
  };

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
    onPageChange(dummyEvent, 1);
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
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditCancellation : dictionary['navigation'].AddCancellation}</Typography>
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
                name='userType'
                control={control}
                rules={{ required: dictionary['navigation'].CancellationTypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].ReasonType}
                    error={!!errors.userType}
                    helperText={errors.userType?.message}
                  >
                    {REASON_TYPES.map((reason) => (
                      <MenuItem key={reason.id} value={reason.name}>
                        {reason.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
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
                    onChange={(e) => {
                      field.onChange(e);
                      const selectedZone = zones.find((zone) => zone.id === e.target.value);

                      const symbol = selectedZone?.currency_symbol;

                      setCurrencySymbol(symbol);
                    }}
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

            <Grid item xs={12}>
              <Controller
                name='reason'
                control={control}
                rules={{ required: dictionary['navigation'].CancellationReasonisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].cancellationReasons}
                    placeholder={dictionary['navigation'].EnterCancellationReason}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='tripStatus'
                control={control}
                rules={{ required: dictionary['navigation'].TripStatusisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].TripStatus}
                    error={!!errors.tripStatus}
                    helperText={errors.tripStatus?.message}
                  >
                    {TRIP_STATUSES.map((status) => (
                      <MenuItem key={status.id} value={status.name}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='payStatus'
                control={control}
                rules={{ required: dictionary['navigation'].PayStatusisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].PayStatus}
                    error={!!errors.payStatus}
                    helperText={errors.payStatus?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      const value = e.target.value;

                      setShowAmount(value === 'Pay'); // Show amount only when Pay selected

                      if (value !== 'Pay') {
                        setValue('amount', undefined); // Clear amount if not Pay
                      }
                    }}
                  >
                    {PAY_STATUSES.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            {showAmount && (
              <Grid item xs={12}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: dictionary['navigation'].AmountisrequiredwhenpaystatusisPay,
                    pattern: {
                      value: /^[0-9]*$/,
                      message: dictionary['navigation'].AmountMustBeANumber,
                    },
                    validate: (value) => {
                      if (typeof value === 'string' && value.length > 4) {
                        return dictionary['navigation'].AmountCannotExceed4Digits;
                      }


                      return true; // Validation passed
                    },
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={`${dictionary['navigation'].Amount} ${currencySymbol ? `(${currencySymbol})` : ''}`}
                      error={!!errors.amount}
                      helperText={errors.amount?.message}

                    />
                  )}
                />
              </Grid>


            )}

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

export default AddCancellationDrawer;
