/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react'
import React, { useEffect, useState } from 'react'

import { IconButton, Divider, Button, Drawer, Typography, MenuItem, Grid } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'react-toastify'

import { getSession } from 'next-auth/react'

import CustomTextField from '@core/components/mui/TextField'
import { createComplaints, updateComplaints } from '@apis/complaints'
import { getDropDownList } from '@/app/api/apps/taxi/user'

import { validateTextOnly } from '@/utils/validation'

interface ComplaintsDataType {
  id?: string
  title: string
  type: string
  language: string
  status?: boolean
  zoneId: string
}

interface AddcomplaintsDrawerProps {
  open: boolean
  handleClose: () => void
  complaintsData: any[]
  dictionary?: any
  editData?: ComplaintsDataType | null
  setData: (data: any[]) => void
  count: number
  page: number
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number
  langId: string
  setTotalResults: any
  clientId: string
  zoneId: string
}

interface FormValues {
  title: string
  type: string
  language: string
}

const AddcomplaintsDrawer: React.FC<AddcomplaintsDrawerProps> = ({
  open,
  handleClose,
  complaintsData,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary,
  langId,
  setTotalResults,
  clientId,
  zoneId
}) => {
  const [loading, setLoading] = useState(false)
  const [languages, setLanguages] = useState<{ id: string; name: string }[]>([])
  const isSubmitDisabled = loading

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      title: '',
      type: '',
      language: ''
    }
  })

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await getDropDownList(clientId, zoneId)
        const filteredLang = (res.language as { id: string; name: string }[]).filter(lang => lang.id === langId)

        setLanguages(filteredLang)
      } catch (err) {
        toast.error(dictionary?.['navigation']?.dataFetchError || 'Error fetching languages')
      }
    }

    fetchLanguages()
  }, [clientId, zoneId, langId, dictionary])

  useEffect(() => {
    if (editData) {
      setValue('title', editData.title)
      setValue('type', editData.type)
      setValue('language', editData.language)
    } else {
      if (langId) {
        reset({
          title: '',
          type: '',
          language: langId
        })
      }
    }
  }, [editData, langId, setValue, reset])

  const handleFormSubmit = async (data: FormValues) => {
    setLoading(true)

    try {
      let response

      const NewData = {
        ...data,
        zoneId
      }

      if (editData) {
        response = await updateComplaints(editData.id, NewData)
      } else {
        response = await createComplaints(NewData)
      }

      const newItem = {
        id: response.id,
        title: data.title,
        type: data.type,
        language: data.language,
        status: editData ? editData.status : true
      }

      // Update Local State
      const updatedComplaintsData = editData
        ? complaintsData.map((item: ComplaintsDataType) => (item.id === newItem.id ? newItem : item))
        : [newItem, ...complaintsData]

      setData(updatedComplaintsData)

      if (!editData) {
        // 1. Update Total Count
        setTotalResults((prev: number) => prev + 1)
        
        // 2. Force Table to go to Page 1 to see the new item
        onPageChange({} as ChangeEvent<unknown>, 1)
      }

      toast.success(
        editData ? dictionary['navigation'].Complaintsupdatedsuccessfully : dictionary['navigation'].Complaintscreatedsuccessfully
      )
      reset()
      handleClose()
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingComplaintsPleasetryagain)
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
        <h2 className='text-lg font-semibold'>
          {editData ? dictionary['navigation'].EditComplaints : dictionary['navigation'].AddComplaints}
        </h2>
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
                name='title'
                control={control}
                rules={{ required: dictionary['navigation'].Titleisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].Title}
                    placeholder={dictionary['navigation'].Title}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='type'
                control={control}
                rules={{ required: dictionary['navigation'].Typeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].userType}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value='User'>{dictionary['navigation'].User}</MenuItem>
                    <MenuItem value='Driver'>{dictionary['navigation'].Driver}</MenuItem>
                    <MenuItem value='Both'>{dictionary['navigation'].Both}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='language'
                control={control}
                render={({ field }) => <input type='hidden' {...field} value={langId || ''} />}
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

export default AddcomplaintsDrawer