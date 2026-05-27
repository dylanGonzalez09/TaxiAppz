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

import { deleteByInvoiceId, getInvoiceByLanguage, updateInvoiceStatus } from '@apis/invoice'

import AddInvoiceDrawer from './AddEditDrawer'
import ConfirmationDialog from '@/components/dialogs/delete-data'
import ExportOptions from '@/utils/ExportOptions'
import TablePaginationComponent from '@/components/CustomTablePaginationComponent'

interface InvoiceDataType {
  id: string
  question: string
  role: string
  status: boolean
  language:string
  zoneId: string
}

const fuzzyFilter: FilterFn<InvoiceDataType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId)

  
return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase())
}

const columnHelper = createColumnHelper<InvoiceDataType>()

const InvoiceTable = ({
  dictionary,
  InvoiceData,
  langId,
  fetchTabContent,
  clientId,
  zoneId,
}: {
  dictionary: any
  InvoiceData: any
  langId: string
  clientId: string
  zoneId: string
  fetchTabContent: (langId: string, search?: string, page?: number, limit?: number) => Promise<void>
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [addInvoiceOpen, setAddInvoiceOpen] = useState(false)
  const [editData, setEditData] = useState<InvoiceDataType | null>(null)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null)
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false)
  const [statusInvoice, setStatusInvoice] = useState<InvoiceDataType | null>(null)

  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(InvoiceData.page - 1) // State is 0-based
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(InvoiceData.totalResults)
  const [data, setData] = useState(InvoiceData.results)
  const [pageSize, setPageSize] = useState(InvoiceData.limit)

  // Sync state when props change (e.g., switching tabs)
  useEffect(() => {
    setData(InvoiceData.results)
    setTotalResults(InvoiceData.totalResults)
    setPageSize(InvoiceData.limit)
    setPageIndex(InvoiceData.page > 0 ? InvoiceData.page - 1 : 0)
  }, [InvoiceData])

  const columns = useMemo<ColumnDef<InvoiceDataType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex <= 0 ? 0 : pageIndex) * pageSize + row.index + 1}</Typography>
      },
      columnHelper.accessor('question', {
        header: dictionary['navigation'].InvoiceQuestion,
        cell: ({ row }) => <Typography className='font-medium'>{row.original.question}</Typography>
      }),
      columnHelper.accessor('role', {
        header: dictionary['navigation'].Role,
        cell: ({ row }) => <Typography className='font-medium'>{row.original.role}</Typography>
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

  const handleEditClick = (rowData: InvoiceDataType) => {
    setEditData(rowData)
    setAddInvoiceOpen(true)
  }

  const handleDeleteClick = (original: InvoiceDataType) => {
    setDeleteInvoiceId(original.id)
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
    if (confirmed && deleteInvoiceId) {
      try {
        await deleteByInvoiceId(deleteInvoiceId)
        await fetchTabContent(langId, '', 1, 10)
        
        // Optimistic Update
        setData((prevData: any[]) => prevData.filter(item => item.id !== deleteInvoiceId))
        setTotalResults((prev: number) => prev - 1)

        // Handle Pagination Logic locally
        const currentDataLength = data.length

        if (currentDataLength === 1 && pageIndex > 0) {
          // If last item on page deleted, go back one page
          triggerPageChange(pageIndex) 
        } else {
           // Just stay on current page visually
        }

        toast.success(dictionary['navigation'].deleteSuccess || 'Deleted successfully')
      } catch (error) {
        console.error('Error deleting Invoice:', error)
        toast.error(dictionary['navigation'].deleteError || 'Error deleting')
      }
    }

    setDeleteConfirmationOpen(false)
    setDeleteInvoiceId(null)
  }

  const handleStatusToggle = async (rowData: InvoiceDataType) => {
    setStatusInvoice(rowData)
    setStatusConfirmationOpen(true)
  }

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusInvoice) {
      const newStatus = !statusInvoice.status

      try {
        await updateInvoiceStatus(statusInvoice.id.toString(), { status: newStatus })
        await fetchTabContent(langId, '', 1, 10)

        // Optimistic Update
        setData((prevData: any[]) =>
          prevData.map(item => (item.id === statusInvoice.id ? { ...item, status: newStatus } : item))
        )
        
        toast.success(dictionary['navigation'].statusUpdatedSuccessfully)
      } catch (error) {
        console.error('Failed to update Invoice status:', error)
        toast.error(dictionary['navigation'].statusUpdateError || 'Error updating status')
      }
    }

    setStatusConfirmationOpen(false)
    setStatusInvoice(null)
  }

  const handlePageChange = async (event: unknown, newPage: number) => {
    // API expects page starting from 1. Table state starts from 0.
    const apiPage = newPage > 0 ? newPage : 1 

    try {
      const { results, totalResults } = await getInvoiceByLanguage(langId, pageSearch, apiPage, pageSize, zoneId)

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
      const { results, totalResults } = await getInvoiceByLanguage(langId, pageSearch, 1, newPageSize, zoneId)

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
        const result = await getInvoiceByLanguage(langId, searchTerm, 1, pageSize, zoneId)

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
            <ExportOptions data={data} tableContainerId='table-container' fileName='Invoice_Export' dictionary={dictionary} />
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setAddInvoiceOpen(true)}>
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
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {dictionary['navigation'].Nodataavailable}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
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

      <AddInvoiceDrawer
        open={addInvoiceOpen}
        handleClose={() => {
          setAddInvoiceOpen(false)
          setEditData(null)
        }}
        invoiceData={data}
        dictionary={dictionary}
        editData={editData}
        setData={setData}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        langId={langId}
        setTotalResults={setTotalResults}
        zoneId={zoneId}
        clientId={clientId}
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

export default InvoiceTable