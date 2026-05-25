/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'

import { DialogActions, Button, Grid, MenuItem, Box, CircularProgress, Card , TextField } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm, Controller } from 'react-hook-form'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField'
import { createCompany } from '@apis/company'
import { fetchActiveLanguage } from '@apis/language'
import { fetchActiveCountry } from '@apis/country'
import { fetchRoles } from '@apis/role'
import {
  validatePassword,
  validatePasswordsMatch,
  textAndMin,
  validateEmail,
  validatePhoneNumber
} from '@/utils/validation'

// Type Definitions
type AddUserInfoData = {
  companyName?: string
  companyEmail?: string
  companyPhoneNumber?: string
  contactPersonName?: string
  contactPersonEmail?: string
  contactPersonPhoneNumber?: string
  loginId?: string
  selectPackage?: string
  startDate?: string
  endDate?: string
  paymentDetails?: string
  commissionType?: string
  password?: string
  confirmPassword?: string
  role?: number | string
  country?: number | string
  commission?: string
  noOfVehicle?: string
  active?: boolean
  status?: boolean
}

type CompanyType = {
  id?: string
  companyName?: string
  contactPersonName?: string
  contactPersonEmail?: string
  contactPersonPhoneNumber?: string
  companyEmail?: string
  companyPhoneNumber?: string
  loginId?: string
  selectPackage?: string
  startDate?: string
  endDate?: string
  paymentDetails?: string
  commissionType?: string
  password?: string
  confirmPassword?: string
  role?: number | string
  country?: number | string
  commission?: string
  noOfVehicle?: string
  userId?: string
  active?: boolean
  status?: boolean
}

// Props for AddCompany
interface AddCompanyProps {
  lang: string,
  dictionary: any
}

