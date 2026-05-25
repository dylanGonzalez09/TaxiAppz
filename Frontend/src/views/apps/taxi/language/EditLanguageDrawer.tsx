import { useState, useEffect } from 'react';

import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import { Divider } from '@mui/material';

import {
  validateTextOnly,
  validateSmallTextOnly
} from '@/utils/validation';

import CustomTextField from '@core/components/mui/TextField';
import { updateLanguage } from '@apis/language';

type languageType = {
  id: string;
  code: string;
  name: string;
  status: boolean;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  languageData: languageType[];
  dictionary:any;
  setData: (data: languageType[]) => void;
  initialData?: FormValues; // Optional initial data for editing
};

type FormValues = {
  id: string;
  code: string;
  name: string;
  status: boolean;
};

const EditLanguageDrawer = (props: Props) => {
  const { open, handleClose, languageData, setData, initialData, dictionary } = props;
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false); // Loading state


  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode:'all',
    defaultValues: initialData || {
      code: '',
      name: '',
      status: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setStatus(initialData.status);
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true); // Start loading

    try {
      if (initialData) {
        const updatedLanguageInfo = removeId(data);

        updatedLanguageInfo.status = status;

        const updateLanguageData = await updateLanguage(data.id, updatedLanguageInfo);

        const updatedData: languageType[] = languageData.map((item) =>
          item.id === updateLanguageData.id
            ? {
              ...item,
              code: updateLanguageData.code,
              name: updateLanguageData.name,
              status: status,
            }
            : item
        );

        setData(updatedData);
        toast.success(dictionary['navigation'].Languageupdatedsuccessfully);
      } else {
        toast.error(dictionary['navigation'].FailedtoupdatelanguageInitialdatamissing);
      }

      handleReset();
    } catch (error) {
      toast.error(dictionary['navigation'].Anerroroccurredwhileupdatingthelanguage);
    } finally{
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
    setStatus(true);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === 'true';

    setStatus(value);
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleReset} PaperProps={{ sx: { width: '400px' } }}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          <div>{dictionary['navigation'].editLanguage}</div>
          <IconButton size="small" onClick={handleReset}>
            <i className="tabler-x text-textSecondary text-2xl" />
          </IconButton>
        </div>
        <Divider />
        <div className="flex-grow p-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
            <Controller
              name="name"
              control={control}
              rules={{ required: dictionary['navigation'].Languageisrequired,validate:validateTextOnly }}
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
              rules={{ required: dictionary['navigation'].languagecoderequired,validate:validateSmallTextOnly }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].languageCode}
                  placeholder={dictionary['navigation'].enterLanguage}
                  error={!!errors.code}
                  helperText={errors.code ? errors.code.message : ''}
                />
              )}
            />
            <CustomTextField
              select
              fullWidth
              label={dictionary['navigation'].status}
              value={status}
              onChange={handleStatusChange}
            >
              <MenuItem value="true">{dictionary['navigation'].Active}</MenuItem>
              <MenuItem value="false">{dictionary['navigation'].Inactive}</MenuItem>
            </CustomTextField>

            <div className="flex items-center gap-4">
              
              <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit(handleFormSubmit)} 
           disabled={loading} // Disable button when loading
          endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
        >
          {loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update}
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

export default EditLanguageDrawer;
