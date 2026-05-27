import React, { useEffect, useState, useRef } from 'react';

import {
  IconButton,
  Divider,
  Button,
  InputAdornment,
  Drawer,
  Typography,
  Grid
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import MenuItem from '@mui/material/MenuItem';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';

import { useIsDemoUser } from '@/utils/demoUser';
import CustomTextField from '@core/components/mui/TextField';
import { BASE_IMAGE_URL } from '@apis/endpoint';
import { createIntro, updateIntro } from '@/app/api/apps/taxi/intro';
import { validateImage,validateSentence} from '@/utils/validation';


interface AddIntroDrawerProps {
  open: boolean;
  handleClose: () => void;
  vehicleData: any;
  dictionary: any;
  editData?: any;
  setData: any;
}

interface FormValues {
  image: FileList | null;
  title: string;
  description: string;
  type: string;
}

const AddIntroDrawer: React.FC<AddIntroDrawerProps> = ({
  open,
  handleClose,
  vehicleData,
  editData,
  setData,
  dictionary
}) => {
  const [ImagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref to clear file input

  const { handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      image: null,
      title: editData?.title || '',
      description: editData?.description || '',
      type: editData?.type || '',
    },
  });

  const handleDrawerClose = () => {
    reset();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    handleClose();
  };

  useEffect(() => {
    if (open) {
      if (editData) {
        reset({
          image: null,
          title: editData.title || '',
          description: editData.description || '',
          type: editData.type || 'driver',
        });
        setImagePreview(editData.image ? `${BASE_IMAGE_URL}${editData.image}` : null);
      } else {
        reset({
          image: null,
          title: '',
          description: '',
          type: 'driver',
        });
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  }, [editData, open, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      const formData = new FormData();

      if (data.image?.[0]) formData.append('image', data.image[0]);

      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('type', data.type);

      let response;

      if (editData) {
        response = await updateIntro(editData.id, formData);
      } else {
        formData.append('status', 'true');
        response = await createIntro(formData);
      }

      if (response) {
        const newitem = {
          id: response.id,
          image: response.image,
          title: response.title,
          description: response.description,
          status: response.status,
          type: response.type,
        };

        const updatedVehicleData = editData
          ? vehicleData.map((item: { id: string }) => (item.id === newitem.id ? newitem : item))
          : [...vehicleData, newitem];

        setData(updatedVehicleData);

        toast.success(editData ? dictionary['navigation'].Imageupdatedsuccessfully : dictionary['navigation'].Imagecreatedsuccessfully);
        handleDrawerClose(); // clear everything
      } else {
        throw new Error('API response error');
      }
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingImagePleasetryagain);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={handleDrawerClose}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between p-5">
        <Typography variant="h5">{editData ? dictionary['navigation'].EditIntroImage : dictionary['navigation'].AddIntroImage}</Typography>
        <IconButton size="small" onClick={handleDrawerClose}>
          <i className="tabler-x text-textSecondary text-2xl" />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col  p-6">
          <Grid item xs={12}>
            {ImagePreview && (
              <img src={ImagePreview} alt="Image" style={{ width: '100px', height: 'auto', borderRadius: '4px', marginTop: '10px' }} />
            )}
            <Controller
              name="image"
              control={control}
              rules={{
                required: !editData ? dictionary['navigation'].Imageisrequired : false,
                validate: value => {
                  if (!editData || (value && value.length > 0)) {
                    return validateImage(value, dictionary);
                  }

                  return true;
                }
              }}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  type="file"
                  fullWidth
                  label={dictionary['navigation'].Image}
                  margin="normal"
                  inputRef={fileInputRef}
                  onChange={e => {

                    const input = e.target as HTMLInputElement;

                    onChange(input.files);

                    if (input.files && input.files[0]) {
                      setImagePreview(URL.createObjectURL(input.files[0]));
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton><i className="tabler-image" /></IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.image}
                  helperText={errors.image?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              rules={{ required: dictionary['navigation'].Titleisrequired,
                validate:(value) => validateSentence(value,dictionary)
               }}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  label={dictionary['navigation'].Title}
                  fullWidth
                  margin="normal"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="type"
              control={control}
              defaultValue={editData?.type || 'driver'}
              rules={{ required: dictionary['navigation'].Typeisrequired }}
              render={({ field }) => (
                <CustomTextField
                  select
                  label={dictionary['navigation'].Type}
                  fullWidth
                  margin="normal"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.type}
                  helperText={errors.type?.message}
                >
                  <MenuItem value="driver">{dictionary['navigation'].Driver}</MenuItem>
                  <MenuItem value="user">{dictionary['navigation'].User}</MenuItem>
                </CustomTextField>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              rules={{ required: dictionary['navigation'].Descriptionisrequired }}
              render={({ field: { onChange, value } }) => (
                <CustomTextField
                  label={dictionary['navigation'].Description}
                  fullWidth
                  margin="normal"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  multiline
                  rows={4}
                />
              )}
            />
          </Grid>

          <div className="flex justify-end mt-4  gap-5">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitDisabled}
              endIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
            </Button>
            <Button
              onClick={handleDrawerClose}
              variant="outlined"
              color="error"
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

export default AddIntroDrawer;
