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
import Switch from '@mui/material/Switch'; // Import the Switch component



// Third-party Imports
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

import OptionMenu from '@core/components/option-menu';


import { useIsDemoUser } from '@/utils/demoUser'

// Component Imports

import CustomTextField from '@core/components/mui/TextField';

// Style Imports
import tableStyles from '@core/styles/table.module.css';
import { deleteBySubScriptionId, updateSubScriptionStatus, getSubscriptionByPagination } from '@apis/subscription';

import ConfirmationDialog from '../../../../components/dialogs/delete-data'; // Import the ConfirmationDialog component
import ExportOptions from '@/utils/ExportOptions';
import AddSubScriptionDrawer from './AddSubScriptionDrawer';
import EditSubScriptionDrawer from './EditSubScriptionDrawer';

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type subscriptionType = {
  id: string,
  name: string;
  validityPeriod: string;
  description: string;
  amount: string;
  status: boolean;
  unit: string;

};

type SubScriptionWithActionsType = subscriptionType & {
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
const columnHelper = createColumnHelper<SubScriptionWithActionsType>();

const SubScriptionTable = ({ subScriptionData, dictionary }: { subScriptionData: any, dictionary: any }) => {
  // States
  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false);
  const [editData, setEditData] = useState<subscriptionType | undefined>(undefined);
  const [editSubscriptionOpen, setEditSubscriptionOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteSubscriptionId, setDeleteSubscriptionId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusSubScription, setstatusSubScription] = useState<subscriptionType | null>(null);


  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(subScriptionData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(subScriptionData.totalResults); // To track the total number of records
  const [data, setData] = useState(subScriptionData.results);
  const [pageSize, setPageSize] = useState(subScriptionData.limit);
  const { checkDemoStatus } = useIsDemoUser();



  const handleDeleteClick = (original: subscriptionType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeleteSubscriptionId(original.id);
    setDeleteConfirmationOpen(true);
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


  const handleStatusToggle = async (subscription: subscriptionType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setstatusSubScription(subscription);
    setStatusConfirmationOpen(true);
  };



  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusSubScription) {

      const updatedSubScription = { ...statusSubScription, status: !statusSubScription.status };

      try {
        await updateSubScriptionStatus(statusSubScription.id.toString(), { status: updatedSubScription.status });

        setData((prevData: { id: string; }[]) => {
          return prevData.map((subScription: { id: string; }) =>
            subScription.id === statusSubScription.id ? updatedSubScription : subScription
          );
        });
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        setStatusConfirmationOpen(false);
        setstatusSubScription(null);
      } catch (error) {
        console.error('Failed to update user status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setstatusSubScription(null);
    }
  };

  const columns = useMemo<ColumnDef<SubScriptionWithActionsType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
      },
      columnHelper.accessor('name', {
        header: dictionary['navigation'].name,
        cell: ({ row }) => <Typography>{row.original.name}</Typography>
      }),
      columnHelper.accessor('validityPeriod', {
        header: dictionary['navigation'].validityPeriod,
        cell: ({ row }) => <Typography>{row.original.validityPeriod}  {row.original.unit}</Typography>
      }),
      columnHelper.accessor('amount', {
        header: dictionary['navigation'].amount,
        cell: ({ row }) => <Typography>{row.original.amount}</Typography>
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
                  backgroundColor: 'white',
                },
                '& .MuiSwitch-track': {
                  backgroundColor: row.original.status ? 'green' : 'red', // Track color
                },
              }}
            />
          </div>
        )
      }),
      columnHelper.accessor('actions', {
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
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const table = useReactTable({
    data: data as subscriptionType[],
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

  const handleEditClick = (rowData: subscriptionType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setEditSubscriptionOpen(true);
  };


  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteSubscriptionId) {
      try {
        await deleteBySubScriptionId(deleteSubscriptionId);

        if (data.length != 1) {
          setData(data.filter((Subscription: { id: string; }) => Subscription.id !== deleteSubscriptionId));
          handlePagecurrentForAddRecord()
        } else {
          handlePageChangeForAddRecord();
        }
      } catch (error) {
        // Handle error, e.g., show an error message
        console.error("Error deleting version:", error);
      }
    }

    setDeleteConfirmationOpen(false);
    setDeleteSubscriptionId(null);
  };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getSubscriptionByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
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

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getSubscriptionByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getSubscriptionByPagination(
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
              fileName='Permission_Export'
              dictionary={dictionary}

            />


              <Button
                variant='contained'
                onClick={() => setAddSubscriptionOpen(!addSubscriptionOpen)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].addSubScription}
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
      <AddSubScriptionDrawer
        open={addSubscriptionOpen}
        subScriptionData={data}
        dictionary={dictionary}
        setData={setData}
        handleClose={() => setAddSubscriptionOpen(!addSubscriptionOpen)}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
      />
      <EditSubScriptionDrawer
        open={editSubscriptionOpen}
        subScriptionData={data}
        setData={setData}
        dictionary={dictionary}
        handleClose={() => setEditSubscriptionOpen(false)}
        initialData={editData}
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

export default SubScriptionTable;
