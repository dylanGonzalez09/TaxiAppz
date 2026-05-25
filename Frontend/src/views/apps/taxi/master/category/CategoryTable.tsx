/* eslint-disable import/no-unresolved */
// src/views/apps/taxi/master/category/CategoryTable.tsx
'use client';
import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';


import TablePagination from '@mui/material/TablePagination';
import Switch from '@mui/material/Switch'; // Import the Switch component

import classnames from 'classnames';

import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Button, Typography, Card , Dialog, DialogActions, DialogContent } from '@mui/material';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import OptionMenu from '@core/components/option-menu';
import { BASE_IMAGE_URL } from '@apis/endpoint';
import { deleteCategoryById, updateCategoryStatus, getByCategoryByPagination } from '@apis/category';

import type { CategoryType } from '@/types/apps/masterType';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import AddCategoryDialog from './AddEditDrawer';
import ExportOptions from '@/utils/ExportOptions';

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

const fuzzyFilter: FilterFn<CategoryType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);


  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};


const columnHelper = createColumnHelper<CategoryType>();

const CategoryTable = ({ Categories, dictionary }: { Categories: any, dictionary: any }) => {
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [editData, setEditData] = useState<CategoryType | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusCategory, setStatusCategory] = useState<CategoryType | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(Categories.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(Categories.totalResults); // To track the total number of records
  const [data, setData] = useState(Categories.results);
  const [pageSize, setPageSize] = useState(Categories.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');
  const { checkDemoStatus } = useIsDemoUser();

  const handleStatusToggle = async (category: CategoryType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusCategory(category);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusCategory) {
      const updatedCategory = { ...statusCategory, status: !statusCategory.status };

      try {
        await updateCategoryStatus(statusCategory.id.toString(), { status: updatedCategory.status });

        setData((prevData: any[]) => {
          return prevData.map(category =>
            category.id === statusCategory.id ? updatedCategory : category
          );
        });
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);


        setStatusConfirmationOpen(false);
        setStatusCategory(null);
      } catch (error) {
        console.error('Failed to update user status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setStatusCategory(null);
    }
  };

  const columns = useMemo<ColumnDef<CategoryType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
      },
      columnHelper.accessor('category', {
        header: dictionary['navigation'].category,
        cell: ({ row }) => (
          <>
            <Typography className='font-medium'>{row.original.category}</Typography>
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

      columnHelper.accessor('categoryImage', {
        header: dictionary['navigation'].categoryimage,
        cell: ({ row }) => (
          <img
          src={`${BASE_IMAGE_URL}/uploads/categoryImage/${row.original.categoryImage}`}
              alt={row.original.category}
            style={{ width: '100px', height: '50px', borderRadius: '4px' }}
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
    globalFilterFn: fuzzyFilter as FilterFn<CategoryType>, // Cast fuzzyFilter to FilterFn<CategoryType>
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEditClick = (rowData: CategoryType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setAddCategoryOpen(true);
  };

  const handleDeleteClick = (original: CategoryType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeleteCategoryId(original.id);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
      if (confirmed && deleteCategoryId)
        {
          try
          {
              const response = await deleteCategoryById(deleteCategoryId);

              if (response.status === httpStatus.FORBIDDEN) {
                setErrorMessage(response.msg);
                setErrorDialogOpen(true);
              }
              else {
                if (data.length != 1) {
                  setData(data.filter((category: { id: string; }) => category.id !== deleteCategoryId));
                  handlePagecurrentForAddRecord()
                } else {
                  handlePageChangeForAddRecord();
                }
              }

              setErrorData(response.status);
              setDeleteConfirmationOpen(false);
              setDeleteCategoryId(null);
          }
          catch (error) {
            toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthecategory);
          }
        }
        else {
          setDeleteConfirmationOpen(false);
          setDeleteCategoryId(null);
        }
  };

  const handleCloseDialog = () => {
    setAddCategoryOpen(false);
    setEditData(undefined);
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
      const { results, totalResults } = await getByCategoryByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getByCategoryByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getByCategoryByPagination(
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
              fileName='Category_Export'
              dictionary={dictionary}

            />


              <Button
                variant='contained'
                onClick={() => setAddCategoryOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].addcategory}
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
      </Card>
      <AddCategoryDialog
        open={addCategoryOpen}
        handleClose={handleCloseDialog}
        categoryData={data}
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

export default CategoryTable;
