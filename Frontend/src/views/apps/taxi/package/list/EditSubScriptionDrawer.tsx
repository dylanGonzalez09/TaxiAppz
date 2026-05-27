/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'

import { Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Checkbox, FormHelperText } from '@mui/material'

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
import { updatePackage } from '@/app/api/apps/taxi/package'

type subScriptionType = {
  id: string
  packageName: string
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
  subScriptionData: subScriptionType[]
  dictionary: any
  setData: (data: subScriptionType[]) => void
  initialData?: FormValues // Optional initial data for editing
}

type FormValues = {
  id: string
  name: string
  validityPeriod: string
  description: string
  noOfDrivers: string
  noOfUsers: string
  type: string
  assignDriverManually: boolean
}

const EditSubScriptionDrawer = (props: Props) => {
  const { open, handleClose, subScriptionData, setData, initialData, dictionary } = props
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false) // Loading state

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: initialData || {
      name: '',
      description: '',
      noOfDrivers: '',
      validityPeriod: '',
      noOfUsers: '',
      type: '',
      assignDriverManually: false
    }
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
      setCategory(initialData.validityPeriod)
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true) // Start loading



    try {
      if (initialData) {
        const updatedSubScriptionInfo = removeId(data)

        const newUpdateData: any = {
          name: data.name,
          noOfDrivers: data.noOfDrivers,
          noOfUsers: data.noOfUsers,
          type: data.type,
          assignDriverManually: data.assignDriverManually,
          description: data.description,
          validityPeriod: category
        }

        const updateSubScriptionData = await updatePackage(data.id, newUpdateData)

        const updatedData: subScriptionType[] = subScriptionData.map(item =>
          item.id === updateSubScriptionData.id
            ? {
              ...item,
              name: updateSubScriptionData.name,
              onOfDrivers: updateSubScriptionData.onOfDrivers,
              noOfUsers: updateSubScriptionData.noOfUsers,
              type: updateSubScriptionData.type,
              assignDriverManually: updateSubScriptionData.assignDriverManually,
              description: updateSubScriptionData.description,
              validityPeriod: category
            }
            : item
        )

        setData(updatedData)

        toast.success(dictionary['navigation'].SubScriptionupdatedsuccessfully)
      } else {
        toast.error(dictionary['navigation'].InitialdataismissingUnabletoupdateSubScription)
      }

      handleReset()
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorupdatingSubScriptionPleasetryagain)
    } finally {
      setLoading(false) // Start loading
    }
  }

  const removeId = (obj: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = obj

    return rest
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
            rules={{ required: dictionary['navigation'].PackageNameisrequired, validate: value => validateTextOnly(value, dictionary)}}
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
            rules={{ required: dictionary['navigation'].validityPeriodisrequired}}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label={dictionary['navigation'].contractPeriod}
                value={category}
                onChange={e => setCategory(e.target.value)}
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
            rules={{ required: dictionary['navigation'].NoOfDriversisrequired, validate: value => validateNumber(value, dictionary) }}
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
            rules={{ required: dictionary['navigation'].Descriptionisrequired }}
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
              disabled={loading} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color='inherit' />} // Show loading spinner
            >
              {loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update}
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
