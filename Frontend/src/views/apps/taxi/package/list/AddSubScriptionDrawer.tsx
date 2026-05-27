/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent} from 'react';
import React, { useState } from 'react'

import { useForm, Controller } from 'react-hook-form'
import { Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Checkbox, FormHelperText } from '@mui/material'


import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { toast } from 'react-toastify' // Import toast

import CircularProgress from '@mui/material/CircularProgress'

import Drawer from '@mui/material/Drawer'

import { useIsDemoUser } from '@/utils/demoUser' 


import CustomTextField from '@core/components/mui/TextField'

import { validateTextOnly, validateNumber } from '@/utils/validation'

import { createPackages } from '@/app/api/apps/taxi/package'

type SubScriptionType = {
  name: string
  validityPeriod: string
  description: string
  noOfDrivers: string
  noOfUsers: string
  type: string
  assignDriverManually: boolean
}

type Props = {
  open: boolean
  handleClose: () => void
  subScriptionData: SubScriptionType[]
  dictionary: any
  setData: (data: SubScriptionType[]) => void
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
}

type FormValues = {
  name: string
  validityPeriod: string
  description: string
  noOfDrivers: string
  noOfUsers: string
  type: string
  assignDriverManually: boolean
}

const AddSubScriptionDrawer = (props: Props) => {
  const { open, handleClose, subScriptionData, setData, dictionary, count,
    page,
    onPageChange,
    rowsPerPage } = props

  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false) // Loading state
  const { checkDemoStatus } = useIsDemoUser();
  
  const isSubmitDisabled = checkDemoStatus() || loading;

  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      name: '',
      validityPeriod: '',
      description: '',
      noOfDrivers: '',
      noOfUsers: '',
      type: '',
      assignDriverManually: false
    }
  })

  const typeSelected = watch('type')

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true) // Start loading

    try {
      const newData: SubScriptionType = {
        name: data.name,
        noOfDrivers: data.noOfDrivers,
        noOfUsers: data.noOfUsers,
        type: data.type,
        assignDriverManually: data.assignDriverManually,
        description: data.description,
        validityPeriod: data.validityPeriod
      }


      const createData = await createPackages(newData)

      setData([createData,...subScriptionData])
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      // if (rowsPerPage != subScriptionData.length) {
      //   setData([...subScriptionData, createData])
      // } else {
      //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
      // }

      toast.success(dictionary['navigation'].Subscriptioncreatedsuccessfully)

      handleReset()
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorcreatingsubscriptionPleasetryagain)
    } finally {
      setLoading(false) // Start loading
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
    onPageChange(dummyEvent,  1);
  };


  const handleReset = () => {
    handleClose()
    reset({
      name: '',
      validityPeriod: '',
      description: '',
      noOfDrivers: '',
      noOfUsers: '',
      type: '',
      assignDriverManually: false
    })
    setCategory('')
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pl-6 pt-5 pb-3'>
        <Typography variant='h5'>{dictionary['navigation'].NewPackage}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />

      <div className='p-6'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            rules={{ required: dictionary['navigation'].Nameisrequired, validate: value => validateTextOnly(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].packageName}
                placeholder={dictionary['navigation'].enterPackageName}
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
              />
            )}
          />

          <Controller
            name='validityPeriod'
            control={control}
            rules={{ required: dictionary['navigation'].ContractPeriodisrequired}}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label={dictionary['navigation'].contractPeriod}
                {...field} // Spread the field props from react-hook-form
                error={!!errors.validityPeriod}
                helperText={errors.validityPeriod ? errors.validityPeriod.message : ''}
              >
                <MenuItem value='1'>1 {dictionary['navigation'].Month}</MenuItem>
                <MenuItem value='6'>6 {dictionary['navigation'].Months}</MenuItem>
                <MenuItem value='12'>1 {dictionary['navigation'].Year}</MenuItem>
                <MenuItem value='18'>1.5 {dictionary['navigation'].Years}</MenuItem>
                <MenuItem value='24'>2 {dictionary['navigation'].Years}</MenuItem>
              </CustomTextField>
            )}
          />

          <Controller
            name='noOfDrivers'
            control={control}
            rules={{ required: dictionary['navigation'].NumberofDriversisrequired, validate: value => validateNumber(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].onOfDrivers}
                placeholder={dictionary['navigation'].enteronOfDrivers}
                error={!!errors.noOfDrivers}
                helperText={errors.noOfDrivers ? errors.noOfDrivers.message : ''}
              />
            )}
          />

          <Controller
            name='noOfUsers'
            control={control}
            rules={{ required: dictionary['navigation'].NumberofUsersisrequired, validate: value => validateNumber(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].noOfUsers}
                placeholder={dictionary['navigation'].enterNoOfUsers}
                error={!!errors.noOfUsers}
                helperText={errors.noOfUsers ? errors.noOfUsers.message : ''}
              />
            )}
          />


          <Controller
            name='assignDriverManually'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value || false}
                    onChange={e => field.onChange(e.target.checked)}
                    color='primary'
                  />
                }
                label={dictionary['navigation'].asignDriverManually} // You can update this label as needed
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            rules={{ required: dictionary['navigation'].Descriptionisrequired}}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                label={dictionary['navigation'].description}
                placeholder={dictionary['navigation'].enterdescription}
                error={!!errors.description}
                helperText={errors.description ? errors.description.message : ''}
              />
            )}
          />

          <div className='flex items-center gap-4'>
            <Button
              variant='contained'
              color='primary'
              type='submit'
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color='inherit' />} // Show loading spinner
            >
              {loading ? dictionary['navigation'].Submitting : dictionary['navigation'].Submit}
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary['navigation'].discard}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddSubScriptionDrawer
