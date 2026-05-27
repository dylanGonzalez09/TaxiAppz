'use client'

import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { SubmitHandler } from 'react-hook-form'
import { useForm, Controller } from 'react-hook-form'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress

import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'

import CustomTextField from '@core/components/mui/TextField'
import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint'
import { fetchActiveCountry } from '@/app/api/apps/taxi/country'
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle'
import { getByVehicleModelByVehicleId } from '@/app/api/apps/taxi/vehiclemodel'
import { fetchRoles } from '@/app/api/apps/taxi/role'
import { updateDriver } from '@/app/api/apps/taxi/driver'


import { validateTextOnly, validateEmail, validateNumeric } from '@/utils/validation';

interface FormData {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  country: string
  city: string
  state: string
  pincode: string
  type: string
  vehicleModelId: string
  carNumber: string
  serviceLocation: string
  address: string
  notes: string
  referralCode: string
  profilePic: File | null
  profilePicUrl: string // Field for the current image URL
}

interface EditDriverFormProps {
  initialData: FormData,
  lang: any,
  dictionary: any
}

const EditDriverForm: React.FC<EditDriverFormProps> = ({ initialData, lang }: { initialData: any, lang?: string, dictionary: any }, { dictionary }) => {


  const router = useRouter();
  const [loading, setLoading] = useState(false); // State to manage loading

  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [vehicleModels, setVehicleModels] = useState<any[]>([])
  const [countries, setCountries] = useState<{ id: string, name: string }[]>([])

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: initialData,
    mode: 'all'

  })

  const BaseUrl = BASE_IMAGE_URL + "/uploads/user/" + initialData.profilePic

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [preview, setPreview] = useState<string | null>(BaseUrl || null)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleTypesData, countriesData] = await Promise.all([
          fetchVehicle(),
          fetchActiveCountry(),
        ])

        setCountries(countriesData)
        setVehicleTypes(vehicleTypesData)

        // Set initial data
        Object.keys(initialData).forEach(key => {
          setValue(key as keyof FormData, initialData[key as keyof FormData])
        })

        // Fetch and set vehicle models based on initial vehicleModelId
        if (initialData.type) {
          const vehicleModelsData = await getByVehicleModelByVehicleId(initialData.type)

          setVehicleModels(vehicleModelsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [initialData, setValue])

  // Fetch vehicle models when vehicle type changes
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
      }
    }

    fetchVehicleModels()
  }, [watch])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null

    setValue('profilePic', file)
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
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
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('pincode', data.pincode);
    formData.append('type', data.type);
    formData.append('carModel', data.vehicleModelId);
    formData.append('carNumber', data.carNumber);
    formData.append('address', data.address)
    formData.append('serviceLocation', data.serviceLocation);
    formData.append('notes', data.notes);
    formData.append('serviceCategory', 'individual');
    formData.append('referralCode', data.referralCode);

    if (data.profilePic) {

      formData.append('profilePic', data.profilePic);

    }

    await updateDriver(initialData._id, formData);

    const DriverUpdate = `/${lang}/apps/taxi/driver/list`;

    router.push(DriverUpdate);
    setLoading(false); // Set loading to true when form is submitted

  }

  return (
    <Card>
      <CardHeader title="Edit Driver" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: dictionary['navigation'].FirstNameisrequired, validate: value => validateTextOnly(value, dictionary) }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].firstName}
                      {...field}
                      required
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message} />
                  </>
                )}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: dictionary['navigation'].LastNameisrequired, validate: value => validateTextOnly(value, dictionary) }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].lastName}
                      {...field}
                      required
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message} />
                  </>
                )}
              />
            </Grid> */}
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

                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].phoneNumber}
                      {...field}
                      required
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message} />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="country"
                control={control}
                rules={{ required: dictionary['navigation'].Countryisrequired }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      select
                      fullWidth
                      label={dictionary['navigation'].country}
                      {...field}
                      required
                      error={!!errors.country}
                      helperText={errors.country?.message}                    >
                      {countries.map((country) => (
                        <MenuItem key={country.id} value={country.id}>{country.name}</MenuItem>
                      ))}
                    </CustomTextField>
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].city}
                      {...field}
                      error={!!errors.city}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].state}
                      {...field}
                      error={!!errors.state}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="pincode"
                control={control}
                rules={{ validate: value => validateNumeric(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].pincode}
                    {...field}
                    error={!!errors.pincode}
                    helperText={errors.pincode?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                rules={{ required: dictionary['navigation'].VehicleTypeisrequired }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      select
                      fullWidth
                      label={dictionary['navigation'].vehicleType}
                      {...field}
                      required
                      error={!!errors.type}
                      helperText={errors.type?.message}                    >
                      {vehicleTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>{type.vehicleName}</MenuItem>
                      ))}
                    </CustomTextField>
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="vehicleModelId"
                control={control}
                render={({ field }) => (
                  <>
                    <CustomTextField
                      select
                      fullWidth
                      label={dictionary['navigation'].vehicleModel}
                      {...field}
                      required
                      error={!!errors.vehicleModelId}
                    >
                      {vehicleModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>{model.modelname}</MenuItem>
                      ))}
                    </CustomTextField>
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="carNumber"
                control={control}
                rules={{ required: dictionary['navigation'].CarNumberisrequired }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].carNumber}
                      {...field}
                      error={!!errors.carNumber}
                      helperText={errors.carNumber?.message} />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceLocation"
                control={control}
                rules={{ required: dictionary['navigation'].ServiceLocationisrequired }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].serviceLocation}
                      {...field}
                      error={!!errors.serviceLocation}
                      helperText={errors.serviceLocation?.message} />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="referralCode"
                control={control}
                rules={{ required: dictionary['navigation'].ReferralCodeisrequired }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].referralCode}
                      {...field}
                      error={!!errors.referralCode}
                      helperText={errors.referralCode?.message} />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                rules={{ required: dictionary['navigation'].Addressisrequired }}

                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].address}
                      multiline
                      rows={4}
                      {...field}
                      error={!!errors.address}
                      helperText={errors.address?.message} />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].notes}
                      multiline
                      rows={4}
                      {...field}
                      error={!!errors.notes}
                    />
                  </>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel>{dictionary['navigation'].profilePic}</FormLabel>
                {preview && (
                  <img
                    src={preview}
                    alt="Profile Preview"
                    style={{ maxWidth: '20%', height: '20%', marginBottom: '10px' }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading} // Disable button while loading
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
                  dictionary['navigation'].EditDriver
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default EditDriverForm
