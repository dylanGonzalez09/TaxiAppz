'use client';

import React, { useState, useMemo, useEffect } from 'react';

import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import { MenuItem, Typography, Card } from '@mui/material';

import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import ExportOptions from '@/utils/ExportOptions';

type TripWiseReportsType = {
  date: string;
  localCompleted: string;
  localCancelled: string;
  rentalCompleted: string;
  rentalCancelled: string;
};

const fuzzyFilter: FilterFn<TripWiseReportsType> = (row, columnId, filterValue) => {
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

const columnHelper = createColumnHelper<TripWiseReportsType>();

const TripWiseReportsTable = ({ staticGroup, dictionary }: { staticGroup: TripWiseReportsType[], dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<TripWiseReportsType[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<TripWiseReportsType, any>[]>(() => [
    columnHelper.accessor('date', {
      id: 'date', // Unique ID for date
      header: dictionary['navigation'].date,
      cell: ({ row }) => <Typography>{new Date(row.original.date).toLocaleDateString()}</Typography>,
    }),
    {
      id: 'local', // Unique ID for the parent column
      header: dictionary['navigation'].local,
      columns: [
        columnHelper.accessor('localCompleted', {
          id: 'localCompleted', // Unique ID for completed
          header: dictionary['navigation'].completed, // Header for completed
          cell: ({ row }) => <Typography>{row.original.localCompleted}</Typography>,
        }),
        columnHelper.accessor('localCancelled', {
          id: 'localCancelled', // Unique ID for cancelled
          header: dictionary['navigation'].cancelled, // Header for cancelled
          cell: ({ row }) => <Typography>{row.original.localCancelled}</Typography>,
        }),
      ],
    },
    {
      id: 'rental', // Unique ID for the parent column
      header: dictionary['navigation'].rental,
      columns: [
        columnHelper.accessor('rentalCompleted', {
          id: 'rentalCompleted', // Unique ID for completed
          header: dictionary['navigation'].completed, // Header for completed
          cell: ({ row }) => <Typography>{row.original.rentalCompleted}</Typography>,
        }),
        columnHelper.accessor('rentalCancelled', {
          id: 'rentalCancelled', // Unique ID for cancelled
          header: dictionary['navigation'].cancelled, // Header for cancelled
          cell: ({ row }) => <Typography>{row.original.rentalCancelled}</Typography>,
        }),
      ],
    },
  ], [ dictionary]);

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
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
                  <th key={header.id} className="p-4 font-medium text-sm text-center border-r " colSpan={header.colSpan}>
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

export default TripWiseReportsTable;
