'use client';
import React, { useState, useMemo, useEffect } from 'react';

import { useParams } from 'next/navigation'

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

import { getSession } from 'next-auth/react';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import ExportOptions from '@/utils/ExportOptions';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import tableStyles from '@core/styles/table.module.css';

import ComposeMail from './ComposeMail';

import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';



type EmailType = {
  id?: string;
  subject: string;
  content: string;
  actions?: string
  notificationType?: string;

};

// Normalize API response to table rows: support array or { results: [] } and map email fields
function normalizeEmailData(staticGroup: any): EmailType[] {

  if (!staticGroup) return [];

  if (Array.isArray(staticGroup)) {
    return staticGroup.map((row: any) => ({
      id: row.id,
      subject: row.subject ?? row.emailTitle ?? row.emailSubject ?? row.title ?? '',
      content: row.content ?? row.emailContent ?? row.emailSubtitle ?? row.subTitle ?? row.message ?? '',
    }));
  }

  const results = staticGroup.results ?? staticGroup.data ?? [];

  if (!Array.isArray(results)) return [];

  return results.map((row: any) => ({
    id: row.id,
    subject: row.subject ?? row.emailTitle ?? row.emailSubject ?? row.title ?? '',
    content: row.content ?? row.emailContent ?? row.emailSubtitle ?? row.subTitle ?? row.message ?? '',
  }));
}

const stripHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';

  return html.replace(/<[^>]*>/g, '').trim();
};

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

const EmailTable = ({ staticGroup, dictionary }: { staticGroup: any; dictionary: any }) => {
const { control, getValues } = useForm();
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<EmailType[]>(() => normalizeEmailData(staticGroup));
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteEmailIndex, setDeleteEmailIndex] = useState<number | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [openCompose, setOpenCompose] = useState(false);
 const [userOptions, setUserOptions] = useState<any[]>([])
  const [driverOptions, setDriverOptions] = useState<any[]>([])

  // Sync table data when server passes new staticGroup (e.g. initial load or refresh)
  useEffect(() => {
    setData(normalizeEmailData(staticGroup));
  }, [staticGroup]);

  const { checkDemoStatus } = useIsDemoUser()

   const { zoneId } = useParams()

  const getClientId = async () => {
    const session = await getSession()

    return session?.user?.image?.clientId
  }

  useEffect(() => {

    const fetchDropdown = async () => {

      try {

const clientId = await getClientId()

if (!clientId) {
  throw new Error('ClientId is undefined')
}

const currentZoneId =
          typeof zoneId === 'string'
            ? zoneId
            : Array.isArray(zoneId)
            ? zoneId[0]
            : ''

        const response = await fetch(
ENDPOINTS.notification.dropDownList(clientId ?? '', currentZoneId)        )

        const res = await response.json()

        setUserOptions(res.data.Userdata || [])
        setDriverOptions(res.data.Driverdata || [])

      } catch (err) {

        console.error(err)
        toast.error('Failed to fetch users and drivers')

      }

    }

    fetchDropdown()

  }, [zoneId])

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
    {
      id: 'notificationType',
      header: dictionary['navigation'].type ?? 'Type',
      cell: ({ row }) => (
        <Typography className='font-medium'>
          {row.original.notificationType === 'push'
            ? (dictionary['navigation'].push ?? 'Push')
            : (dictionary['navigation'].email ?? 'Email')}
        </Typography>
      ),
    },
    columnHelper.accessor('subject', {
      header: dictionary['navigation'].subject,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.subject}</Typography>,
    }),
    columnHelper.accessor('content', {
      header: dictionary['navigation'].content,
      cell: ({ row }) => (
        <Typography className='font-medium'>{stripHtml(row.original.content ?? '')}</Typography>
      ),
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
  ], [ handleDeleteClick,dictionary]);

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
        getValues={getValues}
        userOptions={userOptions}
        driverOptions={driverOptions}
        dictionary={dictionary}
        onSendSuccess={(subject, content) => {
          setData(prev => [...prev, { subject, content }]);
        }}
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
