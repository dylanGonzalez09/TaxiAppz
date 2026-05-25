/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent} from 'react';
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

import CustomTextField from '@core/components/mui/TextField';

import { createInvoice, updateInvoice } from '@apis/invoice';

import { validateTextOnly } from '@/utils/validation';
import { useIsDemoUser } from '@/utils/demoUser' 

interface InvoiceDataType {
  id?: string;
  question: string;
  role: string;
  status?: boolean;
}

interface AddinvoiceDrawerProps {
  open: boolean;
  handleClose: () => void;
  invoiceData: any[];
  dictionary?: any;
  editData?: InvoiceDataType | null;
  setData: (data: any[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  langId: string;
}

interface FormValues {
  question: string;
  role: string;
  language: string;
}

const AddinvoiceDrawer: React.FC<AddinvoiceDrawerProps> = ({
  open,
  handleClose,
  invoiceData,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary,
  langId
}) => {
  const [loading, setLoading] = useState(false);
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: { question: '', role: 'User',language: langId },
  });

  useEffect(() => {
    if (editData) {
      setValue('question', editData.question);
      setValue('role', editData.role);
    } else {
      reset();
    }
  }, [editData, langId,setValue, reset]);


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
    setLoading(true);

    try {
      let response;

      data.language = langId;

      if (editData) {
        response = await updateInvoice(editData.id, data);
      } else {
        response = await createInvoice(data);
      }
     
      if (response.error) {
        
        toast.error(response.error);
        
        return;
      }

      const newItem = {
        id: response.id,
        question: data.question,
        role: data.role,
        status: editData ? editData.status : true,
      };

      const updatedInvoiceData = editData
      ? invoiceData.map((item: InvoiceDataType) => (item.id === newItem.id ? newItem : item))
      : [newItem,...invoiceData];

      setData(updatedInvoiceData);
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      // if (rowsPerPage != invoiceData.length) {
      //   const updatedInvoiceData = editData
      //     ? invoiceData.map((item: InvoiceDataType) => (item.id === newItem.id ? newItem : item))
      //     : [...invoiceData, newItem];
      //   setData(updatedInvoiceData);
      // } else {
      //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
      // }

      toast.success(editData ? dictionary['navigation'].Invoiceupdatedsuccessfully : dictionary['navigation'].Invoicecreatedsuccessfully);
      reset();
      handleClose();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingInvoicePleasetryagain);
    } finally {
      setLoading(false);
    }
  };

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
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditInvoiceQuestion : dictionary['navigation'].AddInvoiceQuestion}</Typography>
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
                name='question'
                control={control}
                rules={{ required: dictionary['navigation'].Invoiceisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].InvoiceQuestion}
                    placeholder={dictionary['navigation'].EnterInvoiceQuestion}
                    error={!!errors.question}
                    helperText={errors.question?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='role'
                control={control}
                rules={{ required: dictionary['navigation'].Roleisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].Role}
                    error={!!errors.role}
                    helperText={errors.role?.message}
                  >
                    <MenuItem value='User'>{dictionary['navigation'].User}</MenuItem>
                    <MenuItem value='Driver'>{dictionary['navigation'].Driver}</MenuItem>
                  </CustomTextField>
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
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating: dictionary['navigation'].Create)}
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

export default AddinvoiceDrawer;
