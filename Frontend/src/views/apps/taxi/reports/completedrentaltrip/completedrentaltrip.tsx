'use client';

import React, { useState, useMemo, useEffect } from 'react';

import { useParams } from 'next/navigation';

import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import {createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card , Link } from '@mui/material';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import Tooltip from '@mui/material/Tooltip'

import { getLocalizedUrl } from '@/utils/i18n';
import type { Locale } from '@configs/i18n';

import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import ExportOptions from '@/utils/ExportOptions';
import tableStyles from '@core/styles/table.module.css';
import TableFilters from '../TableFilters'

type CompletedRentalTripType = {
  requestNumber: string;
  driverName: string;
  userId?: string;
  _id: string;
  serviceType: string;
  customerName: string;
  contactNumber: string;
  startTime: string;
  driverId: string;
  startLocation: string;
  endTime: string;
  endLocation: string;
  basePrice: string;
  waitingCharges: string;
  promoBonus: string;
  serviceTax: string;
  distanceCharges: string;
  totalCharges: string;
  driverAmount: string;
};

const fuzzyFilter: FilterFn<CompletedRentalTripType> = (row, columnId, filterValue) => {
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

const columnHelper = createColumnHelper<CompletedRentalTripType>();

const CompletedRentalTripTable = ({ staticGroup, dictionary,zoneId }: { staticGroup: CompletedRentalTripType[], dictionary: any,zoneId:any }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<CompletedRentalTripType[]>(staticGroup);
  const [globalFilter, setGlobalFilter] = useState('');
  const { lang: locale } = useParams();


  useEffect(() => {
  setData(staticGroup);
}, [staticGroup]);

  const columns = useMemo<ColumnDef<CompletedRentalTripType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
 columnHelper.accessor('requestNumber', {
      header: dictionary['navigation'].requestNumber,
     cell: ({ row }) => (
            <div className='flex items-center gap-2'>
              <Typography
                component={Link}
                href={getLocalizedUrl(`${zoneId}/apps/taxi/request/requestView/${row.original._id}`, locale as Locale)}
                color='primary'
              >{`#${row.original.requestNumber}`}</Typography>
            </div>
          ),
        }),
    columnHelper.accessor('driverName', {
      header: dictionary['navigation'].driverName,
      cell: ({ row }) => 
    <Typography
      component={row.original.userId ? Link : 'span'}  
      href={row.original.userId ? getLocalizedUrl(`${zoneId}/apps/taxi/driver/view/${row.original.driverId}`, locale as Locale) : undefined}
      color="primary"
    > 

      {`${row.original.driverName?? ""} `}
    </Typography>
        }),
    columnHelper.accessor('serviceType', {
      header: dictionary['navigation'].serviceType,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.serviceType}</Typography>,
    }),
    columnHelper.accessor('customerName', {
      header: dictionary['navigation'].customerName,
      cell: ({ row }) => <Typography
      component={row.original.userId ? Link : 'span'}  
      href={row.original.userId ? getLocalizedUrl(`${zoneId}/apps/taxi/user/view/${row.original.userId}`, locale as Locale) : undefined}
      color="primary"
    > 

      {`${row.original.customerName?? ""} `}
    </Typography>,    }),
    columnHelper.accessor('contactNumber', {
      header: dictionary['navigation'].contactNumber,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.contactNumber}</Typography>,
    }),
    columnHelper.accessor('startTime', {
      header: dictionary['navigation'].startTime,
      cell: ({ row }) => {
        const startTime = new Date(row.original.startTime);

        
return <Typography className='font-medium'>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>;
      },
    }),
  
    columnHelper.accessor('startLocation', {
      header: dictionary['navigation'].startLocation,
      cell: ({ row }) => {
        const address = row.original.startLocation;
        const truncatedAddress = address.length > 15 ? address.substring(0, 15) + '...' : address;
    
        return (
          <Tooltip title={address} arrow>
            <Typography>{truncatedAddress}</Typography>
          </Tooltip>
        );
      }
    }),
    columnHelper.accessor('endTime', {
      header: dictionary['navigation'].endTime,
      cell: ({ row }) => {
        const endTime = row.original.endTime ? new Date(row.original.endTime) : null;

        
return (
          <Typography className='font-medium'>
            {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </Typography>
        );
      },
    }),

    columnHelper.accessor('endLocation', {
      header: dictionary['navigation'].endLocation,
      cell: ({ row }) => {
        const address = row.original.endLocation;
        const truncatedAddress = address.length > 15 ? address.substring(0, 15) + '...' : address;
    
        return (
          <Tooltip title={address} arrow>
            <Typography>{truncatedAddress}</Typography>
          </Tooltip>
        );
      }
    }),

    // Continue the rest of the fields as before

    columnHelper.accessor('basePrice', {
      header: dictionary['navigation'].basePrice,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.basePrice}</Typography>,
    }),
    columnHelper.accessor('waitingCharges', {
      header: dictionary['navigation'].waitingCharges,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.waitingCharges}</Typography>,
    }),
    columnHelper.accessor('promoBonus', {
      header: dictionary['navigation'].promoBonus,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.promoBonus}</Typography>,
    }),
    columnHelper.accessor('serviceTax', {
      header: dictionary['navigation'].serviceTax,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.serviceTax}</Typography>,
    }),
    columnHelper.accessor('distanceCharges', {
      header: dictionary['navigation'].distanceCharges,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.distanceCharges}</Typography>,
    }),
    columnHelper.accessor('totalCharges', {
      header: dictionary['navigation'].totalCharges,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.totalCharges}</Typography>,
    }),
    columnHelper.accessor('driverAmount', {
      header: dictionary['navigation'].driverAmount,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.driverAmount}</Typography>,
    }),
   
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
      <TableFilters setData={setData} filterData={staticGroup} dictionary={dictionary} />

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

export default CompletedRentalTripTable;
