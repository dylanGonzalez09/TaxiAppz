/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useMemo, useEffect } from 'react';

import type { TextFieldProps } from '@mui/material/TextField';

import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';

import Switch from '@mui/material/Switch'; // Import the Switch component

import { MenuItem, Button, Typography, Card } from '@mui/material';
import { toast } from 'react-toastify';

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import ConfirmationDialog from '../../../../components/dialogs/delete-data';
import tableStyles from '@core/styles/table.module.css';
import { useIsDemoUser } from '@/utils/demoUser' 

import { BASE_IMAGE_URL } from '@apis/endpoint';
import ExportOptions from '@/utils/ExportOptions';
import AddIntroDrawer from './AddEditDrawer';
import { deleteIntroById, updateIntroStatus } from '@/app/api/apps/taxi/intro';


interface IntroType {
  id: string;
  image: string;
  status: boolean;
  title: string;
  description?: string;
  type: string;
}

const fuzzyFilter: FilterFn<IntroType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);


  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />;
};


const columnHelper = createColumnHelper<IntroType>();

const IntroTable = ({ staticData, dictionary }: { staticData: any[], dictionary: any}) => {
  const [addIntroOpen, setAddIntroOpen] = useState(false);
  const [editData, setEditData] = useState<IntroType | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<IntroType[]>(staticData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteIntroId, setDeleteIntroId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusIntro, setStatusIntro] = useState<IntroType | null>(null);

  const handleStatusToggle = async (intro: IntroType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);
      
    return;  
      }

    setStatusIntro(intro);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusIntro) {
      const updatedVehicle = { ...statusIntro, status: !statusIntro.status };

      try {
        await updateIntroStatus(statusIntro.id.toString(), { status: updatedVehicle.status });

        setData(prevData => {
          return prevData.map(vehicle =>
            vehicle.id === statusIntro.id ? updatedVehicle : vehicle
          );
        });
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        setStatusConfirmationOpen(false);
        setStatusIntro(null);
      } catch (error) {
        console.error('Failed to update user status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setStatusIntro(null);
    }
  };

  const columns = useMemo<ColumnDef<IntroType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
      },
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
    globalFilterFn: fuzzyFilter as FilterFn<IntroType>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { isDemoUser, checkDemoStatus } = useIsDemoUser();

  const handleEditClick = (rowData: IntroType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);
      
return;
    }

    setEditData(rowData);
    setAddIntroOpen(true);
  };

  const handleDeleteClick = (original: IntroType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);
      
return;
    }

    setDeleteIntroId(original.id);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteIntroId) {
      await deleteIntroById(deleteIntroId)
      setData(data.filter((intro) => intro.id !== deleteIntroId));
    }

    setDeleteConfirmationOpen(false);
    setDeleteIntroId(null);
  };

  const handleCloseDialog = () => {
    setAddIntroOpen(false);
    setEditData(undefined);
  };

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder={dictionary['navigation'].search}
          />
          <div className='flex items-center gap-x-4'>

            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className='flex-auto'
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='Vehicle_Export'
              dictionary={dictionary}

            />
          
              <Button
                variant='contained'
                onClick={() => setAddIntroOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].addImage}
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
                        <div
                          className={`flex items-center ${header.column.getIsSorted() ? 'cursor-pointer select-none' : ''}`}
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
                    {dictionary['navigation'].noData}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={row.getIsSelected() ? 'selected' : ''}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>
      <AddIntroDrawer
        open={addIntroOpen}
        handleClose={handleCloseDialog}
        vehicleData={data}
        
        dictionary={dictionary}
        setData={setData}
        editData={editData}
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

export default IntroTable;
