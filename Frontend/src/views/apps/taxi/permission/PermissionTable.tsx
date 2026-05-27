/* eslint-disable import/no-unresolved */
'use client';

// React Imports
import type { ChangeEvent } from 'react';
import { useMemo, useState, useCallback } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import classnames from 'classnames';

import { rankItem } from '@tanstack/match-sorter-utils';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import type { RankingInfo } from '@tanstack/match-sorter-utils';

import { toast } from 'react-toastify';

import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import { useIsDemoUser } from '@/utils/demoUser' 

import { deleteByPermissionId, getPermissionWithPagination } from '@apis/permission';

import ConfirmationDialog from '../../../../components/dialogs/delete-data/'; // Import the ConfirmationDialog component

// Third-party Imports

// Component Imports



// Style Imports

import AddPermissionDialog from './AddPermissionDrawer';
import EditPermissionDialog from './EditPermissionDrawer';


import ExportOptions from '@/utils/ExportOptions';
import OptionMenu from '@/@core/components/option-menu';

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type permissionType = {
  id: string;
  groupName: string;
  permissionName: string;
};

type PermissionWithActionsType = permissionType & {
  actions?: string;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// Column Definitions
const columnHelper = createColumnHelper<PermissionWithActionsType>();

const PermissionTable = ({ permissionData, dictionary }: { permissionData: any, dictionary: any }) => {
  // States
  const [addPermissionOpen, setAddPermissionOpen] = useState(false);
  const [editData, setEditData] = useState<permissionType | undefined>(undefined);
  const [editPermissionOpen, setEditPermissionOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState({});


  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deletePermissionId, setDeletePermissionId] = useState<string | null>(null);



  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(permissionData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(permissionData.totalResults); // To track the total number of records
  const [data, setData] = useState(permissionData.results);
  const [pageSize, setPageSize] = useState(permissionData.limit);

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
  

  const columns = useMemo<ColumnDef<PermissionWithActionsType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('groupName', {
        header: dictionary['navigation'].groupName,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div>
              <Typography className='font-medium' color='text.primary'>
                {row.original.groupName}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('permissionName', {
        header: dictionary['navigation'].permissionName,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div>
              <Typography className='font-medium' color='text.primary'>
                {row.original.permissionName}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('actions', {
        header: dictionary['navigation'].actions,
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>

            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
               {
                  text: 'Edit',
                  icon: 'tabler-pencil-minus',
                  menuItemProps: {
                    onClick: () => handleEditClick(row.original),
                  },
                },
               {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => handleDeleteClick(row.original),
                  },
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const table = useReactTable({
    data: data as permissionType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 25
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  });
  
  const {  checkDemoStatus } = useIsDemoUser();

  const handleEditClick = (rowData: permissionType) => {
    if (checkDemoStatus()) {
    toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setEditPermissionOpen(true);
  };

  const handleDeleteClick = (original: permissionType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeletePermissionId(original.id);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deletePermissionId) {
      try {
        await deleteByPermissionId(deletePermissionId);

        if(data.length != 1){
          setData(data.filter((permission: { id: string; }) => permission.id !== deletePermissionId));
          handlePagecurrentForAddRecord();
        }else{
          handlePageChangeForAddRecord();
        }
      } catch (error) {
        // Handle error, e.g., show an error message
        console.error("Error deleting permission:", error);
      }
    }

    setDeleteConfirmationOpen(false);
    setDeletePermissionId(null);
  };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getPermissionWithPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getPermissionWithPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getPermissionWithPagination(
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
              fileName='Permission_Export'
              dictionary={dictionary}

            />
         
              <Button
                variant='contained'
                onClick={() => setAddPermissionOpen(!addPermissionOpen)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].addPermission}
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
                    No data available
                    {dictionary['navigation'].noDataAvailable}

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
      <AddPermissionDialog
        open={addPermissionOpen}
        permissionData={data}
        dictionary={dictionary}
        setData={setData}
        handleClose={() => setAddPermissionOpen(!addPermissionOpen)}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
      />
      <EditPermissionDialog
        open={editPermissionOpen}
        permissionData={data}
        setData={setData}
        dictionary={dictionary}
        handleClose={() => setEditPermissionOpen(false)}
        initialData={editData}
      />
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType="delete-data"
        onConfirm={handleConfirmDelete} // Pass handleConfirmDelete as onConfirm prop
        dictionary={dictionary}

      />
    </>
  );
};

export default PermissionTable;
