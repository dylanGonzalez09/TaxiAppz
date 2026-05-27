import React, { useEffect, useState } from 'react';

import { useForm, Controller } from 'react-hook-form';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Grid, CircularProgress } from '@mui/material';

import { getSession } from 'next-auth/react';

import CustomTextField from '@core/components/mui/TextField'; // Adjust based on your actual component path
import DialogCloseButton from '@/components/dialogs/DialogCloseButton';

// import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

import { updateProfile } from '@/app/api/apps/taxi/user';

import {dropDownListForAdmin } from '@apis/zone';




type Props = {
  open: boolean;
  handleClose: () => void;
  profileData: any;
  dictionary: any;
  setData: (updatedProfileData: any) => void;
  zoneId: any
};

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  language: string;

  // gender: string;
  address: string;
  country: string;
};

const EditProfileDrawer = ({ zoneId,open, handleClose, profileData, setData , dictionary }: Props) => {
  const { control, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<{ id: string, name: string }[]>([]);
  const [countries, setCountries] = useState<{ id: string, name: string }[]>([]);

  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId;
    
    return { clientId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = await getClientId();
        const clientId = DataKey.clientId;

        if (!clientId) throw new Error("ClientId is undefined");

        const dropDownData = await dropDownListForAdmin(clientId,zoneId);

        setLanguages(dropDownData.data.language);
        setCountries(dropDownData.data.country);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [zoneId]);

  useEffect(() => {
    reset(profileData);
  }, [profileData, reset]);

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true);
     
    try {
      // Create request body
      const updatedData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        language: data.language,

        // gender: data.gender,
        address: data.address,
        country: data.country,
      };
  
 await updateProfile(profileData.id, updatedData); 

      // Merge updated data and pass it to parent component
      const updatedProfileData = { ...profileData, ...data };
      
      setData(updatedProfileData);

      handleClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {dictionary['navigation'].EditAdminInformation}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: dictionary['navigation'].FirstNameisrequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].FirstName}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: dictionary['navigation'].LastNameisrequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].LastName}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{ required: dictionary['navigation'].Emailisrequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].Email}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: dictionary['navigation'].PhoneNumberisrequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].PhoneNumber}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            {/* <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                rules={{ required: dictionary['navigation'].Genderisrequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select
                    label={dictionary['navigation'].Gender}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    <MenuItem value="Male">{dictionary['navigation'].Male}</MenuItem>
                    <MenuItem value="Female">{dictionary['navigation'].Female}</MenuItem>
                    <MenuItem value="Other">{dictionary['navigation'].Other}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <Controller
                name="language"
                control={control}
                rules={{ required: dictionary['navigation'].Languageisrequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select
                    label={dictionary['navigation'].Language}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {languages.length > 0 ? (
                      languages.map((language) => (
                        <MenuItem key={language.id} value={language.id}>
                          {language.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{dictionary['navigation'].Nolanguagesavailable}</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="address"
                control={control}
                rules={{ required: dictionary['navigation'].Addressisrequired }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].Address}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="country"
                control={control}
                rules={{ required: dictionary['navigation'].Countryisrequired}}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    select
                    label={dictionary['navigation'].Country}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {countries.length > 0 ? (
                      countries.map((country) => (
                        <MenuItem key={country.id} value={country.id}>
                          {country.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{dictionary['navigation'].Nocountriesavailable}</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>{dictionary['navigation'].Cancel}</Button>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : dictionary['navigation'].Update}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileDrawer;
