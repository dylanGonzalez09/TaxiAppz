/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent} from 'react';
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
import { createLanguage } from '@apis/language';

import {
  validateTextOnly,
  validateSmallTextOnly
} from '@/utils/validation';

type languageType = {
  name: string;
  code: string;
  status: boolean;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  languageData: languageType[];
  dictionary:any;
  setData: (data: languageType[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
};

type FormValues = {
  name: string;
  code: string;
  status: boolean;
};

const AddLanguageDrawer = (props: Props) => {
  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { open, handleClose, languageData, setData, dictionary, count,
    page,
    onPageChange,
    rowsPerPage } = props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      name: '',
      code: '',
      status: true,
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      const newData: languageType = {
        name: data.name,
        code: data.code,
        status: true,
      };

      // Create the new language
      const createData = await createLanguage(newData);

      setData([createData,...languageData]);
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      // if (rowsPerPage != languageData.length) {
      //   setData([...languageData, createData]);
      // } else {
      //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
      // }

      // Update the state with the new language data

      // Show success message
      toast.success(dictionary['navigation'].Languageaddedsuccessfully);

      // Optionally, reset the form or any other UI elements
      handleReset();
    } catch (error) {
      // Show error message
      toast.error(dictionary['navigation'].ErroraddinglanguagePleasetryagain);
    } finally {
      setLoading(false); // Start loading

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

  const handleReset = () => {
    handleClose();
    reset({
      name: '',
      code: '',
      status: true,
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleReset}
      PaperProps={{ sx: { width: '400px' } }} // Adjust the width of the drawer
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          <Typography variant="h5">{dictionary['navigation'].newLanguage}</Typography>
          <IconButton size="small" onClick={handleReset}>
            <i className="tabler-x text-textSecondary text-2xl" />
          </IconButton>
        </div>
        <Divider />
        <div className="p-4 flex-grow">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
            <Controller
              name="name"
              control={control}
              rules={{ required: dictionary['navigation'].Languageisrequired, validate: value => validateTextOnly(value, dictionary) }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].language}
                  placeholder={dictionary['navigation'].enterLanguage}
                  error={!!errors.name}
                  helperText={errors.name ? errors.name.message : ''}
                />
              )}
            />
            <Controller
              name="code"
              control={control}
              rules={{ required: dictionary['navigation'].Codeisrequired, validate: value => validateSmallTextOnly(value, dictionary) }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].code}
                  placeholder={dictionary['navigation'].enterCode}
                  error={!!errors.code}
                  helperText={errors.code ? errors.code.message : ''}
                />
              )}
            />
            <div className="flex items-center gap-4">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitDisabled} // Disable button when loading
                endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
              >
                {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].Submit}
              </Button>
              <Button variant="outlined" color="error" onClick={handleReset}>
                {dictionary['navigation'].discard}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Drawer>
  );
};

export default AddLanguageDrawer;
