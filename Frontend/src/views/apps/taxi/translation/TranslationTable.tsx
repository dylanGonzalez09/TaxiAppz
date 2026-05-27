/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import type { TextFieldProps } from '@mui/material/TextField'

import classnames from 'classnames'

import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import ExportOptions from '@/utils/ExportOptions'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import { createTranslation, deleteByKey, translateText } from '@apis/translation'

declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type VersionWithActionsType = any & {
  actions?: string
}

function toText(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)

  if (typeof val === 'object') {
    try {
      const keys = Object.keys(val as object)


return keys.length ? JSON.stringify(val) : fallback
    } catch {
      return fallback
    }
  }


return fallback
}

function normalizeCodes(input: any): string[] {
  if (!Array.isArray(input)) return []

return input.map((x: any) => (typeof x === 'string' ? x : x?.code ?? '')).filter(Boolean)
}

function normalizeRows(rows: any[]): Array<Record<string, string>> {
  if (!Array.isArray(rows)) return []

return rows.map(row => {
    const out: Record<string, string> = {}

    if (!row || typeof row !== 'object') return out
    for (const k of Object.keys(row)) out[k] = toText((row as any)[k], '')

return out
  })
}

const notifyTranslationUpdated = () => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('translationUpdatedAt', String(Date.now()))
  window.dispatchEvent(new Event('translationUpdated'))
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const TranslationTable = ({
  translationData,
  currentTab,
  activeLanguage,
  allLanguageCodes = [],
  dictionary
}: {
  translationData: any[]
  currentTab: any
  dictionary: any
  activeLanguage: any
  allLanguageCodes?: string[]
}) => {
  const normalizedInitialData = useMemo(() => normalizeRows(translationData), [translationData])

  const [addVersionOpen, setAddVersionOpen] = useState(false)
  const [newTranslation, setNewTranslation] = useState({ code: '', key: '', value: '', data: '' })
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<Array<Record<string, string>>>(normalizedInitialData)

  useEffect(() => {
    setData(normalizedInitialData)
  }, [normalizedInitialData])
  const [globalFilter, setGlobalFilter] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editCell, setEditCell] = useState<{ rowIndex: number; columnId: string } | null>(null)
  const [editedColumn, setEditedColumn] = useState('')
  const [editedRow, setEditedRow] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editedTab, setEditedTab] = useState('')

  const activeCodes = useMemo(() => {
    return normalizeCodes(activeLanguage)
  }, [activeLanguage])

  const languageCodes = useMemo(() => {
    const all = normalizeCodes(allLanguageCodes)


return all.length > 0 ? all : activeCodes
  }, [allLanguageCodes, activeCodes])

  const [sourceLanguage, setSourceLanguage] = useState<string>(() =>
    languageCodes.length > 0 ? languageCodes[0] : 'en'
  )

  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    if (languageCodes.length > 0 && !languageCodes.includes(sourceLanguage)) {
      setSourceLanguage(languageCodes[0])
    }
  }, [languageCodes, sourceLanguage])

  const handleSaveEdit = async () => {
    if (!editCell) return
    const prefix = currentTab === 'mobile' ? 'mob_' : ''
    const editedLang = editedColumn.replace(/^mob_|^web_/, '')
    const codes = languageCodes.length > 0 ? languageCodes : [editedLang]
    const valueToUpdate = editValue?.trim() ?? ''

    setEditLoading(true)

    try {
      const valuesByLang: Record<string, string> = {}

      for (const code of codes) {
        const res = await translateText(valueToUpdate, code, editedLang)

        valuesByLang[code] = res?.translatedText ?? valueToUpdate
      }

      await createTranslation({
        data: 'update',
        translations: codes.map((code: string) => ({
          code: `${prefix}${code}`,
          key: editedRow,
          value: valuesByLang[code] ?? valueToUpdate
        }))
      })
      notifyTranslationUpdated()
      const updatedData = [...data]
      const row = { ...updatedData[editCell.rowIndex], key: editedRow, ...valuesByLang }

      updatedData[editCell.rowIndex] = row
      setData(updatedData)
      setEditCell(null)
      setEditDialogOpen(false)
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddTranslation = async () => {
    if (!newTranslation.key?.trim()) return
    const valueToUse = newTranslation.value?.trim() ?? ''
    const prefix = currentTab === 'mobile' ? 'mob_' : ''
    const codes = languageCodes

    if (codes.length === 0) return

    setAddLoading(true)

    try {
      const valuesByLang: Record<string, string> = {}

      for (const code of codes) {
        const res = await translateText(valueToUse, code, sourceLanguage)

        valuesByLang[code] = res?.translatedText ?? valueToUse
      }

      await createTranslation({
        data: 'add',
        translations: codes.map((code: string) => ({
          code: `${prefix}${code}`,
          key: newTranslation.key.trim(),
          value: valuesByLang[code] ?? valueToUse
        }))
      })
      notifyTranslationUpdated()

      const newRow: Record<string, string> = { key: newTranslation.key.trim() }

      codes.forEach((code: string) => {
        newRow[code] = valuesByLang[code] ?? valueToUse
      })
      setData([...data, newRow])
      setAddVersionOpen(false)
      setNewTranslation({ code: '', key: '', value: '', data: '' })
    } finally {
      setAddLoading(false)
    }
  }

  // function convertTranslation(translation: any, languages: string[]): Record<string, string> {
  //   const result: Record<string, string> = { key: translation.key }

  //   languages.forEach(lang => {
  //     result[lang] = lang === translation.code ? translation.value : ''
  //   })

  //   return result
  // }

  function mobileconvertTranslation(translation: any, languages: string[]): Record<string, string> {
    const languageCode = translation.code.replace(/^mob_|^web_/, '')

    const result: Record<string, string> = { key: translation.key }

    languages.forEach(lang => {
      result[lang] = lang === languageCode ? translation.value : ''
    })

    return result
  }

  const handleEditClick = (rowIndex: number, columnId: string) => {
    if (currentTab === 'mobile') {
      setEditedRow(data[rowIndex].key)
      setEditedColumn(`mob_${columnId}`)
      setEditedTab('Mobile')
    } else {
      setEditedRow(data[rowIndex].key)
      setEditedColumn(columnId)
      setEditedTab('Web')
    }

    const value = toText(data[rowIndex]?.[columnId], '')

    setEditValue(value)
    setEditCell({ rowIndex, columnId })
    setEditDialogOpen(true)
  }

  const handleDeleteClick = async (original: any) => {
    await deleteByKey(original.key, currentTab === 'mobile' ? 'mobile' : 'web')
    notifyTranslationUpdated()
    setData(data.filter(version => version.key !== original.key))
  }

  const columns = useMemo<ColumnDef<VersionWithActionsType, any>[]>(() => {
    if (data.length === 0) return []
    const allKeys = Array.from(new Set(data.flatMap(row => Object.keys(row)))).filter(k => k !== 'actions')
    const keys = allKeys.length > 0 ? ['key', ...allKeys.filter(k => k !== 'key')] : allKeys
    const columnHelper = createColumnHelper<VersionWithActionsType>()

    return [
      {
        id: 'serialNo',
        header: toText(dictionary?.navigation?.SNo, 'SNo'),
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      },
      ...keys.map(key =>
        columnHelper.accessor(key, {
         header: toText(
            dictionary?.navigation?.[key],
            key.charAt(0).toUpperCase() + key.slice(1)
          ),
          cell: ({ row }) => {
            const raw = (row.original as any)?.[key]
            const display = raw === null || raw === undefined || raw === '' ? 'null' : toText(raw, 'null')
            const isDisabled = key === 'key'

            return (
              <Typography
                 onClick={!isDisabled ? () => handleEditClick(row.index, key) : undefined}
                 className={!isDisabled ? 'cursor-pointer' : ''}
                >
               {display}
             </Typography>
            )
          }
        })
      ),
      columnHelper.accessor('actions', {
        header: toText(dictionary?.navigation?.Actions, 'Actions'),
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleDeleteClick(row.original)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const table = useReactTable({
    data: data as any[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 25
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder={toText(dictionary?.navigation?.Search, 'Search')}
          />

          <div className='flex items-center gap-x-4'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='flex-auto'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='15'>15</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId='table-container'
              fileName='Translation_Export'
              dictionary={dictionary}
            />
            <Button
              variant='contained'
              onClick={() => setAddVersionOpen(!addVersionOpen)}
              startIcon={<i className='tabler-plus' />}
            >
              {toText(dictionary?.navigation?.AddTranslation, 'Add Translation')}
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto' id='table-container'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i className='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {toText(dictionary?.navigation?.Nodataavailable, 'No data available')}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => (
                    <tr
                      key={row.id}
                      className={classnames({
                        selected: row.getIsSelected()
                      })}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <Dialog open={editDialogOpen} onClose={() => !editLoading && setEditDialogOpen(false)}>
        <DialogTitle>{toText(dictionary?.navigation?.Edit, 'Edit')}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            {toText(
              dictionary?.navigation?.TranslateAndUpdateAllLanguages,
              'Value will be translated to every language and updated in all JSON files.'
            )}
          </Typography>
          <TextField
            autoFocus
            margin='dense'
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color='primary' disabled={editLoading}>
            {toText(dictionary?.navigation?.Cancel, 'Cancel')}
          </Button>
          <Button onClick={handleSaveEdit} color='primary' disabled={editLoading}>
            {editLoading
              ? toText(dictionary?.navigation?.TranslatingAndAdding, 'Translating & updating...')
              : toText(dictionary?.navigation?.Save, 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addVersionOpen} onClose={() => setAddVersionOpen(false)}>
        <DialogTitle>{toText(dictionary?.navigation?.AddTranslation, 'Add Translation')}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {toText(
              dictionary?.navigation?.TranslateAndAddToAllActiveLanguages,
              'Value will be translated for every language (active + inactive) and added to mobile JSON.'
            )}
          </Typography>
          <TextField
            margin='dense'
            label={toText(dictionary?.navigation?.SourceLanguage, 'Source language')}
            select
            value={sourceLanguage}
            onChange={e => setSourceLanguage(e.target.value)}
            fullWidth
          >
            {languageCodes.map((code: string) => (
              <MenuItem key={code} value={code}>
                {toText(code, '')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            autoFocus
            margin='dense'
            label={toText(dictionary?.navigation?.Key, 'Key')}
            value={newTranslation.key}
            onChange={e => setNewTranslation({ ...newTranslation, key: e.target.value })}
            fullWidth
          />
          <TextField
            margin='dense'
            label={toText(dictionary?.navigation?.Value, 'Value')}
            value={newTranslation.value}
            onChange={e => setNewTranslation({ ...newTranslation, value: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions className='flex gap-5'>
          <Button onClick={handleAddTranslation} color='primary' variant="contained" disabled={addLoading}>
            {addLoading
              ? toText(dictionary?.navigation?.TranslatingAndAdding, 'Translating & adding...')
              : toText(dictionary?.navigation?.Add, 'Add')}
          </Button>
          <Button onClick={() => setAddVersionOpen(false)} variant='outlined' color='error' disabled={addLoading}>
            {toText(dictionary?.navigation?.Cancel, 'Cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TranslationTable
