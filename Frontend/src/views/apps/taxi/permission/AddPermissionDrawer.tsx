/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent} from 'react';
import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField';
import { createPermission } from '@apis/permission';

import {
  validateTextOnly
} from '@/utils/validation';


type permissionType = {
  groupName: string;
  permissionName: string;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  dictionary: any;
  permissionData: permissionType[];
  setData: (data: permissionType[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
};

type FormValues = {
  groupName: string;
  permissionName: string;
};

const AddPermissionDrawer = (props: Props) => {
  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { open, handleClose, permissionData, setData, dictionary, count,
    page,
    onPageChange,
    rowsPerPage } = props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      groupName: '',
      permissionName: ''
    }
  });

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
    setLoading(true); // Start loading

    try {
      const newData: permissionType = {
        groupName: data.groupName,
        permissionName: data.permissionName
      };

      const createData = await createPermission(newData);

      setData([createData,...permissionData]);
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      // if (rowsPerPage != permissionData.length) {
      //   setData([...permissionData, createData]);
      // } else {
      //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
      // }


      toast.success('Permission added successfully');
      handleReset();
    } catch (error) {
      toast.error('Error adding permission. Please try again.');
    } finally {
      setLoading(false); // Start loading

    }
  };

  const handleReset = () => {
    handleClose();
    reset({
      groupName: '',
      permissionName: ''
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleReset}
      PaperProps={{
        sx: {
          width: '400px', // Adjust the width as needed
          padding: '16px'
        }
      }}
    >
      <div className='flex flex-col h-full'>
        <div className='flex items-center justify-between mb-4'>
          <Typography variant='h6'>{dictionary['navigation'].addPermission}</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textSecondary text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5 mt-4'>
          <Controller
            name='groupName'
            control={control}
            rules={{ required: 'Group Name is required', validate: value => validateTextOnly(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].groupName}
                placeholder={dictionary['navigation'].enterGroupName}
                error={!!errors.groupName}
                helperText={errors.groupName ? errors.groupName.message : ''}
              />
            )}
          />

          <Controller
            name='permissionName'
            control={control}
            rules={{ required: 'Permission Name is required', validate: value => validateTextOnly(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].permissionName}
                placeholder={dictionary['navigation'].enterPermissionName}
                error={!!errors.permissionName}
                helperText={errors.permissionName ? errors.permissionName.message : ''}
              />
            )}
          />
          <div className='flex items-center gap-4 mt-4'>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
            >
              {loading ? 'Submitting...' : 'Submit'}
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

export default AddPermissionDrawer;
