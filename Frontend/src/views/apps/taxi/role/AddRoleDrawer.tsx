/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { createRole } from '@apis/role';

import { validateTextOnly } from '@/utils/validation';

type roleType = {
  role: string;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  roleData: roleType[];
  dictionary: any;
  setData: (data: roleType[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
};

type FormValues = {
  role: string;
};

const AddRoleDrawer = (props: Props) => {
  const [loading, setLoading] = useState(false); // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { open, handleClose, roleData, setData, dictionary, count,
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
      role: '',
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
      const newData: roleType = {
        role: data.role,
      };

      const createData = await createRole(newData);

      if (createData) {
        setData([createData,...roleData]);
        handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

        // if (rowsPerPage != roleData.length) {
        //   setData([...roleData, createData]);
        // } else {
        //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        // }

        toast.success(dictionary['navigation'].Roleaddedsuccessfully);
        handleReset();
      } else {
        toast.error(dictionary['navigation'].FailedtoaddroleNodatareturned);
      }
    } catch (error) {
      toast.error(dictionary['navigation'].Erroraddingrole);
    } finally {
      setLoading(false); // Start loading

    }
  };

  const handleReset = () => {
    handleClose();
    reset({
      role: ''
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
          <Typography variant='h6'>{dictionary['navigation'].addrole}</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textSecondary text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5 mt-4'>
          <Controller
            name='role'
            control={control}
            rules={{ required: dictionary['navigation'].rolerequired, validate: value => validateTextOnly(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].role}
                placeholder={dictionary['navigation'].enterrole}
                error={!!errors.role}
                helperText={errors.role ? errors.role.message : ''}
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

export default AddRoleDrawer;
