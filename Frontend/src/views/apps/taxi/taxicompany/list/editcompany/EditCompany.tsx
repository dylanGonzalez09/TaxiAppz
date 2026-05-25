/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState, useEffect } from 'react'

import { DialogActions, Button, Grid, CircularProgress, Card } from '@mui/material'
import { toast } from 'react-toastify'
import { useForm, Controller } from 'react-hook-form'
import Typography from '@mui/material/Typography'

import CustomTextField from '@core/components/mui/TextField'
import { updateCompany } from '@apis/company'
import { fetchRoles } from '@apis/role'
import { fetchActiveCountry } from '@apis/country'
import { validateEmail, validatePhoneNumber } from '@/utils/validation'

// Type Definitions
type EditUserInfoData = {
  companyName?: string
  companyEmail?: string
  companyPhoneNumber?: string
  contactPersonName?: string
  contactPersonEmail?: string
  contactPersonPhoneNumber?: string
  role?: number | string
  country?: number | string

  // commission?: string
  // noOfVehicle?: string
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
  role?: number | string
  country?: number | string

  // commission?: string
  // noOfVehicle?: string
  active?: boolean
  status?: boolean
}

// Props for EditCompany
interface EditCompanyProps {
  companyData: CompanyType,
  lang: string,
  dictionary: any
}

const EditCompany = ({ companyData, lang ,dictionary}: EditCompanyProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<EditUserInfoData>({
    mode: 'all', // Validate on change and on blur
    defaultValues: {
      companyName: companyData.companyName || '', // Handling undefined here
      companyEmail: companyData.companyEmail || '',
      companyPhoneNumber: companyData.companyPhoneNumber || '',
      contactPersonName: companyData.contactPersonName || '',
      contactPersonEmail: companyData.contactPersonEmail || '',
      contactPersonPhoneNumber: companyData.contactPersonPhoneNumber || '',

      // commission: companyData.commission || '',
      // noOfVehicle: companyData.noOfVehicle || '',
      active: companyData.active !== undefined ? companyData.active : true,
      status: companyData.status !== undefined ? companyData.status : true
    }
  })

  const [roles, setRoles] = useState<{ id: number; role: string }[]>([])
  const [countries, setCountries] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false) // Loading state

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const roleData = await fetchRoles()
        const countryData = await fetchActiveCountry()

        setRoles(roleData)
        setCountries(countryData)
      } catch (error) {
        console.error('Error fetching options:', error)
      }
    }

    fetchOptions()
  }, [])

  const onSubmit = async (formData: EditUserInfoData) => {
    setLoading(true)

    try {
      // Ensure all values are strings (fallback to empty string if undefined)
      const updatedData = {
        ...formData,
        companyName: formData.companyName || '',
        companyEmail: formData.companyEmail || '',
        companyPhoneNumber: formData.companyPhoneNumber || '',
        contactPersonName: formData.contactPersonName || '',
        contactPersonEmail: formData.contactPersonEmail || '',
        contactPersonPhoneNumber: formData.contactPersonPhoneNumber || '',

        // commission: formData.commission || '',
        // noOfVehicle: formData.noOfVehicle || '',
        active: formData.active !== undefined ? formData.active : true,
        status: formData.status !== undefined ? formData.status : true
      }

      await updateCompany(companyData.id || '', updatedData)

      toast.success(dictionary['navigation'].TaxiCompanyupdatedsuccessfully)
    } catch (error) {
      toast.error(dictionary['navigation'].Anerroroccurredwhileprocessingtherequest)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='p-8'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex-center' style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
          <Typography variant='h4' align='center'>
           {dictionary['navigation'].EditTaxiCompany}
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
              rules={{ required: dictionary['navigation'].CompanyNameisrequired }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].CompanyName}
                  placeholder='Enter company name'
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
              rules={{ required: dictionary['navigation'].CompanyEmailisrequired, validate: value => validateEmail(value, dictionary) }}
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
              rules={{ required: dictionary['navigation'].CompanyPhoneNumberisrequired,validate: value => validatePhoneNumber(value, dictionary) }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].CompanyPhoneNumber}
                  placeholder='Enter phone number'
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
              rules={{ required: dictionary['navigation'].ContactPersonNameisrequired }}
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
              rules={{ required: dictionary['navigation'].ContactPersonEmailisrequired, validate: value => validateEmail(value, dictionary) }}
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
              rules={{ required: dictionary['navigation'].ContactPersonPhoneNumberisrequired,validate: value => validatePhoneNumber(value, dictionary) }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].ContactPersonPhoneNumber}
                  placeholder={dictionary['navigation'].Enterphonenumber}
                  error={!!errors.contactPersonPhoneNumber}
                  helperText={errors.contactPersonPhoneNumber?.message}
                />
              )}
            />
          </Grid>

        </Grid>
        {/* Action buttons */}
        <DialogActions className='gap-4 px-6 pb-4'>
          <Button type='submit' color='primary' variant='contained' disabled={loading} sx={{ position: 'relative' }}>
            {loading ? (
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
            ) : (
              dictionary['navigation'].UpdateCompany
            )}
          </Button>
        </DialogActions>
      </form>
    </Card>
  )
}

export default EditCompany
