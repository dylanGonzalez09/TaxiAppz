/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useCallback, useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import classnames from 'classnames';

// import Chip from '@mui/material/Chip'
import type { RankingInfo } from '@tanstack/match-sorter-utils';
import { toast } from 'react-toastify';
import { StatusCodes as httpStatus } from 'http-status-codes';
import { Dialog, DialogActions, DialogContent,IconButton, Link  } from '@mui/material';

import { rankItem } from '@tanstack/match-sorter-utils';
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

import Switch from '@mui/material/Switch'; // Import the Switch component

import { useIsDemoUser } from '@/utils/demoUser' 

import ConfirmationDialog from '@/components/dialogs/delete-data';
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

// Import the ConfirmationDialog component

import AddDispatcherDrawer from './addEditDispatcher';
import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/CustomTablePaginationComponent';
import tableStyles from '@core/styles/table.module.css';
import { deleteByUserId } from '@apis/user';
import ExportOptions from '@/utils/ExportOptions';
import { deleteDispatcherById, getDispatcherByPagination, updateDispatcherStatus } from '@/app/api/apps/taxi/dispatcher';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export type DispatcherType = {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  language?: string;
  location?: string;
  status?: boolean;
  serviceType?: string[];
  image?: FileList | null; // Make categoryImage optional
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

  return itemRank.passed;
};


