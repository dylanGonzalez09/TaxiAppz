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

import CustomAutocomplete from '@core/components/mui/Autocomplete'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';

import {
  validatePassword,
  validateTextOnly, validateEmail,
  validatePhoneNumber,
  validPhoneNumber
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
}

const AddAdminDrawer = ({
  open, setOpen, data, setData, handleClose, editAdmin, count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary
}: AddAdminDrawerProps) => {
  const { control, handleSubmit, setValue, reset, getValues, trigger,watch } = useForm<AddUserInfoData>({
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

  const { isDemoUser, checkDemoStatus } = useIsDemoUser();

  const [roles, setRoles] = useState<{ id: string, role: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: string, name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string,name: any; dial_code: any ,phoneLength: any}[]>([]);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [primaryZones,setPrimaryZones] = useState<{ _id: string, zoneName: string }[]>([]);

  const selectedRoles = watch('roleIds');
  const isAdminSelected = selectedRoles?.some((role: any) => role.role === 'Admin');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = await getClientId();
        const clientId = DataKey.clientId;

        if (!clientId) throw new Error("ClientId is undefined");

        const dropDownData = await fetch(ENDPOINTS.user.dropDownList(clientId));
        const data = await dropDownData.json();

        setRoles(data.data.role);
        setLanguages(data.data.language);
        setCountries(data.data.country);
        setPrimaryZones(data.data.primaryZone);
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
       
        const createData = await createUser(newData);

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
                rules={{ required: dictionary['navigation'].firstNameRequired, validate: value => validateTextOnly(value, dictionary) }}
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
                rules={{ required: dictionary['navigation'].lastNameRequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field, fieldState }) => (
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
                    rules={{ required: dictionary['navigation'].passwordRequired, validate: value => validatePassword(value, dictionary) }}
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
                        onBlur={() => trigger('password')} // Trigger validation on blur
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name='confirmPassword'
                    control={control}
                    rules={{ required: dictionary['navigation'].confirmPasswordRequired, validate: (value) => value === getValues('password') || dictionary['navigation'].passwordsDoNotMatch }}
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
                        onBlur={() => trigger('confirmPassword')} // Trigger validation on blur
                      />
                    )}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={1.5}>
              <Controller
                name="country"
                control={control}
                rules={{ required: dictionary['navigation'].countryRequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={`${dictionary['navigation'].country} *`}
                    onChange={(e) => {
                      field.onChange(e); // Update form value
                      handleCountryChange(e.target.value); // Update phone length validation
                    }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <Controller
                name='phoneNumber'
                control={control}
                rules={{
                  required: dictionary['navigation'].phoneNumberRequired,
                  validate: value => validPhoneNumber(value, selectedPhoneLength, dictionary),
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
                rules={{ required: dictionary['navigation'].emergencyNumberRequired,validate: value => validatePhoneNumber(value, dictionary) }}
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
                    options={roles.filter(role => !["Superadmin", "Client", "User", "Driver"].includes(role.role))} // Filter out unwanted roles
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
                rules={{ required: dictionary['navigation'].languageRequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={`${dictionary['navigation'].language} *`}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger("language")} // Trigger validation on blur
                  >
                    {languages.length > 0 ? (
                      languages.map((language) => (
                        <MenuItem key={language.id} value={language.id}>
                          {language.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{dictionary['navigation'].noLanguagesAvailable}</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>
            {/* {isAdminSelected && ( */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="zoneId"
                control={control}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={`${dictionary['navigation'].primaryZone}`}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger("zoneId")} // Trigger validation on blur
                  >
                    {primaryZones.length > 0 ? (
                      primaryZones.map((zone) => (
                        <MenuItem key={zone._id} value={zone._id}>
                          {zone.zoneName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{dictionary['navigation'].noZoneAvailable}</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>
             {/* )} */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='address'
                control={control}
                rules={{ required: dictionary['navigation'].addressRequired }}
                render={({ field, fieldState }) => (
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
