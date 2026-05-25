/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react';

import React, { useState, useEffect } from 'react'

import {
  IconButton,
  InputAdornment,
  Grid,
  Button,
  MenuItem,
  Drawer,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Icon360 } from '@tabler/icons-react'

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import {
  validateTextOnly,
  validateEmail,
  validatePhoneNumber,
} from '@/utils/validation'
import { createClient, fetchClient, updateClient } from '@/app/api/apps/taxi/democlient'
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint'
import type { ClientType } from '@/types/apps/clientTypes'

const formatDate = (date: Date | null): string => {
  if (!date) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()


  return `${month}/${day}/${year}`
}

const generateDemoKey = () => {
  const randomLetters = Math.random().toString(36).substring(2, 4).toUpperCase()


  return `Demo#${randomLetters}`
}

const AddClientDrawer: React.FC<any> = ({
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
  const [subscriptionStr, setSubscriptionStr] = useState<string>(editClient?.subScriptionId || '') // Initialize with editClient's value if exists
  const [roles, setRoles] = useState<{ id: string; role: string }[]>([]) // Roles (for dropdown)
  const [languages, setLanguages] = useState<any[]>([])
  const [demoKey, setDemoKey] = useState<string>('')
  const { checkDemoStatus } = useIsDemoUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dropDownData = await fetch(ENDPOINTS.democlient.dropDownList)
        
        const data = await dropDownData.json()
        
        setRoles(data.data.roles)
        setLanguages(data.data.languages)
      } catch (error) {
        toast.error(dictionary['navigation'].faildtofechdata)
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
    watch
  } = useForm<ClientType>({
    mode: 'all',
    defaultValues: {
      ...editClient,
      userId: editClient?.userId || 'defaultUserId'
    }
  })

  useEffect(() => {
    if (open) {
      if (editClient) {
        reset({
          Startdate: editClient.Startdate ? new Date(editClient.Startdate).toISOString().split('T')[0] : '',
          Enddate: editClient.Enddate ? new Date(editClient.Enddate).toISOString().split('T')[0] : '',
          subScriptionId: editClient.subScriptionId || '',
          email: editClient.email || '',
          demoKey: editClient.demoKey || '', // Ensure demoKey is set correctly when editing
          phoneNumber: editClient.phoneNumber || '',
          firstName: editClient.firstName || ''
        })
        setStartDate(editClient.Startdate ? new Date(editClient.Startdate) : null)
        setEndDate(editClient.Enddate ? new Date(editClient.Enddate) : null)
        setSubscriptionStr(editClient.subScriptionId || '')
        setDemoKey(editClient.demoKey || '') // Ensure demoKey is set correctly when editing
      } else {
        reset({
          Startdate: '',
          Enddate: '',
          subScriptionId: '',
          email: '',
          phoneNumber: '',
          firstName: '',
          userId: ''
        })
        setStartDate(null)
        setEndDate(null)
        setSubscriptionStr('')
        setDemoKey('') // Clear demoKey when there's no editClient
      }
    }
  }, [open, editClient, reset])

  // Set default start date to today when opening the form if no start date exists
  useEffect(() => {
    if (open && !editClient) {
      // For new entries (not in edit mode), calculate the start and end date
      if (subscriptionStr === 'Demo' && !startDate) {
        const today = new Date()

        setStartDate(today)
        setValue('Startdate', today.toISOString().split('T')[0])

        // Set end date to today + 7 days
        const calculatedEndDate = new Date(today)

        calculatedEndDate.setDate(calculatedEndDate.getDate() + 7)
        setEndDate(calculatedEndDate)
        setValue('Enddate', calculatedEndDate.toISOString().split('T')[0])
      }
    }
  }, [open, startDate, subscriptionStr, setValue, editClient])

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date)

    if (subscriptionStr === 'Demo' && date) {
      const calculatedEndDate = new Date(date)

      calculatedEndDate.setDate(calculatedEndDate.getDate() + 7) // 7 days after the start date
      setEndDate(calculatedEndDate)
      setValue('Enddate', calculatedEndDate.toISOString().split('T')[0])
    }
  }

  const handleSubscriptionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedId = event.target.value as string

    setSubscriptionStr(selectedId)

    if (selectedId === 'Demo' && startDate) {
      // For Demo: Set end date to start date + 7 days
      const calculatedEndDate = new Date(startDate)

      calculatedEndDate.setDate(calculatedEndDate.getDate() + 7)
      setEndDate(calculatedEndDate)
      setValue('Enddate', calculatedEndDate.toISOString().split('T')[0])
    }
  }

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

  const onSubmit = async (formData: ClientType) => {
    setLoading(true)
    const defaultLanguage = languages.length > 0 ? languages[0].id : null
    const defaultPassword = "123456789"

    try {
      const updatedData: any = {
        firstName: formData.firstName ?? editClient?.firstName,
        email: formData.email ?? editClient?.email,
        subScriptionId: subscriptionStr || editClient?.subScriptionId,
        phoneNumber: formData.phoneNumber ?? editClient?.phoneNumber,
        demoKey: formData.demoKey || demoKey,
        password: defaultPassword || editClient?.demoKey,
        roleIds: roles.filter(item => item.role === 'Demo').map(item => item.id),
        active: true,
        Startdate: startDate ? formatDate(startDate) : editClient?.Startdate,
        Enddate: endDate ? formatDate(endDate) : editClient?.Enddate,
        userId: formData._id ?? editClient?._id,
        status: true,
        demo: true,
        languageId: defaultLanguage
      }
    
      if (editClient?._id) {
       
        const response = await updateClient(editClient._id, updatedData)

        updatedData.Name = formData.firstName
        setData((prevData: any[]) => prevData.map(client => (client._id === editClient._id ? { ...client, ...response } : client)))
        setEditClient(response)
        toast.success(dictionary['navigation'].clientupdatedsuccessfully)
      } else {
        const response = await createClient(updatedData)

        if (!response.success) {
          toast.error(response.message)

          return
        }

        updatedData.userId = response.data.userId
        updatedData.Name = updatedData.firstName
        updatedData._id = response.data.id
        handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

        setData((prevData: any[]) => [updatedData, ...prevData])
        toast.success(dictionary['navigation'].clientaddsuccessfully)

      }

      handleDialogClose()
    } catch (error) {
      console.error('Submission error:', error)
      toast.error(dictionary['navigation'].oprationfailed)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDemoKey = () => {
    const newDemoKey = generateDemoKey()

    setDemoKey(newDemoKey)
    setValue('demoKey', newDemoKey)
  }

  const handleDialogClose = () => {
    setDemoKey('')
    handleClose()
    reset()
    setStartDate(null)
    setEndDate(null)
    setSubscriptionStr('')
  }

  // Determine if date fields should be disabled based on subscription type
  const isDateFieldDisabled = subscriptionStr === 'Demo'
  const isSubmitDisabled = checkDemoStatus() || loading;

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={handleDialogClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between plb-5 pli-6">
        <Typography variant="h5">{editClient ? 'Edit Client' : 'Add Client'}</Typography>
        <IconButton size="small" onClick={handleDialogClose}>
          <i className="tabler-x text-2xl text-textPrimary" />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-6">
        <Controller
          name="firstName"
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
        <Controller
          name="email"
          control={control}
          rules={{ required: dictionary['navigation'].Emailisrequired, validate: value => validateEmail(value, dictionary) }}
          render={({ field }) => (
            <CustomTextField
              label={dictionary['navigation'].email}
              fullWidth
              {...field}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
        <Controller
          name="demoKey"
          control={control}
          rules={{
            required: "Demo key is required",
            maxLength: {
              value: 10,
              message: "Maximum 10 characters allowed"
            }
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label="Demo key"
              value={demoKey}
              onChange={(e) => {
                const input = e.target.value;


                // Allow any characters but limit to 10
                if (input.length <= 10) {
                  field.onChange(input);
                  setDemoKey(input);
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={handleGenerateDemoKey}
                    >
                      <Icon360 />
                    </IconButton>
                  </InputAdornment>
                ),
                inputProps: {
                  maxLength: 10
                }
              }}
              error={!!errors.demoKey}
              helperText={errors.demoKey?.message}
            />
          )}
        />
        <Controller
          name="phoneNumber"
          control={control}
          rules={{ required: 'Phone Number is required',validate: value => validatePhoneNumber(value, dictionary) }}
          render={({ field }) => (
            <CustomTextField
              label="Phone Number"
              fullWidth
              {...field}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
            />
          )}
        />
       <Controller
          name="subScriptionId"
          control={control}
          rules={{ required: dictionary['navigation'].Subscriptionisrequired }}
          render={({ field }) => (
            <CustomTextField
              select
              label={dictionary['navigation'].subscription}
              fullWidth
              {...field}
              value={subscriptionStr}
              onChange={e => {
                handleSubscriptionChange(e)
                field.onChange(e)
              }}
              error={!!errors.subScriptionId}
              helperText={errors.subScriptionId?.message}
            >
              <MenuItem value="Demo">{dictionary['navigation'].Demo7days}</MenuItem>
              <MenuItem value="Manual">{dictionary['navigation'].Manual}</MenuItem>
            </CustomTextField>
          )}
        />
        <Controller
          name="Startdate"
          control={control}
          rules={{ required: dictionary['navigation'].StartDateisrequired }}
          render={({ field }) => (
            <AppReactDatepicker
              id="start-date"
              selected={startDate}
              minDate={new Date()}
              onChange={(date: Date | null) => {
                handleStartDateChange(date)
                field.onChange(date)
              }}
              disabled={isDateFieldDisabled}
              customInput={
                <CustomTextField
                  label={dictionary['navigation'].startDate}
                  fullWidth
                  error={!!errors.Startdate}
                  helperText={errors.Startdate?.message}
                  disabled={isDateFieldDisabled}
                  value={startDate ? startDate.toLocaleDateString() : ''}
                />
              }
            />
          )}
        />
        <Controller
          name="Enddate"
          control={control}
          rules={{ required: dictionary['navigation'].EndDateisrequired }}
          render={({ field }) => (
            <AppReactDatepicker
              id="end-date"
              selected={endDate}
              minDate={startDate}
              onChange={(date: Date | null) => {
                setEndDate(date)
                field.onChange(date)
              }}
              disabled={isDateFieldDisabled}
              customInput={
                <CustomTextField
                  label={dictionary['navigation'].endDate}
                  fullWidth
                  error={!!errors.Enddate}
                  helperText={errors.Enddate?.message}
                  disabled={isDateFieldDisabled}
                  value={endDate ? endDate.toLocaleDateString() : ''}
                />
              }
            />
          )}
        />
        <div className="flex items-center gap-4">
          <Button variant="contained" type="submit" disabled={isSubmitDisabled} sx={{ position: 'relative' }}>
            {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].submit}
            {loading && <CircularProgress size={24} color="inherit" />}
          </Button>
          <Button variant="outlined" color="error" onClick={handleDialogClose}>
            {dictionary['navigation'].Cancel}
          </Button>
        </div>
      </form>
    </Drawer>
  )
}

export default AddClientDrawer