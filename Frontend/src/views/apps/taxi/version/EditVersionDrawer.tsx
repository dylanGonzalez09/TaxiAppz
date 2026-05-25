import { useState, useEffect } from 'react';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import Drawer from '@mui/material/Drawer';

import CustomTextField from '@core/components/mui/TextField';
import { updateVersion } from '@apis/version';

type versionType = {
  id: string;
  description: string;
  versionNumber: string;
  versionCode: string;
  applicationType: string;
  status: boolean;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  versionData: versionType[];
  dictionary: any;
  setData: (data: versionType[]) => void;
  initialData?: FormValues; // Optional initial data for editing
};

type FormValues = {
  id: string,
  versionNumber: string;
  versionCode: string;
  applicationType: string;
  description: string;
  status: boolean;
};

const EditVersionDrawer = (props: Props) => {
  const { open, handleClose, versionData, setData, initialData, dictionary } = props;
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false); // Loading state


  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode:'all',
    defaultValues: initialData || {
      versionNumber: '',
      description: '',
      versionCode: '',
      applicationType: '',
        }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setCategory(initialData.applicationType);
    }
  }, [initialData, reset]);


  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      if (initialData) {
        const updatedVersionInfo = removeId(data);

        const updateVersionData = await updateVersion(data.id, updatedVersionInfo);

        const updatedData: versionType[] = versionData.map((item) =>
          item.id === updateVersionData.id
            ? {
              ...item,
              description: updateVersionData.description,
              versionNumber: updateVersionData.versionNumber,
              versionCode: updateVersionData.versionCode,
              applicationType: category,
            }
            : item
        );

        setData(updatedData);

        toast.success(dictionary['navigation'].Versionupdatedsuccessfully);
      } else {
        toast.error(dictionary['navigation'].InitialdataismissingUnabletoupdateversion);
      }

      handleReset();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorupdatingversionPleasetryagain);
    } finally {
      setLoading(false); // Start loading

    }
  };



  const removeId = (obj: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = obj;


    return rest;
  };

  const handleReset = () => {
    handleClose();

    setCategory('');
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
        <Typography variant='h5'>{dictionary['navigation'].EditProjectVersion}</Typography>
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
            rules={{ required: dictionary['navigation'].VersionNumberisrequired }}
            render={({ field }) => (
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
              <CustomTextField
                {...field}
                fullWidth
                disabled
                label={dictionary['navigation'].versionCode}
                placeholder={dictionary['navigation'].enterVersionCode}
                error={!!errors.versionCode}
                helperText={errors.versionCode ? errors.versionCode.message : ''}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            rules={{ required: dictionary['navigation'].Descriptionisrequired }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                label={dictionary['navigation'].description}
                placeholder={dictionary['navigation'].enterdescription}
                error={!!errors.description}
                helperText={errors.description ? errors.description.message : ''}
              />
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              error={!!errors.applicationType}
              helperText={errors.applicationType?.message}
            >
              <MenuItem value='Android'>{dictionary['navigation'].Android}</MenuItem>
              <MenuItem value='iOS'>{dictionary['navigation'].iOS}</MenuItem>
              <MenuItem value='Web'>{dictionary['navigation'].Web}</MenuItem>
            </CustomTextField>
      
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

export default EditVersionDrawer;
