'use client'

import React, { useState, useMemo } from 'react'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

import TablePagination from '@mui/material/TablePagination'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

import TablePaginationComponent from '@components/TablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import WalletDetails from './WalletDetails'
import AddAmountDrawer from './AddAmount'

type WalletTransactionType = {
  id: number
  amount: number
  purpose: string
  type: string
  status: string
  requestId: string
}

const walletTransactions: WalletTransactionType[] = [
  {
    id: 1,
    amount: -50,
    purpose: 'Service Tax	',
    type: 'SPENT',
    status: 'Success',
    requestId: 'TAXI_000004'
  },
  {
    id: 2,
    amount: 2500,
    purpose: 'wallet amount added successfully',
    type: 'EARNED',
    status: 'Failed',
    requestId: ''
  },
]

const columnHelper = createColumnHelper<WalletTransactionType>()

const WalletTable = (dictionary: any) => {
  const [data, setData] = useState(walletTransactions)
  const [addAmountOpen, setAddAmountOpen] = useState(false)

  const columns = useMemo(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].Sl,
        cell: ({ row }: { row: any }) => <Typography>{row.index + 1}</Typography>
      },
      columnHelper.accessor('amount', {
        header: dictionary['navigation'].Amount,
        cell: ({ row }) => (
          <div className='flex items-center'>
            {row.original.amount < 0 ? (
              <>
                <i className='tabler-trending-down text-danger mr-2' />
                <Typography color='danger.main'>{row.original.amount}</Typography>
              </>
            ) : (
              <>
                <i className='tabler-trending-up text-success mr-2' />
                <Typography color='success.main'> 
                {parseFloat(row.original.amount ? row.original.amount.toFixed(2) : "0")}
                </Typography>
              </>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('purpose', {
        header: dictionary['navigation'].Purpose,
        cell: ({ row }) => row.original.purpose,
      }),
      columnHelper.accessor('type', {
        header: dictionary['navigation'].Type,
        cell: ({ row }) => row.original.type,
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].Status,
        cell: ({ row }) => {
          const status = row.original.status;
          const color = status === 'Success' ? 'success' : 'error';


          return (
            <Chip
              label={status}
              color={color}
              variant='tonal'
              size='small'
            />
          );
        },
      }),
      columnHelper.accessor('requestId', {
        header: 'Request ID',
        cell: ({ row }) => row.original.requestId,
      }),
    ],
    [dictionary]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: () => true,
    }
  })

  const handleAddAmount = (newAmount: number) => {

    const newTransaction: WalletTransactionType = {
      id: data.length + 1,
      amount: newAmount,
      purpose: 'wallet amount added successfully',
      type: 'EARNED',
      status: 'Success',
      requestId: '',
    };

    setData(prevData => [...prevData, newTransaction]);
  };

  return (
    <Card>
      <CardHeader
        title={
          <>
            {dictionary['navigation'].WalletTransactionHistory}
            <div className='mt-1 flex items-center justify-between'>
              <Typography variant='subtitle2' color='text.secondary'>
                {dictionary['navigation'].Lastupdated} - 2024-09-30 11:47:05
              </Typography>
              <Button
                variant='contained'
                onClick={() => setAddAmountOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].Addamount}
              </Button>
            </div>
          </>
        }
      />
      <div className='mb-1'>
        <WalletDetails />
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
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
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
      <AddAmountDrawer
        open={addAmountOpen}
        handleClose={() => setAddAmountOpen(false)}
        setData={handleAddAmount}
      />
    </Card>
  )
}

export default WalletTable;
