/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState, useMemo,useEffect } from 'react';

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import type { TextFieldProps } from '@mui/material/TextField'

import { rankItem } from '@tanstack/match-sorter-utils'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent';
import tableStyles from '@core/styles/table.module.css';
import AddFineDrawer from './AddFine';

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


type FineType = {
    driverName: string;
    fineAmount: string;
    description: string;
    date: string;
  };

const fineData: FineType[] = [];

const columnHelper = createColumnHelper<FineType>();

const FineTable = (dictionary: any) => {
  const [data, setData] = useState(fineData);
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [addFineOpen, setAddFineOpen] = useState(false);

  const columns = useMemo(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].Sl,
        cell: ({ row }: { row: any }) => <Typography>{row.index + 1}</Typography>
      },
      columnHelper.accessor('driverName', {
        header: dictionary['navigation'].DriverName,
        cell: ({ row }) => (
            <Typography color='success.main'>{row.original.driverName}</Typography>
        ),
      }),
      columnHelper.accessor('fineAmount', {
        header: dictionary['navigation'].FineAmount,
        cell: ({ row }) => row.original.fineAmount,
      }),
      columnHelper.accessor('description', {
        header: dictionary['navigation'].Description,
        cell: ({ row }) => row.original.description,
      }),
      columnHelper.accessor('date', {
        header: dictionary['navigation'].Date,
        cell: ({ row }) => row.original.date,
      }),
    ],
    []
  );

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

  const handleAddFine = (newFine: FineType) => {
    setData(prevData => [...prevData, newFine]);
  };

  return (
    <Card>
      <CardHeader
        title={
          <div className='flex justify-between items-center'>
            <span>{dictionary['navigation'].ManageFine}</span>
            <Button
              variant='contained'
              onClick={() => setAddFineOpen(true)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].AddNew}
            </Button>
          </div>
        }
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
          placeholder={dictionary['navigation'].SearchComplaint}
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
          table.setPageIndex(page);
        }}
      />
      <AddFineDrawer
        open={addFineOpen}
        handleClose={() => setAddFineOpen(false)}
        setData={handleAddFine}
      />
    </Card>
  );
}

export default FineTable;
