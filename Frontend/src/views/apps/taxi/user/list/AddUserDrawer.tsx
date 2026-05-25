/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';

import {
  Button,
  Drawer,
  InputAdornment,
  IconButton,
  MenuItem,
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
import { validateTextOnly, validateEmail, validPhoneNumber } from '@/utils/validation';


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
};

type FormNonValidateType = {
  country: string;
  language: string;
};

const initialData: FormNonValidateType = {
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
    rowsPerPage
  } = props;

  const { checkDemoStatus } = useIsDemoUser();
  const [formData, setFormData] = useState<FormNonValidateType>(initialData);
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string; dial_code: string; phoneLength: number }[]>([]);
  const [roles, setRoles] = useState<{ id: string; role: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null);

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors },
    trigger
  } = useForm<FormValidateType>({
    mode: 'all',
    defaultValues: {
      firstName: '',

      // lastName: '',
      email: '',
      phoneNumber: '',
      role: 'subscriber',
      status: 'pending',
      Wallet: '0',
      rating: '5',
      language: '',
      country: ''
    }
  });

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

  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId;
    const companyId = session?.user?.image?.companyId;


    return { clientId, companyId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = await getClientId();
        const clientId = DataKey.clientId;
        const companyId = DataKey.companyId;

        if (clientId === undefined) {
          throw new Error(dictionary['navigation'].clientIdError);
        }

         const dropDownData = await fetch(ENDPOINTS.user.dropDownList(clientId), {
          headers: {
              'companyid': companyId ?? '',
            },
          });

        const data = await dropDownData.json();

        setRoles(data.data.role);
        setLanguages(data.data.language);
        setCountries(data.data.country);
      } catch (error) {
        toast.error(dictionary['navigation'].dataFetchError);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, [dictionary]);

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

        // lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        active: true,
        rating: 0,
        roleIds: filteredIds,
        
        ...(formData.country && { country: formData.country }),
        ...(formData.language && { language: formData.language })
      };

      const createData = await createUser(newUsers);

      if (createData.message) {
        toast.error(createData.message);
      } else {
        const newUser: any = {
          id: createData.id,
          firstName: createData.firstName,

          // lastName: createData.lastName,
          email: createData.email,
          phoneNumber: createData.phoneNumber,
          role: createData.roleIds,
          active: true,
          Wallet: data.Wallet,
          rating: createData.rating,
          country: formData.country,
          language: formData.language
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

  const handleReset = () => {
    setFormData(initialData);
    resetForm();
    setSelectedDialCode(null);
    handleClose();
  };

  const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id === countryId);

    if (selectedCountry) {
      setSelectedPhoneLength(selectedCountry.phoneLength);
      setSelectedDialCode(selectedCountry.dial_code);
      trigger('phoneNumber');
    }
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
          {/* <Controller
            name='lastName'
            control={control}
            rules={{
              required: dictionary['navigation'].lastNamerequired,
              validate: value => validateTextOnly(value, dictionary)
            }}
            render={({ field, fieldState }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={`${dictionary['navigation'].lastName} *`}
                placeholder={dictionary['navigation'].lastName}
                error={!!errors.lastName}
                helperText={errors.lastName?.message || dictionary['navigation'].invalidText}
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
          <CustomTextField
            select
            fullWidth
            label={dictionary['navigation'].country}
            value={formData.country}
            onChange={e => {
              setFormData({ ...formData, country: e.target.value });
              handleCountryChange(e.target.value);
            }}
          >
            {countries.map(country => (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            ))}
          </CustomTextField>

          <Controller
            name="phoneNumber"
            control={control}
            rules={{
              required: dictionary['navigation'].PhoneNumberisrequired,
              validate: value => {
                const digitsOnly = value.replace(/\D/g, '');
                const dialCodeDigits = selectedDialCode?.replace(/\D/g, '') || '';
                const phoneWithoutDialCode = digitsOnly.replace(new RegExp(`^${dialCodeDigits}`), '');

                return phoneWithoutDialCode.length === 10 || dictionary['navigation'].PhoneNumbermustbe10digits;
              }
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
          />


          <CustomTextField
            select
            fullWidth
            label={dictionary['navigation'].Language}
            value={formData.language}
            onChange={e => setFormData({ ...formData, language: e.target.value })}
          >
            {languages.map(language => (
              <MenuItem key={language.id} value={language.id}>
                {language.name}
              </MenuItem>
            ))}
          </CustomTextField>

          <div className='flex items-center gap-4'>
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
            <Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary['navigation'].cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddUserDrawer;
