'use client'


import { useCallback, useMemo, useState, type ChangeEvent } from 'react'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import Card from '@mui/material/Card'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'

import CustomTextField from '@core/components/mui/TextField'
import ExportOptions from '@/utils/ExportOptions'
import TablePaginationComponent from '@/components/CustomTablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'

import { getOtpTable } from '@/app/api/apps/taxi/request'

// ----------------- Type Declarations -----------------
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type OtpRow = {
  phoneNumber: string
  otp: string
}

// ----------------- Filter Function -----------------
const fuzzyFilter: FilterFn<OtpRow> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  
  addMeta?.({ itemRank })
  
  return itemRank.passed
}

const columnHelper = createColumnHelper<OtpRow>()

const OtpTable = ({ staticGroup, dictionary }: { staticGroup: any; dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(staticGroup.page - 1)
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(staticGroup.totalResults)
  const [data, setData] = useState<OtpRow[]>(staticGroup.results)
  const [pageSize, setPageSize] = useState(staticGroup.limit)

  // ----------------- Column Setup -----------------
  const columns = useMemo<ColumnDef<OtpRow, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary?.navigation?.serialNo || 'S.No',
      cell: ({ row }) => (
        <Typography>
          {(pageIndex) * pageSize + row.index + 1}
        </Typography>
      )
    },
    columnHelper.accessor('phoneNumber', {
      header: dictionary?.navigation?.phoneNumber || 'Phone Number',
      cell: info => (
        <Typography className='font-medium' color='text.primary'>
          {info.getValue()}
        </Typography>
      )
    }),
    columnHelper.accessor('otp', {
      header: dictionary?.navigation?.otp || 'OTP',
      cell: info => (
        <Typography className='font-medium' color='text.primary'>
          {info.getValue()}
        </Typography>
      )
    })
  ], [dictionary, pageIndex, pageSize])

  // ----------------- Table Setup -----------------
  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  // ----------------- Data Handlers -----------------
  const handleSearch = useCallback(async (searchTerm: string) => {
    try {
      const result = await getOtpTable(searchTerm, 1, pageSize)
      
      setPageSearch(searchTerm)
      setData(result.results)
      setTotalResults(result.totalResults)
      setPageIndex(0)
    } catch (error) {
      console.error('Error fetching search results:', error)
    }
  }, [pageSize])

  const handlePageChange = async (_: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getOtpTable(pageSearch, newPage + 1, pageSize)
      
      setData(results)
      setPageIndex(newPage)
      setTotalResults(totalResults)
    } catch (error) {
      console.error('Error fetching new page data:', error)
    }
  }

  const handlePageSizeChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10)
    const { results, totalResults } = await getOtpTable(pageSearch, 1, newSize)
    
    setPageSize(newSize)
    setData(results)
    setTotalResults(totalResults)
    setPageIndex(0)
  }

  return (
    <Card>
      {/* Top Controls */}
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <CustomTextField
          variant='outlined'
          placeholder={dictionary?.navigation?.Search || 'Search...'}
          value={globalFilter}
          onChange={e => {
            const value = e.target.value
            
            setGlobalFilter(value)
            handleSearch(value)
          }}
          className='flex-auto'
        />
        <div className='flex items-center gap-x-4'>
          <CustomTextField
            select
            value={pageSize}
            onChange={handlePageSizeChange}
            className='flex-auto'
          >
            {[5, 10, 15, 25, 50].map(size => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </CustomTextField>
          <ExportOptions
            data={data}
            tableContainerId='table-container'
            fileName='Otp_Export'
            dictionary={dictionary}
          />
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto' id='table-container'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <i className='tabler-chevron-up text-xl' />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <i className='tabler-chevron-down text-xl' />
                        ) : null}
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
                  {dictionary?.navigation?.Nodataavailable || 'No data available'}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <TablePagination
        component={() => (
          <TablePaginationComponent
            table={table}
            totalResults={totalResults}
            pageIndex={pageIndex + 1}
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
  )
}

export default OtpTable
