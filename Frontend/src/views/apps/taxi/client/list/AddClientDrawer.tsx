/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { ChangeEvent } from 'react';
import React, { useState, useEffect } from 'react'

import {
  IconButton,
  InputAdornment,
  Grid,
  Button,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  validateTextOnly,
  validateEmail,
  validatePhoneNumber,
  validateNumeric,
  validatePassword
} from '@/utils/validation'
import { createClient, fetchClient, updateClient } from '@/app/api/apps/taxi/client'
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint'
import type { ClientType } from '@/types/apps/clientTypes'
import { useIsDemoUser } from '@/utils/demoUser' 

interface AddClientDrawerProps {
  open: boolean
  setOpen: (open: boolean) => void
  data: ClientType[]
  setData: any
  handleClose: () => void
  editClient?: ClientType | null
  setEditClient: (client: ClientType | null) => void
  onConfirm?: (client: ClientType) => Promise<void>
  count: number
  page: number
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number
  dictionary:any
}

const formatDate = (date: Date | null): string => {
  if (!date) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${month}/${day}/${year}`
}

const features = [
  { id: 'taxi', name: 'Taxi' },
  { id: 'on demand Service', name: 'On Demand Service' },
  { id: 'truck', name: 'Truck' }
]

const taxiModules = [
  { id: 'Outstation', name: 'Outstation' },
  { id: 'rental', name: 'Rental' },
  { id: 'Local', name: 'Local' }
]

const AddClientDrawer: React.FC<AddClientDrawerProps> = ({
  open,
  handleClose,
  data,
  editClient,
  setData,
  setEditClient,
  onConfirm,
  count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary
}) => {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const [subscription, setSubscription] = useState<
    { id: string; name: string; validityPeriod: string; description: string; noOfDrivers: string; status: boolean }[]
  >([])
  
  const { checkDemoStatus } = useIsDemoUser();

  const [subscriptionStr, setSubscriptionStr] = useState<string>('')
  const [roles, setRoles] = useState<{ id: string; role: string }[]>([])
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [noOfDriversStr, setNoOfDriversStr] = useState<string>('')
  const [noOfUsersStr, setNoOfUsersStr] = useState<string>('')
  const [languages, setLanguages] = useState<any[]>([]);

  const handleClickShowPassword = () => {
    setIsPasswordShown(prev => !prev)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dropDownData = await fetch(ENDPOINTS.client.dropDownList)
        const data = await dropDownData.json()

        setRoles(data.data.roles);
        setLanguages(data.data.languages);
        setSubscription(data.data.companySubscription)
      } catch (error) {
        toast.error('Failed to fetch data')
      }
    }

    fetchData()
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    watch,
    getValues
  } = useForm<ClientType>({
    mode: 'all',
    defaultValues: {
      ...editClient,
      userId: editClient?.userId || 'defaultUserId' // Ensure userId is populated
    }
  })

  useEffect(() => {
    if (open) {
      if (editClient) {
        reset({
          clientCode: editClient.clientCode || '',
          Startdate: editClient.Startdate ? new Date(editClient.Startdate).toISOString().split('T')[0] : '',
          Enddate: editClient.Enddate ? new Date(editClient.Enddate).toISOString().split('T')[0] : '',
          subScriptionId: editClient.subScriptionId || '',
          noOfDrivers: editClient.noOfDrivers || '',
          noOfUsers: editClient.noOfUsers || '',
          features: editClient.features || '',
          taxiModules: editClient.taxiModules || '',
          email: editClient.email || '',
          phoneNumber: editClient.phoneNumber || '',
          emergencyNumber: editClient.emergencyNumber || '',
          address: editClient.address || '',
          firstName: editClient.firstName || '',
          lastName: editClient.lastName || ''
        })
        setStartDate(editClient.Startdate ? new Date(editClient.Startdate) : null)
        setEndDate(editClient.Enddate ? new Date(editClient.Enddate) : null)
      } else {
        reset({
          clientCode: '',
          Startdate: '',
          Enddate: '',
          subScriptionId: '',
          noOfDrivers: '',
          noOfUsers: '',
          features: '',
          taxiModules: '',
          email: '',
          phoneNumber: '',
          emergencyNumber: '',
          address: '',
          firstName: '',
          lastName: '',
          userId: ''
        })
        setStartDate(null)
        setEndDate(null)
      }
    }
  }, [open, editClient, reset])

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date)

    if (subscriptionStr) {
      const selectedSubscription = findSubscriptionById(subscriptionStr, subscription)

      if (selectedSubscription) {
        const calculatedEndDate = calculateEndDate(date, selectedSubscription.validityPeriod)

        setEndDate(calculatedEndDate)
      }
    }
  }

  const calculateEndDate = (startDate: Date | null, validityPeriod: string): Date | null => {
    if (!startDate || !validityPeriod) return null
    const endDate = new Date(startDate)
    const period = parseInt(validityPeriod, 10)

    endDate.setMonth(endDate.getMonth() + period)

    return endDate
  }

  const findSubscriptionById = (id: string, subscriptions: any[]): any | undefined => {
    return subscriptions.find(subscription => subscription.id === id)
  }

  const onSubmit = async (formData: ClientType) => {
    setLoading(true)
    const defaultLanguage = languages.length > 0 ? languages[0].id : null;

    try {
      const filteredIds = roles.filter(item => item.role === 'Client').map(item => item.id)

      // Use nullish coalescing for proper null/undefined checks
      const updatedData: any = {
        firstName: formData.firstName ?? editClient?.firstName,
        lastName: formData.lastName ?? editClient?.lastName,
        email: formData.email ?? editClient?.email,
        subScriptionId: subscriptionStr || editClient?.subScriptionId,
        phoneNumber: formData.phoneNumber ?? editClient?.phoneNumber,
        emergencyNumber: formData.emergencyNumber ?? editClient?.emergencyNumber,
        password: formData.password || editClient?.password, // Keep || for password to allow empty string reset
        roleIds: filteredIds,
        address: formData.address ?? editClient?.address,
        active: true,
        clientCode: formData.clientCode ?? editClient?.clientCode,
        Startdate: startDate ? formatDate(startDate) : editClient?.Startdate,
        Enddate: endDate ? formatDate(endDate) : editClient?.Enddate,
        noOfDrivers: Number(noOfDriversStr ?? editClient?.noOfDrivers),
        noOfUsers: Number(noOfUsersStr ?? editClient?.noOfUsers),
        taxiModules: formData.taxiModules ?? editClient?.taxiModules,
        features: formData.features ?? editClient?.features,
        userId: formData._id ?? editClient?._id,
        status: true,
        languageId: defaultLanguage, 

      }


      if (editClient?._id) {
        // Update existing client
        const response = await updateClient(editClient._id, updatedData)

        updatedData.Name = formData.firstName + '' + formData.lastName

        setData((prevData: any[]) =>
          prevData.map(client => (client._id === editClient._id ? { ...client, ...response } : client))
        )
        setEditClient(response)
        toast.success(dictionary['navigation'].clientUpdatedSuccessfully)
      } else {
        // Create new client

        const response = await createClient(updatedData);


        if (!response.success) {
          toast.error(response.message)

          return
        }

        const createData: any = response.data

        createData.Name = formData.firstName + '' + formData.lastName


        setData((prevData: any[]) => [createData,...prevData])
        handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);


        // if (rowsPerPage != data.length) {
        //   setData((prevData: any[]) => [...prevData, createData])
        // } else {
        //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        // }
        // Update state with API response
        toast.success(dictionary['navigation'].clientAddedSuccessfully)
      }

      handleDialogClose()
    } catch (error) {
      console.error('Submission error:', error)

      if (error instanceof Error) {
        toast.error(`Operation failed: ${error.message}`)
      } else {
        toast.error(dictionary['navigation'].operationFailed)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDialogClose = () => {
    handleClose()
    reset()
    setStartDate(null)
    setEndDate(null)
  }

  const handleSubscriptionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedId = event.target.value as string

    setSubscriptionStr(selectedId)

    const selectedSubscription = findSubscriptionById(selectedId, subscription)

    if (selectedSubscription && startDate) {
      const calculatedEndDate = calculateEndDate(startDate, selectedSubscription.validityPeriod)

      setEndDate(calculatedEndDate)
    }

    setNoOfUsersStr(selectedSubscription?.noOfUsers || '')
    setNoOfDriversStr(selectedSubscription?.noOfDrivers || '')
    setValue('noOfDrivers', selectedSubscription?.noOfDrivers || '')
    setValue('noOfUsers', selectedSubscription?.noOfUsers || '')
  }


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
  
    const isSubmitDisabled = checkDemoStatus() || loading;

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
      <DialogTitle>{editClient ? dictionary['navigation'].EditClient :  dictionary['navigation'].AddClient }</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6} marginTop={4}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='firstName'
                control={control}
                rules={{ required: dictionary['navigation'].FirstNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].FirstName}
                    fullWidth
                    {...field}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: dictionary['navigation'].LastNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].LastName}
                    fullWidth
                    {...field}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>

            {editClient === null && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: dictionary['navigation'].Passwordisrequired, validate: value => validatePassword(value, dictionary) }}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        type={isPasswordShown ? 'text' : 'password'}
                        fullWidth
                        label={dictionary['navigation'].Password}
                        placeholder={dictionary['navigation'].Enterpassword}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={handleClickShowPassword} edge='end'>
                                {isPasswordShown ? '🙈' : '👁️'}

                                {/* {isPasswordShown ? <i className='tabler-eye-off' /> : <i className='tabler-eye' />} */}
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
                    rules={{
                      required: dictionary['navigation'].ConfirmPasswordisrequired,
                      validate: value => value === getValues('password') || dictionary['navigation'].Passwordsdonotmatch
                    }}
                    render={({ field, fieldState }) => (
                      <CustomTextField
                        {...field}
                        type={isPasswordShown ? 'text' : 'password'}
                        fullWidth
                        label={dictionary['navigation'].ConfirmPassword}
                        placeholder={dictionary['navigation'].Confirmpassword}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton onClick={handleClickShowPassword} edge='end'>
                                {/* {isPasswordShown ? <i className='tabler-eye-off' /> : <i className='tabler-eye' />} */}
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
            <Grid item xs={12} sm={6}>
              <Controller
                name='clientCode'
                control={control}
                rules={{ required: dictionary['navigation'].ClientCodeisrequired,validate: value => validateNumeric(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].ClientCode}
                    fullWidth
                    {...field}
                    error={!!errors.clientCode}
                    helperText={errors.clientCode?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='email'
                control={control}
                rules={{ required: dictionary['navigation'].Emailisrequired, validate: value => validateEmail(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label= {dictionary['navigation'].Email}
                    fullWidth
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='phoneNumber'
                control={control}
                rules={{ required: dictionary['navigation'].PhoneNumberIsRequired,validate: value => validatePhoneNumber(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].PhoneNumber}
                    fullWidth
                    {...field}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name='emergencyNumber'
                control={control}
                rules={{ required: dictionary['navigation'].EmergencyNumberIsRequired,validate: value => validatePhoneNumber(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].EmergencyNumber}
                    fullWidth
                    {...field}
                    error={!!errors.emergencyNumber}
                    helperText={errors.emergencyNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={8} sm={4}>
              <Controller
                name='subScriptionId'
                control={control}
                rules={{ required: dictionary['navigation'].SubscriptionIsRequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    label={dictionary['navigation'].Subscription}
                    fullWidth
                    {...field}
                    onChange={e => {
                      handleSubscriptionChange(e)
                      field.onChange(e)
                    }}
                    error={!!errors.subScriptionId}
                    helperText={errors.subScriptionId?.message}
                  >
                    {subscription.map(sub => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={8} sm={4}>
              <Controller
                name='Startdate'
                control={control}
                rules={{ required: dictionary['navigation'].StartDateIsRequired }}
                render={({ field }) => (
                  <AppReactDatepicker
                    id='start-date'
                    selected={startDate}
                    minDate={new Date()} // or a specific start date
                    onChange={(date: Date | null) => {
                      handleStartDateChange(date)
                      field.onChange(date)
                    }}
                    customInput={
                      <CustomTextField
                        label={dictionary['navigation'].StartDate}
                        fullWidth
                        error={!!errors.Startdate}
                        helperText={errors.Startdate?.message}
                      />
                    }
                  />
                )}
              />
            </Grid>
            <Grid item xs={8} sm={4}>
              <CustomTextField
                label={dictionary['navigation'].EndDate}
                fullWidth
                disabled
                value={endDate ? formatDate(endDate) : ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <Controller
                name='noOfDrivers'
                control={control}
                disabled
                rules={{ required: dictionary['navigation'].NoOfDriversIsRequired,validate: value => validateNumeric(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].NoOfDrivers}
                    fullWidth
                    {...field}
                    error={!!errors.noOfDrivers}
                    helperText={errors.noOfDrivers?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={8} sm={4}>
              <Controller
                name='noOfUsers'
                control={control}
                disabled
                rules={{ required: dictionary['navigation'].NoOfUsersIsRequired,validate: value => validateNumeric(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].NoOfUsers}
                    fullWidth
                    {...field}
                    error={!!errors.noOfUsers}
                    helperText={errors.noOfUsers?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={8} sm={4}>
              <Controller
                name='features'
                control={control}
                rules={{ required: dictionary['navigation'].SelectFeaturesIsRequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    label={dictionary['navigation'].SelectFeatures}
                    fullWidth
                    {...field}
                    error={!!errors.features}
                    helperText={errors.features?.message}
                  >
                    {features.map(sub => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={8} sm={4}>
              <Controller
                name='taxiModules'
                control={control}
                rules={{ required: dictionary['navigation'].SelectTaxiModulesIsRequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    label={dictionary['navigation'].SelectTaxiModules}
                    fullWidth
                    {...field}
                    error={!!errors.taxiModules}
                    helperText={errors.taxiModules?.message}
                  >
                    {taxiModules.map(sub => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Controller
                name='address'
                control={control}
                rules={{ required: dictionary['navigation'].AddressIsRequired }}
                render={({ field }) => (
                  <CustomTextField
                    label={dictionary['navigation'].Address}
                    fullWidth
                    {...field}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <DialogActions>
            <Button onClick={handleDialogClose} color='secondary'>
              {dictionary['navigation'].cancel}
            </Button>
            <Button type='submit' color='primary' variant='contained' disabled={isSubmitDisabled}>
              {loading ? <CircularProgress size={24} /> : dictionary['navigation'].submit}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddClientDrawer
