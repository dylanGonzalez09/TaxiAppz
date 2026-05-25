/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useForm, Controller } from 'react-hook-form'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'

import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress


import { getSession } from 'next-auth/react';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField'
import { createDriver } from '@/app/api/apps/taxi/driver';
import { fetchRoles } from '@/app/api/apps/taxi/role';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle';
import { getByVehicleModelByVehicleId } from '@/app/api/apps/taxi/vehiclemodel';
import { validateTextOnly, validateEmail, validatePhoneNumber, validateNumeric } from '@/utils/validation';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';


interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  gender: string;
  city: string;
  state: string;
  pincode: string;
  type: string;
  vehicleModel: string;
  carNumber: string;
  serviceType: {
    rental: boolean;
    local: boolean;
  };
  serviceLocation: string;
  address: string;
  notes: string;
  category: string;
  driverImage: File | null;
  referralCode: string;
}

interface AddDriverFormProps {
  lang: any;
  dictionary: any;
}

// Default values for the form
const defaultValues: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  country: '',
  gender: '',
  city: '',
  state: '',
  pincode: '',
  type: '',
  vehicleModel: '',
  carNumber: '',
  serviceType: {
    rental: false,
    local: false
  },
  serviceLocation: '',
  address: '',
  notes: '',
  category: '',
  driverImage: null,
  referralCode: '',
};

const AddDriverForm: React.FC<AddDriverFormProps> = ({ lang, dictionary }: { lang?: string, dictionary: any }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State to manage loading
  const { checkDemoStatus } = useIsDemoUser();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues,
    mode: 'all' // Set validation mode to 'all'
  });

  const [countries, setCountries] = useState<{ id: string, name: string }[]>([])
  const [vehicleModels, setVehicleModels] = useState<any[]>([])
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {

      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const dropDownData = await fetch(ENDPOINTS.driver.dropDownList(clientId));

        const data = await dropDownData.json();

        setCountries(data.data.country);
        setVehicleTypes(data.data.vehicle);
      } catch (error) {
        toast.error(dictionary['navigation'].faildtofechdata);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);

  }, []);

  // Helper function to add headers to the request
  const getClientId = async () => {

    const session = await getSession();

    const clientId = session?.user?.image?.clientId; // Access clientId
    const companyId = session?.user?.image?.companyId; // Access companyId


    return { clientId, companyId };
  };



  useEffect(() => {
    const fetchVehicleModels = async () => {
      const selectedType = watch('type')

      if (selectedType) {
        try {
          const vehicleModelsData = await getByVehicleModelByVehicleId(selectedType)

          setVehicleModels(vehicleModelsData)
        } catch (error) {
          console.error("Error fetching vehicle models:", error)
        }
      } else {
        setVehicleModels([])
      }
    }

    fetchVehicleModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('type')])

  const handleInputChange = (e: any) => {
    const { name, value } = e.target

    setValue(name as keyof FormData, value)
  }

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target

    setValue('serviceType', {
      ...watch('serviceType'),
      [name]: checked,
    })
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true); // Set loading to true when form is submitted

    const formData = new FormData()

    const roles = await fetchRoles();

    const filteredIds = roles
      .filter((item: { role: string }) => item.role === "Driver")
      .map((item: { id: any }) => item.id);

    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('roleIds', filteredIds.join(','));
    formData.append('countryCode', data.country);
    formData.append('gender', data.gender);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('pincode', data.pincode);
    formData.append('type', data.type);
    formData.append('carModel', data.vehicleModel);
    formData.append('carNumber', data.carNumber);
    formData.append('address', data.address)
    formData.append('serviceLocation', data.serviceLocation);
    formData.append('notes', data.notes);
    formData.append('serviceCategory', data.category);
    formData.append('referralCode', data.referralCode);


    if (data.driverImage) {
      formData.append('profilePic', data.driverImage);
    }

    await createDriver(formData);

    const DriverUpdate = `/${lang}/apps/taxi/driver/list`;

    router.push(DriverUpdate);
    setLoading(false); // Reset loading state after submission

  }

  const isSubmitDisabled = checkDemoStatus() || loading;

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].ADDDRIVER} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: dictionary['navigation'].FirstNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].firstName}
                    {...field}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: dictionary['navigation'].LastNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].lastName}
                    {...field}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
            </Grid>






            
            <Grid item xs={12} sm={6}>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: dictionary['navigation'].PhoneNumberisrequired, validate: value => validatePhoneNumber(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].phoneNumber}
                    {...field}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>





            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                rules={{ required: dictionary['navigation'].vehicletypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].vehicletype}
                    {...field}
                    onChange={(e) => handleInputChange(e)}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    {vehicleTypes.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicleName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="vehicleModel"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].vehiclemodel}
                    {...field}
                    required
                    disabled={!watch('type')}
                  >
                    {vehicleModels.map((vehicleModel) => (
                      <MenuItem key={vehicleModel.id} value={vehicleModel.id}>
                        {vehicleModel.modelname}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="carNumber"
                control={control}
                rules={{ required: dictionary['navigation'].carnumberisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].carnumber}
                    {...field}
                    error={!!errors.carNumber}
                    helperText={errors.carNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceLocation"
                control={control}
                rules={{ required: dictionary['navigation'].servicelocationisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].servicelocation}
                    {...field}
                    error={!!errors.serviceLocation}
                    helperText={errors.serviceLocation?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                rules={{ required: dictionary['navigation'].Servicecategoryisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].Servicecategory}
                    {...field}
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{dictionary['navigation'].ServiceType}</FormLabel>
                <FormControlLabel
                  control={<Checkbox name="rental" onChange={handleCheckboxChange} />}
                  label={dictionary['navigation'].Rental}
                />
                <FormControlLabel
                  control={<Checkbox name="local" onChange={handleCheckboxChange} />}
                  label={dictionary['navigation'].Local}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="referralCode"
                control={control}
                rules={{ required: dictionary['navigation'].ReferralCodeisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].referralCode}
                    {...field}
                    error={!!errors.referralCode}
                    helperText={errors.referralCode?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitDisabled} // Disable button while loading
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
                    {dictionary['navigation'].Submitting}
                  </>
                ) : (
                  dictionary['navigation'].AddDriver
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddDriverForm;
