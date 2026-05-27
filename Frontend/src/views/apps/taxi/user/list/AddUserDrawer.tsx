/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';

import {
  Button,
  Drawer,
  InputAdornment,
  IconButton,
  Typography,
  Divider,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getSession } from 'next-auth/react';

import CustomTextField from '@core/components/mui/TextField';
import { useIsDemoUser } from '@/utils/demoUser';
import { createUser } from '@apis/user';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';
import type { UsersType } from '@/types/apps/userTypes';
import { validateTextOnly, validateEmail, validPhoneNumber } from '@/utils/validation'; // validPhoneNumber imported correctly

import { dropDownListForAdmin } from '@apis/zone';
import AsyncDropdown from '@/components/AsyncDropdown';
import { getActiveLanguageByPagination } from '@/app/api/apps/taxi/language';
import { getActiveCountryByPagination } from '@/app/api/apps/taxi/country';

type Props = {
  open: boolean;
  handleClose: () => void;
  userData: UsersType[];
  dictionary: any;
  setData: (data: UsersType[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPage: number;
  zoneId?: any;
};

type FormValidateType = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  Wallet: string;
  rating: string;
  language: string;
  country: string;
  employeeId?: string;
  dial_code?: any;
};

const initialData = {
  country: '',
  language: ''
};

const AddUserDrawer = (props: Props) => {
  const {
    open,
    handleClose,
    userData,
    setData,
    count,
    page,
    onPageChange,
    dictionary,
    rowsPerPage,
    zoneId
  } = props;

  const { checkDemoStatus } = useIsDemoUser();
  const [roles, setRoles] = useState<{ id: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null);
  const [ClientId, setClientId] = useState<string>("");
   const [countries, setCountries] = useState<{ id: string,name: any; dial_code: any ,phoneLength: any}[]>([]);

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue
  } = useForm<FormValidateType>({
    mode: 'all',
    defaultValues: {
      firstName: '',
      email: '',
      phoneNumber: '',
      role: 'subscriber',
      status: 'pending',
      Wallet: '0',
      rating: '5',
      language: '',
      country: '',
      dial_code: '',
    }
  });

  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId;

    setClientId(clientId || '');

return { clientId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = await getClientId();
        const clientId = DataKey.clientId;

        if (!clientId) {
          console.warn("ClientId is missing");

  return;
        }

        const dropDownData = await dropDownListForAdmin(clientId, zoneId);

        if (dropDownData && dropDownData.data) {
          setRoles(dropDownData.data.role || []);
        }

         setCountries(
           dropDownData.data.country.sort((a: any, b: any) =>
             a.name.localeCompare(b.name)
           )
         );
      } catch (error) {
        console.error("Error fetching dropdown data:", error);

        // toast.error(dictionary['navigation'].dataFetchError); // Optional: Show toast
      }
    };

    fetchData();
  }, [zoneId]); // Added zoneId dependency

  useEffect(() => {
  const countryId = control._formValues.country;

  if (countryId && countries.length > 0) {
    const selected = countries.find(c => c.id === countryId);

    if (selected) {
      setSelectedDialCode(selected.dial_code);
      setSelectedPhoneLength(selected.phoneLength);
    }
  }
}, [countries, control._formValues.country]);

  const handlePageChangeForAddRecord = (
    count: number,
    rowsPerPage: number,
    onPageChange: (event: ChangeEvent<unknown>, page: number) => void
  ) => {
    const newPage = Math.floor(count / rowsPerPage);

    const dummyEvent = {
      target: { value: newPage },
      currentTarget: { value: newPage },
      nativeEvent: {} as Event,
      bubbles: false,
    } as unknown as ChangeEvent<unknown>;

    onPageChange(dummyEvent, 1);
  };

  const onSubmit = async (data: FormValidateType) => {
    setLoading(true);

    try {
      if (checkDemoStatus()) {
        toast.error(dictionary['navigation'].editError);

return;
      }

      const filteredIds = roles
        .filter(item => item.role === "User")
        .map(item => item.id);

      const newUsers = {
        firstName: data.firstName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        active: true,
        rating: 0,
        roleIds: filteredIds,
        ...(data.country && { country: data.country }),
        ...(data.language && { language: data.language }),
      };

      const createData = await createUser(newUsers, zoneId);

      if (createData.message) {
        toast.error(createData.message);
      } else {
        const newUser: any = {
          id: createData.id,
          firstName: createData.firstName,
          email: createData.email,
          phoneNumber: createData.phoneNumber,
          role: createData.roleIds,
          active: true,
          Wallet: data.Wallet,
          rating: createData.rating,
          country: data.country,
          language: data.language,

        };

        setData([newUser, ...(userData ?? [])]);
        handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        toast.success(dictionary['navigation'].userCreated);
        handleReset();
      }
    } catch (error) {
      toast.error(dictionary['navigation'].createError);
    } finally {
      setLoading(false);
    }
  };

   const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id === countryId);

    if (selectedCountry) {
      setSelectedPhoneLength(selectedCountry.phoneLength);

      // You might want to update the phone number field validation here
      trigger('phoneNumber');
    }
  };

  const handleReset = () => {
    resetForm({
      firstName: '',
      email: '',
      phoneNumber: '',
      role: 'subscriber',
      status: 'pending',
      Wallet: '0',
      rating: '5',
      language: '',
      country: ''
    });
    setSelectedDialCode(null);
    setSelectedPhoneLength(null);
    handleClose();
  };

  const isSubmitDisabled = checkDemoStatus() || loading;

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
        <Typography variant='h5'>{dictionary['navigation'].AddNewUser}</Typography>
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
            rules={{ required: dictionary['navigation'].FirstNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].FirstName}
                placeholder={dictionary['navigation'].John}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />

          {/* Email */}
          <Controller
            name='email'
            control={control}
            rules={{
              required: dictionary['navigation'].Emailisrequired,
              validate: (value) => validateEmail(value, dictionary)
            }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='email'
                label={`${dictionary['navigation'].email} *`}
                placeholder={dictionary['navigation'].email}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* Country - AsyncDropdown */}
          {ClientId && (<Controller
            name="country"
            control={control}
            rules={{ required: dictionary['navigation'].countryRequired || "Country is required" }}
            render={({ field, fieldState }) => (
              <AsyncDropdown
                label={`${dictionary['navigation'].country} *`}
                apiFunction={getActiveCountryByPagination}
                extraParams={[ClientId]}
                value={field.value || null}
                getOptionLabel={(option: any) =>option?.name && option?.dial_code ? `${option.name}(${option.dial_code})` : option?.name || option?._id}
                onChange={(value: any) => {
                  const id = value?._id || value?.id;

                  field.onChange(id);

                  // Logic to set dial code and phone length based on selection
                  if (value) {
                     if(value.dial_code) setSelectedDialCode(value.dial_code);
                     if(value.phoneLength) setSelectedPhoneLength(value.phoneLength);
                  } else {
                    setSelectedDialCode(null);
                    setSelectedPhoneLength(null);
                  }

                  trigger('phoneNumber'); // Re-validate phone when country changes
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

                    const digitsOnly = value.replace(/\D/g, '');
                    const dialCodeDigits = selectedDialCode?.replace(/\D/g, '') || '';

                    const phoneWithoutDialCode = digitsOnly.replace(
                      new RegExp(`^${dialCodeDigits}`),
                      ''
                    );

                   // Not all zero

                     if (phoneWithoutDialCode && /^0+$/.test(phoneWithoutDialCode)) {
                                return 'Enter a valid phone number';
                              }


                  return validPhoneNumber(value, selectedPhoneLength, dictionary);
                  },
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
                              {countries.find(c => c.id === control._formValues.country)?.dial_code || ''}
                            </InputAdornment>
                      ),
                    }}
                  />
                )}
              />


           {/* <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: dictionary['navigation'].PhoneNumberisrequired,
                validate: value => {
                const digitsOnly = value.replace(/\D/g, '');
                const dialCodeDigits = selectedDialCode?.replace(/\D/g, '') || '';
                const phoneWithoutDialCode = digitsOnly.replace(new RegExp(`^${dialCodeDigits}`), '');



                // Not all zeros
                if (/^0+$/.test(phoneWithoutDialCode)) {
                  return 'Enter a valid phone number';
                }

                return true;
              },

                            // validate: value => validPhoneNumber(value, selectedPhoneLength, dictionary),
                    }}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label={`${dictionary['navigation'].phoneNumber} *`}
                        placeholder={dictionary['navigation'].phoneNumber}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        onBlur={() => trigger('phoneNumber')}
                        InputProps={{
                          startAdornment: selectedDialCode && (
                            <InputAdornment position="start">
                              {selectedDialCode}
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />  */}

          {/* Language - AsyncDropdown */}
          {ClientId && (<Controller
            name="language"
            control={control}
            rules={{ required: dictionary['navigation'].languageRequired || "Language is required" }}
            render={({ field, fieldState }) => (

              <AsyncDropdown
                label={`${dictionary['navigation'].language} *`}
                apiFunction={getActiveLanguageByPagination}
                extraParams={[ClientId]}
                value={field.value || null}
                getOptionLabel={(option: any) => option?.name || option?._id || ''}
                onChange={(value: any) => {
                  // Assuming language value is just an ID string
                  const id = value?._id || value?.id || value;

                  field.onChange(id);

                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />)}
          {/* {ClientId && (<Controller
            name="country"
            control={control}
            rules={{ required: dictionary['navigation'].countryRequired || "Country is required" }}
            render={({ field, fieldState }) => (
              <AsyncDropdown
                label={`${dictionary['navigation'].country} *`}
                apiFunction={getActiveCountryByPagination}
                extraParams={[ClientId]}
                value={field.value || null}
                getOptionLabel={(option: any) => option?.name || option?._id || ''}
                onChange={(value: any) => {
                  const id = value?._id || value?.id;

                  field.onChange(id);

                  // Logic to set dial code and phone length based on selection
                  if (value) {
                     if(value.dial_code) setSelectedDialCode(value.dial_code);
                     if(value.phoneLength) setSelectedPhoneLength(value.phoneLength);
                  } else {
                    setSelectedDialCode(null);
                    setSelectedPhoneLength(null);
                  }

                  trigger('phoneNumber'); // Re-validate phone when country changes
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />)} */}

          <div className='flex items-center gap-5'>
            <Button
              variant='contained'
              type='submit'
              disabled={isSubmitDisabled}
              sx={{ position: 'relative' }}
            >
              {loading ? dictionary['navigation'].submitting : dictionary['navigation'].submit}
              {loading && (
                <CircularProgress size={24} color="inherit" sx={{ position: 'absolute', right: '16px' }} />
              )}
            </Button>
            < Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary['navigation'].cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddUserDrawer;
