/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import type { ChangeEvent } from 'react'
import React, { useState, useMemo, useCallback, useEffect } from 'react'

import TablePagination from '@mui/material/TablePagination'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import {
  useReactTable,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'
import Switch from '@mui/material/Switch'
import { MenuItem, Button, Typography, Card } from '@mui/material'
import classnames from 'classnames'

import { toast } from 'react-toastify'

import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import tableStyles from '@core/styles/table.module.css'

import { deleteByCancellationId, getCancellationByLanguage, updateCancellationStatus } from '@apis/cancellationReason'

import AddCancellationDrawer from './AddEditDrawer'
import ConfirmationDialog from '@/components/dialogs/delete-data'
import ExportOptions from '@/utils/ExportOptions'
import TablePaginationComponent from '@/components/CustomTablePaginationComponent'

interface CancellationDataType {
  id: string
  reason: string
  tripStatus: string
  userType: string
  language: string
  payStatus: string
  amount: number
  status: boolean,
  zoneId:string
}

const fuzzyFilter: FilterFn<CancellationDataType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId)

  
return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase())
}

const columnHelper = createColumnHelper<CancellationDataType>()

const CancellationTable = ({
  dictionary,
  CancellationData,
  langId,
  fetchTabContent,
  clientId,
  zoneId,
  
}: {
  dictionary: any
  CancellationData: any
  langId: string
  clientId:string
  zoneId:string
  fetchTabContent: (langId: string, search?: string, page?: number, limit?: number) => Promise<void>
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [addCancellationOpen, setAddCancellationOpen] = useState(false)
  const [editData, setEditData] = useState<CancellationDataType | null>(null)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteCancellationId, setDeleteCancellationId] = useState<string | null>(null)
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false)
  const [statusCancellation, setStatusCancellation] = useState<CancellationDataType | null>(null)

  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(CancellationData.page - 1)
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(CancellationData.totalResults)
  const [data, setData] = useState(CancellationData.results)
  const [pageSize, setPageSize] = useState(CancellationData.limit)


  useEffect(() => {
    setData(CancellationData.results)
    setTotalResults(CancellationData.totalResults)
    setPageSize(CancellationData.limit)
    setPageIndex(CancellationData.page > 0 ? CancellationData.page - 1 : 0)
  }, [CancellationData])

  const columns = useMemo<ColumnDef<CancellationDataType, any>[]>
    (() => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,

        // FIX: Changed condition to <= 0 to handle Page 1 and Page 2 correctly
        cell: ({ row }) => <Typography>{(pageIndex <= 0 ? 0 : pageIndex) * pageSize + row.index + 1}</Typography>
      },
      columnHelper.accessor('reason', {
        header: dictionary['navigation'].cancellationReason || 'Cancellation Reason',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.reason}</Typography>
      }),
      columnHelper.accessor('userType', {
        header: dictionary['navigation'].userType || 'user Type',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.userType}</Typography>
      }),
      columnHelper.accessor('payStatus', {
        header: dictionary['navigation'].payStatus || 'Pay Status',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.payStatus}</Typography>
      }),
      columnHelper.accessor('amount', {
        header: dictionary['navigation'].amount || 'Amount',
        cell: ({ row }) => {
          const { payStatus, amount } = row.original

          
return <Typography className='font-medium'>{payStatus?.toLowerCase() === 'pay' ? amount : '-'}</Typography>
        }
      }),
      columnHelper.accessor('tripStatus', {
        header: dictionary['navigation'].tripStatus || 'TripStatus',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.tripStatus}</Typography>
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].Status,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Switch
              checked={row.original.status}
              onChange={() => handleStatusToggle(row.original)}
              color={row.original.status ? 'success' : 'error'}
              sx={{
                '& .MuiSwitch-switchBase': { color: row.original.status ? 'green' : 'red' },
                '& .MuiSwitch-switchBase.Mui-checked': { color: row.original.status ? 'green' : 'red' },
                '& .MuiSwitch-thumb': { backgroundColor: 'white' },
                '& .MuiSwitch-track': { backgroundColor: row.original.status ? 'green' : 'red' }
              }}
            />
          </div>
        )
      }),
      {
        id: 'actions',
        header: dictionary['navigation'].Actions,
        cell: ({ row }) => (
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: dictionary['navigation'].Edit,
                icon: 'tabler-pencil-minus',
                menuItemProps: { onClick: () => handleEditClick(row.original) }
              },
              {
                text: dictionary['navigation'].Delete,
                icon: 'tabler-trash',
                menuItemProps: { onClick: () => handleDeleteClick(row.original) }
              }
            ].filter(Boolean)}
          />
        ),
        enableSorting: false
      }
    ],
    [data, dictionary, pageIndex, pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleEditClick = (rowData: CancellationDataType) => {
    setEditData(rowData)
    setAddCancellationOpen(true)
  }

  const handleDeleteClick = (original: CancellationDataType) => {
    setDeleteCancellationId(original.id)
    setDeleteConfirmationOpen(true)
  }

  // Helper to trigger page change manually
  const triggerPageChange = (page: number) => {
    const dummyEvent = {
      target: { value: page },
      currentTarget: { value: page },
      nativeEvent: {} as Event,
      bubbles: false
    } as unknown as ChangeEvent<unknown>

    handlePageChange(dummyEvent, page)
  }

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteCancellationId) {
      try {
        await deleteByCancellationId(deleteCancellationId)
        await fetchTabContent(langId, '', 1, 10)
        
        setData((prevData: any[]) => prevData.filter(reason => reason.id !== deleteCancellationId))
        setTotalResults((prev: number) => prev - 1)

        const currentDataLength = data.length

        if (currentDataLength === 1 && pageIndex > 0) {
          triggerPageChange(pageIndex) 
        } else {
           // Just stay on current page visually
        }

        toast.success(dictionary['navigation'].deleteSuccess)
      } catch (error) {
        console.error('Error deleting Cancellation:', error)
        toast.error(dictionary['navigation'].deleteError)
      }
    }

    setDeleteConfirmationOpen(false)
    setDeleteCancellationId(null)
  }

  const handleStatusToggle = async (rowData: CancellationDataType) => {
    setStatusCancellation(rowData)
    setStatusConfirmationOpen(true)
  }

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusCancellation) {
      const newStatus = !statusCancellation.status

      try {
        await updateCancellationStatus(statusCancellation.id.toString(), { status: newStatus })
        await fetchTabContent(langId, '', 1, 10)
        setData((prevData: any[]) =>
          prevData.map(reason => (reason.id === statusCancellation.id ? { ...reason, status: newStatus } : reason))
        )
        
        toast.success(dictionary['navigation'].statusUpdatedSuccessfully)
      } catch (error) {
        console.error('Failed to update Cancellation status:', error)
        toast.error(dictionary['navigation'].statusUpdateError)
      }
    }

    setStatusConfirmationOpen(false)
    setStatusCancellation(null)
  }

  const handlePageChange = async (event: unknown, newPage: number) => {
    // API expects page starting from 1. Table state starts from 0.
    const apiPage = newPage > 0 ? newPage : 1 

    try {
      const { results, totalResults } = await getCancellationByLanguage(langId, pageSearch, apiPage, pageSize, zoneId)

      setData(results)
      setTotalResults(totalResults)

      // Update state index: API Page 1 -> Index 0
      setPageIndex(apiPage - 1)
    } catch (error) {
      console.error('Error fetching new page data:', error)
    }
  }

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value)
    
    // When changing page size, always go back to page 1
    try {
      const { results, totalResults } = await getCancellationByLanguage(langId, pageSearch, 1, newPageSize, zoneId)

      setPageSize(newPageSize)
      setData(results)
      setTotalResults(totalResults)
      setPageIndex(0)
    } catch (error) {
      console.error('Error fetching new page size data:', error)
    }
  }

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getCancellationByLanguage(langId, searchTerm, 1, pageSize, zoneId)

        setPageSearch(searchTerm)
        setGlobalFilter(searchTerm)
        setData(result.results)
        setTotalResults(result.totalResults)
        setPageIndex(0)
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
    },
    [langId, pageSize, zoneId]
  )

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex items-center gap-x-4'>
            <CustomTextField
              variant='outlined'
              placeholder={dictionary['navigation'].Search}
              value={globalFilter}
              onChange={e => {
                const searchTerm = e.target.value

                handleSearch(searchTerm)
              }}
              className='flex-auto'
            />
          </div>

          <div className='flex items-center gap-x-4'>
            <CustomTextField select value={pageSize} onChange={e => handlePageSizeChange(e)} className='flex-auto'>
              {[5, 10, 15, 25].map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </CustomTextField>
            <ExportOptions data={data} tableContainerId='table-container' fileName='Cancellation_Export' dictionary={dictionary} />
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddCancellationOpen(true)}
            >
              {dictionary['navigation'].Add}
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
            <tbody>
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {dictionary['navigation'].Nodataavailable}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          component={() => (
            <TablePaginationComponent
              table={table}
              totalResults={totalResults}
              pageIndex={pageIndex + 1} // Display is 1-based
              pageSize={pageSize}
              handlePageChange={handlePageChange}
              handlePageSizeChange={handlePageSizeChange}
              dictionary={dictionary}
            />
          )}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />
      </Card>

      <AddCancellationDrawer
        open={addCancellationOpen}
        handleClose={() => {
          setAddCancellationOpen(false)
          setEditData(null)
        }}
        cancellationData={data}
        dictionary={dictionary}
        editData={editData}
        setData={setData}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        langId={langId}
        setTotalResults={setTotalResults}
        clientId={clientId}
        zoneId={zoneId}
      />
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType='delete-data'
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}
      />
      <ConfirmationDialog
        open={statusConfirmationOpen}
        setOpen={setStatusConfirmationOpen}
        confirmationType='status-data'
        onConfirm={handleConfirmStatus}
        dictionary={dictionary}
      />
    </>
  )
}

export default CancellationTable