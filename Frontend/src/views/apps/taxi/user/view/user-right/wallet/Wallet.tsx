/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useState, useMemo } from 'react'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

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
  amount: number
  purpose: string
  type: string
  createdAt: string
}

type WalletDetailsType = {
  earnedAmount: number;
  amountSpent: number;
  balance: number;
};

const formatDate = (date: Date | string) => {
  const parsedDate = new Date(date);

  return isNaN(parsedDate.getTime())
    ? 'Invalid Date'
    : parsedDate.toLocaleDateString(); // or your custom format
};

const columnHelper = createColumnHelper<WalletTransactionType>()

const WalletTable = ({ userId, TransactionsData, walletDetails, addWalletButton,dictionary}: {
  userId: string; TransactionsData: WalletTransactionType[], walletDetails: WalletDetailsType, addWalletButton: any,dictionary:any

}) => {
  const [data, setData] = useState(TransactionsData || []);
  const [addAmountOpen, setAddAmountOpen] = useState(false)
  const [localWalletDetails, setLocalWalletDetails] = useState<WalletDetailsType>(walletDetails);


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
            {row.original.type === 'Earned' ? (
              <i className='tabler-trending-up text-success mr-2' />
            ) : (
              <i className='tabler-trending-down text-error mr-2' />
            )}
            <Typography color={row.original.type === 'Earned' ? 'success.main' : 'error.main'}>
              {parseFloat(row.original.amount ? row.original.amount.toFixed(2) : "0")}
            </Typography>
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

      columnHelper.accessor('createdAt', {
        header: dictionary['navigation'].TransactionDate,
        cell: ({ row }) => {
          const date = row.original?.createdAt;


          return date ? formatDate(new Date(date)) : 'N/A'; // Fallback if invalid
        },
      }),

      // columnHelper.accessor('createdAt', {
      //   header: 'Transaction Date',
      //   cell: ({ row }) => formatDate(row.original?.createdAt),
      // }),
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleAddAmount = (amount: number) => {
    const newTransaction: WalletTransactionType = {
      amount: amount,
      purpose: 'Wallet update',
      type: 'Earned',
      createdAt: 'created At', // Optionally, you might want to generate or manage this
    };

    setData(prevData => [...prevData, newTransaction]);

    setLocalWalletDetails(prevDetails => ({
      ...prevDetails,
      earnedAmount: prevDetails.earnedAmount + amount,
      balance: prevDetails.balance + amount,
    }));

  };


  return (
    <Card>
      <CardHeader
        title={
          <>
            {dictionary['navigation'].WalletTransactionHistory}
            <div className='mt-1 flex items-center justify-between'>
              <Typography variant='subtitle2' color='text.secondary'>
              </Typography>
              {addWalletButton && (
                <Button
                  variant="contained"
                  onClick={() => setAddAmountOpen(true)}
                  startIcon={<i className="tabler-plus" />}
                >
                  {dictionary['navigation'].Addamount}
                </Button>
              )}
            </div>
          </>
        }
      />
      <div className='mb-1'>
        <WalletDetails walletDetails={localWalletDetails} dictionary={dictionary} />
      </div>
      <div className='overflow-x-auto'>
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  {dictionary['navigation'].Nodataavailable}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
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

      <AddAmountDrawer open={addAmountOpen} handleClose={() => setAddAmountOpen(false)} setData={handleAddAmount} setWalletDetails={setLocalWalletDetails} userId={userId} dictionary={dictionary} />

    </Card>
  )
}

export default WalletTable;
