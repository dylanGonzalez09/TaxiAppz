/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type { ChangeEvent} from 'react';
import React, { useState, useMemo, useCallback, useEffect } from 'react';

import Link from 'next/link';

import { useParams } from 'next/navigation'

import TablePagination from '@mui/material/TablePagination';

import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { useReactTable, createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import Switch from '@mui/material/Switch';

import { toast } from 'react-toastify';

import Chip from '@mui/material/Chip'



import { MenuItem, Button, Typography, Card } from '@mui/material';

import classnames from 'classnames';



import { format } from 'date-fns';

import { FilterList } from '@mui/icons-material';

import type { Locale } from '@configs/i18n'

import { useIsDemoUser } from '@/utils/demoUser'

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import tableStyles from '@core/styles/table.module.css';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import ExportOptions from '@/utils/ExportOptions';
import AddTicketDialog from './AddEditDrawer'

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';
import { deleteByTicketId, fetchAdmins, getByTicketByPagination, updateTicketStatus } from '@/app/api/apps/taxi/ticket';


import { getLocalizedUrl } from '@/utils/i18n';


interface TicketDataType {
  userDetails: any;
  userName: string;
  assignedToName: string;
  userRoleName: string;
  id: string;
  title: string;
  description: string;
  userId: string;
  assignedTo: string;
  user_type: string;
  status: 'open' | 'In-Progress' | 'Action-Taken' | 'closed';
createdAt: string;
notes?: string;
updatedAt: string;
}


// Define the statusOrder object outside the column definition to make it accessible
const statusOrder = {
  open: 1,


  'In-Progress': 2,
  'Action-Taken': 3,
  closed: 4,
};

const fuzzyFilter: FilterFn<TicketDataType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);

  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};


const columnHelper = createColumnHelper<TicketDataType>();

