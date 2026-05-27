/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';

import { useParams } from 'next/navigation';

import Link from 'next/link';

import classnames from 'classnames';

import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';


import { MenuItem, Button, Typography, Card , Dialog, DialogActions, DialogContent, IconButton } from '@mui/material';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser';


import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import { BASE_IMAGE_URL } from '@apis/endpoint';

import { deleteVehicleModelById, getVehicleModelByPagination } from '@apis/vehiclemodel';
import type { Locale } from '@configs/i18n';
import { getLocalizedUrl } from '@/utils/i18n';

import ConfirmationDialog from '@/components/dialogs/delete-data';
import AddVehicleDialog from './AddEditDrawer';
import ExportOptions from '@/utils/ExportOptions';
import TablePaginationComponent from '@/components/CustomTablePaginationComponent';
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

interface VehicleModelType {
  id: string;
  modelname: string;
  vehicleName: string;
  image: string;
  brandId: string;
  status: boolean;
  _id?: string;
}

const fuzzyFilter: FilterFn<VehicleModelType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);


  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

const columnHelper = createColumnHelper<VehicleModelType>();

const VehicleModelTable = ({ vehicleModelData, dictionary, zoneId}: { vehicleModelData: any, dictionary: any; zoneId:string}) => {
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editData, setEditData] = useState<VehicleModelType | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deletebrandId, setDeletebrandId] = useState<string | null>(null);

  const safeVehicleModelData = vehicleModelData ?? {};
  const initialPage = Number(safeVehicleModelData.page) > 0 ? Number(safeVehicleModelData.page) - 1 : 0;
  const initialPageSize = Number(safeVehicleModelData.limit) > 0 ? Number(safeVehicleModelData.limit) : 10;

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(Number(safeVehicleModelData.totalResults) || 0); // To track the total number of records
  const [data, setData] = useState<VehicleModelType[]>(safeVehicleModelData.results || []);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');

 const { id: brandId, lang: locale } = useParams() as { id: string; lang: string };

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
    handlePageChange(dummyEvent, pageIndex === 0 ? pageIndex + 1 : pageIndex);
  };




  const columns = useMemo<ColumnDef<VehicleModelType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('modelname', {
        header: dictionary['navigation'].modelname,
           cell: ({ row }) => (
                  <>
                    <Typography className='font-medium'>{row.original.modelname}</Typography>
                    <Typography
                      variant='body2'
                      className='text-wrap'
                      style={{ color: 'green' }}
                    >
                      {row.original.vehicleName}
                    </Typography>
                  </>
                ),
      }),
      columnHelper.accessor('image', {
        header: dictionary['navigation'].modelimage,
        cell: ({ row }) => (
          <img
            src={`${BASE_IMAGE_URL}/uploads/vehicleModels/${row.original.image}`}
            alt={row.original.modelname}
            style={{ width: '100px', height: '30px', borderRadius: '4px' }}
          />
        ),
      }),


      {
        id: 'actions',
        header: dictionary['navigation'].actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
             <IconButton>
              <Link
                href={getLocalizedUrl(`${zoneId}/apps/taxi/master/vehicle-variant/${row.original._id}`, locale as Locale)}
                className='flex'
              >
                <i className='tabler-arrow-right bg-primary' />
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
    globalFilterFn: fuzzyFilter as FilterFn<VehicleModelType>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEditClick = (rowData: VehicleModelType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].editError);
      
      return;
      }

    setEditData(rowData);
    setAddVehicleOpen(true);
  };

  const handleDeleteClick = (original: VehicleModelType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);
      
      return;
      }

    setDeletebrandId(original?._id ?? null);
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

    if (confirmed && deletebrandId) {
      try
      {
        const response = await deleteVehicleModelById(deletebrandId)
    
        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        } 
        else {
          if (data.length != 1) {
            setData(data.filter((vehicle) => vehicle.id !== deletebrandId));
            handlePagecurrentForAddRecord()
          } else {
            handlePageChangeForAddRecord();
          }
        }

        setErrorData(response.status);
        setDeleteConfirmationOpen(false);
        setDeletebrandId(null);
      }
      catch (error) {
        toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthevehiclemodel);
      }
    }
    else
    {
      setDeleteConfirmationOpen(false);
      setDeletebrandId(null);
    }
  };

  const handleCloseDialog = () => {
    setAddVehicleOpen(false);
    setEditData(undefined);
  };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getVehicleModelByPagination(brandId,pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getVehicleModelByPagination(brandId,pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getVehicleModelByPagination(
          brandId,
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
    [pageSize,brandId]
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
            {/* <Button
                variant='contained'
                startIcon={<i className='tabler-arrow-narrow-left' />}
                href={ getLocalizedUrl(`${zoneId}/apps/taxi/master/brand`, locale as Locale)}
              >
                {dictionary['navigation'].Back}
            </Button> */}
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='VehicleModel_Export'
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
            pageIndex={pageIndex === 0 ? pageIndex + 1 : pageIndex}  // Current page index
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
        brandId={brandId}
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

export default VehicleModelTable;
