/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';

import { Drawer, Button, IconButton, Typography, Divider, InputAdornment, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getSession } from 'next-auth/react';

import { dropDownListForAdmin } from '@apis/zone';

// import { dropDownListForAdmin } from '@apis/zone';
import CustomTextField from '@core/components/mui/TextField';

// API Imports
import { updateUser } from '@apis/user';

import {
  validateTextOnly, validateEmail,
  validPhoneNumber
} from '@/utils/validation';

import type { UsersType } from '@/types/apps/userTypes';

// AsyncDropdown Import
import AsyncDropdown from '@/components/AsyncDropdown';
import { getActiveLanguageByPagination } from '@/app/api/apps/taxi/language';
import { getActiveCountryByPagination } from '@/app/api/apps/taxi/country';

type Props = {
  open: boolean;
  handleClose: () => void;
  userData: UsersType[];
  dictionary: any;
  setData: (data: UsersType[]) => void;
  initialData: UsersType | null;
  zoneId?: any;
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
  employeeId?: string;
};

type CountryType = {
  id: string;
  name: string;
  dial_code: string;
  phoneLength: number;
};



const EditUserDrawer: React.FC<Props> = ({ open, handleClose, userData, setData, initialData, dictionary, zoneId }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null);
  const [ClientId, setClientId] = useState<string>("");
  const [countries, setCountries] = useState<CountryType[]>([]);

  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId;

    setClientId(clientId || '');

    return { clientId };
  };

  // React Hook Form setup
  const { control, handleSubmit, setValue, trigger, reset, getValues } = useForm<FormValidateType>({
    mode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      language: '',
      country: '',

    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = await getClientId();
        const clientId = DataKey.clientId;

        if (!clientId) {
          console.warn("ClientId is missing");

          return;
        }

        // Roles or other static data can still be fetched here if needed
        // const dropDownData = await dropDownListForAdmin(clientId, zoneId);
        const dropDownData = await dropDownListForAdmin(clientId, zoneId);

        setCountries(
          dropDownData.data.country.sort((a: any, b: any) =>
            a.name.localeCompare(b.name)
          )
        );
      } catch (error) {
        // toast.error('Failed to fetch data');
      }
    };

    fetchData();
  }, [zoneId]);

  // Initialize form when initialData changes (Drawer opens)
  useEffect(() => {
    if (initialData) {
      setValue('firstName', initialData.firstName || '');
      setValue('lastName', initialData.lastName || '');
      setValue('email', initialData.email || '');
      setValue('phoneNumber', initialData.phoneNumber || '');

      // Set IDs for AsyncDropdowns
      setValue('country', initialData.country || '');
      setValue('language', initialData.language || '');

      // NOTE: Since AsyncDropdown fetches data asynchronously, we cannot immediately find
      // dial_code from a local 'countries' state array unless we fetch it separately.
      // If you need the dial code to show up immediately on edit, you might need to
      // fetch country details separately or assume the API returns full objects in initialData.
      // For now, user selecting the country again will update the dial code.
    } else {
      reset(); // Reset if no data
    }
  }, [initialData, setValue, reset]);



  const handleCountryChange = (value: any) => {
    // Update the form value with the ID
    // const countryId = value?._id || value?.id;

    if (value) {
      if (value.dial_code) setSelectedDialCode(value.dial_code);
      if (value.phoneLength) setSelectedPhoneLength(value.phoneLength);
    } else {
      setSelectedDialCode(null);
      setSelectedPhoneLength(null);
    }

    // Re-validate phone number when country changes
    trigger('phoneNumber');
  };

  useEffect(() => {
    if (initialData && countries.length > 0) {
      const selected = countries.find(c => c.id === initialData.country);

      if (selected) {
        setSelectedDialCode(selected.dial_code);
        setSelectedPhoneLength(selected.phoneLength);
      }
    }
  }, [initialData, countries]);

  const onSubmit = async (data: FormValidateType) => {
    setLoading(true);

    try {
      if (initialData) {
        const updatedUser = {
          firstName: data.firstName || '',
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
    reset();
    setSelectedDialCode(null);
    setSelectedPhoneLength(null);
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

          {/* First Name */}
          <Controller
            name='firstName'
            control={control}
            rules={{
              required: dictionary['navigation'].FirstNameisrequired,
              validate: value => validateTextOnly(value, dictionary)
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={`${dictionary['navigation'].firstName} *`}
                placeholder={dictionary['navigation'].firstName}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || dictionary['navigation'].invalidText}
              />
            )}
          />

          {/* Email */}
          <Controller
            name='email'
            control={control}
            rules={{
              validate: (value) => validateEmail(value, dictionary),
              required: dictionary['navigation'].Emailisrequired || "Emailisrequired"
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label={dictionary['navigation'].email}
                placeholder={dictionary['navigation'].email}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Country - AsyncDropdown */}
          {ClientId && (<Controller
            name='country'
            control={control}
            rules={{ required: dictionary['navigation'].Countryisrequired || "Countryisrequired" }}
            render={({ field, fieldState }) => (
              <AsyncDropdown
                label={dictionary['navigation'].Country}
                apiFunction={getActiveCountryByPagination}
                extraParams={[ClientId]}
                value={field.value || null}
                getOptionLabel={(option: any) => option?.name && option?.dial_code ? `${option?.name}(${option?.dial_code})` : option?.name || option?._id}
                onChange={(value: any) => {
                  const id = value?._id || value?.id;

                  field.onChange(id); // Update form state with ID
                  handleCountryChange(value); // Handle local state (dial code, etc)
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />)}

          {/* Phone Number */}

          <Controller
            name='phoneNumber'
            control={control}
            rules={{
              required: dictionary['navigation'].phoneNumberRequired,

              validate: value => {
                const digitsOnly = (value || '').replace(/\D/g, '');

                //  block repeated numbers like 9999999999
                if (/^(\d)\1+$/.test(digitsOnly)) {
                  return 'Phone number cannot be all same digits';
                }

                const dialCodeDigits = (selectedDialCode || '').replace(/\D/g, '');

                const phoneWithoutDialCode = digitsOnly.replace(
                  new RegExp(`^${dialCodeDigits}`),
                  ''
                );

                if (phoneWithoutDialCode && /^0+$/.test(phoneWithoutDialCode)) {
                  return 'Enter a valid phone number';
                }

                return validPhoneNumber(value, selectedPhoneLength, dictionary);
              }
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={`${dictionary['navigation'].phoneNumber} *`}
                placeholder={dictionary['navigation'].enterPhoneNumber}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onBlur={() => trigger('phoneNumber')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {countries.find(c => c.id === getValues('country'))?.dial_code || ''}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* Language - AsyncDropdown */}
          {ClientId && (<Controller
            name='language'
            control={control}
            rules={{
              required: dictionary['navigation'].Languageisrequired || "Language is required",
            }}
            render={({ field, fieldState }) => (
              <AsyncDropdown
                label={dictionary['navigation'].Language}
                apiFunction={getActiveLanguageByPagination}
                extraParams={[ClientId]}
                value={field.value || null}
                getOptionLabel={(option: any) => option?.name || option?._id || ''}

                onChange={(value: any) => {

                  const id = value?._id || value?.id || value;

                  field.onChange(id);
                  
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />)}

          <div className='flex items-center gap-5'>
            <Button variant='contained' type='submit' disabled={loading} sx={{ position: 'relative' }}>
              {loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update}
              {loading && <CircularProgress size={24} color="inherit" sx={{ position: 'absolute', right: '16px' }} />}
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
