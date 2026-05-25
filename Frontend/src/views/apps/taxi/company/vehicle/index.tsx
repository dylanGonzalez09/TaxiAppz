/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent} from 'react';
import { useCallback, useMemo, useState, useEffect } from 'react';

import '@tanstack/table-core';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import classnames from 'classnames';
import type { RankingInfo } from '@tanstack/match-sorter-utils';
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

import { toast } from 'react-toastify';

import Switch from '@mui/material/Switch';

import { useIsDemoUser } from '@/utils/demoUser'

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/CustomTablePaginationComponent';
import tableStyles from '@core/styles/table.module.css';
import { 
  deleteCompanyVehicleById, 
  getCompanyVehiclesWithPagination, 
  updateCompanyVehicleStatus 
} from '@apis/companyVehicle';

import AddCompanyVehicleDrawer from './AddCompanyVehicle';
import ExportOptions from '@/utils/ExportOptions';
import ConfirmationDialog from '@/components/dialogs/delete-data';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export type CompanyVehicleType = {
  _id?: string;
  registrationNumber?: string;
  color?: string;
  seatingCapacity?: string | number;
  companyId?: string | number;
  vehicleId?: string | number;
  vehicleModelId?: string | number;
  status?: string;
  active?: boolean;
  companyName?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleName?: string;
  vehicleModelName?: string;

};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });
  
return itemRank.passed;
};

const columnHelper = createColumnHelper<CompanyVehicleType>();

const CompanyVehicleTable = ({ tableData, dictionary }: { tableData?: any, dictionary: any}) => {
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<CompanyVehicleType | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusVehicle, setStatusVehicle] = useState<CompanyVehicleType | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(tableData?.totalResults || 0);
  const [data, setData] = useState(tableData?.results || []);
  const [pageSize, setPageSize] = useState(tableData?.limit || 10);

  const { isDemoUser, checkDemoStatus } = useIsDemoUser();

  // Initialize data from props on component mount
  useEffect(() => {
    if (tableData) {
      setData(tableData.results || []);
      setTotalResults(tableData.totalResults || 0);
      setPageSize(tableData.limit || 10);
      setPageIndex(tableData.page || 1);
    }
  }, [tableData]);

  const handleEditClick = (rowData: any) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation']?.editError || 'Edit operation not allowed in demo mode');
      
return;
    }

    setEditVehicle(rowData);
    setAddVehicleOpen(true);
  };

  const handleDeleteClick = (vehicleId: any) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation']?.deleteError || 'Delete operation not allowed in demo mode');
      
return;
    }

    setDeleteVehicleId(vehicleId);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteVehicleId) {
      try {
        await deleteCompanyVehicleById(deleteVehicleId);
        setDeleteConfirmationOpen(false);
        setDeleteVehicleId(null);

        if (data.length !== 1) {
          setData((prevData: any[]) => prevData.filter(vehicle => vehicle._id !== deleteVehicleId));
          handlePagecurrentForAddRecord();
        } else {
          handlePageChangeForAddRecord();
        }
        
        toast.success(dictionary['navigation']?.deleteSuccess || 'Vehicle deleted successfully');
      } catch (error) {
        toast.error(dictionary['navigation']?.deleteError || 'Failed to delete vehicle');
      }
    } else {
      setDeleteConfirmationOpen(false);
      setDeleteVehicleId(null);
    }
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

  const handleStatusToggle = async (vehicle: CompanyVehicleType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation']?.editError || 'Edit operation not allowed in demo mode');
      
return;
    }

    setStatusVehicle(vehicle);
    setStatusConfirmationOpen(true);
  };

