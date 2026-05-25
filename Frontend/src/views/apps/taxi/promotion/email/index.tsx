/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useMemo, useEffect } from 'react';

import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import { useForm } from 'react-hook-form';
import {

  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { toast } from 'react-toastify';

import { MenuItem, Typography, Card, IconButton, Button } from '@mui/material';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import ExportOptions from '@/utils/ExportOptions';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import tableStyles from '@core/styles/table.module.css';
import ComposeMail from './ComposeMail';



type EmailType = {
  subject: string;
  content: string;
  actions?: string;
};

const userOptions = [
  { id: 1, name: 'User One' },
  { id: 2, name: 'User Two' },
  { id: 3, name: 'User Three' },
  { id: 4, name: 'User four' },
  { id: 5, name: 'User' },
  { id: 6, name: 'Three' },
  { id: 7, name: 'One' },
  { id: 8, name: 'Two' },
  { id: 9, name: 'Three' },
];

const driverOptions = [
  { id: 1, name: 'Driver One' },
  { id: 2, name: 'Driver Two' },
  { id: 3, name: 'Driver Three' },
];

const fuzzyFilter: FilterFn<EmailType> = (row, columnId, filterValue) => {

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

const columnHelper = createColumnHelper<EmailType>();

const EmailTable = ({ staticGroup, dictionary }: { staticGroup: EmailType[]; dictionary: any }) => {
  const { control } = useForm();
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<EmailType[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteEmailIndex, setDeleteEmailIndex] = useState<number | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [openCompose, setOpenCompose] = useState(false);
  const { checkDemoStatus } = useIsDemoUser();

  const handleDeleteClick = (index: number) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeleteEmailIndex(index);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if
     (confirmed && deleteEmailIndex !== null) {

      const updatedData = data.filter((_, index) => index !== deleteEmailIndex);

      setData(updatedData);
    }

    setDeleteEmailIndex(null);
    setDeleteConfirmationOpen(false);
  };

  const columns = useMemo<ColumnDef<EmailType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    columnHelper.accessor('subject', {
      header: dictionary['navigation'].subject,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.subject}</Typography>,
    }),
    columnHelper.accessor('content', {
      header: dictionary['navigation'].content,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.content}</Typography>,
    }),
    columnHelper.accessor('actions', {
      header: dictionary['navigation'].actions,
      cell: ({ row }) => (
        <div className='flex items-center'>
          <IconButton onClick={() => handleDeleteClick(row.index)}>
            <i className='tabler-trash text-textSecondary' />
          </IconButton>
        </div>
      ),
      enableSorting: false,
    }),
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
      <div className='flex flex-wrap justify-between gap-5 p-6'>
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
            fileName='InvoiceQuestion_Export'
            dictionary={dictionary}
          />
          <Button color='primary' variant='contained' onClick={() => setOpenCompose(true)}>
            {dictionary['navigation'].Compose}
          </Button>
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
                          header.column.getIsSorted() === 'asc' ? (
                            <i className='tabler-chevron-up text-xl' />
                          ) : (
                            <i className='tabler-chevron-down text-xl' />
                          )
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
      <ComposeMail
        openCompose={openCompose}
        setOpenCompose={setOpenCompose}
        control={control}
        userOptions={userOptions}
        driverOptions={driverOptions}
        dictionary={dictionary}

      />
      <TablePagination
        component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType="delete-data"
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}
      />

    </Card>
  );
};

export default EmailTable;
