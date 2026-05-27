/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';

import Link from 'next/link'


import { useParams, useSearchParams } from 'next/navigation';

import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';


import { MenuItem, Button, Typography, Card , Dialog, DialogActions, DialogContent,IconButton } from '@mui/material';
import classnames from 'classnames';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser';

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import { BASE_IMAGE_URL } from '@apis/endpoint';

// Next Imports


import { deleteVehicleById, getVehiclesWithPagination } from '@apis/vehicle';

import AddVehicleDialog from './AddEditDrawer';

// import ConfirmationDialog from '@/components/dialogs/delete-data';

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

const VehicleTable = ({ staticData, dictionary, zoneId }: { staticData: any; dictionary: any; zoneId?: string }) => {
  const normalizedStaticData = {
    page: Number(staticData?.page) > 0 ? Number(staticData.page) : 1,
    totalResults: Number(staticData?.totalResults) >= 0 ? Number(staticData.totalResults) : 0,
    results: Array.isArray(staticData?.results) ? staticData.results : [],
    limit: Number(staticData?.limit) > 0 ? Number(staticData.limit) : 25,
  }

  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editData, setEditData] = useState<VehicleType | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const { lang: locale } = useParams();
  const searchParams = useSearchParams();
  const initialPage = Math.max(1, Number(searchParams?.get('page')) || normalizedStaticData.page || 1);

  const initialPageSize = Math.min(
    100,
    Math.max(5, Number(searchParams?.get('pageSize')) || normalizedStaticData.limit || 10)
  );

  const initialSearch = searchParams?.get('search') || '';

  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [pageSearch, setPageSearch] = useState(initialSearch);
  const [totalResults, setTotalResults] = useState(normalizedStaticData.totalResults); // To track the total number of records
  const [data, setData] = useState(normalizedStaticData.results);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');

  const { checkDemoStatus } = useIsDemoUser();
  const currentReturnPage = pageIndex > 0 ? pageIndex : 1;
  const returnQuery = `?returnPage=${currentReturnPage}&returnPageSize=${pageSize}&returnSearch=${encodeURIComponent(pageSearch)}`;


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
    handlePageChange(dummyEvent, Math.max(1, pageIndex - 1));
  };



  const columns = useMemo<ColumnDef<VehicleType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex - 1) * pageSize + row.index + 1}</Typography>,
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

      // columnHelper.accessor('capacity', {
      //   header: dictionary['navigation'].capacity,
      //   cell: ({ row }) => <Typography className='font-medium'>{row.original.capacity}</Typography>,
      // }),

      {
        id: 'actions',
        header: dictionary['navigation'].actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
                    {/* <Link
                      href={ getLocalizedUrl(`${zoneId}/apps/taxi/master/vehicle-model/${row.original.id}`, locale as Locale)}
                      className='flex'
                    > */}
                    <Link
                href={getLocalizedUrl(`${zoneId ? `/${zoneId}` : ''}/apps/taxi/master/brand/${row.original.id}${returnQuery}`, locale as Locale)}
                className='flex'
              >
                     <i className='tabler-arrow-right bg-primary ' />
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

  // const handleDeleteClick = (original: VehicleType) => {
  //   if (checkDemoStatus()) {
  //    toast.error(dictionary['navigation'].deleteError);
      
  //     return;
  //     }

  //   setDeleteVehicleId(original.id);
  //   setDeleteConfirmationOpen(true);
  // };

  

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
      const response = await getVehiclesWithPagination(pageSearch, newPage, pageSize);
      const results = Array.isArray(response?.results) ? response.results : [];
      const total = Number(response?.totalResults) >= 0 ? Number(response.totalResults) : 0;

      setData(results);
      setPageIndex(newPage);
      setTotalResults(total);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const response = await getVehiclesWithPagination(pageSearch, 1, newPageSize);
    const results = Array.isArray(response?.results) ? response.results : [];
    const total = Number(response?.totalResults) >= 0 ? Number(response.totalResults) : 0;

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(total);
    setPageIndex(1);
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
        setData(Array.isArray(result?.results) ? result.results : []);
        setTotalResults(Number(result?.totalResults) >= 0 ? Number(result.totalResults) : 0);
        setPageIndex(1); // Reset to first page
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
            pageIndex={pageIndex}  // Current page index
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
