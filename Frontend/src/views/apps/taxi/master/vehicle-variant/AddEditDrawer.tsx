/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent } from 'react'
import React, { useEffect, useState, useRef } from 'react'

import { IconButton, Divider, Button, InputAdornment, Drawer, Typography, Grid, MenuItem } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField' // Adjust path as necessary
import { BASE_IMAGE_URL } from '@apis/endpoint'
import { createVehicleVariant, updateVehicleVariant } from '@apis/vehicleVariant'

import { validateTextOnly, validateImage } from '@/utils/validation'

interface AddVehicleVariantDrawerProps {
  open: boolean
  handleClose: () => void
  variantData: any
  dictionary: { [key: string]: { [key: string]: string } }
  editData?: any
  setData: any
  count: number
  page: number
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number
  vehicleModelId: string
}

interface FormValues {
  variantName: string
  description: string
  image: FileList | null
  vehicleModelId: string
}

const AddVehicleVariantDrawer: React.FC<AddVehicleVariantDrawerProps> = ({
  open,
  handleClose,
  variantData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dictionary,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  vehicleModelId
}) => {
  const [variantImagePreview, setVariantImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) // Loading state
  const isSubmitDisabled = loading
  const variantImageRef = useRef<HTMLInputElement | null>(null)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      variantName: '',
      description: '',
      image: null,
      vehicleModelId: ''
    }
  })

  useEffect(() => {
    if (editData) {
      setValue('variantName', editData.variantName || '')
      setValue('description', editData.description || '')
      setValue('vehicleModelId', editData.vehicleModelId || vehicleModelId)
      setVariantImagePreview(editData.image ? `${BASE_IMAGE_URL}${editData.image}` : null)
    } else {
      reset()
      setValue('vehicleModelId', vehicleModelId)

      if (variantImageRef.current) {
        variantImageRef.current.value = ''
      }

      setVariantImagePreview(null)
    }
  }, [editData, reset, setValue, vehicleModelId])

  // Helper function to handle page change logic
  const handlePageChangeForAddRecord = (
    count: number,
    rowsPerPage: number,
    onPageChange: (event: ChangeEvent<unknown>, page: number) => void
  ) => {
    // For new records, go to page 1 (0-indexed) since new items appear at the top
    const newPage = 0

    // Create a dummy event object
    const dummyEvent = {
      target: {
        value: newPage
      },
      currentTarget: {
        value: newPage
      },
      nativeEvent: {} as Event,
      bubbles: false
    } as unknown as ChangeEvent<unknown>

    // Trigger onPageChange with the new page
    onPageChange(dummyEvent, newPage)
  }

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true) // Start loading

    try {
      const formData = new FormData()

      formData.append('variantName', data.variantName)
      formData.append('description', data.description || '')
      formData.append('vehicleModelId', vehicleModelId)

      if (data.image?.[0]) {
        formData.append('image', data.image[0])
      }

      let response

      if (editData) {
        formData.append('status', editData.status)
        response = await updateVehicleVariant(editData._id, formData)
      } else {
        formData.append('status', 'true')
        response = await createVehicleVariant(formData)
      }

      if (response) {
        const newItem = {
          id: response.id,
          variantName: response.variantName,
          description: response.description,
          image: response.image,
          vehicleModelId: response.vehicleModelId,
          status: response.status
        }

        // Instead of manually updating state, refresh data from server
        // For create: go to page 1 (0-indexed) to see the new item
        // For update: refresh current page to see the updated item
        if (editData) {
          // For update: refresh current page
          const dummyEvent = {
            target: { value: page },
            currentTarget: { value: page },
            nativeEvent: {} as Event,
            bubbles: false
          } as unknown as ChangeEvent<unknown>

          onPageChange(dummyEvent, page)
        } else {
          // For create: go to page 1 (0-indexed)
          handlePageChangeForAddRecord(count, rowsPerPage, onPageChange)
        }

        toast.success(editData ? 'Vehicle Variant updated successfully' : 'Vehicle Variant created successfully')

        reset()

        if (variantImageRef.current) {
          variantImageRef.current.value = ''
        }

        handleClose()
      } else {
        throw new Error('API response error')
      }
    } catch (error) {
      toast.error('Error saving vehicle variant. Please try again.')
    } finally {
      setLoading(false) // Stop loading
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={() => {
        handleClose()
        reset()
      }}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, padding: 2 } }}
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>
          {editData ? dictionary['navigation'].EditVariant || 'Edit Variant' : dictionary['navigation'].AddVariant || 'Add Variant'}
        </Typography>
        <IconButton
          size='small'
          onClick={() => {
            handleClose()
            reset()
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
                name='variantName'
                control={control}
                rules={{
                  required: dictionary['navigation'].VariantNameisrequired || 'Variant Name is required'

                  // validate: value => validateTextOnly(value, dictionary)
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].VariantName || 'Variant Name'}
                    placeholder={dictionary['navigation'].EnterVariantName || 'Enter Variant Name'}
                    error={!!errors.variantName}
                    helperText={errors.variantName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'none' }}>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              {variantImagePreview && (
                <img
                  src={variantImagePreview}
                  alt={dictionary['navigation'].VariantImage || 'Variant Image'}
                  style={{ width: '100px', height: 'auto', borderRadius: '4px', marginTop: '10px' }}
                />
              )}

              <Controller
                name='image'
                control={control}
                rules={{
                  required: !editData ? dictionary['navigation'].Imageisrequired || 'Image is required' : false,

                  validate: value => {
                    if (!editData || (value && value.length > 0)) {
                      return validateImage(value, dictionary)
                    }

                    return true
                  }
                }}
                render={({ field: { onChange } }) => (
                  <CustomTextField
                    type='file'
                    fullWidth
                    label={dictionary['navigation'].Image}
                    margin='normal'
                    inputProps={{ accept: 'image/*' }} // <-- here is the fix
                    onChange={e => {
                      const input = e.target as HTMLInputElement

                      onChange(input.files)

                      if (input.files && input.files[0]) {
                        setVariantImagePreview(URL.createObjectURL(input.files[0]))
                      }
                    }}
                    inputRef={variantImageRef}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <IconButton>
                            <i className='tabler-image' />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    error={!!errors.image}
                    helperText={errors.image?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
          <div className='flex justify-end mt-4 gap-5'>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color='inherit' />} // Show loading spinner
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
                reset()

                if (variantImageRef.current) {
                  variantImageRef.current.value = ''
                }

                setVariantImagePreview(null)
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

export default AddVehicleVariantDrawer
