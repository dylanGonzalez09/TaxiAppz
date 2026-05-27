/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';

import Card from '@mui/material/Card';

import CardHeader from '@mui/material/CardHeader';
import TablePagination from '@mui/material/TablePagination';

import type {
  Row
} from '@tanstack/react-table';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

import { fetchUserRequestData } from '@/app/api/apps/taxi/request';

import CustomTextField from '@core/components/mui/TextField';

import TablePaginationComponent from '@components/TablePaginationComponent';

import tableStyles from '@core/styles/table.module.css';

import { getLocalizedUrl } from '@/utils/i18n';

import type { Locale } from '@/configs/i18n';

// Define request data type
type requestDataType = {
  _id: string;
  requestNumber: string;
  totalAmount: number;
  pickAddress: string;
  dropAddress: string;
  status: string;
};

interface RequestTripTabProps {
  userId: string;
  requestData: requestDataType[];
  dictionary: any;
}

// Create a column helper
const columnHelper = createColumnHelper<requestDataType>();

const RequestTable = ({ userId, requestData, dictionary }: RequestTripTabProps) => {
  const { lang: locale, zoneId } = useParams();
  const zoneIdString = Array.isArray(zoneId) ? zoneId[0] : zoneId;

  // State Variables
  const [data, setData] = useState<requestDataType[]>(requestData || []);
  const [globalFilter, setGlobalFilter] = useState<string>('');

  // Define Table Columns
  const columns = useMemo(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].SL,
        cell: ({ row }: { row: Row<requestDataType> }) => <Typography>{row.index + 1}</Typography>
      },
      columnHelper.accessor('requestNumber', {
        header: dictionary['navigation'].RequestNumber,
        cell: ({ row }) => (
          <Link href={getLocalizedUrl(`${zoneIdString}/apps/taxi/request/requestView/${row.original._id}`, locale as Locale)} className="flex">
            <Typography color="primary" className="cursor-pointer hover:underline">
              {row.original.requestNumber}
            </Typography>
          </Link>
        ),
      }),

      columnHelper.accessor('pickAddress', {
        header: dictionary['navigation'].PickupLocation,
        cell: ({ row }) => {
          const address = row.original.pickAddress;
          const truncatedAddress = address?.length > 15 ? address?.substring(0, 15) + '...' : address;

          return (
            <Tooltip title={address} arrow>
              <Typography>{truncatedAddress}</Typography>
            </Tooltip>
          );
        }
      }),
      columnHelper.accessor('dropAddress', {
        header: dictionary['navigation'].DropLocation,
        cell: ({ row }) => {
          const address = row.original.dropAddress;
          const truncatedAddress = address?.length > 15 ? address?.substring(0, 15) + '...' : address;

          return (
            <Tooltip title={address} arrow>
              <Typography>{truncatedAddress}</Typography>
            </Tooltip>
          );
        }
      }),

      columnHelper.accessor('totalAmount', {
        header: dictionary['navigation'].TotalAmount,
        cell: ({ row }) => <Typography>{row.original.totalAmount ? row.original.totalAmount.toFixed(2) : '0.00'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].Status,
        cell: ({ row }) => {
          const chipColor =
            row.original.status === 'Completed' || row.original.status === 'completed'
              ? 'success'
              : row.original.status === 'In Progress'
              ? 'warning'
              : 'error';

          return <Chip label={dictionary['navigation'][row.original.status]} color={chipColor} variant="tonal" size="small" />;
        }
      })
    ],
    [zoneIdString, locale, dictionary]
  );

  // React Table Instance
  const table = useReactTable<requestDataType>({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: () => true,
    }
  });

  return (
    <Card>
      <CardHeader title={`${dictionary['navigation'].RequestList} (${data.length ?? 0})`} />
      <div className="p-6">
        <CustomTextField
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={dictionary['navigation'].SearchRequest}
        />
      </div>
      <div className="overflow-x-auto" id="table-container">
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  {dictionary['navigation'].Nodataavailable}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
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
        onRowsPerPageChange={(event) => table.setPageSize(Number(event.target.value))}
      />
    </Card>
  );
};

export default RequestTable;
