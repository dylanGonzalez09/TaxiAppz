/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Divider,
  Button,
  Drawer,
  Grid,
  MenuItem,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { getSession } from 'next-auth/react';

import CustomTextField from '@core/components/mui/TextField';
import { createComplaints, updateComplaints } from '@apis/complaints';
import { useIsDemoUser } from '@/utils/demoUser';
import { validateTextOnly } from '@/utils/validation';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';


interface ComplaintsDataType {
  id: string;
  title: string;
  type: string;
  language: string;
  status: boolean;
}

interface AddcomplaintsDrawerProps {
  open: boolean;
  handleClose: () => void;
  complaintsData: any[];
  dictionary?: any;
  editData?: ComplaintsDataType | null;
  setData: (data: any[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPage: number;
    langId: string;

}

interface FormValues {
  title: string;
  type: string;
  language: string;
}

const AddcomplaintsDrawer: React.FC<AddcomplaintsDrawerProps> = ({
  open,
  handleClose,
  complaintsData,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary,
    langId,
}) => {
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      title: '',
      type: '',
      language: '',
    },
  });

    const getClientId = async () => {
      const session = await getSession();
      const clientId = session?.user?.image?.clientId;
      const companyId = session?.user?.image?.companyId;
  
  
      return { clientId, companyId };
    };

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const { clientId } = await getClientId();

        if (!clientId) throw new Error('Client ID missing');

        const res = await fetch(ENDPOINTS.user.dropDownList(clientId));
        const json = await res.json();

        setLanguages(json.data.language || []);
      } catch (err) {
        toast.error(dictionary?.['navigation']?.dataFetchError || 'Error fetching languages');
      }
    };

    fetchLanguages();
  }, []);

  useEffect(() => {
    if (editData) {
      setValue('title', editData.title);
      setValue('type', editData.type);
   
      setValue('language', editData.language);
    } else {
      if(langId)
      {
        reset({
          title: '',
          type: '',
          
          language: langId,
        });
      }

      // reset();
    }
  }, [editData, langId,setValue, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      const response = editData
        ? await updateComplaints(editData.id, data)
        : await createComplaints(data);

      const newItem = {
        id: response.id,
        ...data,
        status: editData ? editData.status : true,
      };

      const updatedComplaintsData = editData
        ? complaintsData.map(item => (item.id === newItem.id ? newItem : item))
        : [newItem, ...complaintsData];

      setData(updatedComplaintsData);
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      toast.success(
        editData
          ? dictionary['navigation'].Complaintsupdatedsuccessfully
          : dictionary['navigation'].Complaintscreatedsuccessfully
      );
      reset();
      handleClose();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingComplaintsPleasetryagain);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChangeForAddRecord = (
    count: number,
    rowsPerPage: number,
    onPageChange: (event: ChangeEvent<unknown>, page: number) => void
  ) => {
    const dummyEvent = {
      target: { value: 1 },
      currentTarget: { value: 1 },
      nativeEvent: {} as Event,
      bubbles: false,
    } as unknown as ChangeEvent<unknown>;

    onPageChange(dummyEvent, 1);
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
     <div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold">
    {editData
      ? dictionary['navigation'].EditComplaints
      : dictionary['navigation'].AddComplaints}
  </h2>
  <IconButton
    size="small"
    onClick={() => {
      handleClose();
      reset();
    }}
  >
    <i className="tabler-x text-textSecondary text-2xl" />
  </IconButton>
</div>
       <Divider />
       <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6 p-6">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: dictionary['navigation'].Titleisrequired,
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].title}
                    placeholder={dictionary['navigation'].EnterTitle}
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
                rules={{
                  required: dictionary['navigation'].Typeisrequired,
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].type}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="driver">Driver</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            {/* <Grid item xs={12}>
              <Controller
                name="language"
                control={control}
                rules={{ required: dictionary['navigation'].Languageisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].Language}
                    error={!!errors.language}
                    helperText={errors.language?.message}
                  >
                    {languages.map(lang => (
                      <MenuItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid> */}
          </Grid>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitDisabled}
              endIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {editData
                ? loading
                  ? dictionary['navigation'].Updating
                  : dictionary['navigation'].Update
                : loading
                ? dictionary['navigation'].Creating
                : dictionary['navigation'].Create}
            </Button>
            <Button
              onClick={() => {
                handleClose();
                reset();
              }}
              variant="outlined"
              color="secondary"
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

export default AddcomplaintsDrawer;