const handleConfirmStatus = async (confirmed: boolean) => {
  if (confirmed && statusVehicle) {
    const updatedStatus = !statusVehicle.active;

    try {
      if (statusVehicle._id) {
        await updateCompanyVehicleStatus(statusVehicle._id.toString(), updatedStatus);

        // Update local data after successful API call
        setData((prevData: any[]) =>
          prevData.map(vehicle =>
            vehicle._id === statusVehicle._id
              ? { ...vehicle, active: updatedStatus }
              : vehicle
          )
        );

        toast.success(dictionary['navigation']?.statusUpdatedSuccessfully || 'Status updated successfully');
      } else {
        console.error('Vehicle ID is undefined');
      }
    } catch (error) {
      console.error('Failed to update vehicle status:', error);
      toast.error(dictionary['navigation']?.statusUpdateError || 'Failed to update status');
    }
  }

  // Reset confirmation dialog state
  setStatusConfirmationOpen(false);
  setStatusVehicle(null);
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

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getCompanyVehiclesWithPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
      toast.error(dictionary['navigation']?.fetchError || "Failed to fetch page data");
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value);

    try {
      const { results, totalResults } = await getCompanyVehiclesWithPagination(pageSearch, pageIndex, newPageSize);

      setPageSize(newPageSize);
      setData(results);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error changing page size:", error);
      toast.error(dictionary['navigation']?.pageSizeError || "Failed to change page size");
    }
  };

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getCompanyVehiclesWithPagination(
          searchTerm,
          1, // Reset to first page on new search
          pageSize
        );

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(1); // Reset to first page
      } catch (error) {
        console.error("Error fetching search results:", error);
        toast.error(dictionary['navigation']?.searchError || "Failed to search");
      }
    },
    [pageSize, dictionary]
  );

  const columns = useMemo<ColumnDef<CompanyVehicleType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation']?.serialNo || 'No.',
        cell: ({ row }) => (
          <Typography>{(pageIndex === 1 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('registrationNumber', {
        header: dictionary['navigation']?.registrationNumber || 'Registration Number',
        cell: ({ row }) => <Typography className='font-medium' color='text.primary'>{row.original.registrationNumber}</Typography>
      }),
      columnHelper.accessor('color', {
        header: dictionary['navigation']?.color || 'Color',
        cell: ({ row }) => <Typography>{row.original.color}</Typography>
      }),
      columnHelper.accessor('seatingCapacity', {
        header: dictionary['navigation']?.seatingCapacity || 'Seating Capacity',
        cell: ({ row }) => <Typography>{row.original.seatingCapacity}</Typography>
      }),

      columnHelper.accessor('vehicleType', {
        header: dictionary['navigation']?.vehicleType || 'Vehicle Type',
        cell: ({ row }) => <Typography>{row.original.vehicleName}</Typography>
      }),
      columnHelper.accessor('vehicleModel', {
        header: dictionary['navigation']?.vehicleModel || 'Vehicle Model',
        cell: ({ row }) => <Typography>{row.original.vehicleModelName}</Typography>
      }),
       columnHelper.accessor('status', {
           header: dictionary['navigation'].Status,
           cell: ({ row }) => (
             <div className='flex items-center gap-3'>
               <Switch
                 checked={row.original.active}
                 onChange={() => handleStatusToggle(row.original)} // Toggle status on switch change
                 color={row.original.active ? 'success' : 'error'} // Use 'success' for active, 'error' for inactive
                 sx={{
                   '& .MuiSwitch-switchBase': {
                     color: row.original.active ? 'green' : 'red', // Color for unchecked state
                   },
                   '& .MuiSwitch-switchBase.Mui-checked': {
                     color: row.original.active ? 'green' : 'red', // Color for checked state
                   },
                   '& .MuiSwitch-thumb': {
                     backgroundColor: 'white', // Inner knob color
                   },
                   '& .MuiSwitch-track': {
                     backgroundColor: row.original.active ? 'green' : 'red', // Track color
                   },
                 }}
               />
             </div>
           ),
         }),
      {
        id: 'actions',
        header: dictionary['navigation']?.actions || 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: dictionary['navigation']?.edit || 'Edit',
                  icon: 'tabler-pencil-minus',
                  menuItemProps: { onClick: () => handleEditClick(row.original) }
                },
                {
                  text: dictionary['navigation']?.delete || 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => handleDeleteClick(row.original._id)
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    [data, pageIndex, pageSize, dictionary, handleEditClick, handleDeleteClick, handleStatusToggle]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
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
          <div className='flex items-center gap-x-4'>
            <CustomTextField
              variant="outlined"
              placeholder={dictionary['navigation']?.search || "Search..."}
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
              fileName='Company_Vehicles_Export'
              dictionary={dictionary}
            />
            <Button
              variant='contained'
              onClick={() => {
                setEditVehicle(null);
                setAddVehicleOpen(true);
              }}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation']?.addNewVehicle || 'Add New Vehicle'}
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto' id="table-container">
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
              {data.length === 0 ? (
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {dictionary['navigation']?.noDataAvailable || 'No data available'}
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
        {/* Pagination */}
        <TablePagination
          component={() => <TablePaginationComponent
            table={table}
            totalResults={totalResults}
            pageIndex={pageIndex}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            dictionary={dictionary}
          />}
          count={totalResults}
          page={pageIndex - 1}
          onPageChange={(e, page) => handlePageChange(e, page + 1)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />
      </Card>
      <AddCompanyVehicleDrawer
        open={addVehicleOpen}
        setOpen={setAddVehicleOpen}
        data={data}
        setData={setData}
        dictionary={dictionary}
        handleClose={() => setAddVehicleOpen(false)}
        editVehicle={editVehicle}
        setEditVehicle={setEditVehicle}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
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

export default CompanyVehicleTable;