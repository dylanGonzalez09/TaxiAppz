/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react'
import React, { useEffect, useState } from 'react'

import { IconButton, Divider, Button, Drawer, Typography, Grid, MenuItem } from '@mui/material'

import CircularProgress from '@mui/material/CircularProgress'

import { useForm, Controller } from 'react-hook-form'

import { toast } from 'react-toastify'
import { getSession } from 'next-auth/react'

import { getDropDownList } from '@apis/user'

import CustomTextField from '@core/components/mui/TextField'

import { createCancellation, updateCancellation } from '@apis/cancellationReason'

interface CancellationDataType {
  id: string
  reason: string
  userType: string
  tripStatus: string
  payStatus: string
  status: boolean
  language: string
  zoneId: string
  amount:number
}

interface AddCancellationDrawerProps {
  open: boolean
  handleClose: () => void
  cancellationData: any
  editData?: CancellationDataType | null
  dictionary?: any
  setData: (data: CancellationDataType[]) => void
  count: number
  page: number
  setTotalResults: React.Dispatch<React.SetStateAction<number>>
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number
  langId: string
  clientId: string
  zoneId: string,
}

interface FormValues {
  userType: string
  reason: string
  tripStatus: string
  payStatus: string
  status: boolean
  amount?: number
  language:string
}

const REASON_TYPES = [
  { id: '1', name: 'User' },
  { id: '2', name: 'Driver' },
  { id: '3', name: 'Both' }
]

const TRIP_STATUSES = [
  { id: '1', name: 'Before Arrive' },
  { id: '2', name: 'After Arrived' }
]

const PAY_STATUSES = [
  { id: 'Free', name: 'Free' },
  { id: 'Pay', name: 'Pay' }
]

const AddCancellationDrawer: React.FC<AddCancellationDrawerProps> = ({
  open,
  handleClose,
  cancellationData,
  editData,
  setData,
  dictionary,
  count,
  page,
  setTotalResults,
  onPageChange,
  rowsPerPage,
  langId,
  clientId,
  zoneId,
}) => {
  const [loading, setLoading] = useState(false)
  const [showAmount, setShowAmount] = useState(false)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      userType: 'User',
      reason: '',
      tripStatus: TRIP_STATUSES[0].name,
      payStatus: 'Free',
      amount: 0,
      status: true,
      language:''
    }
  })

  useEffect(() => {
      if (!open) {
        reset({
      userType: 'User',
      reason: '',
      tripStatus: TRIP_STATUSES[0].name,
      payStatus: 'Free',
      amount: 0,
      status: true,
      language:langId
    })
        setShowAmount(false)
      }
    }, [open, reset])

  useEffect(() => {
    if (editData) {
      setValue('userType', editData.userType)
      setValue('reason', editData.reason)
      setValue('tripStatus', editData.tripStatus)
      setValue('payStatus', editData.payStatus)
      setValue('amount', editData.amount ?? 0)
      setValue('language', editData.language)
      setShowAmount(editData.payStatus === 'Pay')
    }else {
      if (langId) {
        reset({
          userType: 'User',
          reason: '',
          tripStatus: '',
          payStatus:'Free',
          amount:0,
          language: langId
        })
      }
    }
  }, [editData, langId, setValue,reset])

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true)

    try {
      let response

      const NewData = {
        ...data,
        language:langId,
        zoneId,
        amount: data.payStatus === 'Pay' ? data.amount : 0
      }

      if (editData) {
        response = await updateCancellation(editData.id, NewData)
      } else {
        response = await createCancellation(NewData)
      }

      const newItem = {
        id: response.id,
        ...NewData,
        status: editData ? editData.status : true
      }

      // Update Local State
      const updatedCancellationData = editData
        ? cancellationData.map((item: CancellationDataType) => (item.id === newItem.id ? newItem : item))
        : [newItem, ...cancellationData]

      setData(updatedCancellationData)

      if (!editData) {
        // 1. Update Total Count
        setTotalResults((prev: number) => prev + 1)
      
        onPageChange({} as ChangeEvent<unknown>, 1)
      }

      toast.success(
        editData
          ? dictionary['navigation'].Cancellationupdatedsuccessfully
          : dictionary['navigation'].Cancellationcreatedsuccessfully
      )

      reset({
        payStatus:'Free'
      })
      handleClose()
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingcancellationPleasetryagain)
    } finally {
      setLoading(false)
    }
  }

  const isSubmitDisabled = loading

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={() => {
        handleClose()
        reset({
        payStatus:'Free'
      })
      }}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, padding: 2 } }}
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>
          {editData ? dictionary['navigation'].EditCancellation : dictionary['navigation'].AddCancellation}
        </Typography>
        <IconButton
          size='small'
          onClick={() => {
            handleClose()
            reset({
        payStatus:'Free'
      })
          }}
        >
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name='userType'
                control={control}
                rules={{ required: dictionary['navigation'].CancellationTypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].ReasonType}
                    error={!!errors.userType}
                    helperText={errors.userType?.message}
                  >
                    {REASON_TYPES.map(reason => (
                      <MenuItem key={reason.id} value={reason.name}>
                        {dictionary['navigation'][reason.name]}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='reason'
                control={control}
                rules={{ required: dictionary['navigation'].CancellationReasonisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].cancellationReasons}
                    placeholder={dictionary['navigation'].EnterCancellationReason}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='tripStatus'
                control={control}
                rules={{ required: dictionary['navigation'].TripStatusisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].TripStatus}
                    error={!!errors.tripStatus}
                    helperText={errors.tripStatus?.message}
                  >
                    {TRIP_STATUSES.map(status => (
                      <MenuItem key={status.id} value={status.name}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='payStatus'
                control={control}
                rules={{ required: dictionary['navigation'].PayStatusisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].PayStatus}
                    error={!!errors.payStatus}
                    helperText={errors.payStatus?.message}
                    onChange={e => {
                      field.onChange(e)
                      const value = e.target.value

                      setShowAmount(value === 'Pay') // Show amount only when Pay selected

                      if (value !== 'Pay') {
                        setValue('amount', undefined) // Clear amount if not Pay
                      }
                    }}
                  >
                    {PAY_STATUSES.map(status => (
                      <MenuItem key={status.id} value={status.id}>
                       {dictionary['navigation'][status.name]||status.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            {showAmount && (
              <Grid item xs={12}>
                <Controller
                  name='amount'
                  control={control}
                  rules={{
                    required: dictionary['navigation'].AmountisrequiredwhenpaystatusisPay,
                    pattern: {
                      value: /^[0-9]*$/,
                      message: dictionary['navigation'].AmountMustBeANumber
                    }
                  }}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label={dictionary['navigation'].Amount}
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>

          <div className='flex justify-end mt-4 gap-5'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled}
              endIcon={loading && <CircularProgress size={20} color='inherit' />}
            >
              {editData
                ? loading
                  ? dictionary['navigation'].Updating
                  : dictionary['navigation'].Update
                : loading
                  ? dictionary['navigation'].Creating
                  : dictionary['navigation'].Create}
            </Button>
            <Button
              onClick={() => {
                handleClose()
                reset({
        payStatus:'Free'
      })
              }}
              variant='outlined'
              color='error'
              style={{ marginLeft: '10px' }}
            >
              {dictionary['navigation'].Cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddCancellationDrawer