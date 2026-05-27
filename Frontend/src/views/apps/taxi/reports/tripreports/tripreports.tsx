'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { 
  createColumnHelper, 
  flexRender, 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getSortedRowModel, 
  getPaginationRowModel 
} from '@tanstack/react-table';

import type { ColumnDef } from '@tanstack/react-table';

import Card from '@mui/material/Card';
import type { TextFieldProps } from '@mui/material/TextField';
import { MenuItem, Typography } from '@mui/material';

import TablePagination from '@mui/material/TablePagination';

import TablePaginationComponent from '@components/TablePaginationComponent';



import CustomTextField from '@core/components/mui/TextField';

import ExportOptions from '@/utils/ExportOptions';


type TripReportsType = {
  date: string;
  dispatcherCompleted: string;
  dispatcherCancelled: string;
  mobileCompleted: string;
  mobileCancelled: string;
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

const columnHelper = createColumnHelper<TripReportsType>();

const TripReportsTable = ({ dictionary,data }: { dictionary: any, data:TripReportsType[] }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo<ColumnDef<TripReportsType, any>[]>(() => [
    columnHelper.accessor('date', {
      header: dictionary['navigation'].date,
      cell: ({ row }) => <Typography>{new Date(row.original.date).toLocaleDateString()}</Typography>,
    }),
    {
      id: 'dispatcherBooking',
      header: () => <div className="text-center">{dictionary['navigation'].dispatcherBooking}</div>,
      columns: [
        columnHelper.accessor('dispatcherCompleted', {
          header: () => <div className="text-center">{dictionary['navigation'].completed}</div>,
          cell: ({ row }) => <div className="text-center">{row.original.dispatcherCompleted}</div>,
        }),
        columnHelper.accessor('dispatcherCancelled', {
          header: () => <div className="text-center">{dictionary['navigation'].cancelled}</div>,
          cell: ({ row }) => <div className="text-center">{row.original.dispatcherCancelled}</div>,
        }),
      ],
    },
    {
      id: 'mobileBooking',
      header: () => <div className="text-center">{dictionary['navigation'].mobileBooking}</div>,
      columns: [
        columnHelper.accessor('mobileCompleted', {
          header: () => <div className="text-center">{dictionary['navigation'].completed}</div>,
          cell: ({ row }) => <div className="text-center">{row.original.mobileCompleted}</div>,
        }),
        columnHelper.accessor('mobileCancelled', {
          header: () => <div className="text-center">{dictionary['navigation'].cancelled}</div>,
          cell: ({ row }) => <div className="text-center">{row.original.mobileCancelled}</div>,
        }),
      ],
    },
  ], [dictionary]);
  

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, globalFilter },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
    filterFns: {
      fuzzy: () => true,
    }
  });

  return (
    <Card className="w-full">
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
            fileName='TripWiseReports_Export'
            dictionary={dictionary}
          />
        </div>
      </div>
      <div className="overflow-x-auto" id="table-container">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-4 font-medium text-sm text-center border-r" colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center justify-center ${header.column.getIsSorted() ? 'cursor-pointer select-none' : ''}`}
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-4 text-sm border-r">
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
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </Card>
  );
};

export default TripReportsTable;
