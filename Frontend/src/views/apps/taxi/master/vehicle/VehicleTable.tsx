/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';


import { useParams } from 'next/navigation';

import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';

import Switch from '@mui/material/Switch'; // Import the Switch component

import { MenuItem, Button, Typography, Card , Dialog, DialogActions, DialogContent,IconButton, Link } from '@mui/material';
import classnames from 'classnames';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser';

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import { BASE_IMAGE_URL } from '@apis/endpoint';

// Next Imports


import { deleteVehicleById, updateVehicleStatus, getVehiclesWithPagination } from '@apis/vehicle';

import AddVehicleDialog from './AddEditDrawer';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

import ExportOptions from '@/utils/ExportOptions';

import type { Locale } from '@configs/i18n';
import { getLocalizedUrl } from '@/utils/i18n';

import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

interface VehicleType {
  id: string;
  vehicleName: string;
  image: string;
  highlightImage: string;
  capacity: number;
  category: string;
  sortOrder: number;
  serviceType: string;
  status: boolean;
}

const fuzzyFilter: FilterFn<VehicleType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);


  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

const columnHelper = createColumnHelper<VehicleType>();

const VehicleTable = ({ staticData, dictionary }: { staticData: any, dictionary: any}) => {
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editData, setEditData] = useState<VehicleType | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusVehicle, setStatusVehicle] = useState<VehicleType | null>(null);
   const { lang: locale } = useParams();

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(staticData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(staticData.totalResults); // To track the total number of records
  const [data, setData] = useState(staticData.results);
  const [pageSize, setPageSize] = useState(staticData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');

  const { checkDemoStatus } = useIsDemoUser();


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


  const handleStatusToggle = async (vehicle: VehicleType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusVehicle(vehicle);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusVehicle) {
      const updatedVehicle = { ...statusVehicle, status: !statusVehicle.status };

      try {
        await updateVehicleStatus(statusVehicle.id.toString(), { status: updatedVehicle.status });

        setData((prevData: any[]) => {
          return prevData.map(vehicle =>
            vehicle.id === statusVehicle.id ? updatedVehicle : vehicle
          );
        });
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        setStatusConfirmationOpen(false);
        setStatusVehicle(null);
      } catch (error) {
        console.error('Failed to update user status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setStatusVehicle(null);
    }
  };

  const columns = useMemo<ColumnDef<VehicleType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
      },
      columnHelper.accessor('vehicleName', {
        header: dictionary['navigation'].vehicleName,
        cell: ({ row }) => <Typography className='font-medium'>{row.original.vehicleName}</Typography>,
      }),
      columnHelper.accessor('image', {
        header: dictionary['navigation'].vehicleimage,
        cell: ({ row }) => (
          <img
            src={`${BASE_IMAGE_URL}/uploads/vehicles/${row.original.image}`}
            alt={row.original.vehicleName}
            style={{ width: '60px', height: '60px', borderRadius: '4px' }}
          />
        ),
      }),
      columnHelper.accessor('highlightImage', {
        header: dictionary['navigation'].imageHighlight,
        cell: ({ row }) => (
          <img
          src={`${BASE_IMAGE_URL}/uploads/vehicles/${row.original.highlightImage}`}
          alt={row.original.vehicleName}
            style={{ width: '60px', height: '60px', borderRadius: '4px' }}
          />
        ),
      }),
      columnHelper.accessor('capacity', {
        header: dictionary['navigation'].capacity,
        cell: ({ row }) => <Typography className='font-medium'>{row.original.capacity}</Typography>,
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
        )
      }),
      {
        id: 'actions',
        header: dictionary['navigation'].actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
                    <Link
                      href={ getLocalizedUrl(`/apps/taxi/master/vehicle-model/${row.original.id}`, locale as Locale)}
                      className='flex'
                    >
                      <i className='tabler-eye text-textSecondary' />
                    </Link>
                  </IconButton>
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
    globalFilterFn: fuzzyFilter as FilterFn<VehicleType>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEditClick = (rowData: VehicleType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setAddVehicleOpen(true);
  };

  const handleDeleteClick = (original: VehicleType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeleteVehicleId(original.id);
    setDeleteConfirmationOpen(true);
  };



  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteVehicleId) {
      try
      {
        const response = await deleteVehicleById(deleteVehicleId)

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        }
        else {
          if (data.length != 1) {
            setData(data.filter((vehicle: { id: string; }) => vehicle.id !== deleteVehicleId));
            handlePagecurrentForAddRecord()
          } else {
            handlePageChangeForAddRecord();
          }
        }

        setErrorData(response.status);
        setDeleteConfirmationOpen(false);
        setDeleteVehicleId(null);
      }
      catch (error) {
        toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthevehicle);
      }
    }
    else {
      setDeleteConfirmationOpen(false);
      setDeleteVehicleId(null);
    }
  };

  const handleCloseDialog = () => {
    setAddVehicleOpen(false);
    setEditData(undefined);
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

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getVehiclesWithPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getVehiclesWithPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getVehiclesWithPagination(
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
              fileName='Vehicle_Export'
              dictionary={dictionary}

            />
              <Button
                variant='contained'
                onClick={() => setAddVehicleOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].addvehicle}
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
      <AddVehicleDialog
        open={addVehicleOpen}
        handleClose={handleCloseDialog}
        vehicleData={data}
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

export default VehicleTable;
