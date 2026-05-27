/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, MenuItem, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import type { SubmitHandler } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';

import { getSession } from 'next-auth/react';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';

import { createUser, updateUser } from '@apis/user';
import { dropDownListForAdmin, getActiveZoneByPagination } from '@apis/zone';

import CustomAutocomplete from '@core/components/mui/Autocomplete'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';


import AsyncDropdown from '@/components/AsyncDropdown';
import { getActiveLanguageByPagination } from '@/app/api/apps/taxi/language';

import { getActiveCountryByPagination } from '@/app/api/apps/taxi/country';


import {
  validatePasswordsMatch,
  validatePassword,
  validateTextOnly, validateEmail,
  validatePhoneNumber,
  validPhoneNumber,
  validateAddress
} from '@/utils/validation';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

// Type Definitions
type AddUserInfoData = {
  roleIds?: any;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: any;
  dial_code?: any;
  language?: string;
  country?: string;
  address?: string;
  active?: boolean;
  zoneId?: any;
};

type AdminType = {
  roleIds?: any;
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: any;
  dial_code?: any;
  language?: string;
  country?: string;
  address?: string;
  active?: boolean;
  zoneId?: any;
};

interface AddAdminDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: AdminType[];
  setData: (data: AdminType[]) => void;
  handleClose: () => void;
  editAdmin: AdminType | null;
  setEditAdmin: (admin: AdminType | null) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  dictionary?: any;
  zoneId: string;
}

