/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/consistent-type-imports */
'use client';

// React Imports
import { useMemo, useState, useCallback, ChangeEvent } from 'react';

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

import CustomTextField from '@core/components/mui/TextField';

import tableStyles from '@core/styles/table.module.css';

import { useIsDemoUser } from '@/utils/demoUser' 

import { deleteByVersionId, updateVersionStatus, getVersionByPagination } from '@apis/version';

import ConfirmationDialog from '../../../../components/dialogs/delete-data/'; // Import the ConfirmationDialog component

// Component Imports
import AddVersionDrawer from './AddVersionDrawer';
import EditVersionDrawer from './EditVersionDrawer';


// Style Imports

import ExportOptions from '@/utils/ExportOptions';
import TablePaginationComponent from '@/components/CustomTablePaginationComponent';


declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type versionType = {
  id: string,
  versionNumber: string;
  versionCode: string;
  applicationType: string;
  description: string;
  status: boolean;
};

type VersionWithActionsType = versionType & {
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
const columnHelper = createColumnHelper<VersionWithActionsType>();

const VersionTable = ({ versionData, dictionary }: { versionData: any, dictionary: any }) => {
  // States
  const [addVersionOpen, setAddVersionOpen] = useState(false);
  const [editData, setEditData] = useState<versionType | undefined>(undefined);
  const [editVersionOpen, setEditVersionOpen] = useState(false);

  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusVersion, setStatusVersion] = useState<versionType | null>(null);


  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(versionData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(versionData.totalResults); // To track the total number of records
  const [data, setData] = useState(versionData.results);
  const [pageSize, setPageSize] = useState(versionData.limit);

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

  const {  checkDemoStatus } = useIsDemoUser();

  const handleDeleteClick = (original: versionType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);
      
      return;
      }

    setDeleteVersionId(original.id);
    setDeleteConfirmationOpen(true);
  };

  const handleStatusToggle = async (version: versionType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);
      
    return;  
      }

    setStatusVersion(version);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusVersion) {


      const updatedVersion = { ...statusVersion, status: !statusVersion.status };

      try {
        await updateVersionStatus(statusVersion.id.toString(), { status: updatedVersion.status });

        setData((prevData: { id: string; }[]) => {
          return prevData.map((version: { id: string; }) =>
            version.id === statusVersion.id ? updatedVersion : version
          );
        });
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        setStatusConfirmationOpen(false);
        setStatusVersion(null);
      } catch (error) {
        console.error('Failed to update user status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setStatusVersion(null);
    }
  };

  const columns = useMemo<ColumnDef<VersionWithActionsType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>,
      },
      columnHelper.accessor('versionNumber', {
        header: dictionary['navigation'].versionNumber,
        cell: ({ row }) => <Typography>{row.original.versionNumber}</Typography>
      }),
      columnHelper.accessor('versionCode', {
        header: dictionary['navigation'].versionCode,
        cell: ({ row }) => <Typography>{row.original.versionCode}</Typography>
      }),
      columnHelper.accessor('applicationType', {
        header: dictionary['navigation'].applicationType,
        cell: ({ row }) => <Typography>{row.original.applicationType}</Typography>
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
                  hidden: true,
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
    data: data as versionType[],
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

  const handleEditClick = (rowData: versionType) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].editError);
      
      return;
    }
    
    setEditData(rowData);
    setEditVersionOpen(true);
  };


  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteVersionId) {
      try {
        await deleteByVersionId(deleteVersionId);

        if (data.length != 1) {
          setData(data.filter((version: { id: string; }) => version.id !== deleteVersionId));
          handlePagecurrentForAddRecord();
        } else {
          handlePageChangeForAddRecord();
        }
      } catch (error) {
        // Handle error, e.g., show an error message
        console.error("Error deleting version:", error);
      }
    }

    setDeleteConfirmationOpen(false);
    setDeleteVersionId(null);
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
      const { results, totalResults } = await getVersionByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getVersionByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getVersionByPagination(
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
              onClick={() => setAddVersionOpen(!addVersionOpen)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].addversion}
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
            dictionary={dictionary}  // Pass the dictionary object for localization
          />}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />

      </Card>
      <AddVersionDrawer
        open={addVersionOpen}
        versionData={data}
        dictionary={dictionary}
        setData={setData}
        handleClose={() => setAddVersionOpen(!addVersionOpen)}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
      />
      <EditVersionDrawer
        open={editVersionOpen}
        versionData={data}
        setData={setData}
        dictionary={dictionary}
        handleClose={() => setEditVersionOpen(false)}
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

export default VersionTable;