const AddCompany = ({ lang, dictionary }: AddCompanyProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, touchedFields },
    trigger,
    watch
  } = useForm<AddUserInfoData>({
    mode: 'all', // Validate on change and on blur
    defaultValues: {
      companyName: '',
      contactPersonName: '',
      companyEmail: '',
      companyPhoneNumber: '',
      contactPersonEmail: '',
      contactPersonPhoneNumber: '',
      loginId: '',
      selectPackage: '',
      startDate: '',
      endDate: '',
      paymentDetails: '',
      commissionType: '',
      password: '',
      confirmPassword: '',
      role: '',
      commission: '',
      noOfVehicle: ''
    }
  })

  const [roles, setRoles] = useState<{ id: number; role: string }[]>([])
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([])
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([])
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false) // Loading state
  const paymentDetails = watch('paymentDetails') // Watch the paymentDetails field
  const commissionType = watch('commissionType')
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  // Dynamically update the input field name based on payment selection
  const [fieldName, setFieldName] = useState<string>('')
  const [rules, setRules] = useState<any>({})
  const [label, setLabel] = useState<string>('')
  const [helperText, setHelperText] = useState<string>('')

  const [commisionType, setCommissionType] = useState<string>('')
  const [commissionTypeRules, setCommissionTypeRules] = useState<any>({})
  const [commissionTypeLabel, setCommissionTypeLabel] = useState<string>('')
  const [commissionTypeHelperText, setCommissionTypeHelperText] = useState<string>('')

  // Dynamically update the input field name based on comissiom type selection
  const [commisionName, setCommissionName] = useState<string>('')
  const [commissionRules, setCommissionRules] = useState<any>({})
  const [commissionLabel, setCommissionLabel] = useState<string>('')
  const [commissionHelperText, setCommissionHelperText] = useState<string>('')

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const roleData = await fetchRoles()
        const languageData = await fetchActiveLanguage()
        const countryData = await fetchActiveCountry()

        setRoles(roleData)
        setLanguages(languageData)
        setCountries(countryData)
      } catch (error) {
        console.error('Error fetching options:', error)
      }
    }

    if (paymentDetails === 'commission') {
      setCommissionType('commissionType')
      setCommissionTypeLabel('Commission Type *')
      setCommissionTypeRules({ required: 'commission type is required' })
      setCommissionTypeHelperText('Select commission type')
    } else if (paymentDetails === 'subscription') {
      setFieldName('subscriptionPrice')
      setLabel('Subscription Price *')
      setRules({ required: 'Subscription price is required' })
      setHelperText('Enter the subscription amount.')
    } else {
      setFieldName('')
      setLabel('')
      setRules({})
      setHelperText('')
    }

    if (paymentDetails !== 'commission') {
      setCommissionName('') // Reset commission field name
      setCommissionLabel('') // Reset commission label
      setCommissionRules({}) // Reset commission validation rules
      setCommissionHelperText('') // Reset commission helper text
    }

    // Update the field name based on commission type selection

    if (commissionType === 'fixed') {
      setCommissionName('fixed')
      setCommissionLabel('Fixed *')
      setCommissionRules({ required: 'fixed amount is required' })
      setCommissionHelperText('Enter the fixed amount')
    } else if (commissionType === 'percentage') {
      setCommissionName('percentage')
      setCommissionLabel('Percentage *')
      setCommissionRules({ required: 'percentage is required' })
      setCommissionHelperText('Enter the percentage')
    }

    fetchOptions()
  }, [paymentDetails, commissionType])

  const onSubmit = async (formData: AddUserInfoData) => {
    setLoading(true)

    try {
      const filteredIds = roles.filter(item => item.role === 'Company').map(item => item.id)

      const newData: any = {
        companyName: formData.companyName,
        contactPersonName: formData.contactPersonName,
        contactPersonEmail: formData.contactPersonEmail,
        contactPersonPhoneNumber: formData.contactPersonPhoneNumber,
        companyEmail: formData.companyEmail || '',
        loginId: formData.loginId || '',
        selectPackage: formData.selectPackage || '',
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        paymentDetails: formData.paymentDetails || '',
        commissionType: formData.commissionType || '',
        active: true,
        commission: formData.commission || '',
        noOfVehicle: formData.noOfVehicle || '',
        companyPhoneNumber: formData.companyPhoneNumber || '',
        roleIds: filteredIds,
        password: formData.password || '',
        status: true,
        type: 'CORPORATE'

      }

      const createdData = await createCompany(newData)

      const newCompany: CompanyType = {
        id: createdData.id,
        companyName: formData.companyName,
        contactPersonName: formData.contactPersonName,
        contactPersonEmail: formData.contactPersonEmail,
        contactPersonPhoneNumber: formData.contactPersonPhoneNumber,
        companyEmail: formData.companyEmail || '',
        active: true,
        commission: formData.commission || '',
        noOfVehicle: formData.noOfVehicle || '',
        companyPhoneNumber: formData.companyPhoneNumber || '',
        status: true
      }

      toast.success(dictionary['navigation'].NewTaxiCompanycreatedsuccessfully)
    } catch (error) {
      toast.error(dictionary['navigation'].Anerroroccurredwhileprocessingtherequest)
    } finally {
      setLoading(false)
    }
  }

  const handleClickShowPassword = () => setIsPasswordShown(prev => !prev)

  return (
    <Card className='p-8'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex-center' style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
          <Typography variant='h4' align='center'>
            {dictionary['navigation'].AddTaxiCompany}
          </Typography>
        </div>
        <Grid container spacing={5}>
          <div
            className='flex items-center justify-between plb-5 pli-6 mt-5'
            style={{ width: '100%', marginLeft: '15px' }}
          >
            <Typography variant='h5' marginLeft={-5}>
              {dictionary['navigation'].CompanyDetails}
            </Typography>
          </div>
          {/* Form fields */}
          <Grid item xs={12} sm={4}>
            <Controller
              name='companyName'
              control={control}
              rules={{ required: dictionary['navigation'].CompanyNameisrequired, validate: textAndMin }}

              // rules={{ required: 'Last Name is required', validate: value => validateTextOnly(value, dictionary) }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].CompanyName}
                  placeholder={dictionary['navigation'].Entercompanyname}
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name='companyEmail'
              control={control}
              rules={{ required: dictionary['navigation'].CompanyEmailisrequired, validate: validateEmail }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].CompanyEmail}
                  placeholder={dictionary['navigation'].Entercompanyemail}
                  error={!!errors.companyEmail}
                  helperText={errors.companyEmail?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name='companyPhoneNumber'
              control={control}
              rules={{ required: dictionary['navigation'].CompanyNumberisrequired, validate: validatePhoneNumber }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].CompanyPhoneNumber}
                  placeholder={dictionary['navigation'].Enterphonenumber}
                  error={!!errors.companyPhoneNumber}
                  helperText={errors.companyPhoneNumber?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name='contactPersonName'
              control={control}
              rules={{ required: dictionary['navigation'].ContactPersonNameisrequired, validate: textAndMin }}

              // rules={{ required: 'Last Name is required', validate: value => validateTextOnly(value, dictionary) }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].ContactPersonName}
                  placeholder={dictionary['navigation'].Entercontactpersonname}
                  error={!!errors.contactPersonName}
                  helperText={errors.contactPersonName?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name='contactPersonEmail'
              control={control}
              rules={{ required: dictionary['navigation'].ContactPersonEmailisrequired, validate: validateEmail }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].ContactPersonEmail}
                  placeholder={dictionary['navigation'].Entercontactpersonemail}
                  error={!!errors.contactPersonEmail}
                  helperText={errors.contactPersonEmail?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name='contactPersonPhoneNumber'
              control={control}
              rules={{ required: dictionary['navigation'].ContactPersonNumberisrequired, validate: validatePhoneNumber }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].ContactPersonNumber}
                  placeholder={dictionary['navigation'].Enterphonenumber}
                  error={!!errors.contactPersonPhoneNumber}
                  helperText={errors.contactPersonPhoneNumber?.message}
                />
              )}
            />
          </Grid>

          {/* {editCompany === null && (
            <>
              <Grid item xs={12} sm={4}>
                <Controller
                  name='role'
                  control={control}
                  rules={{ required: 'Role is required' }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label='Role *'
                      placeholder='Select Role'
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    >
                      {roles.map(option => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.role}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid> */}

          <div
            className='flex items-center justify-between plb-5 pli-6  '
            style={{ borderTop: '1px solid #ccc', width: '100%', marginLeft: '15px', marginTop: '25px' }}
          >
            <Typography variant='h5' marginLeft={-5}>
              {dictionary['navigation'].LoginDetails}
            </Typography>
          </div>

          <Grid item xs={12} sm={4}>
            <Controller
              name='loginId'
              control={control}
              rules={{ required: dictionary['navigation'].LoginIDisrequired, validate: textAndMin }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].LoginID}
                  placeholder={dictionary['navigation'].EnterloginId}
                  error={!!errors.loginId}
                  helperText={errors.loginId?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name='password'
              control={control}
              rules={{ required: dictionary['navigation'].Passwordisrequired, validate: validatePassword }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].Password}
                  placeholder={dictionary['navigation'].Enterpassword}
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          {isPasswordShown ? '🙈' : '👁️'}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name='confirmPassword'
              control={control}
              rules={{
                required: dictionary['navigation'].ConfirmPasswordisrequired,
                validate: validatePasswordsMatch(watch('password'))
              }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].ConfirmPassword}
                  placeholder={dictionary['navigation'].EnterConfirmpassword}
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        ></IconButton>
                      </InputAdornment>
                    )
                  }}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              )}
            />
          </Grid>
          {/* </>
          )} */}

          {/* <div
            className='flex items-center justify-between plb-5 pli-6  '
            style={{ borderTop: '1px solid #ccc', width: '100%', marginLeft: '15px', marginTop: '25px' }}
          >
            <Typography variant='h5' marginLeft={-5}>
              PacKage Details
            </Typography>
          </div>

          <Grid item xs={12} sm={4}>
            <Controller
              name='selectPackage'
              control={control}
              rules={{ required: 'Package is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  fullWidth
                  label='Select Package *'
                  placeholder='Select Package type'
                  error={Boolean(errors.selectPackage)}
                  helperText={errors.selectPackage?.message || ''}
                >
                  <MenuItem value='sliver'>Sliver</MenuItem>
                  <MenuItem value='gold'>Gold</MenuItem>
                  <MenuItem value='platinum'>Platinum</MenuItem>
                </CustomTextField>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant='h6' sx={{ fontSize: '0.80rem', color: errors.startDate ? 'red' : 'inherit' }}>
              Start Date *
            </Typography>
            <Controller
              name='startDate'
              control={control}
              rules={{ required: 'Start Date is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 40 // Decrease the input field height
                    },
                    '& input': {
                      padding: '6px 14px', // Adjust padding for smaller height
                      fontSize: '0.875rem' // Adjust font size
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* End Date Field */}
          {/*<Grid item xs={12} sm={4}>
            <Typography variant='h6' sx={{ fontSize: '0.80rem', color: errors.endDate ? 'red' : 'inherit' }}>
              End Date *
            </Typography>
            <Controller
              name='endDate'
              control={control}
              rules={{
                required: 'End Date is required',
                validate: (value, context) => {
                  // Check if value is provided and valid
                  if (value) {
                    const endDate = new Date(value)

                    // Ensure context.startDate is available and valid
                    if (context.startDate) {
                      const startDate = new Date(context.startDate)
                      if (endDate < startDate) {
                        return 'End date must be after start date'
                      }
                    } else {
                      return 'Start date is not available'
                    }
                  } else {
                    return 'End date is required'
                  }

                  return true // Validation passed
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='date'
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 40 // Decrease the input field height
                    },
                    '& input': {
                      padding: '6px 14px', // Adjust padding for smaller height
                      fontSize: '0.875rem' // Adjust font size
                    }
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name='paymentDetails'
              control={control}
              rules={{ required: 'paymentDetails is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  fullWidth
                  label='Payment Details *'
                  placeholder='Select Payment type'
                  error={Boolean(errors.paymentDetails)}
                  helperText={errors.paymentDetails?.message || ''}
                >
                  <MenuItem value='commission'>Commission</MenuItem>
                  <MenuItem value='subscription'>Subscription</MenuItem>
                </CustomTextField>
              )}
            />
          </Grid>

          {paymentDetails === 'subscription' && (
            <Grid item xs={12} sm={4}>
              <Controller
                name={fieldName as keyof AddUserInfoData}
                control={control}
                rules={rules}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={label}
                    placeholder={helperText}
                    error={!!errors[fieldName as keyof AddUserInfoData]} // Dynamically check for errors using fieldName
                    helperText={errors[fieldName as keyof AddUserInfoData]?.message} // Dynamically show error message
                  />
                )}
              />
            </Grid>
          )}

          {paymentDetails === 'commission' && (
            <Grid item xs={12} sm={4}>
              <Controller
                name='commissionType'
                control={control}
                rules={commissionTypeRules}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={commissionTypeLabel}
                    placeholder={commissionTypeHelperText}
                    error={Boolean(errors['commissionType' as keyof AddUserInfoData])} // Access commissionType error dynamically
                    helperText={errors['commissionType' as keyof AddUserInfoData]?.message || ''}
                  >
                    <MenuItem value='fixed'>Fixed</MenuItem>
                    <MenuItem value='percentage'>Percentage</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
          )}

          {paymentDetails === 'commission' && commissionType && (
            <Grid item xs={12} sm={4}>
              <Controller
                name={commisionName as keyof AddUserInfoData}
                control={control}
                rules={commissionRules}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={commissionLabel}
                    placeholder={commissionHelperText}
                    error={!!errors[commisionName as keyof AddUserInfoData]} // Dynamically check for errors using commissionName
                    helperText={errors[commisionName as keyof AddUserInfoData]?.message}
                  />
                )}
              />
            </Grid>
          )} */}
          {/* <Grid item xs={12}>
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Address'
                    placeholder='Enter address'
                    rows={4}
                    multiline
                  />
                )}
              />
            </Grid> */}
        </Grid>
        <DialogActions className='gap-4 px-6 pb-4'>
          <Button
            variant='outlined'

            // onClick={handleCloseDrawer}
          >
            {dictionary['navigation'].Cancel}
          </Button>

          <Button variant='contained' type='submit' disabled={isSubmitDisabled} sx={{ position: 'relative' }}>
            {loading ? (
              <>
                <CircularProgress
                  size={24}
                  color='inherit'
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: -12,
                    marginLeft: -12
                  }}
                />
                {dictionary['navigation'].Submitting}
              </>
            ) : (
              dictionary['navigation'].Submit
            )}
          </Button>
        </DialogActions>
      </form>
    </Card>
  )
}

export default AddCompany