const AddAdminDrawer = ({
  open, setOpen, data, setData, handleClose, editAdmin, count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary,
  zoneId
}: AddAdminDrawerProps) => {
  const { control, handleSubmit, setValue, reset, getValues, trigger, watch } = useForm<AddUserInfoData>({
    mode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      emergencyNumber: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
      language: '',
      country: '',
      address: '',
      zoneId: '',
    }
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const { isDemoUser, checkDemoStatus } = useIsDemoUser();

  const [roles, setRoles] = useState<{ id: string, role: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: string, name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string, name: any; dial_code: any, phoneLength: any }[]>([]);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [primaryZones, setPrimaryZones] = useState<{ _id: string, zoneName: string }[]>([]);
  const [ClientId, setClientId] = useState<string>("");

  const selectedRoles = watch('roleIds');
  const isAdminSelected = selectedRoles?.some((role: any) => role.role === 'Admin');
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = await getClientId();
        const clientId = DataKey.clientId;

        if (!clientId) throw new Error("ClientId is undefined");

        const dropDownData = await dropDownListForAdmin(clientId, zoneId);

        setRoles(dropDownData.data.role);
        setLanguages(dropDownData.data.language);

        setCountries(
          dropDownData.data.country.sort((a: any, b: any) =>
            a.name.localeCompare(b.name)
          )
        ); setPrimaryZones(dropDownData.data.primaryZone);
      } catch (error) {
        toast.error(dictionary['navigation'].failedToFetchData);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const resetForm = useCallback(() => {
    reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      emergencyNumber: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
      language: '',
      country: '',
      address: '',
      zoneId: ''
    });
  }, [reset]);

  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId;

    setClientId(clientId || '');

    return { clientId };
  };

  const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id === countryId);

    if (selectedCountry) {
      setSelectedPhoneLength(selectedCountry.phoneLength);

      // You might want to update the phone number field validation here
      trigger('phoneNumber');
    }
  };

  useEffect(() => {
    if (open) {
      if (editAdmin) {
        const selectedRoles = roles.filter(role => editAdmin.roleIds.includes(role.id));

        setValue('roleIds', selectedRoles); // Ensure roles are set correctly as objects
        Object.keys(editAdmin).forEach(key => {
          setValue(key as keyof AddUserInfoData, editAdmin[key as keyof AdminType] || '');
        });
      } else {
        resetForm();
      }
    }
  }, [open, editAdmin, setValue, reset, roles]);

  const onSubmit: SubmitHandler<AddUserInfoData> = async (formData) => {
    setLoading(true); // Start loading

    try {
      const roleIds = formData.roleIds.map((role: { id: string }) => role.id);

      // Create the user data
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName || '',
        email: formData.email || '',

        // password: formData.password || '',

        phoneNumber: formData.phoneNumber || '',
        emergencyNumber: formData.emergencyNumber || '',
        language: formData.language || '',
        country: formData.country || '',
        address: formData.address || '',
        active: true,
        roleIds: roleIds, // Now sending an array of role IDs
        zoneId: formData.zoneId || ''
      };

      if (editAdmin) {
        // Update existing admin
        const updatedData = {
          ...userData,
          roleIds, // Same role IDs format here
        };

        await updateUser(String(editAdmin.id), updatedData);

        const updatedAdmin = { id: editAdmin.id, ...updatedData };

        updatedAdmin.roleIds = updatedAdmin.roleIds.map((roleId: string) => {
          const roleObject = roles.find((role) => role.id === roleId);

          return roleObject ? { role: roleObject.role, id: roleObject.id } : null;
        }).filter((role: any) => role !== null);

        // Now map updatedAdmin to the list
        const updatedAdminList = data.map((admin: AdminType) =>
          admin.id === editAdmin.id ? updatedAdmin : admin
        );

        setData(updatedAdminList);
        toast.success(dictionary['navigation'].adminUpdated);
        reset();
        handleClose();
      }

      else {

        const password = formData.password || '';

        const newData = {
          ...userData,

          password

        };

        const createData = await createUser(newData, zoneId);

        if (createData.message) {
          toast.error(createData.message);
        } else {

          const newAdmin = {

            id: createData.id,

            // ...userData,

            ...newData,
            active: true,
          };

          setData([newAdmin, ...data]);
          handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

          toast.success(dictionary['navigation'].adminCreated);
          reset();
          handleClose();
        }
      }
    } catch (error) {
      toast.error(dictionary['navigation'].errorOccurred);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Helper function to handle page change logic
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

  const handleClickShowPassword = () => {
    setIsPasswordShown(prev => !prev);
  };

  const handleCloseDrawer = () => {
    setOpen(false);
    resetForm();
    setLoading(false);
  };

  const isSubmitDisabled = isDemoUser || loading;

  useEffect(() => {
    if (confirmPassword && password) {
      trigger('confirmPassword');
    }
  }, [password, confirmPassword, trigger]);

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleCloseDrawer}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleCloseDrawer} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {editAdmin ? dictionary['navigation'].editAdminInformation : dictionary['navigation'].addAdminInformation}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='firstName'
                control={control}

                rules={{
                  required: dictionary['navigation'].firstNameRequired,
                  validate: value => {
                    const val = (value || '').trim();

                    // existing text validation
                    const textValidation = validateTextOnly(val, dictionary);

                    if (textValidation !== true) return textValidation;

                    //  block same characters (aaaa)
                    if (/^([a-zA-Z])\1+$/.test(val)) {
                      return 'First name cannot be repeated characters';
                    }

                    return true;
                  }
                }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={`${dictionary['navigation'].firstName} *`}
                    placeholder={dictionary['navigation'].enterFirstName}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('firstName')} // Trigger validation on blur
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='lastName'
                control={control}
                rules={{
                  required: dictionary['navigation'].lastNameRequired,
                  validate: value => {
                    const val = (value || '').trim();

                    const textValidation = validateTextOnly(val, dictionary);

                    if (textValidation !== true) return textValidation;

                    // block same characters (bbbb)
                    if (/^([a-zA-Z])\1+$/.test(val)) {
                      return 'Last name cannot be repeated characters';
                    }

                    return true;
                  }
                }} render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={`${dictionary['navigation'].lastName} *`}
                    placeholder={dictionary['navigation'].enterLastName}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('lastName')} // Trigger validation on blur
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: dictionary['navigation'].emailRequired, validate: value => validateEmail(value, dictionary) }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={`${dictionary['navigation'].email} *`}
                    placeholder={dictionary['navigation'].enterEmail}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('email')} // Trigger validation on blur
                  />
                )}
              />
            </Grid>
            {editAdmin === null && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{
                      required: dictionary['navigation'].passwordRequired,
                      validate: value => validatePassword(value, dictionary)
                    }}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        type={isPasswordShown ? 'text' : 'password'}
                        fullWidth
                        label={`${dictionary['navigation'].password} *`}
                        placeholder={dictionary['navigation'].enterPassword}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={handleClickShowPassword}
                                edge='end'
                              >
                                {isPasswordShown ? '🙈' : '👁️'}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        onChange={(e) => {
                          field.onChange(e);


                          // Trigger validation on confirm password if it has a value

                          if (getValues('confirmPassword')) {
                            setTimeout(() => trigger('confirmPassword'), 0);
                          }
                        }}
                        onBlur={() => trigger('password')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='confirmPassword'
                    control={control}

                    rules={{

                      required: dictionary['navigation'].confirmPasswordRequired,

                      validate: (value) => {
                        const currentPassword = getValues('password');

                        if (!currentPassword) {
                          return dictionary['navigation'].passwordRequired || 'Please enter password first';
                        }

                        if (value !== currentPassword) {
                          return dictionary['navigation'].Confirmpasswordwasnotmatched || 'Confirm password was not matched';

                        }

                        return true;
                      }
                    }}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        type={isPasswordShown ? 'text' : 'password'}
                        fullWidth
                        label={`${dictionary['navigation'].confirmPassword} *`}
                        placeholder={dictionary['navigation'].confirmPasswordPlaceholder}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                onClick={handleClickShowPassword}
                                edge='end'
                              >
                                {isPasswordShown ? '🙈' : '👁️'}

                              </IconButton>
                            </InputAdornment>
                          )
                        }}

                        onChange={(e) => {
                          field.onChange(e);

                          // Trigger validation immediately

                          setTimeout(() => trigger('confirmPassword'), 0);
                        }}
                        onBlur={() => trigger('confirmPassword')}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={2}>
              <Controller
                name="country"
                control={control}
                rules={{ required: dictionary['navigation'].countryRequired }}
                render={({ field, fieldState }) => (
                  <AsyncDropdown
                    label={`${dictionary['navigation'].country} *`}
                    apiFunction={getActiveCountryByPagination}
                    extraParams={[ClientId]}
                    value={field.value || null}
                    getOptionLabel={(option: any) =>
                      option.name && option.dial_code
                        ? `${option.name} (${option.dial_code})`
                        : option.name || option._id
                    }
                    onChange={(value: any) => {
                      const id = value?._id || value?.id

                      field.onChange(id)
                      handleCountryChange(id)
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='emergencyNumber'
                control={control}
                rules={{
                  required: dictionary['navigation'].emergencyNumberRequired,
                  validate: (value) => {
                    const val = (value || "").trim();

                    const digitsOnly = val.replace(/\D/g, '');
                    const dialCodeDigits = (selectedDialCode || '').replace(/\D/g, '');

                    const phoneWithoutDialCode = digitsOnly.replace(
                      new RegExp(`^${dialCodeDigits}`),
                      ''
                    );


                    //  Allow min 3 digits (for 108), max 15
                    if (!/^[0-9]{3,15}$/.test(val)) {
                      return 'Emergency number must be between 3 to 15 digits';
                    }

                    // Block all same digits (000, 1111, etc.)
                    if (/^(\d)\1+$/.test(phoneWithoutDialCode || digitsOnly)) {
                      return 'Emergency number cannot be repeated digits';
                    }

                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={`${dictionary['navigation'].emergencyNumber} *`}
                    placeholder={dictionary['navigation'].enterEmergencyNumber}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('emergencyNumber')} // Trigger validation on blur
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="roleIds"
                control={control}
                rules={{ required: dictionary['navigation'].roleRequired }}
                render={({ field, fieldState }) => (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    options={roles
                      .filter(role => !["Superadmin", "Client", "User", "Driver"].includes(role.role))
                      .sort((a, b) => a.role.localeCompare(b.role))
                    }
                    id="autocomplete-roles"
                    getOptionLabel={(option) => option.role || ''}
                    value={field.value || []} // Ensure that the value is an array of role objects
                    isOptionEqualToValue={(option, value) => option.id === value.id} // Compare by ID
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        label={dictionary['navigation'].selectRoles}
                        placeholder={dictionary['navigation'].typeToSearchRoles}
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message || ''}
                      />
                    )}
                    onChange={(event, value) => field.onChange(value)} // Update the value when selected
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="language"
                control={control}
                rules={{ required: dictionary['navigation'].languageRequired || "Language is required" }}
                render={({ field, fieldState }) => (

                  <AsyncDropdown
                    label={`${dictionary['navigation'].language} *`}
                    apiFunction={getActiveLanguageByPagination}
                    extraParams={[ClientId]}

                    //  multiple
                    value={field.value || null}
                    getOptionLabel={(option: any) =>
                      option.name ? `${option.name}` : option._id
                    }
                    onChange={(value: any) => {
                      field.onChange(value._id || value.id);
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {/* {isAdminSelected && ( */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="zoneId"
                control={control}
                rules={{ required: dictionary['navigation'].zoneRequired || "Zone is required" }}
                render={({ field, fieldState }) => (
                  <AsyncDropdown
                    label={`${dictionary['navigation'].primaryZone}`}
                    apiFunction={getActiveZoneByPagination}
                    extraParams={[]}

                    //  multiple
                    value={field.value || null}
                    getOptionLabel={(option: any) =>
                      option.zoneName ? `${option.zoneName}` : option._id
                    }
                    onChange={(value: any) => {
                      field.onChange(value?._id || value?.id)
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            {/* )} */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='address'
                control={control}
                rules={{
                  required: dictionary['navigation'].newAddressRequired || "Address is required",
                  validate: (value) => {
                    const val = (value || '').trim();
                    
                   // ✅ Allow all language letters + numbers + common address characters
                    if (!/^[\p{L}0-9\s,.\-/#()]+$/u.test(val)) {
                      return 'Address contains invalid characters';
                    }

                    // remove spaces for strict repeat check
                    const noSpaceVal = val.replace(/\s+/g, '');

                   // ✅ Block repeated letters in all languages (aaa, அஅஅ, ممم)
                   if (/([\p{L}])\1{2,}/u.test(noSpaceVal)) {
                     return 'Address cannot contain repeated letters';
                   }
                   
                    //  Block repeated numbers (1111, 999999)
                    if (/(\d)\1{2,}/.test(noSpaceVal)) {
                      return 'Address cannot contain repeated numbers';
                    }

                    //  Block repeated special chars (---, ///, ###)
                    if (/([,.\-/#()])\1{2,}/.test(noSpaceVal)) {
                      return 'Address cannot contain repeated special characters';
                    }

                    return true;
                  }
                }} render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={`${dictionary['navigation'].address} *`}
                    placeholder={dictionary['navigation'].enterAddress}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('address')} // Trigger validation on blur
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='gap-4 px-6 pb-4'>
          <Button variant='outlined' onClick={handleCloseDrawer}>
            {dictionary['navigation'].cancel}
          </Button>
          <Button
            variant='contained'
            type='submit'
            disabled={isSubmitDisabled}
            sx={{ position: 'relative' }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }} />
                {dictionary['navigation'].submitting}
              </>
            ) : (
              editAdmin ? dictionary['navigation'].update : dictionary['navigation'].submit
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddAdminDrawer;
