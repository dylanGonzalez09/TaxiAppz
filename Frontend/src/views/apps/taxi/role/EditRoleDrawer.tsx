import { useEffect,useState } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import { validateTextOnly } from '@/utils/validation';

import CustomTextField from '@core/components/mui/TextField';
import { updateRole } from '@apis/role';

type roleType = {
  id: number;
  role: string;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  roleData: roleType[];
  dictionary: any;
  setData: (data: roleType[]) => void;
  initialData?: FormValues; // Optional initial data for editing
};

type FormValues = {
  id: string;
  role: string;
};

const EditRoleDrawer = (props: Props) => {
  const [loading, setLoading] = useState(false); // Loading state

  const { open, handleClose, roleData, setData, initialData, dictionary } = props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode:'all',
    defaultValues: initialData || {
      role: ''
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
        const updatedVersionInfo = removeId(data);

        // Perform the update operation
        const updateVersionData = await updateRole(data.id, updatedVersionInfo);

        // Update the roleData with the new information
        const updatedData: roleType[] = roleData.map((item) =>
          item.id === updateVersionData.id
            ? {
              ...item,
              role: data.role,
            }
            : item
        );

        // Set the updated data
        setData(updatedData);

        // Show success message
        toast.success(dictionary['navigation'].Roleupdatedsuccessfully);
      } else {
        // Show an error message if initialData is not available
        toast.error(dictionary['navigation'].ErrorupdatingroleInitialdatanotfound);
      }
    } catch (error) {
      // Show error message if the update fails
      toast.error(dictionary['navigation'].Errorupdatingrole);
      console.error('Error updating role:', error);
    } finally {
      setLoading(false); // Start loading
      handleReset();
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
          padding: '16px'
        }
      }}
    >
      <div className='flex flex-col h-full'>
        <div className='flex items-center justify-between mb-4'>
          <Typography variant='h6'>{dictionary['navigation'].editRole}</Typography>
          <IconButton onClick={handleReset}>
            <i className='tabler-x text-textSecondary text-2xl' />
          </IconButton>
        </div>
        <Divider />
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5 mt-4'>
          <Controller
            name='role'
            control={control}
            rules={{ required: dictionary['navigation'].rolerequired ,validate:validateTextOnly}}

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

export default EditRoleDrawer;
