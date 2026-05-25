/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

import Link from 'next/link';

import { useParams } from 'next/navigation';

import Chip from '@mui/material/Chip'


// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'

// Third-party Imports
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

import { getLocalizedUrl } from '@/utils/i18n'


// Type Imports

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import type { Locale } from '@configs/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type requestListType = {
  id: number
  TotalAmount: number
  name: string
  rideType: string
  requestTitle: string
  issuedOn: string
  status : string
  invoice: string
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Vars
const requestTable: requestListType[] = [

  {
    id: 1,
    TotalAmount: 100.00,
    issuedOn: '01-02-2024',
    name: 'Project Alpha',
    rideType: 'Ride Now',
    requestTitle: 'Alpha Website Revamp',
    status: 'Completed',
    invoice: 'INV-001',
  },
  {
    id: 2,
    TotalAmount: 250.00,
    issuedOn: '01-02-2024',
    name: 'Project Beta',
    rideType: 'Ride Now',
    requestTitle: 'Beta App Launch',
    status: 'In Progress',
    invoice: 'INV-002',
  },
  {
    id: 3,
    TotalAmount: 150.00,
    issuedOn: '01-02-2024',
    name: 'Project Gamma',
    rideType: 'Ride Now',
    requestTitle: 'Gamma SEO Audit',
    status: 'Pending',
    invoice: 'INV-003',
  },
]

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
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

// Column Definitions
const columnHelper = createColumnHelper<requestListType>()

const RequestTable = (dictionary: any) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState(...[requestTable])
  const [globalFilter, setGlobalFilter] = useState('')
  const { lang: locale } = useParams();

  // Hooks
  const columns = useMemo<ColumnDef<requestListType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].Sl,
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
      },
      columnHelper.accessor('requestTitle', {
        header: dictionary['navigation'].Details,
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <div className='flex flex-col'>
            <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/taxi/request/requestView/`, locale as Locale)}
            color='primary'
          >{`#${row.original.invoice}`}</Typography>
              <Typography variant='body2'>{row.original.rideType}</Typography>

            </div>
          </div>
        )
      }),
      columnHelper.accessor('name', {
        header: dictionary['navigation'].Name,
        cell: ({ row }) => <Typography color='text.primary'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('issuedOn', {
        header: dictionary['navigation'].Issuedon,
        cell: ({ row }) => (
          <>
            <Typography color='text.primary'>{`${row.original.issuedOn}`}</Typography>
          </>
        )
      }),
      columnHelper.accessor('TotalAmount', {
        header: dictionary['navigation'].TotalAmount,
        cell: ({ row }) => <Typography>{parseFloat(row.original.TotalAmount.toFixed(2))}</Typography>
      }),
        columnHelper.accessor('status', {
          header: dictionary['navigation'].Status,
          cell: ({ row }) => {
            const chipColor =
              row.original.status === 'completed'
                ? 'success'
                : row.original.status === 'In Progress'
                ? 'warning'
                : 'error';
  
            
  return <Chip label={row.original.status} color={chipColor} variant="tonal" size="small" />;
          }
        })

    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data,
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

    // enableRowSelection: row => row.original.age > 18,
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
    <Card>
      <CardHeader
        title={`Request List (${table.getFilteredRowModel().rows.length})`}
        className='flex flex-wrap gap-2'
      />
      <div className='flex items-center justify-between p-6 gap-4'>
        <div className='flex items-center gap-2'>
          <Typography>{dictionary['navigation'].Show}</Typography>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[70px]'
          >
            <MenuItem value='5'>5</MenuItem>
            <MenuItem value='7'>7</MenuItem>
            <MenuItem value='10'>10</MenuItem>
          </CustomTextField>
        </div>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Request'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
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
                      </>
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
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
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
  )
}

export default RequestTable
