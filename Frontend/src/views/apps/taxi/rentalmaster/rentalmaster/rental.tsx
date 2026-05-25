/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';

import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { useReactTable, createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import Switch from '@mui/material/Switch';
import { MenuItem, Button, Typography, Card,Dialog, DialogActions, DialogContent } from '@mui/material';
import classnames from 'classnames';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import tableStyles from '@core/styles/table.module.css';

import { deleteRentalById, getRentalWithPagination, updateRentalStatus } from '@apis/rental';

import AddRentalDialog from './AddEditDrawer';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import ExportOptions from '@/utils/ExportOptions';
import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

interface RentalDataType {
  _id: string;
  packageName: string;
  km: number;
  hour: number;
  Mile: number;
  countryId: string;
  zoneId: string;
  clientId: string;
  vehiclePrices: { vehicleId: string; price: number; minKmPrice: number }[];
  status: boolean;
}


const fuzzyFilter: FilterFn<RentalDataType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);

  // Convert both to strings for comparison
  return cellValue !== undefined && cellValue !== null &&
    cellValue.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
};



const columnHelper = createColumnHelper<RentalDataType>();

const RentalTable = ({ dictionary, RentalData,zone }: { dictionary: any; RentalData: any; zone: string }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [addRentalOpen, setAddRentalOpen] = useState(false);
  const [editData, setEditData] = useState<RentalDataType | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteRentalId, setDeleteRentalId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusRental, setStatusRental] = useState<RentalDataType | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(RentalData?.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(RentalData?.totalResults); // To track the total number of records
  const [data, setData] = useState(RentalData?.results);
  const [pageSize, setPageSize] = useState(RentalData?.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');
  const { checkDemoStatus } = useIsDemoUser();

  const columns = useMemo<ColumnDef<RentalDataType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => (
        <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      ),
    },
    columnHelper.accessor('hour', {
      header: dictionary['navigation'].Hour,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.hour}</Typography>,
    }),
    columnHelper.accessor('km', {
      header: dictionary['navigation']['Km/Mile'],
      cell: ({ row }) => <Typography className='font-medium'>{row.original.km}</Typography>,
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

          ].filter(Boolean)} // Removes falsy values (undefined, false, null, etc.)
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

  const handleEditClick = (rowData: RentalDataType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setAddRentalOpen(true);
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

  const handleDeleteClick = (original: RentalDataType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }


    setDeleteRentalId(original._id);
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
    if (confirmed && deleteRentalId) {
      try {
        const response = await deleteRentalById(deleteRentalId);

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        }
        else {
          if (data?.length != 1) {
            setData((prevData: any[]) => prevData.filter(question => question.id !== deleteRentalId));
            handlePagecurrentForAddRecord();
          } else {
            handlePageChangeForAddRecord();
          }
        }

        setErrorData(response.status);
        setDeleteConfirmationOpen(false);
        setDeleteRentalId(null);
      } catch (error) {
        toast.error(dictionary['navigation'].AnerroroccurredwhiledeletingtheRentalpackage);
      }
    }
    else
    {
      setDeleteConfirmationOpen(false);
      setDeleteRentalId(null);
    }
  };

  const handleStatusToggle = async (rowData: RentalDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusRental(rowData);
    setStatusConfirmationOpen(true);
  };


  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusRental) {
      const updatedRental = { ...statusRental, status: !statusRental.status };

      try {
        await updateRentalStatus(statusRental._id.toString(), { status: updatedRental.status });
        setData((prevData: any[]) => prevData.map(question => (question.id === statusRental._id ? updatedRental : question)));
                toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

      } catch (error) {
        console.error('Failed to update Invoice status:', error);
      }
    }

    setStatusConfirmationOpen(false);
    setStatusRental(null);
  };





  const handlePageChange = async (event: unknown, newPage: number) => {
    try {

      const { results, totalResults } = await getRentalWithPagination(zone,pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getRentalWithPagination(zone,pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getRentalWithPagination(
          zone,
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
              fileName='Rental_Export'
              dictionary={dictionary}

            />
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setAddRentalOpen(true)}>
              {dictionary['navigation'].Add}
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
            {table.getFilteredRowModel().rows?.length === 0 ? (
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

        <AddRentalDialog
          open={addRentalOpen}
          handleClose={() => {
            setAddRentalOpen(false);
            setEditData(null); // Reset edit data when closing
          }}
          rentalData={data}

          // Pass current rental data
          dictionary={dictionary} // Pass dictionary for localization
          editData={editData} // Pass the data for editing
          setData={setData} // Function to update the data after adding or editing rental
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          zoneId={zone} // Pass the zone prop
        />

        <ConfirmationDialogErrorHandle
          open={deleteConfirmationOpen}
          setOpen={setDeleteConfirmationOpen} // Set function to close the dialog
          confirmationType="delete-data" // Specify the type of confirmation (delete in this case)
          onConfirm={handleConfirmDelete} // Pass the delete handler to be called on confirmation
          dictionary={dictionary} // Pass dictionary for localization
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
                        {dictionary['navigation'].Error}
                      </Typography>
                      {/* Error message */}
                      <Typography color="text.primary">{errorMessage}</Typography>
                    </DialogContent>
                    <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
                      {/* OK button */}
                      <Button variant="contained" color="error" onClick={() => setErrorDialogOpen(false)}>
                        {dictionary['navigation'].OK}
                      </Button>
                    </DialogActions>
              </Dialog>
      </Card>
    </>
  );
};

export default RentalTable;
