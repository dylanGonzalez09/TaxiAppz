/* eslint-disable import/no-unresolved */
'use client'

// React Imports
import { useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Util Imports
import tableStyles from '@core/styles/table.module.css'

import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports

// Sample Data
const RenewalData = [
  {
    id: 1,
    name: 'Vikram',
    number: '1234567890',
    packagename: 'Gold',
    expirydays: '12'
  },
  {
    id: 2,
    name: 'Amit',
    number: '9876543210',
    packagename: 'Silver',
    expirydays: '10'
  },
  {
    id: 3,
    name: 'Priya',
    number: '5678901234',
    packagename: 'Bronze',
    expirydays: '15'
  },
  {
    id: 4,
    name: 'Raj',
    number: '4561237890',
    packagename: 'Platinum',
    expirydays: '20'
  },
  {
    id: 5,
    name: 'Priya',
    number: '5678901234',
    packagename: 'Bronze',
    expirydays: '15'
  },
  {
    id: 6,
    name: 'Raj',
    number: '4561237890',
    packagename: 'Platinum',
    expirydays: '20'
  }
]

// Fuzzy Filter Function
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })
  
return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper()

const RenewalList = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState(RenewalData)

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo(
    () => [
      {
        id: 'serialNo',
        header: 'S.No',  
        cell: ({ row }) => (
          <Typography>
            {(table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + row.index + 1}
          </Typography>
        ),
      },
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl('/number', locale)}
            className='font-medium hover:text-primary'
            color='text.primary'
          >
            #{row.original.name}
          </Typography>
        )
      }),
      columnHelper.accessor('number', {
        header: 'Number',
        cell: ({ row }) => <Typography>{row.original.number}</Typography>
      }),
      columnHelper.accessor('packagename', {
        header: 'Package Name',
        cell: ({ row }) => <Typography>{row.original.packagename}</Typography>
      }),
      columnHelper.accessor('expirydays', {
        header: 'Expiry Days',
        cell: ({ row }) => <Typography>{row.original.expirydays} days</Typography>
      })
    ],
    [locale,table]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection },
    initialState: { pagination: { pageSize: 5 } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].Last5Requests} action={<OptionMenu options={['Refresh']} />} />
      <div className='overflow-x-auto' id="table-container">
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    <div
                      className={classnames({
                        'flex items-center': header.column.getIsSorted(),
                        'cursor-pointer select-none': header.column.getCanSort()
                      })}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <i className='tabler-chevron-up text-xl' />}
                      {header.column.getIsSorted() === 'desc' && <i className='tabler-chevron-down text-xl' />}
                    </div>
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
        component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </Card>
  )
}

export default RenewalList
