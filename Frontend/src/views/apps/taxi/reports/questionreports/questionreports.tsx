/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo, useEffect } from 'react';

import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import {  createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card,Link } from '@mui/material';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import IconButton from '@mui/material/IconButton';

import { getLocalizedUrl } from '@/utils/i18n';
import type { Locale } from '@configs/i18n';

import CustomTextField from '@core/components/mui/TextField';

import TablePaginationComponent from '@components/TablePaginationComponent';
import ExportOptions from '@/utils/ExportOptions';


import tableStyles from '@core/styles/table.module.css';

type QuestionReportsType = {
  _id: string;
  question: string;
  role:string;
  agree: string;
  disagree: string;
  actions?: any;
};

const fuzzyFilter: FilterFn<QuestionReportsType> = (row, columnId, filterValue) => {
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

const columnHelper = createColumnHelper<QuestionReportsType>();

const QuestionReportsTable = ({ staticGroup, dictionary,zoneId }: { staticGroup: QuestionReportsType[], dictionary: any,zoneId:any }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [data] = useState<QuestionReportsType[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');
  const locale = 'en'; // Define your locale here

  const columns = useMemo<ColumnDef<QuestionReportsType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    columnHelper.accessor('question', {
      header: dictionary['navigation'].question || 'question',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.question}</Typography>,
    }),

    columnHelper.accessor('agree', {

      header: dictionary['navigation'].agree,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.agree}</Typography>,
    }),
    columnHelper.accessor('disagree', {
      header: dictionary['navigation'].disagree,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.disagree}</Typography>,
    }),
    columnHelper.accessor('actions', {
      header: dictionary['navigation'].actions,
      cell: ({ row }) => (
        <div className='flex items-center'>
          <IconButton>
            <Link
                          href={getLocalizedUrl(`${zoneId}/apps/taxi/reports/invoicequestion/${row.original._id}`, locale as Locale)}
                          className='flex'
                        >
                          <i className='tabler-eye text-textSecondary' />
                        </Link>
          </IconButton>
        </div>
      ),
      enableSorting: false
    })
  ], [ locale,zoneId,dictionary]);

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
            fileName='QuestionReports_Export'
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

export default QuestionReportsTable;
