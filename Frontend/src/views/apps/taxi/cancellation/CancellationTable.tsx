/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback,useEffect } from 'react';


import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { useReactTable, createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import Switch from '@mui/material/Switch';
import { MenuItem, Button, Typography, Card } from '@mui/material';
import classnames from 'classnames';

import { toast } from 'react-toastify';

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import tableStyles from '@core/styles/table.module.css';

import { useIsDemoUser } from '@/utils/demoUser'

import { deleteByCancellationId, getCancellationByPagination, updateCancellationStatus } from '@apis/cancellationReason';

import AddCancellationDialog from './AddEditDrawer';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import ExportOptions from '@/utils/ExportOptions';


import TablePaginationComponent from '@/components/CustomTablePaginationComponent';



interface CancellationDataType {
  id: string;
  reason: string;
  tripStatus: string;
  userType: string;
  language: string;
  payStatus:string;
  status: boolean;
}

const fuzzyFilter: FilterFn<CancellationDataType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);

  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};


const columnHelper = createColumnHelper<CancellationDataType>();


const CancellationTable = ({ dictionary,
  CancellationData,
  langId,
  fetchTabContent
}: {
  dictionary: any;
  CancellationData: any;
  langId: string;
  fetchTabContent: (langId: string, search?: string,page?: number, limit?: number) => Promise<void>; }) => {




  const [rowSelection, setRowSelection] = useState({});
  const [addCancellationOpen, setAddCancellationOpen] = useState(false);
  const [editData, setEditData] = useState<CancellationDataType | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteCancellationId, setDeleteCancellationId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusCancellation, setStatusCancellation] = useState<CancellationDataType | null>(null);


  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(CancellationData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(CancellationData.totalResults); // To track the total number of records
  const [data, setData] = useState(CancellationData.results);
  const [pageSize, setPageSize] = useState(CancellationData.limit);


  useEffect(() => {
    setData(CancellationData.results);
    setTotalResults(CancellationData.totalResults);
    setPageSize(CancellationData.limit);
    setPageIndex(CancellationData.page - 1);
  }, [CancellationData]);
  const { checkDemoStatus } = useIsDemoUser();


  const columns = useMemo<ColumnDef<CancellationDataType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => (
        <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      ),
    },
    columnHelper.accessor('reason', {
      header: dictionary['navigation'].cancellationReason || 'Cancellation Reason',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.reason}</Typography>,
    }),
        columnHelper.accessor('userType', {
      header: dictionary['navigation'].userType || 'user Type',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.userType}</Typography>,
    }),
           columnHelper.accessor('payStatus', {
      header: dictionary['navigation'].payStatus|| 'Pay Status',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.payStatus}</Typography>,
    }),
          columnHelper.accessor('tripStatus', {
      header: dictionary['navigation'].tripStatus|| 'TripStatus',
      cell: ({ row }) => <Typography className='font-medium'>{row.original.tripStatus}</Typography>,
    }),
    columnHelper.accessor('status', {
      header: dictionary['navigation'].Status,
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
      ),
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

  const handleEditClick = (rowData: CancellationDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setAddCancellationOpen(true);
  };

  const handleDeleteClick = (original: CancellationDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeleteCancellationId(original.id);
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
    if (confirmed && deleteCancellationId) {
      try {
        await deleteByCancellationId(deleteCancellationId);

        if (data.length != 1) {
          setData((prevData: any[]) => prevData.filter(reason => reason.id !== deleteCancellationId));
          handlePagecurrentForAddRecord();
        } else {
          handlePageChangeForAddRecord();
        }
      } catch (error) {
        console.error("Error deleting Cancellation:", error);
      }
    }

    setDeleteConfirmationOpen(false);

    setDeleteCancellationId(null);
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


  const handleStatusToggle = async (rowData: CancellationDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusCancellation(rowData);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusCancellation) {
      const updatedCancellation = { ...statusCancellation, status: !statusCancellation.status };

      try {
        await updateCancellationStatus(statusCancellation.id.toString(), { status: updatedCancellation.status });
        setData((prevData: any[]) => prevData.map(reason => (reason.id === statusCancellation.id ? updatedCancellation : reason)));
               toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

      } catch (error) {
        console.error('Failed to update Cancellation status:', error);
      }
    }

    setStatusConfirmationOpen(false);
    setStatusCancellation(null);
  };






  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      // const { results, totalResults } = await getByCancellationByPagination(pageSearch, newPage, pageSize);


      // setData(results);
      setPageIndex(newPage);
      await fetchTabContent(langId, pageSearch,newPage + 1, pageSize);
      
      // setTotalResults(totalResults);
  
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    // const { results, totalResults } = await getByCancellationByPagination(pageSearch, 1, newPageSize);


    // const { results, totalResults } = await getByCancellationByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    
    await fetchTabContent(langId,pageSearch, 1, newPageSize );
    
    // setData(results);
    // setTotalResults(totalResults);
   
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        // const result = await getByCancellationByPagination(
        //   searchTerm,
        //   1, // Reset to first page on new search
        //   pageSize
        // );


        setPageSearch(searchTerm);
        
        setGlobalFilter(searchTerm);
        await fetchTabContent(langId,searchTerm, 1, pageSize);
        
        // setData(result.results);
        // setTotalResults(result.totalResults);
       
        setPageIndex(0); // Reset to first page
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [langId,pageSize]
  );





  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>

          {/* start pagination */}

          <div className='flex items-center gap-x-4'>
            <CustomTextField
              variant="outlined"
              placeholder={dictionary['navigation'].Search}
              value={globalFilter}
              onChange={(e) => {
                const searchTerm = e.target.value;


                // setGlobalFilter(searchTerm);
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
              fileName='Cancellation_Export'
              dictionary={dictionary}

            />
            {(
              <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setAddCancellationOpen(true)}>
                {dictionary['navigation'].Add}
              </Button>
            )}
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

        {/* start pagination */}
        <TablePagination
          component={() => <TablePaginationComponent
            table={table}  // Pass the table object
            totalResults={CancellationData.totalResults}  // Pass the total results
            pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex}  // Current page index
            pageSize={pageSize}  // Current page size
            handlePageChange={handlePageChange}  // Page change handler
            handlePageSizeChange={handlePageSizeChange}  // Page size change handler
            dictionary={dictionary}  // Pass the dictionary for localization
          />}
          count={CancellationData.totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />


        {/* <TablePagination
          component='div'
          count={CancellationData.totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        /> */}
        </Card>


        {/* end pagination */}

        <AddCancellationDialog
          open={addCancellationOpen}
          handleClose={() => {
            setAddCancellationOpen(false);
            setEditData(null);
          }}
          cancellationData={data}
          dictionary={dictionary}
          editData={editData}
          setData={setData}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          langId={langId}
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

export default CancellationTable;
