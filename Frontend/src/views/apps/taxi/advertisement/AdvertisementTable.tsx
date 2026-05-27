/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';

import { useParams } from 'next/navigation';


import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import Switch from '@mui/material/Switch';

import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';

import { MenuItem, Button, Typography, Card, Dialog, DialogActions, DialogContent } from '@mui/material';

import classnames from 'classnames';

import { StatusCodes as httpStatus } from 'http-status-codes';
import { toast } from 'react-toastify';

import { BASE_IMAGE_URL } from '@apis/endpoint';


import CustomTextField from '@core/components/mui/TextField';

import ConfirmationDialog from '@components/dialogs/delete-data/';
import tableStyles from '@core/styles/table.module.css';

import OptionMenu from '@core/components/option-menu';
import { deleteAdvertisementById, updateAdvertisementStatus, getAdvertisementsWithPagination } from '@apis/advertisement';

import AddAdvertisementDrawer from './AddEditDrawer';
import ExportOptions from '@/utils/ExportOptions';

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

const fuzzyFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);
 
  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

const columnHelper = createColumnHelper<any>();

const AdvertisementTable = ({ staticGroup, dictionary }: { staticGroup: any, dictionary: any }) => {
  const [addAdvertisementOpen, setAddAdvertisementOpen] = useState(false);
  const [editData, setEditData] = useState<any | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteAdvertisementId, setDeleteAdvertisementId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusAdvertisement, setStatusAdvertisement] = useState<any | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(staticGroup.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(staticGroup.totalResults);
  const [data, setData] = useState<any[]>(staticGroup.results);
  const [pageSize, setPageSize] = useState(staticGroup.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');
  const { zoneId } = useParams();

  const handleStatusToggle = async (advertisement: any) => {


    setStatusAdvertisement(advertisement);
    setStatusConfirmationOpen(true);
  };

const handleConfirmStatus = async (confirmed: boolean) => {
  if (confirmed && statusAdvertisement) {
    const updatedAdvertisement = { ...statusAdvertisement, status: !statusAdvertisement.status };

    try {
      const response = await updateAdvertisementStatus(statusAdvertisement.id.toString(), { status: updatedAdvertisement.status }, zoneId);
       
      
      if (response && response.success) {
        setData(prevData => {
          return prevData.map(advertisement =>
            advertisement.id === statusAdvertisement.id ? updatedAdvertisement : advertisement
          );
        });
        toast.success(dictionary['navigation'].statusUpdatedSuccessfully);
      } else {
        // Show error in dialog for conflicts, toast for other errors
        const errorMessage = response?.message || 'Error updating advertisement status';
        
        if (errorMessage.includes('already exists')) {
          setErrorMessage(errorMessage);
          setErrorDialogOpen(true);
        } else {
          toast.error(errorMessage);
        }
      }
      
      setStatusConfirmationOpen(false);
      setStatusAdvertisement(null);
    } catch (error) {
      console.error('Failed to update advertisement status:', error);
      toast.error('Network error occurred. Please try again.');
      setStatusConfirmationOpen(false);
      setStatusAdvertisement(null);
    }
  } else {
    setStatusConfirmationOpen(false);
    setStatusAdvertisement(null);
  }
};


  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('title', {
        header: dictionary['navigation'].title || 'Title',
        cell: ({ row }) => (
          <>
            <Typography className='font-medium'>{row.original.title}</Typography>
            <Typography
              variant='body2'
              className='text-wrap'
              style={{ color: 'green' }}
            >
              {row.original.zoneName}
            </Typography>
          </>
        ),
      }),
      columnHelper.accessor('userType', {
        header: dictionary['navigation'].userType || 'User Type',
        cell: ({ row }) => (
          <Typography className='font-medium capitalize'>{row.original.userType}</Typography>
        ),
      }),
      columnHelper.accessor('isPermanent', {
        header: dictionary['navigation'].Type,
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {row.original.isPermanent}
          </Typography>
        ),
      }),
          columnHelper.accessor('image', {
        header: dictionary['navigation'].image,
        cell: ({ row }) => (
          <img
            src={`${BASE_IMAGE_URL}${row.original.image}`}
            style={{ width: '100px', height: '30px', borderRadius: '4px' }}
          />
        ),
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].Status,
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
        header: dictionary['navigation'].actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: dictionary['navigation'].Edit,
                  icon: 'tabler-pencil-minus',
                  menuItemProps: {
                    onClick: () => handleEditClick(row.original),
                  },
                },
                {
                  text: dictionary['navigation'].Delete,
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => handleDeleteClick(row.original),
                  },
                }
              ]}
            />
          </div>
        ),
        enableSorting: false,
      },
    ],
   
    [data, dictionary, pageIndex, pageSize]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter as FilterFn<any>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEditClick = (rowData: any) => {

    
    setEditData(rowData);
    setAddAdvertisementOpen(true);
  };

  const handlePageChangeForAddRecord = () => {
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

    handlePageChange(dummyEvent, pageIndex - 1);
  };

  const handleDeleteClick = (original: any) => {


    setDeleteAdvertisementId(original.id);
    setDeleteConfirmationOpen(true);
  };

  const handlePagecurrentForAddRecord = () => {
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

    handlePageChange(dummyEvent, pageIndex);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteAdvertisementId) {
      try {
        const response = await deleteAdvertisementById(deleteAdvertisementId, zoneId);
        
        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        } else {
          if (data.length != 1) {
            setData(data.filter((advertisement) => advertisement.id !== deleteAdvertisementId));
            handlePagecurrentForAddRecord();
          } else {
            handlePageChangeForAddRecord();
          }
         
          toast.success(dictionary['navigation'].deleteSuccess || 'Advertisement deleted successfully');
        }

        setErrorData(response.status);
        setDeleteConfirmationOpen(false);
        setDeleteAdvertisementId(null);
      } catch (error) {
        toast.error(dictionary['navigation'].deleteError || 'An error occurred while deleting the advertisement');
      }
    } else {
      setDeleteConfirmationOpen(false);
      setDeleteAdvertisementId(null);
    }
  };

  const handleCloseDialog = () => {
    setAddAdvertisementOpen(false);
    setEditData(undefined);
  };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const result = await getAdvertisementsWithPagination(pageSearch, newPage, pageSize, zoneId);

      setData(result.results);
      setPageIndex(newPage);
      setTotalResults(result.totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value);

    const result = await getAdvertisementsWithPagination(pageSearch, 1, newPageSize, zoneId);

    setPageSize(newPageSize);
    setData(result.results);
    setTotalResults(result.totalResults);
    setPageIndex(0);
  };

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getAdvertisementsWithPagination(
          searchTerm,
          1,
          pageSize,
          zoneId
        );

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(0);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [pageSize, zoneId]
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
              fileName='Advertisement_Export'
              dictionary={dictionary}
            />
            <Button
              variant='contained'
              onClick={() => setAddAdvertisementOpen(true)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].AddAdvertisement || 'Add Advertisement'}
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
            {table.getFilteredRowModel().rows.length === 0 ? (
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
    .rows
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
  component={() => (
    <TablePaginationComponent
      table={table}
      totalResults={totalResults}   // ✅ use state value
      pageIndex={pageIndex === 0 ? pageIndex + 1 : pageIndex}
      pageSize={pageSize}
      handlePageChange={handlePageChange}
      handlePageSizeChange={handlePageSizeChange}
      dictionary={dictionary}
    />
  )}
  count={totalResults}   // ✅ important
  page={pageIndex}
  onPageChange={handlePageChange}
  rowsPerPage={pageSize}
  onRowsPerPageChange={handlePageSizeChange}
/>
      </Card>
      <AddAdvertisementDrawer
        open={addAdvertisementOpen}
        handleClose={handleCloseDialog}
        advertisementData={data}
        dictionary={dictionary}
        setData={setData}
        editData={editData}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        zoneId={zoneId}
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
          <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
          <Typography variant="h4" className="mbe-2">
            {dictionary['navigation'].Error}
          </Typography>
          <Typography color="text.primary">{errorMessage}</Typography>
        </DialogContent>
        <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
          <Button variant="contained" color="error" onClick={() => setErrorDialogOpen(false)}>
            {dictionary['navigation'].OK}
          </Button> 
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdvertisementTable;
