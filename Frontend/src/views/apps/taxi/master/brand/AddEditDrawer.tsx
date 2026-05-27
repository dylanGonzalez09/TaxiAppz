/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import type { ChangeEvent } from 'react'
import React, { useEffect, useState, useRef } from 'react'

import { IconButton, Divider, Button, InputAdornment, Drawer, Typography, Grid, MenuItem } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'
import { BASE_IMAGE_URL } from '@apis/endpoint'
import { createBrand, updateBrand } from '@apis/brand'
import { fetchVehicle } from '@apis/vehicle'

import { validateTextOnly, validateImage } from '@/utils/validation'

interface AddBrandDrawerProps {
  open: boolean
  handleClose: () => void
  brandData: any
  dictionary: { [key: string]: { [key: string]: string } }
  editData?: any
  setData: any
  count: number
  page: number
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number
  vehicleId: string
}

interface FormValues {
  brandName: string
  image: FileList | null
  vehicleId: string
  description?: string
}

const AddBrandDrawer: React.FC<AddBrandDrawerProps> = ({
  open,
  handleClose,
  brandData,
  dictionary,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  vehicleId
}) => {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [brandImagePreview, setBrandImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isSubmitDisabled = loading
  const brandImageRef = useRef<HTMLInputElement | null>(null)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      brandName: '',
      image: null,
      vehicleId: '',
      description: ''
    }
  })

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetchVehicle()

        setVehicles(response)
      } catch (error) {
        toast.error('Failed to load vehicles')
      }

      if (editData) {
        setValue('brandName', editData.brandName || '')
        setValue('vehicleId', editData.vehicleid || '')
        setValue('description', editData.description || '')
        setBrandImagePreview(editData.image ? `${BASE_IMAGE_URL}/uploads/brands/${editData.image}` : null)
      } else {
        reset()

        if (brandImageRef.current) {
          brandImageRef.current.value = ''
        }

        setBrandImagePreview(null)
      }
    }

    if (open) {
      fetchVehicles()
    }

    if (!editData && open) {
      reset()

      if (brandImageRef.current) {
        brandImageRef.current.value = ''
      }

      setBrandImagePreview(null)
    }
  }, [editData, reset, setValue, open])

  useEffect(() => {
    if (vehicles.length > 0 && vehicleId) {
      const selectedVehicle = vehicles.find(vehicle => vehicle.id === vehicleId)

      if (selectedVehicle) {
        setValue('vehicleId', selectedVehicle.id)
      }
    }
  }, [vehicles, vehicleId, setValue])

  const handlePageChangeForAddRecord = (
    count: number,
    rowsPerPage: number,
    onPageChange: (event: ChangeEvent<unknown>, page: number) => void
  ) => {
    const newPage = 0

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

    onPageChange(dummyEvent, newPage)
  }

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true)

    try {
      const formData = new FormData()

      formData.append('brandName', data.brandName)
      formData.append('vehicleId', vehicleId)

      if (data.description) {
        formData.append('description', data.description)
      }

      if (data.image?.[0]) {
        formData.append('image', data.image[0])
      }

      let response

      if (editData) {
        formData.append('status', editData.status)
        response = await updateBrand(editData._id || editData.id, formData)
      } else {
        formData.append('status', 'true')
        response = await createBrand(formData)
      }

      if (response) {
        const newItem = {
          id: response.id,
          brandName: response.brandName,
          image: response.image,
          vehicleId: response.vehicleId,
          status: response.status
        }

        if (editData) {
          const dummyEvent = {
            target: { value: page },
            currentTarget: { value: page },
            nativeEvent: {} as Event,
            bubbles: false
          } as unknown as ChangeEvent<unknown>

          onPageChange(dummyEvent, page)
        } else {
          handlePageChangeForAddRecord(count, rowsPerPage, onPageChange)
        }

        toast.success(editData ? 'Brand updated successfully' : 'Brand created successfully')

        reset()

        if (brandImageRef.current) {
          brandImageRef.current.value = ''
        }

        handleClose()
      } else {
        throw new Error('API response error')
      }
    } catch (error) {
      toast.error('Error saving brand. Please try again.')
    } finally {
      setLoading(false)
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
          {editData ? dictionary['navigation'].EditBrand || 'Edit Brand' : dictionary['navigation'].AddBrand || 'Add Brand'}
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
                name='brandName'
                control={control}
                rules={{
                  required: dictionary['navigation'].BrandNameisrequired || 'Brand name is required'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].BrandName || 'Brand Name'}
                    placeholder={dictionary['navigation'].EnterBrandName || 'Enter Brand Name'}
                    error={!!errors.brandName}
                    helperText={errors.brandName?.message}
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
              {brandImagePreview && (
                <img
                  src={brandImagePreview}
                  alt={dictionary['navigation'].BrandImage || 'Brand Image'}
                  style={{ width: '100px', height: 'auto', borderRadius: '4px', marginTop: '10px' }}
                />
              )}

              <Controller
                name='image'
                control={control}
                rules={{
                  required: !editData ? dictionary['navigation'].Imageisrequired : false,
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
                    inputProps={{ accept: 'image/*' }}
                    onChange={e => {
                      const input = e.target as HTMLInputElement

                      onChange(input.files)

                      if (input.files && input.files[0]) {
                        setBrandImagePreview(URL.createObjectURL(input.files[0]))
                      }
                    }}
                    inputRef={brandImageRef}
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
                reset()

                if (brandImageRef.current) {
                  brandImageRef.current.value = ''
                }

                setBrandImagePreview(null)
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

export default AddBrandDrawer
