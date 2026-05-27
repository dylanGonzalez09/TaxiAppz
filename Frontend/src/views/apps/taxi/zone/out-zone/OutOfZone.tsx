/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useMemo, useCallback } from 'react';

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
import AddOutZoneDialog from './AddEditDrawer';

import ConfirmationDialog from '@/components/dialogs/delete-data';

import ExportOptions from '@/utils/ExportOptions';

import { useIsDemoUser } from '@/utils/demoUser'

import { deleteByOutZoneId, updateOutZoneStatus, getByOutOfZoneByPagination } from '@apis/outOfZone';

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

interface OutZoneDataType {
  id: string;
  kilometer: number;
  price: number;
  status: boolean;
}

const fuzzyFilter: FilterFn<OutZoneDataType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);

  // Convert both to strings for comparison
  return cellValue !== undefined && cellValue !== null &&
    cellValue.toString().toLowerCase().includes(filterValue.toString().toLowerCase());
};



const columnHelper = createColumnHelper<OutZoneDataType>();

const OutZoneTable = ({ dictionary, OutZoneData }: { dictionary: any; OutZoneData: any }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [addOutZoneOpen, setAddOutZoneOpen] = useState(false);
  const [editData, setEditData] = useState<OutZoneDataType | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteOutZoneId, setDeleteOutZoneId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusOutZone, setStatusOutZone] = useState<OutZoneDataType | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(OutZoneData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(OutZoneData.totalResults);
  const [data, setData] = useState(OutZoneData.results);
  const [pageSize, setPageSize] = useState(OutZoneData.limit);


  const columns = useMemo<ColumnDef<OutZoneDataType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].Sl,
      cell: ({ row }) => <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>, /* {row.index + 1 + pageIndex * pageSize} */
    },
    columnHelper.accessor('kilometer', {
      header: dictionary['navigation'].Kilometer,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.kilometer}</Typography>,
    }),
    columnHelper.accessor('price', {
      header: dictionary['navigation'].Price,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.price}</Typography>,
    }),
    columnHelper.accessor('status', {
      header: dictionary['navigation'].Status,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Switch
            checked={row.original.status}
            onChange={() => handleStatusToggle(row.original)}
            color={row.original.status ? 'success' : 'error'}
            sx={{
              '& .MuiSwitch-switchBase': { color: row.original.status ? 'green' : 'red' },
              '& .MuiSwitch-switchBase.Mui-checked': { color: row.original.status ? 'green' : 'red' },
              '& .MuiSwitch-thumb': { backgroundColor: 'white' },
              '& .MuiSwitch-track': { backgroundColor: row.original.status ? 'green' : 'red' },
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

          //  {
          //     text: dictionary['navigation'].Delete,
          //     icon: 'tabler-trash',
          //     menuItemProps: { onClick: () => handleDeleteClick(row.original) },
          //   },

          ]}
        />
      ),
      enableSorting: false,
    },
  ], [data,dictionary]);

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

  const { checkDemoStatus } = useIsDemoUser();

  const handleEditClick = (rowData: OutZoneDataType) => {
    if (checkDemoStatus()) {
       toast.error(dictionary['navigation'].editError);

        return;
        }

    setEditData(rowData);
    setAddOutZoneOpen(true);
  };

  // const handleDeleteClick = (original: OutZoneDataType) => {
  //    if (checkDemoStatus()) {
  //        toast.error(dictionary['navigation'].deleteError);

  //         return;
  //         }

  //         setDeleteOutZoneId(original.id);
  //   setDeleteConfirmationOpen(true);
  // };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteOutZoneId) {
      try {
        await deleteByOutZoneId(deleteOutZoneId);

        setData((prevData:any[]) => prevData.filter(outZone => outZone.id !== deleteOutZoneId));
      } catch (error) {
        console.error("Error deleting OutZone:", error);
      }
    }

    setDeleteConfirmationOpen(false);

    setDeleteOutZoneId(null);
  };

  const handleStatusToggle = async (rowData: OutZoneDataType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusOutZone(rowData);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusOutZone) {
      const updatedOutZone = { ...statusOutZone, status: !statusOutZone.status };

      try {
        await updateOutZoneStatus(statusOutZone.id.toString(), { status: updatedOutZone.status });
        setData((prevData: any[]) => prevData.map(outZone => (outZone.id === statusOutZone.id ? updatedOutZone : outZone)));
         toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

      } catch (error) {
        console.error('Failed to update OutZone status:', error);
      }
    }

    setStatusConfirmationOpen(false);
    setStatusOutZone(null);
  };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getByOutOfZoneByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getByOutOfZoneByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        // Convert the search term to string to ensure compatibility with API calls
        const searchQuery = searchTerm.toString();


        // Call the API with the converted search query
        const result = await getByOutOfZoneByPagination(
          searchQuery,
          1,
          pageSize
        );

        setPageSearch(searchQuery);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(0);
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
              fileName='OutZone_Export'
              dictionary={dictionary}

            />
              <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setAddOutZoneOpen(true)}>
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
        <AddOutZoneDialog
          open={addOutZoneOpen}
          handleClose={() => {
            setAddOutZoneOpen(false);
            setEditData(null);
          }}
          outZoneData={data}
          dictionary={dictionary}
          editData={editData}
          setData={setData}
          setTotalResults={setTotalResults}
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
      </Card>
    </>
  );
};

export default OutZoneTable;
