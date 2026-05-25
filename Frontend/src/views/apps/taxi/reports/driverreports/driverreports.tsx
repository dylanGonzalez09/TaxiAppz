/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';
import React, { useState, useMemo, useEffect } from 'react';

import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card } from '@mui/material';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import CustomTextField from '@core/components/mui/TextField';

import TablePaginationComponent from '@components/TablePaginationComponent';

import tableStyles from '@core/styles/table.module.css';

import ExportOptions from '@/utils/ExportOptions';

// type DriverReportsType = {
//   driverName: string;
//   vehicleType: string;
//   phoneNumber: string;
//   todayWorking: string;
//   currentStatus: string;
//   driverStatus: string;
//   yesterdayWorking: string;
//   weeklyWorking: string;
//   monthlyWorking: string;
//   tripCancelled: string;
//   tripCompleted : string;
// };

const fuzzyFilter: FilterFn<any> = (row, columnId, filterValue) => {
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

const columnHelper = createColumnHelper<any>();

const DriverReportsTable = ({ staticGroup, dictionary }: { staticGroup: any[], dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({});
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<any[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentStatus, setCurrentStatus] = useState('All'); // Added state for currentStatus

  const filteredData = useMemo(() => {
    if (currentStatus === 'All') return data;

    return data.filter(driver => driver.currentStatus.toLowerCase() === currentStatus.toLowerCase());
  }, [data, currentStatus]);

  function formatTime(timeStr: string): string {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  const parts = [];

  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
}

  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    columnHelper.accessor('driverName', {
      header: dictionary['navigation'].driverName,
      cell: ({ row }) => {
        const isDriverActive = row.original.driverStatus === 'active';
        const isCurrentOnline = row.original.currentStatus === 'online';

        return (
          <div>
            <Typography className='font-medium'>{row.original.driverName}</Typography>
            <Typography className='font-medium' color='text.primary'>
              {row.original.phoneNumber}
            </Typography>
            <Typography
              variant='body2'
              className='text-wrap'
              style={{ color: isCurrentOnline ? 'green' : 'red' }} // Corrected color assignment
            >
              {row.original.currentStatus}
            </Typography>
            <Typography
              variant='body2'
              className='text-wrap'
              style={{ color: isDriverActive ? 'green' : 'red' }} // Corrected color assignment
            >
              {row.original.driverStatus}
            </Typography>
          </div>
        );
      }
    }),
    columnHelper.accessor('vehicleType', {
      header: dictionary['navigation'].vehicleType,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.vehicleType}</Typography>,
    }),
    columnHelper.accessor('tripCompleted', {
      header: dictionary['navigation'].tripStatus,
      cell: ({ row }) => (
        <div>
          <Typography className='font-medium' style={{ color: 'green' }}>
            Completed - {row.original.tripCompleted}
          </Typography>
          <Typography className='font-medium' style={{ color: 'red' }}>
            Cancelled - {row.original.tripCancelled}
          </Typography>
        </div>
      ),
    }),

    columnHelper.accessor('todayWorking', {
      header: dictionary['navigation'].todayWorking,
      cell: ({ row }) => {
        return <Typography className='font-medium'>{formatTime(row.original.todayWorkingTime)}</Typography>

      },
    }),
    columnHelper.accessor('yesterdayWorking', {
      header: dictionary['navigation'].yesterdayWorking,
      cell: ({ row }) => {

        return <Typography className='font-medium'>{formatTime(row.original.yesterdayWorkingTime)}</Typography>

      },
    }),
    columnHelper.accessor('weeklyWorking', {
      header: dictionary['navigation'].weeklyWorking,
      cell: ({ row }) => {

        return <Typography className='font-medium'>{formatTime(row.original.weeklyWorkingTime)}</Typography>

      },
    }),
    columnHelper.accessor('monthlyWorking', {
      header: dictionary['navigation'].monthlyWorking,
      cell: ({ row }) => {
        return <Typography className='font-medium'>{formatTime(row.original.monthlyWorkingTime)}</Typography>

      },
    }),
  ], [ dictionary]);

  const table = useReactTable({
    data: filteredData,
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
          <CustomTextField
            select
            fullWidth
            value={currentStatus}
            onChange={e => setCurrentStatus(e.target.value)} // Use the correct state
            className='is-[140px] flex-auto'
          >
            <MenuItem value='All'>{dictionary['navigation'].All}</MenuItem>
            <MenuItem value='Online'>{dictionary['navigation'].Online}</MenuItem>
            <MenuItem value='Offline'>{dictionary['navigation'].Offline}</MenuItem>
          </CustomTextField>
          <ExportOptions
            data={data}
            tableContainerId="table-container"
            fileName='DriverReports_Export'
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

export default DriverReportsTable;
