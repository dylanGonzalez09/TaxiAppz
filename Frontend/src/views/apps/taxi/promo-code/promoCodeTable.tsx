/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';


import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import Switch from '@mui/material/Switch'; // Import the Switch component


import { MenuItem, Button, Typography, Card, Dialog, DialogActions, DialogContent } from '@mui/material';
import classnames from 'classnames';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import ConfirmationDialog from '../../../../components/dialogs/delete-data/';

import ExportOptions from '@/utils/ExportOptions';
import AddPromoCodeModelDrawer from './AddEditDrawer';
import { deletePromoCodeById, updatePromoCodeStatus, getPromoWithPagination } from '@/app/api/apps/taxi/promoCode';
import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

interface PromoDataType {
  id: string;
  banner: string;
  description: string;
  zoneId: string;
  promoType: string;
  promoCodeType: string;
  userId: string[];
  promoCode: string;
  totalCount: number;
  promoReuseCount: number;
  targetAmount: number;
  amount: number;
  percentage: number;
  status: boolean;
  fromDate: string;
  toDate: string;
}

const fuzzyFilter: FilterFn<PromoDataType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);


  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

const columnHelper = createColumnHelper<PromoDataType>();

const PromoCodeTable = ({ promoData, dictionary }: { promoData: any, dictionary: any}) => {
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editData, setEditData] = useState<PromoDataType | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deletePromoId, setDeletePromoId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusVehicleModel, setStatusVehicleModel] = useState<PromoDataType | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(promoData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(promoData.totalResults); // To track the total number of records
  const [data, setData] = useState<PromoDataType[]>(promoData.results);
  const [pageSize, setPageSize] = useState(promoData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');

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


  const handleStatusToggle = async (vehiclemodel: PromoDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusVehicleModel(vehiclemodel);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusVehicleModel) {
      const updatedVehicleModel = { ...statusVehicleModel, status: !statusVehicleModel.status };

      try {
        await updatePromoCodeStatus(statusVehicleModel.id.toString(), { status: updatedVehicleModel.status });

        setData(prevData => {
          return prevData.map(vehiclemodel =>
            vehiclemodel.id === statusVehicleModel.id ? updatedVehicleModel : vehiclemodel
          );
        });
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        setStatusConfirmationOpen(false);
        setStatusVehicleModel(null);
      } catch (error) {
        console.error('Failed to update user status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setStatusVehicleModel(null);
    }
  };

  const columns = useMemo<ColumnDef<PromoDataType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('promoCodeType', {
        header: dictionary['navigation'].PromoType,
        cell: ({ row }) => <Typography className='font-medium'>{row.original.promoCodeType}</Typography>,
      }),
      columnHelper.accessor('targetAmount', {
        header: dictionary['navigation'].MinimumAmount,
        cell: ({ row }) => <Typography className='font-medium'>{row.original.targetAmount}</Typography>,
      }),
      columnHelper.accessor('promoCode', {
        header: dictionary['navigation'].PromoCode,
        cell: ({ row }) => <Typography className='font-medium'>{row.original.promoCode}</Typography>,
      }),
      columnHelper.accessor('fromDate', {
        header: dictionary['navigation'].FromDate,
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Date(row.original.fromDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        ),
      }),
      columnHelper.accessor('toDate', {
        header: dictionary['navigation'].ToDate,
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {new Date(row.original.toDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        ),
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].Status,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Switch
              checked={row.original.status}
              onChange={() => handleStatusToggle(row.original)} // Toggle status on switch change
              color={row.original.status ? 'success' : 'error'} // Use 'success' for active, 'error' for inactive
                disabled={!row.original.status}
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
                },
              ]}
            />
          </div>
        ),
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, dictionary]
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
    globalFilterFn: fuzzyFilter as FilterFn<PromoDataType>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const {  checkDemoStatus } = useIsDemoUser();

  const handleEditClick = (rowData: PromoDataType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setAddVehicleOpen(true);
  };

  const handleDeleteClick = (original: PromoDataType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeletePromoId(original.id);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deletePromoId) {
      try
      {
        const response = await deletePromoCodeById(deletePromoId);

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        }
        else
        {
          setData(data.filter((vehicle) => vehicle.id !== deletePromoId));
           handlePagecurrentForAddRecord()

        }

        setErrorData(response.status);
        setDeleteConfirmationOpen(false);
        setDeletePromoId(null);
      }
      catch (error) {
        toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthepromo);
      }
    }
    else
    {
      setDeleteConfirmationOpen(false);
      setDeletePromoId(null);
    }
  };

  const handleCloseDialog = () => {
    setAddVehicleOpen(false);
    setEditData(undefined);
  };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getPromoWithPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getPromoWithPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getPromoWithPagination(
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
              fileName='PromoCode_Export'
              dictionary={dictionary}

            />
              <Button
                variant='contained'
                onClick={() => setAddVehicleOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].addPromo}
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
            dictionary={dictionary} // Pass the dictionary prop
          />}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />
      </Card>
      <AddPromoCodeModelDrawer
        open={addVehicleOpen}
        handleClose={handleCloseDialog}
        promoData={data}
        dictionary={dictionary}
        setData={setData}
        editData={editData}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
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
    </>
  );
};

export default PromoCodeTable;
