/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import { useMemo, useState, useCallback,useEffect } from 'react';

import Link from 'next/link'
import { useParams } from 'next/navigation'

import '@tanstack/table-core';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';

import type { RankingInfo } from '@tanstack/match-sorter-utils';

import { rankItem } from '@tanstack/match-sorter-utils';


import IconButton from '@mui/material/IconButton'
import { toast } from 'react-toastify';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import Switch from '@mui/material/Switch';
import classnames from 'classnames';

import type { Locale } from '@configs/i18n'

import { useIsDemoUser } from '@/utils/demoUser'

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

import AddClientDrawer from './AddClientDrawer';
import { getLocalizedUrl } from '@/utils/i18n'
import ExportOptions from '@/utils/ExportOptions';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import type { ClientType } from '@/types/apps/clientTypes';
import { deleteByClientId, getClientByPagination,updateClientStatus } from '@/app/api/apps/taxi/democlient';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

  return itemRank.passed;
};



// Sample Data
const columnHelper = createColumnHelper<ClientType>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ClientTable = ({ tableData, dictionary }: { tableData: any, dictionary: any }) => {
  const [currentStatus, setCurrentStatus] = useState<'All' | 'Active' | 'Block'>('All');
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [editClient, setEditClient] = useState<ClientType | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusClient, setstatusClient] = useState<ClientType | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteClientId, setdeleteClientId] = useState<string | null>(null);


  const [pageIndex, setPageIndex] = useState(tableData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(tableData.totalResults); // To track the total number of records
  const [data, setData] = useState(tableData.results);
  const [pageSize, setPageSize] = useState(tableData.limit);
  const [searchInput, setSearchInput] = useState('');
  const { isDemoUser, checkDemoStatus } = useIsDemoUser();

  const handleEditClick = (rowData: any) => {
    // if (checkDemoStatus()) {
    //   toast.error(dictionary['navigation'].editError);

    //   return;
    //   }

      setEditClient(rowData);
      setAddClientOpen(true);
  };

  const handleDeleteClick = (clientId: any) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setdeleteClientId(clientId);

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

  const handleConfirmDelete = async (confirmed: boolean) => {

    if (confirmed && deleteClientId) {
      try {
        await deleteByClientId(deleteClientId);
        setDeleteConfirmationOpen(false);
        setdeleteClientId(null);

        if (data.length != 1) {
          setData((prevData: any[]) => prevData.filter(client => client._id !== deleteClientId));
          handlePagecurrentForAddRecord();       // Convert id to string for compariso
        } else {
          handlePageChangeForAddRecord();
        }
      } catch (error) {
        console.log("error", error);

        // Handle error (e.g., show an error message)
      }
    } else {
      setDeleteConfirmationOpen(false);
      setdeleteClientId(null);
    }
  };


  const handleStatusToggle = async (client: any) => {
    setstatusClient(client);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusClient && statusClient._id) {

      const updatedClient = { ...statusClient, status: !statusClient.status };

      try {
        await updateClientStatus(statusClient._id, { status: updatedClient.status })
        setData((prevData: any[]) =>
          prevData.map(client =>
            client._id === statusClient._id ? updatedClient : client
          )
        );
            toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        setStatusConfirmationOpen(false);
        setstatusClient(null);
      } catch (error) {
        // Handle error if updating status fails
        console.error('Failed to update client status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      // Close the confirmation dialog if action is not confirmed
      setStatusConfirmationOpen(false);
      setstatusClient(null);
    }
  };


  const handleConfirmEdit = async (client: ClientType) => {
    if (editClient) {
      try {
        // Dummy implementation for editing client
        setData((prevData: any[]) =>
          prevData.map(item =>
            item.id === editClient.id ? client : item
          )
        );
        setAddClientOpen(false);
        setEditClient(null);
      } catch (error) {
        console.error('Failed to update client:', error);
      }
    } else {
      try {
        // Dummy implementation for adding a new client
        setData((prevData: any) => [...prevData, client]);
        setAddClientOpen(false);
      } catch (error) {
        console.error('Failed to add client:', error);
      }
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();


    return `${month}/${day}/${year}`;
  };

  const { lang: locale } = useParams()

  const columns = useMemo<ColumnDef<ClientType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('Name', {
        header: dictionary['navigation'].name,
        cell: ({ row }) => <Typography className='font-medium' color='text.primary'>{row.original.Name}</Typography>
      }),

      columnHelper.accessor('Startdate', {
        header: dictionary['navigation'].startDate,
        cell: ({ row }) => {
          const startDate = row.original.Startdate ? new Date(row.original.Startdate) : null;


          return <Typography>{formatDate(startDate)}</Typography>;
        },
      }),
      columnHelper.accessor('Enddate', {
        header: dictionary['navigation'].endDate,
        cell: ({ row }) => {
          const endDate = row.original.Enddate ? new Date(row.original.Enddate) : null;


          return <Typography>{formatDate(endDate)}</Typography>;
        },
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].status,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Switch
              checked={row.original.status}
              onChange={() => handleStatusToggle(row.original)}
              color={row.original.status ? 'success' : 'error'}
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: row.original.status ? 'green' : 'red',
                },
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: row.original.status ? 'green' : 'red',
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: 'white',
                },
                '& .MuiSwitch-track': {
                  backgroundColor: row.original.status ? 'green' : 'red',
                },
              }}
            />
          </div>
        )
      }),
      {
        id: 'actions',
        header:dictionary['navigation'].actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            {/* <IconButton>
              <Link href={getLocalizedUrl(`/apps/taxi/client/view/${row.original._id}`, locale as Locale)} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton> */}
            {/* <IconButton>
              <Link href={getLocalizedUrl(`/apps/taxi/settings/${row.original._id}`, locale as Locale)} className='flex'>
                <i className='tabler-settings' />
              </Link>
            </IconButton> */}
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                // {
                //   text: 'Push',
                //   icon: 'tabler-bell-plus',
                //     href: getLocalizedUrl(`/apps/taxi/notification/${row.original._id}`, locale as Locale),
                //   linkProps: {
                //     className: 'flex items-center is-full plb-2 pli-4 gap-2 ',
                //   },
                // },
                {
                  text: dictionary['navigation'].edit,
                  icon: 'tabler-pencil-minus',
                  menuItemProps: {
                    onClick: () => handleEditClick(row.original),

                  }
                },

                // {
                //   text: 'Country',
                //   icon: 'tabler-world',
                //   href: getLocalizedUrl(`/apps/taxi/country/list/${row.original._id}`, locale as Locale),
                //   linkProps: {
                //     className: 'flex items-center is-full plb-2 pli-4 gap-2 ',
                //   },
                // },
                // {
                //   text: 'Language',
                //   icon: 'tabler-language',
                //   href: getLocalizedUrl(`/apps/taxi/language/list/${row.original._id}`, locale as Locale),
                //   linkProps: {
                //     className: 'flex items-center is-full plb-2 pli-4 gap-2 ',
                //   },
                // },
                {
                  text:  dictionary['navigation'].delete,
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => {
                      if (row.original._id !== undefined) {
                        handleDeleteClick(row.original._id.toString());
                      } else {
                        console.error('Client ID is undefined');
                      }
                    }
                  }

                }

              ].filter(option => option.text && option.icon)}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const displayData = useMemo(
    () =>
      data.filter((driver: { status: boolean }) => {
        if (currentStatus === 'Active' && driver.status !== true) return false;
        if (currentStatus === 'Block' && driver.status !== false) return false;

        // 'All' or any other case → show all
        return true;
      }),
    [data, currentStatus]
  );

  const table = useReactTable({
    data: displayData,
    columns,
    state: { rowSelection },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getClientByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getClientByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getClientByPagination(
          searchTerm,
          1,
          pageSize
        );

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(0);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [pageSize]
  );

  // Debounce search so typing feels fast and we don't call API on every key press
  useEffect(() => {
    const trimmed = searchInput.trim();

    const timer = setTimeout(() => {
      // Optional: only hit API after at least 2 characters or when cleared
      if (trimmed.length === 0 || trimmed.length >= 2) {
        handleSearch(trimmed);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchInput, handleSearch]);

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex items-center gap-x-4'>
            <CustomTextField
              variant="outlined"
              placeholder= {dictionary['navigation'].search}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              className="flex-auto"
            />
          </div>

          {/* end pagination */}

          <div className='flex items-center gap-x-4'>

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
              <CustomTextField
                select
                fullWidth
                value={currentStatus}
                onChange={e => setCurrentStatus(e.target.value as 'All' | 'Active' | 'Block')}
                className='is-[140px] flex-auto'
              >
                <MenuItem value='All'> {dictionary['navigation'].All}</MenuItem>
                <MenuItem value='Active'>{ dictionary['navigation'].active}</MenuItem>
                <MenuItem value='Block'>{ dictionary['navigation'].block}</MenuItem>
              </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='Client_Export'
              dictionary={dictionary}

            />
            <Button
              variant='contained'
              onClick={() => {
                setEditClient(null);
                setAddClientOpen(true);
              }}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].addNew}
            </Button>
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
            {displayData.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
                   {dictionary['navigation'].noDataFound}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.slice(0, table.getState().pagination.pageSize).map((row) => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}


          </table>
        </div>

        <TablePagination
          component={() => <TablePaginationComponent
            table={table}
            totalResults={totalResults}
            pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            dictionary={dictionary}
          />}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />

      </Card>
      <AddClientDrawer
        open={addClientOpen}
        setOpen={setAddClientOpen}
        data={data}
        setData={setData}
        handleClose={() => setAddClientOpen(false)}
        editClient={editClient}
        setEditClient={setEditClient}
        onConfirm={handleConfirmEdit} // Pass handleConfirmEdit as a prop
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        dictionary={dictionary}
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
    </>
  );
};

export default ClientTable;