const columnHelper = createColumnHelper<DispatcherType>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DispatcherTable = ({ dispatcherData, dictionary }: { dispatcherData?: any, dictionary: any }) => {
  const [addDispatcherOpen, setAddDispatcherOpen] = useState(false);
  const [editDispatcher, setEditDispatcher] = useState<DispatcherType | null>(null); // Add state for editing
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteDispatcherId, setdeleteDispatcherId] = useState<string | null>(null); // Ensure type consistency
  const [deleteuserIds, setdeleteuserId] = useState<string | null>(null); // Ensure type consistency
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusDispatcher, setstatusDispatcher] = useState<DispatcherType | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(dispatcherData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(dispatcherData.totalResults); // To track the total number of records
  const [data, setData] = useState(dispatcherData.results);
  const [pageSize, setPageSize] = useState(dispatcherData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');
  const { isDemoUser, checkDemoStatus } = useIsDemoUser();


  const handleEditClick = (rowData: any) => {
    if (checkDemoStatus()) {
        toast.error(dictionary['navigation'].editError);
      
      
      return;
      }

      setEditDispatcher(rowData);
      setAddDispatcherOpen(true);
      };

  const handleDeleteClick = (dispatcherId: any, userId: any) => {
    if (checkDemoStatus()) {
        toast.error(dictionary['navigation'].deleteError);
      
      return;
      }

    setdeleteDispatcherId(dispatcherId); 
    setdeleteuserId(userId);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteDispatcherId) {
      try {
        const response = await deleteDispatcherById(deleteDispatcherId);
        const response2 = await deleteByUserId(deleteuserIds || "");

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
          setErrorData(response.status)
        }
        else if (response2.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response2.msg);
          setErrorDialogOpen(true);
          setErrorData(response2.status)
        }
        else {
        setData((prevData: any[]) => prevData.filter(dispatcher => dispatcher.id.toString() !== deleteDispatcherId)); 
        toast.success("Driver deleted successfully"); // Convert id to string for comparison
        }

        setDeleteConfirmationOpen(false);
        setdeleteDispatcherId(null);
      } catch (error) {
        toast.error("An error occurred while deleting the admin");
      }
    } else {
      setDeleteConfirmationOpen(false);
      setdeleteDispatcherId(null);
    }
  };

  const handleStatusToggle = async (dispatcher: DispatcherType) => {
     if (checkDemoStatus()) {
          toast.error(dictionary['navigation'].editError);
          
        return;  
          }

    setstatusDispatcher(dispatcher);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusDispatcher) {
      const updatedDispatcher = { ...statusDispatcher, status: !statusDispatcher.status };

      try {
        const body = {
          status: !statusDispatcher.status,
        };

        await updateDispatcherStatus(statusDispatcher.id.toString(), body);

        // Assume you have this API function
        setData((prevData: any[]) =>
          prevData.map(dispatcher =>
            dispatcher.id === statusDispatcher.id ? updatedDispatcher : dispatcher
          )
        );
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        setStatusConfirmationOpen(false);
        setstatusDispatcher(null); // Clear the statusDispatcher after the operation
      } catch (error) {
        console.error('Failed to update dispatcher status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setstatusDispatcher(null); // Clear the statusDispatcher after the operation
    }
  };





  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getDispatcherByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getDispatcherByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getDispatcherByPagination(
          searchTerm,
          1, // Reset to first page on new search
          pageSize
        );

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(0); // Reset to first page
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [pageSize]
  );




  const columns = useMemo<ColumnDef<DispatcherType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('firstName', {
        header: 'Name',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.firstName}</Typography>
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cell: ({ row }) => <Typography>{"Dispatcher"}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Switch
              checked={row.original.status}
              onChange={() => handleStatusToggle(row.original)} // Toggle status on switch change
              color={row.original.status ? 'success' : 'error'} // Use 'success' for active, 'error' for inactive
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: row.original.status ? 'green' : 'red', // Color for unchecked state
                },
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: row.original.status ? 'green' : 'red', // Color for checked state
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: 'white', // Inner knob color
                },
                '& .MuiSwitch-track': {
                  backgroundColor: row.original.status ? 'green' : 'red', // Track color
                },
              }}
            />
          </div>
        )
      }),
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
               {
                  text: 'Edit',
                  icon: 'tabler-pencil-minus',
                  menuItemProps: {
                    onClick: () => handleEditClick(row.original),

                  }
                },
              {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => handleDeleteClick(row.original.id, row.original.userId)
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

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

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          {/* start pagination */}

          <div className='flex items-center gap-x-4'>
            <CustomTextField
              variant="outlined"
              placeholder="Search..."
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
              fileName='Dispatcher_Export'
              dictionary={dictionary}
            />

            
              <Button
                variant='contained'
                onClick={() => {
                  setEditDispatcher(null); // Clear editDispatcher to indicate adding mode
                  setAddDispatcherOpen(true);
                }}
                startIcon={<i className='tabler-plus' />}
              >
                Add New
              </Button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
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
                    No data available
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* start pagination */}
        <TablePagination
          component={() => <TablePaginationComponent
            table={table}  // Pass the table object
            totalResults={totalResults}  // Pass the total results
            pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex}  // Current page index
            pageSize={pageSize}  // Current page size
            handlePageChange={handlePageChange}  // Page change handler
            handlePageSizeChange={handlePageSizeChange}  // Page size change handler
            dictionary={dictionary} // Pass the dictionary prop
          />}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />

        {/* end pagination */}
      </Card>
      <AddDispatcherDrawer
        open={addDispatcherOpen}
        setOpen={setAddDispatcherOpen}
        data={data}
        setData={setData}
        handleClose={() => setAddDispatcherOpen(false)}
        editDispatcher={editDispatcher}
        setEditDispatcher={setEditDispatcher}
        dictionary={dictionary}
      />
      <ConfirmationDialogErrorHandle
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType="delete-data"
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}
        status={errorData}
      />

      <ConfirmationDialog
        open={statusConfirmationOpen}
        setOpen={setStatusConfirmationOpen}
        confirmationType="status-data"
        onConfirm={handleConfirmStatus}
        dictionary={dictionary}

      />

      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
              <DialogContent className="flex items-center flex-col text-center">
                {/* Error icon */}
                <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
                {/* Error title */}
                <Typography variant="h4" className="mbe-2">
                  Error
                </Typography>
                {/* Error message */}
                <Typography color="text.primary">{errorMessage}</Typography>
              </DialogContent>
              <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
                {/* OK button */}
                <Button variant="contained" color="error" onClick={() => setErrorDialogOpen(false)}>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
    </>
  );
};

export default DispatcherTable;
