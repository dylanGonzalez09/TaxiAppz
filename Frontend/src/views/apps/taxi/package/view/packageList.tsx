/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useMemo, useEffect } from 'react';

import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card } from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import type { FilterFn } from '@tanstack/react-table';

import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';

import tableStyles from '@core/styles/table.module.css';

import ExportOptions from '@/utils/ExportOptions';

type DriverReportsType = {
  Name: string;
  clientCode: string;
  Startdate: string;
  Enddate: string;
  status: string;
};

const fuzzyFilter: FilterFn<DriverReportsType> = (row, columnId, filterValue) => {
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
  placeholder?: string;
}) => {
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

const formatDate = (date: Date | null) => {
  return date ? date.toLocaleDateString() : '';
};

const columnHelper = createColumnHelper<DriverReportsType>();

const ClientView = ({ staticGroup, dictionary }: { staticGroup: DriverReportsType[], dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<DriverReportsType[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentStatus, setCurrentStatus] = useState('All');

  const filteredData = useMemo(() => {
    if (currentStatus === 'All') return data;

    return data.filter(driver => driver.status.toLowerCase() === currentStatus.toLowerCase());
  }, [data, currentStatus]);

  const columns = useMemo(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }: { row: any }) => (
        <Typography>{(filteredData.length === 0 ? 0 : filteredData.length) * (row.index + 1)}</Typography>
      ),
    },
    columnHelper.accessor('Name', {
      header: dictionary['navigation'].Name,
      cell: ({ row }) => <Typography className='font-medium' color='text.primary'>{row.original.Name}</Typography>,
    }),
    columnHelper.accessor('clientCode', {
      header: dictionary['navigation'].ClientCode,
      cell: ({ row }) => <Typography>{row.original.clientCode}</Typography>,
    }),
    columnHelper.accessor('Startdate', {
      header: dictionary['navigation'].StartDate,
      cell: ({ row }) => <Typography>{formatDate(new Date(row.original.Startdate))}</Typography>,
    }),
    columnHelper.accessor('Enddate', {
      header: dictionary['navigation'].EndDate,
      cell: ({ row }) => <Typography>{formatDate(new Date(row.original.Enddate))}</Typography>,
    }),
    columnHelper.accessor('status', {
      header: dictionary['navigation'].Status,
      cell: ({ row }) => {
        const isActive = row.original.status.toLowerCase() === 'active';

        return (
          <Typography variant='body2' style={{ color: isActive ? 'green' : 'red' }}>
            {row.original.status}
          </Typography>
        );
      },
    }),
  ], [data]);

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
            onChange={e => setCurrentStatus(e.target.value)}
            className='is-[140px] flex-auto'
          >
            <MenuItem value='All'>{dictionary['navigation'].All}</MenuItem>
            <MenuItem value='Active'>{dictionary['navigation'].Active}</MenuItem>
            <MenuItem value='Expiry soon'>{dictionary['navigation'].Expirysoon}</MenuItem>
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

export default ClientView;