const TicketTable = ({ dictionary, ticketData,zoneId }: { dictionary: any; ticketData: any,zoneId:any }) => {
  const { lang: locale } = useParams()
  const [rowSelection, setRowSelection] = useState({});
  const [addTicketOpen, setAddTicketOpen] = useState(false);
  const [editData, setEditData] = useState<TicketDataType | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusTicket, setStatusTicket] = useState<TicketDataType | null>(null);


  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(ticketData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(ticketData.total); // To track the total number of records
  const [data, setData] = useState(ticketData.results);
  const [pageSize, setPageSize] = useState(ticketData.limit);
  const [Status, setStatus] = useState<string>('All')

    const filtermaps = [
    { name: 'All', value: 'All' },
    { name: 'Open', value: 'open' },
    { name: 'In-Progress', value: 'In-Progress' },
    { name: 'Action-Taken', value: 'Action-Taken' },
    { name: 'Closed', value: 'closed' }
  ]


  const formatDate = (date: any) => {
    if (!date) return '-'; // Handle undefined or null date

return format(new Date(date), 'dd/MM/yyyy HH:mm'); // Format date to a more readable form
  };


  const columns = useMemo<ColumnDef<TicketDataType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => (
        <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      ),
    },
    columnHelper.accessor('title', {
      header: dictionary['navigation'].Title,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.title}</Typography>,
    }),

    columnHelper.accessor('userName', {
      header: dictionary['navigation'].User,
      cell: ({ row }) => (
        <div>

     <Link href={getLocalizedUrl(`${zoneId}/apps/taxi/user/view/${row.original.userId}`, locale as Locale)} className='flex'>

            <Typography color="primary" className="cursor-pointer hover:underline">
              {row.original.userName}
            </Typography>
          </Link>
          <Typography className="font-extrasmall text-gray-500 text-xs">
            {row.original.userRoleName}
          </Typography>

        </div>

      ),
    }),


    columnHelper.accessor('createdAt', {
      header: dictionary['navigation'].CreatedAt,
      cell: ({ row }) => <Typography className="font-medium">{formatDate(row.original.createdAt)}</Typography>,
    }),


    columnHelper.accessor('assignedToName', {
      header: dictionary['navigation'].TakenBy,
      cell: ({ row }) => (
        <Typography className='font-medium'>
          {row.original.assignedToName ? row.original.assignedToName : 'Not yet taken'}
        </Typography>
      ),
    }),

    columnHelper.accessor('updatedAt', {
      header: dictionary['navigation'].UpdatedAt,
      cell: ({ row }) => <Typography className='font-medium'>{formatDate(row.original.updatedAt)}</Typography>, // Format updatedAt
    }),


    columnHelper.accessor('status', {
      header: dictionary['navigation'].Status,
      cell: ({ row }) => {
        const status = row.original.status;

        const statusColorMapping: { [key: string]: 'success' | 'warning' | 'error' | 'info' } = {
          open: 'info',
          'In-Progress': 'warning',
          'Action-Taken': 'success',
          closed: 'error',
        };

        return (
          <Chip
            label={dictionary['navigation'] [status]}
            color={statusColorMapping[status] || 'default'} // Use color based on status
            variant="tonal"
            size="small"
          />
        );
      },
    }),

    {
      id: 'actions',
      header: dictionary['navigation'].Actions,
      cell: ({ row }) => (
        <OptionMenu
          iconButtonProps={{ size: 'medium' }}
          iconClassName='text-textSecondary'
          options={[
            {
              text: dictionary['navigation'].Edit,
              icon: 'tabler-pencil-minus',
              menuItemProps: { onClick: () => handleEditClick(row.original) },
            },
            {
              text: dictionary['navigation'].Delete,
              icon: 'tabler-trash',
              menuItemProps: { onClick: () => handleDeleteClick(row.original) },
            },
          ].filter(Boolean)}
        />
      ),
      enableSorting: false,
    },
  ], [data, dictionary]);

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const { isDemoUser, checkDemoStatus } = useIsDemoUser();

  const handleEditClick = (rowData: TicketDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setAddTicketOpen(true);
  };

  const handleDeleteClick = (original: TicketDataType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeleteTicketId(original.id);
    setDeleteConfirmationOpen(true);
  };

  const handlePagecurrentForAddRecord = () => {
    // Create a dummy event object
    const dummyEvent = {
      target: {
        value: pageIndex,
      },
      currentTarget: {
        value: pageIndex,
      },
      nativeEvent: {} as Event,
      bubbles: false,
    } as unknown as ChangeEvent<unknown>;

    // Trigger onPageChange with the new page
    handlePageChange(dummyEvent, pageIndex);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteTicketId) {
      try {
        deleteByTicketId(deleteTicketId);

        if (data.length != 1) {
          setData((prevData: any[]) => prevData.filter(title => title.id !== deleteTicketId));
          handlePagecurrentForAddRecord();
        } else {
          handlePageChangeForAddRecord();
        }
      } catch (error) {
        console.error("Error deleting ticket:", error);
      }
    }

    setDeleteConfirmationOpen(false);

    setDeleteTicketId(null);
  };

  const handlePageChangeForAddRecord = () => {
    // Create a dummy event object
    const dummyEvent = {
      target: {
        value: pageIndex,
      },
      currentTarget: {
        value: pageIndex,
      },
      nativeEvent: {} as Event,
      bubbles: false,
    } as unknown as ChangeEvent<unknown>;

    // Trigger onPageChange with the new page
    handlePageChange(dummyEvent, pageIndex - 1);
  };


  const handleStatusToggle = async (rowData: TicketDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusTicket(rowData);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusTicket) {
      const updatedTicket = { ...statusTicket, status: !statusTicket.status };

      try {
        await updateTicketStatus(statusTicket.id.toString(), { status: updatedTicket.status });
        setData((prevData: any[]) => prevData.map(title => (title.id === statusTicket.id ? updatedTicket : title)));
               toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

      } catch (error) {
        console.error('Failed to update Ticket status:', error);
      }
    }

    setStatusConfirmationOpen(false);
    setStatusTicket(null);
  };


  const handleFilterChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || 'All'

    setStatus(value)

    const response = await getByTicketByPagination(pageSearch, 1, pageSize, value,zoneId)

    if (!response) return

    const { results = [], total = 0 } = response

    setData(results)
    setTotalResults(total)
    setPageIndex(0)
  }



  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, total } = await getByTicketByPagination(pageSearch, newPage, pageSize,Status, zoneId);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(total);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, total } = await getByTicketByPagination(pageSearch, 1, newPageSize,Status,zoneId);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(total);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getByTicketByPagination(
          searchTerm,
          1, // Reset to first page on new search
          pageSize,
          Status,
          zoneId
        );

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.total);
        setPageIndex(0); // Reset to first page
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [pageSize]
  );





  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>



          <div className='flex items-center gap-x-4'>
            <CustomTextField
              variant="outlined"
              placeholder={dictionary['navigation'].Search}
              value={globalFilter}
              onChange={(e) => {
                const searchTerm = e.target.value;

                setGlobalFilter(searchTerm);
                handleSearch(searchTerm);
              }}
              className="flex-auto"
            />
          </div>

          {/* end pagination */}

          <div className='flex items-center gap-x-4'>
            <CustomTextField select value={Status} onChange={(e: any) => handleFilterChange(e)} className='flex-auto'>
              {filtermaps.map((f, index) => (
                <MenuItem key={index} value={f.value}>
                  {f.name}
                </MenuItem>
              ))}
            </CustomTextField>

            <CustomTextField
              select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e)}
              className='flex-auto'
            >
              {[5, 10, 15, 25].map(size => (
                <MenuItem key={size} value={size}>{size}</MenuItem>
              ))}
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='Ticket_Export'
              dictionary={dictionary}

            />
            {/* {(
              <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setAddTicketOpen(true)}>
                Add
              </Button>
            )} */}
          </div>
        </div>
        <div className='overflow-x-auto' id="table-container">
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='tabler-chevron-up text-xl' />,
                              desc: <i className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel()?.rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {dictionary['navigation'].Nodataavailable}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map((row) => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            )}
          </table>
        </div>

      <TablePagination
             component={() => <TablePaginationComponent
               table={table}  // Pass the table object
               totalResults={totalResults}  // Pass the total results
               pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex}  // Current page index
               pageSize={pageSize}  // Current page size
               handlePageChange={handlePageChange}  // Page change handler
               handlePageSizeChange={handlePageSizeChange}  // Page size change handler
               dictionary={dictionary}


             />}
             count={totalResults}
             page={pageIndex}
             onPageChange={handlePageChange}
             rowsPerPage={pageSize}
             onRowsPerPageChange={handlePageSizeChange}
           />
        {/* end pagination */}

        <AddTicketDialog
          open={addTicketOpen}
          handleClose={() => {
            setAddTicketOpen(false);
            setEditData(null);
          }}
          ticketData={data}
          editData={editData}
          setData={setData}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          dictionary={dictionary}
          zoneId={zoneId}
          isSuperAdmin={ticketData.isSuperAdmin}
        />
        <ConfirmationDialog
          open={deleteConfirmationOpen}
          setOpen={setDeleteConfirmationOpen}
          confirmationType="delete-data"
          onConfirm={handleConfirmDelete}
          dictionary={dictionary}


        />
        <ConfirmationDialog
          open={statusConfirmationOpen}
          setOpen={setStatusConfirmationOpen}
          confirmationType="status-data"
          onConfirm={handleConfirmStatus}
          dictionary={dictionary}

        />
      </Card>
    </>
  );
};


export default TicketTable;
