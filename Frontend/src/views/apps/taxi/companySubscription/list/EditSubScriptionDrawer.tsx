/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'
import CircularProgress from '@mui/material/CircularProgress'

import Drawer from '@mui/material/Drawer'

import { validateTextOnly, validateNumber } from '@/utils/validation'

import CustomTextField from '@core/components/mui/TextField'
import { updateCompanySubScription } from '@/app/api/apps/taxi/companySubscription'

type SubScriptionType = {
  id: string;
  name: string;
  validityPeriod: string;
  description: string;
  noOfDrivers: string;
  noOfUsers: string;
  status?: boolean;
  unit?: string;
  amount?: string;
}

type Props = {
  open: boolean;
  handleClose: () => void;
  subScriptionData: SubScriptionType[];
  dictionary: any;
  setData: (data: SubScriptionType[]) => void;
  initialData?: FormValues; // Optional initial data for editing
}

type FormValues = {
  id: string;
  name: string;
  validityPeriod: string;
  description: string;
  noOfDrivers: string;
  noOfUsers: string;
  unit?: string;
  amount?: string;
}

const EditSubScriptionDrawer = (props: Props) => {
  const { open, handleClose, subScriptionData, setData, initialData, dictionary } = props
  const [validityUnit, setValidityUnit] = useState('MONTH')
  const [loading, setLoading] = useState(false)

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: initialData || {
      id: '',
      name: '',
      description: '',
      noOfDrivers: '',
      validityPeriod: '',
      noOfUsers: '',
      amount: '',
    }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      
      // If initialData has a unit property, use that; otherwise use the validityPeriod
      
      setValidityUnit(initialData.unit || initialData.validityPeriod)
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true)

    try {
      if (initialData) {
        const newUpdateData: any = {
          name: data.name,
          noOfDrivers: data.noOfDrivers,
          noOfUsers: data.noOfUsers,
          description: data.description,
          validityPeriod: data.validityPeriod,
          unit: validityUnit,
          amount: data.amount
        }

        const updateSubScriptionData = await updateCompanySubScription(data.id, newUpdateData)

        const updatedData: SubScriptionType[] = subScriptionData.map(item =>
          item.id === updateSubScriptionData.id
            ? {
              ...item,
              name: updateSubScriptionData.name,
              noOfDrivers: updateSubScriptionData.noOfDrivers,
              noOfUsers: updateSubScriptionData.noOfUsers,
              description: updateSubScriptionData.description,
              validityPeriod: updateSubScriptionData.validityPeriod,
              unit: validityUnit,
              amount: updateSubScriptionData.amount
            }
            : item
        )

        setData(updatedData)
        toast.success('Subscription updated successfully')
      } else {
        toast.error('Initial data is missing. Unable to update subscription.')
      }

      handleReset()
    } catch (error) {
      toast.error('Error updating subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    handleClose()
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
        <Typography variant='h5'>Edit Package</Typography>
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
            rules={{ required: 'Package Name is required.', validate: value => validateTextOnly(value, dictionary) }}
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
            rules={{ required: dictionary['navigation'].validityPeriod, validate: value => validateNumber(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].validityPeriod}
                placeholder={dictionary['navigation'].validityPeriod}
                error={!!errors.validityPeriod}
                helperText={errors.validityPeriod ? errors.validityPeriod.message : ''}
              />
            )}
          />

          <CustomTextField
            select
            fullWidth
            label={dictionary['navigation'].unit}
            value={validityUnit}
            onChange={(e) => setValidityUnit(e.target.value)}
            required
          >
            <MenuItem value="DAY">{dictionary['navigation'].Day}</MenuItem>
            <MenuItem value="WEEK">{dictionary['navigation'].Week}</MenuItem>
            <MenuItem value="MONTH">{dictionary['navigation'].Month}</MenuItem>
            <MenuItem value="YEAR">{dictionary['navigation'].Year}</MenuItem>
          </CustomTextField>

          <Controller
            name='noOfDrivers'
            control={control}
            rules={{ required: 'No Of Drivers is required.', validate: value => validateNumber(value, dictionary) }}
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
            rules={{ required: 'Number of Users is required.', validate: value => validateNumber(value, dictionary) }}
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
            name='amount'
            control={control}
            rules={{ required: dictionary['navigation'].Enteramount, validate: value => validateNumber(value, dictionary) }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].amount}
                placeholder={dictionary['navigation'].Enteramount}
                error={!!errors.amount}
                helperText={errors.amount ? errors.amount.message : ''}
              />
            )}
          />

          <Controller
            name='description'
            control={control}
            rules={{ required: 'Description is required.' }}
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
              disabled={loading}
              endIcon={loading && <CircularProgress size={20} color='inherit' />}
            >
              {loading ? 'Updating...' : 'Update'}
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

export default EditSubScriptionDrawer