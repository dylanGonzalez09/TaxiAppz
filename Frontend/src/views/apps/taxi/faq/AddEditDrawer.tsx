/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent} from 'react';
import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Divider,
  Button,
  Drawer,
  Typography,
  MenuItem,
  Grid,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { getSession } from 'next-auth/react';

import CustomTextField from '@core/components/mui/TextField';
import { createFaq, updateFaq } from '@apis/faq';
import { useIsDemoUser } from '@/utils/demoUser' 

import { validateTextOnly } from '@/utils/validation';


import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

interface FaqDataType {
  id?: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  status?: boolean;
}

interface AddfaqDrawerProps {
  open: boolean;
  handleClose: () => void;
  faqData: any[];
  dictionary?: any;
  editData?: FaqDataType | null;
  setData: (data: any[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPage: number;
  langId: string;
}

interface FormValues {
  question: string;
  answer: string;
  category: string;
  language: string;
}

const AddfaqDrawer: React.FC<AddfaqDrawerProps> = ({
  open,
  handleClose,
  faqData,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary,
  langId
}) => {
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      question: '',
      answer: '',
      category: 'User',
      language: ''
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

          const filteredLang = (json.data.language as { id: string; name: string }[]).filter(
            (lang) => lang.id === langId
          );

          setLanguages(filteredLang);
        } catch (err) {
          toast.error(dictionary?.['navigation']?.dataFetchError || 'Error fetching languages');
        }
      };
  
      fetchLanguages();
  }, [langId]);

  useEffect(() => {
    if (editData) {
      setValue('question', editData.question);
      setValue('answer', editData.answer);
      setValue('category', editData.category);
      setValue('language', editData.language);

    } else {
      if(langId)
      {
        reset({
          question: '',
          answer: '',
          category: 'User',
          language: langId,
        });
      }

      // reset();
    }
  }, [editData, langId,setValue, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      let response;

      if (editData) {
        response = await updateFaq(editData.id, data);
      } else {
        response = await createFaq(data);
      }

      const newItem = {
        id: response.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        language: data.language,
        status: editData ? editData.status : true,
      };

      const updatedFaqData = editData
        ? faqData.map((item: FaqDataType) => (item.id === newItem.id ? newItem : item))
        : [newItem,...faqData];

        setData(updatedFaqData);
        handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      // if (rowsPerPage != faqData.length || editData) {
      //   setData(updatedFaqData);
      // } else {
      //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
      // }
      toast.success(editData ? dictionary['navigation'].Faqupdatedsuccessfully : dictionary['navigation'].Faqcreatedsuccessfully);
      reset();
      handleClose();
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingFaqPleasetryagain);
    } finally {
      setLoading(false);
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
      <div className='flex items-center justify-between mb-4'>
      {editData ? dictionary['navigation'].EditFaqQuestion : dictionary['navigation'].AddFaqQuestion}
      <IconButton
          size='small'
          onClick={() => {
            handleClose();
            reset();
          }}
        >
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='question'
                control={control}
                rules={{ required: dictionary['navigation'].Faqisrequired,
                  //  validate: value => validateTextOnly(value, dictionary)
                   }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].FaqQuestion}
                    placeholder={dictionary['navigation'].EnterFaqQuestion}
                    error={!!errors.question}
                    helperText={errors.question?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='answer'
                control={control}
                rules={{ required: dictionary['navigation'].Faqisrequired,
                  //  validate: value => validateTextOnly(value, dictionary) 
                  }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].Faqanswer}
                    placeholder={dictionary['navigation'].EnterFaqanswer}
                    error={!!errors.answer}
                    helperText={errors.answer?.message}
                  />
                )}
              />
            </Grid>
             <Grid item xs={12}>
              <Controller
                name='category'
                control={control}
                rules={{ required: dictionary['navigation'].categoryisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].category}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    <MenuItem value='User'>{dictionary['navigation'].User}</MenuItem>
                    <MenuItem value='Driver'>{dictionary['navigation'].Driver}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              {/* <Controller
                name="language"
                control={control}
                rules={{ required: dictionary['navigation'].Languageisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].language}
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
              /> */}
              <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <input type="hidden" {...field} value={langId || ''} />
                  )}
              />
            </Grid>
          </Grid>
          <div className='flex justify-end mt-4'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled}
              endIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
            </Button>
            <Button
              onClick={() => {
                handleClose();
                reset();
              }}
              variant='outlined'
              color='secondary'
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

export default AddfaqDrawer;
