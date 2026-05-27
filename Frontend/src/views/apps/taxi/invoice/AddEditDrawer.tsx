/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react'
import React, { useEffect, useState } from 'react'

import { IconButton, Divider, Button, Drawer, Typography, Grid, MenuItem } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

import { useForm, Controller } from 'react-hook-form'

import { toast } from 'react-toastify'

import CustomTextField from '@core/components/mui/TextField'

import { createInvoice, updateInvoice } from '@apis/invoice'

import { validateTextOnly } from '@/utils/validation'
import { getDropDownList } from '@/app/api/apps/taxi/user'

interface InvoiceDataType {
  id?: string
  question: string
  role: string
  language: string
  status?: boolean
  zoneId: string
}

interface AddinvoiceDrawerProps {
  open: boolean
  handleClose: () => void
  invoiceData: any[]
  dictionary?: any
  editData?: InvoiceDataType | null
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
  question: string
  role: string
  language: string
}

const AddinvoiceDrawer: React.FC<AddinvoiceDrawerProps> = ({
  open,
  handleClose,
  invoiceData,
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
  zoneId,
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
      question: '',
      role: '',
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
      setValue('question', editData.question)
      setValue('role', editData.role)
      setValue('language', editData.language)
    } else {
      if (langId) {
        reset({
          question: '',
          role: '',
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
        response = await updateInvoice(editData.id, NewData)
      } else {
        response = await createInvoice(NewData)
      }

      const newItem = {
        id: response.id,
        question: data.question,
        role: data.role,
        language: data.language,
        status: editData ? editData.status : true
      }

      // Update Local State
      const updatedInvoiceData = editData
        ? invoiceData.map((item: InvoiceDataType) => (item.id === newItem.id ? newItem : item))
        : [newItem, ...invoiceData]

      setData(updatedInvoiceData)

      if (!editData) {
        // 1. Update Total Count
        setTotalResults((prev: number) => prev + 1)
        
        // 2. Force Table to go to Page 1 to see the new item
        // We pass '1' because handlePageChange in Table expects 1-based page numbers
        onPageChange({} as ChangeEvent<unknown>, 1)
      }

      toast.success(
        editData ? dictionary['navigation'].Invoiceupdatedsuccessfully : dictionary['navigation'].Invoicecreatedsuccessfully
      )
      reset()
      handleClose()
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorsavingInvoicePleasetryagain)
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
          {editData ? dictionary['navigation'].EditInvoiceQuestion : dictionary['navigation'].AddInvoiceQuestion}
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
                name='question'
                control={control}
                rules={{ required: dictionary['navigation'].Invoiceisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].InvoiceQuestion}
                    placeholder={dictionary['navigation'].EnterInvoiceQuestion}
                    error={!!errors.question}
                    helperText={errors.question?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='role'
                control={control}
                rules={{ required: dictionary['navigation'].Roleisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    fullWidth
                    label={dictionary['navigation'].Role}
                    error={!!errors.role}
                    helperText={errors.role?.message}
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

export default AddinvoiceDrawer