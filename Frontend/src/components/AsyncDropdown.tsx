import React, { useEffect, useState, useCallback } from 'react'

import { Autocomplete, Box } from '@mui/material'

import CustomTextField from '@core/components/mui/TextField'

interface Props {
  label: string
  apiFunction: (search: string, page: number, limit: number, ...extra: any[]) => Promise<any>
  getOptionLabel: (option: any) => string
  extraParams?: any[]
  multiple?: boolean
  value?: any
  onChange?: (value: any) => void
  error?: boolean
  helperText?: string
  limitTags?: number
  disabled?: boolean
}

const AsyncDropdown: React.FC<Props> = ({
  label,
  apiFunction,
  getOptionLabel,
  extraParams = [],
  multiple = false,
  value = multiple ? [] : null,
  onChange,
  error = false,
  helperText = '',
  limitTags = 2,
  disabled = false
}) => {
  const limit = 100
  const [options, setOptions] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const getId = useCallback((obj: any) => (typeof obj === 'string' ? obj : obj?._id || obj?.id), [])

  const loadData = useCallback(
    async (reset = false, searchStr = search) => {
      if (loading || (!reset && !hasMore)) return

      setLoading(true)

      try {
        const currentPage = reset ? 1 : page
        const res = await apiFunction(searchStr, currentPage, limit, ...extraParams)
        const results = res?.results || []

        setOptions(prev => (reset ? results : [...prev, ...results]))
        setPage(reset ? 2 : page + 1)
        setHasMore(results.length === limit)
      } catch (error) {
        console.error('API Error:', error)
      } finally {
        setLoading(false)
      }
    },
    [apiFunction, extraParams, hasMore, loading, page, search]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(true, search)
    }, 500)

    return () => clearTimeout(timer)
    
  }, [search])

  const handleScroll = (e: React.SyntheticEvent) => {
    const listboxNode = e.currentTarget

    if (listboxNode.scrollHeight - listboxNode.scrollTop <= listboxNode.clientHeight + 5) {
      loadData(false, search)
    }
  }

  const getOptionLabelSafe = (option: any) => {
    if (!option) return ''

    if (typeof option === 'string') {
      const found = options.find(opt => getId(opt) === option)


return found ? getOptionLabel(found) : option
    }


return getOptionLabel(option)
  }

  return (
    <Autocomplete
      multiple={multiple}
      disabled={disabled}
      disableClearable={!multiple}
      options={options}
      limitTags={limitTags}
      value={value}
      loading={loading}
      filterOptions={x => x}
      getOptionLabel={getOptionLabelSafe}
      isOptionEqualToValue={(opt, val) => getId(opt) === getId(val)}
      onChange={(_, val) => {
        onChange?.(val)
        setSearch('')
      }}
      onOpen={() => {
        if (options.length === 0) {
          loadData(true, '')
        }
      }}
      onInputChange={(_, val, reason) => {
        if (reason === 'input') setSearch(val)
        if (reason === 'clear') setSearch('')
      }}
      ListboxProps={{
        onScroll: handleScroll,
        sx: { maxHeight: 300 }
      }}
      slotProps={{
        paper: {
          sx: { minWidth: 300 }
        }
      }}
      renderOption={(props, option) => {
        const selected = multiple ? value?.some((v: any) => getId(v) === getId(option)) : getId(value) === getId(option)

        return (
          <Box
            component='li'
            {...props}
            key={getId(option)}
            sx={{
              fontWeight: selected ? 600 : 400,
              backgroundColor: selected ? 'action.selected' : 'inherit',
              cursor: 'pointer'
            }}
          >
            {getOptionLabel(option)}
          </Box>
        )
      }}
      renderInput={params => (
        <CustomTextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
          sx={{
            '& .MuiInputBase-root': {
              cursor: 'pointer'
            },
            '& .MuiAutocomplete-input': {
              cursor: 'pointer'
            },
            '& .MuiChip-root': {
              cursor: 'pointer'
            },
            '& input': {
              cursor: 'pointer'
            }
          }}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off',
            onClick: () => {
              if (!params.inputProps.value) {
                setSearch('')
                loadData(true, '')
              }
            }
          }}
        />
      )}
    />
  )
}

export default AsyncDropdown
