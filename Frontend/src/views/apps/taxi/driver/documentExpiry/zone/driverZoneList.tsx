/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo, useEffect } from 'react';

import { useParams } from 'next/navigation';
import Link from 'next/link';

import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import {createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card  } from '@mui/material';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import { ClassNames } from '@emotion/react';

import type { Locale } from '@configs/i18n';
import { getLocalizedUrl } from '@/utils/i18n';


import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import ExportOptions from '@/utils/ExportOptions';
import tableStyles from '@core/styles/table.module.css';

type driverZoneList = {
  _id: string;
  zoneName: string;
  status: boolean;
  action: any;
  zoneLevel: string;
  id:string;
};

const fuzzyFilter: FilterFn<driverZoneList> = (row, columnId, filterValue) => {
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

const columnHelper = createColumnHelper<driverZoneList>();

const DriverZoneListTable = ({ staticGroup, dictionary }: { staticGroup: driverZoneList[], dictionary: any }) => {

  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<driverZoneList[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');
  const { lang: locale,zoneId } = useParams();
  const zoneIdString = Array.isArray(zoneId) ? zoneId[0] : zoneId;

  const columns = useMemo<ColumnDef<driverZoneList, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    columnHelper.accessor('zoneName', {
      header: dictionary['navigation'].zone,
         cell: ({ row }) => (
                <>
                  <Typography className='font-medium'>{row.original.zoneName}</Typography>
                  <Typography
                    variant='body2'
                    className='text-wrap'
                    style={{ color: 'green' }}
                  >
                    {row.original.zoneLevel}
                  </Typography>
                </>
              ),
    }),
    columnHelper.accessor('status', {
      header: dictionary['navigation'].status,
      cell: ({ row }) =>
     <Typography
          className='font-medium'
          style={{ color: row.original.status === true ? 'green' : 'red' }}
        >
          {row.original.status === true ? dictionary['navigation'].Active || 'Active': dictionary['navigation'].Inactive || 'Inactive'}
        </Typography>
    }),
    columnHelper.accessor('action', {
      header: dictionary['navigation'].Action,
      cell: ({ row }) => (
        <div className='flex items-center'>

           <Typography
                component={Link}
                href={getLocalizedUrl(`${zoneIdString}/apps/taxi/driver/documentExpiry/drivers/${row.original.id || row.original._id}` , locale as Locale)}
                className='flex'
              >
               <i className='tabler-eye text-textSecondary' />
              </Typography>

          {/* <Link href={`/${zoneIdString}/apps/taxi/driver/documentExpiry/drivers/${row.original._id}`} className='flex'>
            <i className='tabler-eye text-textSecondary' />
          </Link> */}
        </div>
      ),
      enableSorting: false,
    }),
  ], [zoneIdString,dictionary]);

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
            fileName='DriverSummary_Export'
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
            {table.getFilteredRowModel()?.rows?.length=== 0 ? (
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

export default DriverZoneListTable;
