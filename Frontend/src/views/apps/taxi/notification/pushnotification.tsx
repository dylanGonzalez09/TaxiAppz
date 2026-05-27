/* eslint-disable react-hooks/exhaustive-deps */
  'use client';

  import React, { useState, useMemo, useEffect } from 'react';

  import type { TextFieldProps } from '@mui/material/TextField';
  import TablePagination from '@mui/material/TablePagination';
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
  import AddPushNotificationDialog from './addEdit';

  // import { BASE_IMAGE_URL } from '@apis/endpoint';

  import { deleteByNotificationId } from '@/app/api/apps/taxi/notification';

  type PushNotificationType = {
    id?: string;
    title: string;
    subTitle: string;
    date?: string;
    image?: string;
    actions?: string;
    notificationType?: string;
    emailTitle?: string;
    emailSubtitle?: string;
    emailSubject?: string;
    emailContent?: string;
  };

  const stripHtml = (html: string): string => {
    if (!html || typeof html !== 'string') return '';

    return html.replace(/<[^>]*>/g, '').trim();
  };

  // Backend creates one record per recipient (zone×user×driver) - dedupe to show one per send
  const deduplicateNotifications = (records: any[]): any[] => {
    if (!Array.isArray(records) || records.length === 0) return records;
    const seen = new Set<string>();

return records.filter((record) => {
      const title = record.title ?? record.emailTitle ?? record.emailSubject ?? '';
      const subTitle = record.subTitle ?? record.emailSubtitle ?? record.emailContent ?? '';
      const message = record.message ?? '';
      const date = record.createdAt ?? record.created_at ?? record.date ?? record.timestamp ?? '';
      const key = `${String(title)}|${String(subTitle)}|${String(message)}|${String(date).slice(0, 19)}`;

      if (seen.has(key)) return false;
      seen.add(key);

      return true;
    });
  };

  const normalizeNotificationData = (staticGroup: any): any[] => {
    if (!staticGroup) return [];

    const arr = Array.isArray(staticGroup)
      ? staticGroup
      : (staticGroup.results ?? staticGroup.data ?? []);


return Array.isArray(arr) ? deduplicateNotifications(arr) : [];
  };

  // Fuzzy filter for searching
  const fuzzyFilter: FilterFn<PushNotificationType> = (row, columnId, filterValue) => {

    const cellValue = row.getValue(columnId);

    return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
  };

  // Debounced input component
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

  const columnHelper = createColumnHelper<PushNotificationType>();

  const PushNotificationTable = ({ staticGroup, dictionary }: { staticGroup: PushNotificationType[]; dictionary: any }) => {
    const [pushNotificationOpen, setPushNotificationOpen] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState<any[]>(() => normalizeNotificationData(staticGroup));

    useEffect(() => {
      setData(normalizeNotificationData(staticGroup));
    }, [staticGroup]);

    const [globalFilter, setGlobalFilter] = useState('');
    const [deletePushNotificationIndex, setDeletePushNotificationIndex] = useState<number | null>(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const { checkDemoStatus } = useIsDemoUser();

    const handleDeleteClick = (index: number) => {

      if (checkDemoStatus()) {
       toast.error(dictionary['navigation'].deleteError);

        return;
        }

      setDeletePushNotificationIndex(index);
      setDeleteConfirmationOpen(true);
    };

    const handleConfirmDelete = async (confirmed: boolean) => {
      if (confirmed && deletePushNotificationIndex !== null) {
        try {

          const notificationToDelete = data[deletePushNotificationIndex];

          await deleteByNotificationId(notificationToDelete.id);

          setData(prevData => prevData.filter(notification => notification.id !== notificationToDelete.id));

        } catch (error) {
          console.error("Error deleting push notification:", error);
        }
      }

      // Reset the state after deletion or cancellation
      setDeletePushNotificationIndex(null);
      setDeleteConfirmationOpen(false);
    };

    const columns = useMemo<ColumnDef<PushNotificationType, any>[]>(() => [
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
            {row.original.notificationType === 'email'
              ? (dictionary['navigation'].email ?? 'Email')
              : (dictionary['navigation'].push ?? 'Push')}
          </Typography>
        ),
      },
      columnHelper.accessor('title', {
        header: dictionary['navigation'].title,
        cell: ({ row }) => {
          const isEmail = row.original.notificationType === 'email';

          const raw = isEmail
            ? (row.original.emailTitle ?? row.original.emailSubject ?? row.original.title ?? '')
            : (row.original.title ?? '');

          const displayTitle = stripHtml(raw);

          return <Typography className='font-medium'>{displayTitle}</Typography>;
        },
      }),
      columnHelper.accessor('subTitle', {
        header: dictionary['navigation'].subTitle,
        cell: ({ row }) => {
          const isEmail = row.original.notificationType === 'email';

          const raw = isEmail
            ? (row.original.emailSubtitle ?? row.original.emailContent ?? row.original.subTitle ?? '')
            : (row.original.subTitle ?? '');

          const displaySubtitle = stripHtml(raw);

          return <Typography className='font-medium'>{displaySubtitle}</Typography>;
        },
      }),
      columnHelper.accessor('date', {
        header: dictionary['navigation'].date,
        cell: () => {
          const today = new Date();
          const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${today.toLocaleString('default', { month: 'short' })}-${today.getFullYear().toString().slice(-2)}`;

          return <Typography className='font-medium'>{formattedDate}</Typography>;
        },
      }),

    // columnHelper.accessor('image', {
    //     header: dictionary['navigation'].image,
    //     cell: ({ row }) => (
    //       <img
    //         src={row.original.image ? `${BASE_IMAGE_URL}${row.original.image}` : ''}
    //         style={{ width: '100px', height: '30px', borderRadius: '4px' }}
    //         alt={row.original.title}
    //       />
    //     ),
    //   }),
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
    ], [ dictionary,handleDeleteClick]);

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

    const handleCloseDialog = () => {
      setPushNotificationOpen(false);
    };

    return (
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter}
            onChange={value => setGlobalFilter(String(value))}
            placeholder={dictionary['navigation'].search}
          />
          <div className='flex items-center gap-x-4'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='flex-auto'
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='PushNotification_Export'
              dictionary={dictionary}
            />
            <div className='flex items-center gap-x-4'>
              <Button
                variant='contained'
                onClick={() => setPushNotificationOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].AddPushNotification}
              </Button>
            </div>
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
              {table?.getFilteredRowModel()?.rows?.length === 0 ? (
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
        <AddPushNotificationDialog
          open={pushNotificationOpen}
          handleClose={handleCloseDialog}
          dictionary={dictionary}
          setData={setData}
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

  export default PushNotificationTable;
