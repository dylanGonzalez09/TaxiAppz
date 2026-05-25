/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'

import type { Control, UseFormWatch, UseFormClearErrors, UseFormSetValue } from 'react-hook-form';
import { Controller } from 'react-hook-form'

import { Grid, MenuItem, Chip, Typography, Paper, Box, Divider, InputAdornment, IconButton } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle'
import { fetchActiveCountry } from '@/app/api/apps/taxi/country'
import { fetchZone } from '@/app/api/apps/taxi/zone'
import { validatePassword, textAndMin, validateEmail, validatePhoneNumber } from '@/utils/validation'
import { fetchCompanySubScription } from '@/app/api/apps/taxi/companySubscription'
import type { VehicleType } from '../CorporateCompanyForm'
import { fetchActiveLanguage } from '@apis/language';

interface Country {
  id: string
  name: string
}

interface Zone {
  _id: string
  zoneName: string
}

interface Package {
  id: string
  name: string
  validityPeriod: string
  unit: string
  amount: number
  noOfDrivers: number
  noOfUsers: number
  description: string
}

interface CompanyInformationProps {
  control: Control<any>
  watch: UseFormWatch<any>
  formErrors: Record<string, any>
  clearErrors: UseFormClearErrors<any>
  setValue?: UseFormSetValue<any>
  handleChangeVehicles: (value: VehicleType[]) => void
  selectedVehicles: VehicleType[]
  setPaymentTypes: (value: string[]) => void
  paymentTypes: string[]
  dictionary: any
  isEditing?: boolean
  editData?: any
}

