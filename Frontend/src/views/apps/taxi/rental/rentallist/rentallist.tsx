/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useMemo, useEffect } from 'react';

import Link from 'next/link';

import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import {  createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card, Tooltip } from '@mui/material';


import Chip from '@mui/material/Chip'


import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import CustomTextField from '@core/components/mui/TextField';


import TablePaginationComponent from '@components/TablePaginationComponent';

import tableStyles from '@core/styles/table.module.css';

import ExportOptions from '@/utils/ExportOptions';




type RentalListType = {
  requestId: string;
  driverName: string;
  userName: string;
  date: string;
  tripFrom: string;
  tripTo: string;
  status: string;
  actions?: string;
  _id: string;
};

type StatusType = 'Completed' | 'Accepted' | 'Cancelled' | 'Scheduled' | 'Arrived' | 'Started';

const fuzzyFilter: FilterFn<RentalListType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);

  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />;
};

const columnHelper = createColumnHelper<RentalListType>();

const RentalListTable = ({ staticGroup, dictionary }: { staticGroup: RentalListType[], dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [data] = useState<RentalListType[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');


  const statusChipColor: Record<StatusType, { color: 'success' | 'warning' | 'error' | 'info' | 'success' | 'success' }> = {

    Completed: { color: 'success' },
    Accepted: { color: 'warning' },
    Cancelled: { color: 'error' },
    Scheduled: { color: 'info' },
    Arrived: { color: 'success'},
    Started: { color:'success' }
  };


  const columns = useMemo<ColumnDef<RentalListType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    columnHelper.accessor('requestId', {
      header: dictionary['navigation'].requestId,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.requestId}</Typography>,
    }),

    columnHelper.accessor('userName', {
      header: dictionary['navigation'].userName,
      cell: ({ row }) => {
        const name = row.original.userName ?? '';


return name.length > 15 ? (
          <Tooltip title={name} arrow placement="bottom">
            <Typography className="font-medium" sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 150,
              display: 'inline-block',
            }}>
              {name.slice(0, 15) + '...'}
            </Typography>
          </Tooltip>
        ) : (
          <Typography className="font-medium">{name}</Typography>
        );
      },
    }),
    columnHelper.accessor('driverName', {
      header: dictionary['navigation'].driverName,
      cell: ({ row }) => {
        const name = row.original.driverName ?? '';


return name.length > 15 ? (
          <Tooltip title={name} arrow placement="bottom">
            <Typography className="font-medium" sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 150,
              display: 'inline-block',
            }}>
              {name.slice(0, 15) + '...'}
            </Typography>
          </Tooltip>
        ) : (
          <Typography className="font-medium">{name}</Typography>
        );
      },
    }),

    columnHelper.accessor('date', {
      header: dictionary['navigation'].date,
      cell: ({ row }) => {

        // const date = new Date(row.original.date);

        return <Typography className='font-medium'>{row.original.date} </Typography>
      },
    }),
    columnHelper.accessor('tripFrom', {
      header: dictionary['navigation'].tripFrom,
      cell: ({ row }) => {
        const location = row.original.tripFrom ?? '';

        return location.length > 15 ? (
          <Tooltip title={location} arrow placement="bottom">
            <Typography className="font-medium" sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 150,
              display: 'inline-block',
            }}>
              {location.slice(0, 15) + '...'}
            </Typography>
          </Tooltip>
        ) : (
          <Typography className='font-medium'>{location}</Typography>
        );
      },
    }),
    columnHelper.accessor('tripTo', {
      header: dictionary['navigation'].tripTo,
      cell: ({ row }) => {
        const location = row.original.tripTo ?? '';

        return location.length > 15 ? (
          <Tooltip title={location} arrow placement="bottom">
            <Typography className="font-medium" sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 150,
              display: 'inline-block',
            }}>
              {location.slice(0, 15) + '...'}
            </Typography>
          </Tooltip>
        ) : (
          <Typography className='font-medium'>{location}</Typography>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: dictionary['navigation'].Status,
      cell: ({ row }) => {
        const status = row.original.status as StatusType; // Cast here

        return (
          <Chip
            label={status}
            color={statusChipColor[status]?.color}
            variant='tonal'
            size='small'
          />
        );
      },
    }),

    columnHelper.accessor('actions', {
      header: dictionary['navigation'].actions,
      cell: ({ row }) => (
        <div className='flex items-center'>
          {/* <IconButton onClick={() => (window.location.href = `/${locale}/apps/taxi/request/requestView/${row.original._id}`)}>
            <i className='tabler-eye text-textSecondary' />
          </IconButton> */}
          <div className='flex items-center'>
                    <Link href={`/apps/taxi/request/requestView/${row.original._id}`} className='flex'>
                      <i className='tabler-eye text-textSecondary' />
                    </Link>
                  </div>
        </div>
      ),
      enableSorting: false
    })
  ], [dictionary,statusChipColor]);

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <div className='flex flex-wrap justify-between gap-4 p-6'>
        <DebouncedInput
          value={globalFilter}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder={dictionary['navigation'].search}
        />
        <div className='flex items-center gap-x-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className='flex-auto'
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </CustomTextField>
          <ExportOptions
            data={data}
            tableContainerId="table-container"
            fileName='RentalList_Export'
            dictionary={dictionary}
          />
        </div>
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
                        className={`flex items-center ${header.column.getIsSorted() ? 'cursor-pointer select-none' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'asc' ? <i className='tabler-chevron-up text-xl' /> : <i className='tabler-chevron-down text-xl' />
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
                  {dictionary['navigation'].noDataAvailable}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={row.getIsSelected() ? 'selected' : ''}>
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
        component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </Card>
  );
};

export default RentalListTable;
