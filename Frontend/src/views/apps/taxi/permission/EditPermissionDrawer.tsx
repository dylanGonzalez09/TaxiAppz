import { useEffect,useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import CustomTextField from '@core/components/mui/TextField';
import { updatePermission } from '@apis/permission';
import {
  validateTextOnly
} from '@/utils/validation';

type permissionType = {
  id: string;
  groupName: string;
  permissionName: string;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  dictionary: any;
  permissionData: permissionType[];
  setData: (data: permissionType[]) => void;
  initialData?: FormValues;
};

type FormValues = {
  id: string;
  groupName: string;
  permissionName: string;
};

const EditPermissionDrawer = (props: Props) => {
  const [loading, setLoading] = useState(false); // Loading state

  const { open, handleClose, permissionData, setData, initialData, dictionary } = props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode:'all',
    defaultValues: initialData || {
      id: '',
      groupName: '',
      permissionName: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      if (initialData) {
        const updatedPermissionInfo = removeId(data);
        const updatePermissionData = await updatePermission(data.id, updatedPermissionInfo);

        const updatedData: permissionType[] = permissionData.map((item) =>
          item.id === updatePermissionData.id
            ? {
              ...item,
              groupName: data.groupName,
              permissionName: data.permissionName,
            }
            : item
        );

        setData(updatedData);

        toast.success('Permission updated successfully');
      } else {
        toast.error('Initial data is missing. Unable to update permission.');
      }

      handleReset();
    } catch (error) {
      toast.error('Error updating permission. Please try again.');
    } finally{
      setLoading(false); // Start loading

    }
  };

  const handleReset = () => {
    handleClose();

  };

  const removeId = (obj: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = obj;


    return rest;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleReset}
      PaperProps={{
        sx: {
          width: '400px', // Adjust the width as needed
          padding: '16px',
          height: '100%',
        }
      }}
    >
      <div className='flex flex-col h-full'>
        <div className='flex items-center justify-between mb-4'>
          <Typography variant='h6'>{dictionary['navigation'].editPermission}</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textSecondary text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <div className='flex flex-col flex-grow mt-4'>
          <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5 flex-grow'>
            <Controller
              name='groupName'
              control={control}
              rules={{  required: 'Group Name is required', validate: value => validateTextOnly(value, dictionary)  }}
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
              rules={{ required: dictionary['navigation'].permissionNameRequired ,validate: value => validateTextOnly(value, dictionary) }}
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
           disabled={loading} // Disable button when loading
          endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
              <Button variant='outlined' color='error' onClick={handleReset}>
                {dictionary['navigation'].discard}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Drawer>
  );
};

export default EditPermissionDrawer;
