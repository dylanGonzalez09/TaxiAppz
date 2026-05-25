/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';

import { Drawer, Button, IconButton, Typography, Divider, MenuItem, InputAdornment } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import CircularProgress from '@mui/material/CircularProgress';

import { getSession } from 'next-auth/react';

import CustomTextField from '@core/components/mui/TextField';

// API Imports

import { updateUser } from '@apis/user';

import {
  validateTextOnly, validateEmail,
  validPhoneNumber
} from '@/utils/validation';

import type { UsersType } from '@/types/apps/userTypes';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

type Props = {
  open: boolean;
  handleClose: () => void;
  userData: UsersType[];
  dictionary: any;
  setData: (data: UsersType[]) => void;
  initialData: UsersType | null;
};

export type UserStatus = 'active' | 'pending' | 'inactive';
export type UserRole = 'admin' | 'author' | 'editor' | 'maintainer' | 'subscriber';

type FormValidateType = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  language: string;
  country: string;
};

const EditUserDrawer: React.FC<Props> = ({ open, handleClose, userData, setData, initialData, dictionary }) => {
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string; dial_code: string; phoneLength: number }[]>([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null);

  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId;
    const companyId = session?.user?.image?.companyId;

    return { clientId, companyId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = getClientId();
        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {
          throw new Error("ClientId is undefined");
        }

        const dropDownData = await fetch(ENDPOINTS.user.dropDownList(clientId));
        const data = await dropDownData.json();

        setLanguages(data.data.language);
        setCountries(data.data.country);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // React Hook Form setup
  const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormValidateType>({
    mode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      language: '',
      country: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      setValue('firstName', initialData.firstName);
      setValue('lastName', initialData.lastName);
      setValue('email', initialData.email);
      setValue('phoneNumber', initialData.phoneNumber);
      setValue('language', initialData.language);
      setValue('country', initialData.country);

      // Set the country details based on initial data
      const selectedCountry = countries.find(c => c.id === initialData.country);

      if (selectedCountry) {
        setSelectedPhoneLength(selectedCountry.phoneLength);
        setSelectedDialCode(selectedCountry.dial_code);
      }
    }
  }, [initialData, countries, setValue]);

  const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id === countryId);

    if (selectedCountry) {
      setSelectedPhoneLength(selectedCountry.phoneLength);
      setSelectedDialCode(selectedCountry.dial_code);
    }
  };

  const onSubmit = async (data: FormValidateType) => {
    setLoading(true);

    try {
      if (initialData) {
        const updatedUser = {
          firstName: data.firstName || '',

          // lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          country: data.country,
          language: data.language,
        };

        await updateUser(`${initialData.id}`, updatedUser);

        const updatedData = userData.map(user =>
          user.id === initialData.id ? { ...user, ...updatedUser } : user
        );

        setData(updatedData);

        toast.success(dictionary['navigation'].Userupdatedsuccessfully);
        handleClose();
        reset();
      } else {
        toast.error(dictionary['navigation'].Noinitialdataavailableforupdate);
      }
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorupdatinguserPleasetryagain);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    handleClose();
    setSelectedDialCode(null);
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
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>{dictionary['navigation'].EditUser}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          <Controller
            name='firstName'
            control={control}
            rules={{
              required: dictionary['navigation'].FirstNameisrequired,
              validate: value => validateTextOnly(value, dictionary)
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={`${dictionary['navigation'].firstName} *`}
                placeholder={dictionary['navigation'].firstName}
                error={!!errors.firstName}
                helperText={errors.firstName?.message || dictionary['navigation'].invalidText}
              />
            )}
          />
          {/* <Controller
            name='lastName'
            control={control}
            rules={{
              required: dictionary['navigation'].LastNameisrequired,
              validate: value => validateTextOnly(value, dictionary)
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].LastName}
                placeholder={dictionary['navigation'].Doe}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          /> */}
          <Controller
            name='email'
            control={control}
            rules={{
              validate: (value) => validateEmail(value, dictionary)
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label={dictionary['navigation'].email} // No * since optional
                placeholder={dictionary['navigation'].email}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Controller
            name='country'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label={dictionary['navigation'].Country}
                error={!!errors.country}
                helperText={errors.country?.message}
                onChange={e => {
                  field.onChange(e);
                  handleCountryChange(e.target.value);
                }}
              >
                {countries.map(country => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
          <Controller
            name='phoneNumber'
            control={control}
            rules={{
              required: dictionary['navigation'].PhoneNumberisrequired,
              validate: value => validPhoneNumber(value, selectedPhoneLength, dictionary),
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='tel'
                label={dictionary['navigation'].PhoneNumber}
                placeholder='1234567890'
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {selectedDialCode}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          <Controller
            name='language'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label={dictionary['navigation'].Language}
                error={!!errors.language}
                helperText={errors.language?.message}
              >
                {languages.map(language => (
                  <MenuItem key={language.id} value={language.id}>
                    {language.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading} sx={{ position: 'relative' }}>
              {loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update}
              {loading && <CircularProgress size={24} color="inherit" />}
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary['navigation'].Cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default EditUserDrawer;
