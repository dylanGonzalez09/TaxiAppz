/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent } from 'react';
import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify'; // Import toast
import CircularProgress from '@mui/material/CircularProgress';

import Drawer from '@mui/material/Drawer';

import { useIsDemoUser } from '@/utils/demoUser'


import CustomTextField from '@core/components/mui/TextField';
import { createVersion } from '@apis/version';

import { validateTextWithNumber } from '@/utils/validation';

type versionType = {
  description: string;
  versionNumber: string;
  versionCode: string;
  applicationType: string
};

type Props = {
  open: boolean;
  handleClose: () => void;
  versionData: versionType[];
  dictionary: any;
  setData: (data: versionType[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
};

type FormValues = {
  versionNumber: string;
  versionCode: string;
  applicationType: string;
  description: string;
  status: string;
};

const AddVersionDrawer = (props: Props) => {
  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { open, handleClose, versionData, setData, dictionary, count,
    page,
    onPageChange,
    rowsPerPage } = props;

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      versionNumber: '',
      description: '',
      versionCode: '',
      applicationType: ''
    }
  });

  const generateVersionCode = () => {
    const generatedCode = 'V-' + Math.random().toString(16).substr(2, 32);

    setValue('versionCode', generatedCode);
  };

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      const newData: versionType = {
        description: data.description,
        versionNumber: data.versionNumber,
        versionCode: data.versionCode,
        applicationType: data.applicationType
      };

      const createData = await createVersion(newData);

      setData([createData, ...versionData]);
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      // if (rowsPerPage != versionData.length) {
      //   setData([...versionData, createData]);
      // } else {
      //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
      // }


      toast.success(dictionary['navigation'].Versioncreatedsuccessfully);

      handleReset();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorcreatingversionPleasetryagain);
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
      versionNumber: '',
      description: '',
      versionCode: '',
      applicationType: ''
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
        <Typography variant='h5'>{dictionary['navigation'].NewProjectVersion}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <div className='p-6'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='versionNumber'
            control={control}
            rules={{
              required: dictionary['navigation'].VersionNumberisrequired,
              pattern: {
                value: /^[A-Za-z0-9. ]+$/,
                message: 'Only letters, numbers, spaces, and dot (.) are allowed'
              }
            }} render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].versionNumber}
                placeholder={dictionary['navigation'].enterVersionNumber}
                error={!!errors.versionNumber}
                helperText={errors.versionNumber ? errors.versionNumber.message : ''}
              />
            )}
          />

          <Controller
            name='versionCode'
            control={control}
            rules={{ required: dictionary['navigation'].VersionCodeisrequired }}
            render={({ field }) => (
              <div className="flex items-center w-full gap-2">
                <CustomTextField
                  {...field}
                  fullWidth
                  disabled
                  label={dictionary['navigation'].versionCode}
                  placeholder={dictionary['navigation'].enterVersionCode}
                  error={!!errors.versionCode}
                  helperText={errors.versionCode ? errors.versionCode.message : ''}
                  sx={{ flexGrow: 1 }} // Make the text field take up remaining space
                />
                <Button
                  className="" style={{ marginTop: '16px' }}
                  variant="outlined"
                  onClick={generateVersionCode}
                >
                  {dictionary['navigation'].Generate}
                </Button>
              </div>
            )}
          />

          <Controller
            name='applicationType'
            control={control}
            rules={{ required: dictionary['navigation'].ApplicationTypeisrequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label={dictionary['navigation'].applicationType}
                error={!!errors.applicationType}
                helperText={errors.applicationType?.message}
              >
                <MenuItem value='Android'>{dictionary['navigation'].Android}</MenuItem>
                <MenuItem value='iOS'>{dictionary['navigation'].iOS}</MenuItem>
                <MenuItem value='Web'>{dictionary['navigation'].Web}</MenuItem>
              </CustomTextField>
            )}
          />
<Controller
  name='description'
  control={control}
  rules={{
    required: dictionary['navigation'].Descriptionisrequired,
    pattern: {
                value: /^[A-Za-z0-9. ]+$/,
                message: 'Only letters, numbers, spaces, and dot (.) are allowed'
              }
  }}
  render={({ field }) => (
    <CustomTextField
      {...field}
      fullWidth
      multiline
      minRows={3}
      label={dictionary['navigation'].description}
      placeholder={dictionary['navigation'].enterdescription}
      error={!!errors.description}
      helperText={errors.description?.message}
    />
  )}
/>

          <div className='flex justify-end gap-5'>
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

export default AddVersionDrawer;