const CompanyInformation: React.FC<CompanyInformationProps> = ({
  control,
  watch,
  formErrors,
  clearErrors,
  setValue,
  handleChangeVehicles,
  selectedVehicles,
  setPaymentTypes,
  paymentTypes,
  dictionary,
  isEditing = false,
  editData
}) => {
  // State variables
  const [countries, setCountries] = useState<Country[]>([])
  const [vehicle, setVehicle] = useState<VehicleType[]>([])
  const [languageData, setLanguageData] = useState<{ id: string; name: string }[]>([])
  const [zoneData, setZoneData] = useState<Zone[]>([])
  const [packageData, setPackageData] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isPasswordShown, setIsPasswordShown] = useState<boolean>(false)

  // Watch form values
  const watchedCountry = watch('country')
  const watchedLanguage = watch('language')
  const subScriptionId = watch('subScriptionId')

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryData, vehicleData, zoneData, packageData,languageData] = await Promise.all([
          fetchActiveCountry(),
          fetchVehicle(),
          fetchZone(),
          fetchCompanySubScription(),
          fetchActiveLanguage()
        ])
        
        setCountries(countryData)
        setVehicle(vehicleData)
        setZoneData(zoneData)
        setPackageData(packageData)
        setLanguageData(languageData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    fetchData()
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (isEditing && editData && setValue) {
      // Set basic company information
      setValue('companyName', editData.companyName || '')
      setValue('companyPhoneNumber', editData.companyPhoneNumber || '')
      setValue('contactPersonName', editData.contactPersonName || '')
      setValue('contactPersonEmail', editData.contactPersonEmail || '')
      setValue('contactPersonNumber', editData.contactPersonNumber || '')
      setValue('companyEmail', editData.companyEmail || '')
      setValue('noOfVehicle', editData.noOfVehicle || '')
      
      // Set select field values
      setValue('country', editData.country || '')
      setValue('language', editData.language || '')
      setValue('serviceArea', editData.serviceArea || '')
      setValue('subScriptionId', editData.subScriptionId || '')
      
      // Set payment types
      setValue('paymentTypes', editData.paymentTypes || [])
      setPaymentTypes(editData.paymentTypes || [])
      
      // Set vehicle types when vehicle data is loaded
      if (editData.vehicleTypes && vehicle.length > 0) {
        const selectedVehicleTypes = editData.vehicleTypes.map((vt: any) => {
          const foundVehicle = vehicle.find(v => v.id === vt.id)

          return foundVehicle || vt
        })

        setValue('vehicleTypes', selectedVehicleTypes)
        handleChangeVehicles(selectedVehicleTypes)
      }
    }
  }, [isEditing, editData, setValue, vehicle, handleChangeVehicles, setPaymentTypes])

  // Update selected package when ID changes
  useEffect(() => {
    if (subScriptionId && packageData.length > 0) {
      const found = packageData.find(pkg => pkg.id === subScriptionId)

      setSelectedPackage(found || null)
    } else {
      setSelectedPackage(null)
    }
  }, [subScriptionId, packageData])

  // Handle autocomplete changes
  const handleAutocompleteChange = (event: React.SyntheticEvent, value: string[], type: 'vehicle' | 'payment') => {
    if (type === 'payment') {
      setPaymentTypes(value)
    }
  }

  return (
    <Grid container spacing={5}>
      {/* Company Details Section */}
      <div className='flex items-center justify-between plb-5 pli-6' style={{ width: '100%', marginLeft: '15px' }}>
        <Typography variant='h5' marginLeft={-5}>
          Company Details
        </Typography>
      </div>

      {/* Company Name */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='companyName'
          control={control}
          rules={{ 
            required: 'Company Name is required',
            validate: value => textAndMin(value, dictionary) 
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Company Name *'
              placeholder='Enter company name'
              error={!!formErrors.companyName}
              helperText={formErrors.companyName?.message}
            />
          )}
        />
      </Grid>

      {/* Company Phone */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='companyPhoneNumber'
          control={control}
          rules={{ 
            required: 'Company Phone Number is required',
            validate: value => validatePhoneNumber(value, dictionary) 
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Company Phone Number *'
              placeholder='Enter company phone number'
              error={!!formErrors.companyPhoneNumber}
              helperText={formErrors.companyPhoneNumber?.message}
            />
          )}
        />
      </Grid>

      {/* Contact Person Name */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='contactPersonName'
          control={control}
          rules={{ 
            required: 'Contact Person Name is required',
            validate: value => textAndMin(value, dictionary) 
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Contact Person Name *'
              placeholder='Enter contact person name'
              error={!!formErrors.contactPersonName}
              helperText={formErrors.contactPersonName?.message}
            />
          )}
        />
      </Grid>

      {/* Contact Person Email */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='contactPersonEmail'
          control={control}
          rules={{ 
            required: 'Contact Person Email is required', 
            validate: value => validateEmail(value, dictionary) 
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Contact Person Email *'
              placeholder='Enter contact person email'
              error={!!formErrors.contactPersonEmail}
              helperText={formErrors.contactPersonEmail?.message}
            />
          )}
        />
      </Grid>

      {/* Contact Person Number */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='contactPersonNumber'
          control={control}
          rules={{ 
            required: 'Contact Person Number is required',
            validate: value => validatePhoneNumber(value, dictionary) 
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Contact Person Number *'
              placeholder='Enter contact person number'
              error={!!formErrors.contactPersonNumber}
              helperText={formErrors.contactPersonNumber?.message}
            />
          )}
        />
      </Grid>

      {/* Country */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='country'
          control={control}
          rules={{ required: 'Country is required' }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Country'
              value={field.value || watchedCountry || ''}
              error={Boolean(formErrors.country)}
              helperText={formErrors.country?.message || ''}
            >
              {countries.map(country => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
      </Grid>
     <Grid item xs={12} sm={4}>
        <Controller
          name='language'
          control={control}
          rules={{ required: 'Language is required' }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label='Language'
              value={field.value || watchedLanguage || ''}
              error={Boolean(formErrors.language)}
              helperText={formErrors.language?.message || ''}
            >
              {languageData.map(language => (
                <MenuItem key={language.id} value={language.id}>
                  {language.name}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
      </Grid>

      {/* Service Area */}
      <Grid item xs={12} sm={4}>
        <Controller
          name="serviceArea"
          control={control}
          rules={{ required: 'Service area is required' }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label="Service Area"
              value={field.value || ''}
              error={Boolean(formErrors.serviceArea)}
              helperText={formErrors.serviceArea?.message || ''}
            >
              {zoneData.map(option => (
                <MenuItem key={option._id} value={option._id}>
                  {option.zoneName}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
      </Grid>

      {/* Payment Types */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='paymentTypes'
          control={control}
          rules={{ required: 'At least one payment type is required' }}
          render={({ field }) => (
            <CustomAutocomplete
              multiple
              limitTags={2}
              options={['Cash', 'Card', 'Wallet']}
              id='autocomplete-payment-types'
              getOptionLabel={(option: string) => option || ''}
              value={field.value}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  name='paymentTypes'
                  label='Available Payment Methods'
                  placeholder='Payment Types'
                  error={Boolean(formErrors.paymentTypes)}
                  helperText={formErrors.paymentTypes?.message || ''}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} key={index} size='small' />
                ))
              }
              onChange={(event, value) => {
                field.onChange(value)
                handleAutocompleteChange(event, value, 'payment')
              }}
            />
          )}
        />
      </Grid>

      {/* Vehicle Types */}
      <Grid item xs={12} sm={4}>
        <Controller
          name="vehicleTypes"
          control={control}
          rules={{ required: 'At least one vehicle type is required' }}
          render={({ field, fieldState }) => (
            <CustomAutocomplete
              multiple
              limitTags={2}
              options={vehicle}
              id="autocomplete-vehicle-types"
              getOptionLabel={(option: VehicleType) => option.vehicleName || ''}
              value={field.value || []}
              isOptionEqualToValue={(option, value) => option.vehicleName === value.vehicleName}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label="Available Vehicle"
                  placeholder="Type"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message || ''}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option: VehicleType, index: number) => (
                  <Chip
                    label={option.vehicleName}
                    {...getTagProps({ index })}
                    key={option.id}
                    size="small"
                  />
                ))
              }
              onChange={(event, value) => {
                field.onChange(value);
                handleChangeVehicles(value);

                if (value.length > 0) {
                  clearErrors('vehicleTypes');
                }
              }}
            />
          )}
        />
      </Grid>

      {/* Number of Vehicles */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='noOfVehicle'
          control={control}
          rules={{ required: 'Number of Vehicles is required' }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='No. of Vehicles *'
              placeholder='Enter number of vehicles'
              error={!!formErrors.noOfVehicle}
              helperText={formErrors.noOfVehicle?.message}
            />
          )}
        />
      </Grid>

      {/* Login Details Section */}
      <div
        className='flex items-center justify-between plb-5 pli-6'
        style={{ borderTop: '1px solid #ccc', width: '100%', marginLeft: '15px', marginTop: '25px' }}
      >
        <Typography variant='h5' marginLeft={-5}>
          Login Details
        </Typography>
      </div>

      {/* Company Email */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='companyEmail'
          control={control}
          rules={{ 
            required: 'Company Email is required', 
            validate: value => validateEmail(value, dictionary) 
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label='Company Email *'
              placeholder='Enter company email'
              error={!!formErrors.companyEmail}
              helperText={formErrors.companyEmail?.message}
            />
          )}
        />
      </Grid>

      {/* Password */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='password'
          control={control}
          rules={{ 
            required: isEditing ? false : 'Password is required', 
            validate: isEditing ? undefined : value => validatePassword(value, dictionary) 
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label={isEditing ? 'Password (Leave blank to keep current)' : 'Password *'}
              placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
              type={isPasswordShown ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => setIsPasswordShown(!isPasswordShown)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      {isPasswordShown ? '🙈' : '👁️'}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={!!formErrors.password}
              helperText={formErrors.password?.message}
            />
          )}
        />
      </Grid>
      
      {/* Confirm Password */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='confirmPassword'
          control={control}
          rules={{
            required: isEditing ? false : 'Confirm Password is required',
            validate: (value, formValues) => {
              if (!isEditing && value !== formValues.password) {
                return 'Passwords do not match';
              }
              
              return true;
            }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label={isEditing ? 'Confirm Password (if changing)' : 'Confirm Password *'}
              placeholder={isEditing ? 'Confirm new password' : 'Enter Confirm password'}
              type={isPasswordShown ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => setIsPasswordShown(!isPasswordShown)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      {isPasswordShown ? '🙈' : '👁️'}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword?.message}
            />
          )}
        />
      </Grid>

      {/* Package Details Section */}
      <div
        className='flex items-center justify-between plb-5 pli-6'
        style={{ borderTop: '1px solid #ccc', width: '100%', marginLeft: '15px', marginTop: '25px' }}
      >
        <Typography variant='h5' marginLeft={-5}>
          Package Details
        </Typography>
      </div>

      {/* Subscription */}
      <Grid item xs={12} sm={4}>
        <Controller
          name='subScriptionId'
          control={control}
          rules={{ required: dictionary['navigation']?.SubscriptionIsRequired || 'Subscription is required' }}
          render={({ field }) => (
            <CustomTextField
              select
              label={dictionary['navigation']?.Subscription || 'Subscription'}
              fullWidth
              {...field}
              value={field.value || subScriptionId || ''}
              error={!!formErrors.subScriptionId}
              helperText={formErrors.subScriptionId?.message}
            >
              {packageData.map(sub => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
      </Grid>
      
      {/* Package Details Display */}
      {selectedPackage && (
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 3, mt: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Selected Package Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Package Name</Typography>
                  <Typography variant="body1">{selectedPackage.name}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                  <Typography variant="body1">${selectedPackage.amount}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Validity Period</Typography>
                  <Typography variant="body1">{selectedPackage.validityPeriod} {selectedPackage.unit}S</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Maximum Drivers</Typography>
                  <Typography variant="body1">{selectedPackage.noOfDrivers}</Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Maximum Users</Typography>
                  <Typography variant="body1">{selectedPackage.noOfUsers}</Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Typography variant="body2">{selectedPackage.description}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      )}
    </Grid>
  )
}

export default CompanyInformation