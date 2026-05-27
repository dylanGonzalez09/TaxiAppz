/* eslint-disable react-hooks/exhaustive-deps */
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
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import { getLocalizedUrl } from '@/utils/i18n'


// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { useIsDemoUser } from '@/utils/demoUser'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

type referalListType = {
  referredUserName: string
  email: string
  phoneNumber: string
  amount: string

}

interface ReferalTabProps {
  referalData: referalListType[];
  dictionary: any;
}

// Extend the table core types for filtering
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Fuzzy Filter
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

return itemRank.passed
}

// Debounced Input Component
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
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)


return () => clearTimeout(timeout)
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper<referalListType>()

const ReferalTable = (props: ReferalTabProps) => {
  // States
  const { referalData, dictionary } = props;
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')
    const [data, setData] = useState<referalListType[]>(referalData || []);
  const { checkDemoStatus } = useIsDemoUser();

  // Column definitions
  const columns = useMemo<ColumnDef<referalListType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].Sl,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    columnHelper.accessor('referredUserName', {
      header: dictionary['navigation'].name,
      cell: ({ row }) => <Typography color='text.primary'>{row.original.referredUserName}</Typography>
    }),
    columnHelper.accessor('email', {
      header: dictionary['navigation'].Email,
      cell: ({ row }) => {
        const email = row.original.email;
        const isDemo = checkDemoStatus(); // Your demo user check

        const maskedEmail = isDemo && email?.length > 5
          ? '*****' + email.slice(5)
          : email;

        return <Typography color='text.primary'>{maskedEmail}</Typography>;
      }
    }),

    columnHelper.accessor('phoneNumber', {
      header: dictionary['navigation'].PhoneNumber,
      cell: ({ row }) => {
        const phone = row.original.phoneNumber;
        const isDemo = checkDemoStatus();

        const maskedPhone = isDemo && phone?.length > 5
          ? phone.slice(0, phone.length - 5) + '*****'
          : phone;

        return <Typography color='text.primary'>{maskedPhone}</Typography>;
      }
    }),

    columnHelper.accessor('amount', {
      header: dictionary['navigation'].amount,
      cell: ({ row }) => <Typography color='text.primary'>{row.original.amount}</Typography>
    }),

  ], [])

  // Table instance
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
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <Card>
      <CardHeader
        title={`Referal List (${table.getFilteredRowModel().rows.length})`}
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
          placeholder='Search Referal'
        />
      </div>
      <div className='overflow-x-auto' id="table-container">
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
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
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
        component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </Card>
  )
}

export default ReferalTable
