/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

// React Imports
import { useEffect, useMemo, useState, useCallback } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch'; // Import the Switch component

import { getSession } from 'next-auth/react';  // For client-side

import { toast } from 'react-toastify';

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

import CustomTextField from '@core/components/mui/TextField';
import { useIsDemoUser } from '@/utils/demoUser'

import tableStyles from '@core/styles/table.module.css';

import { getCountryByPagination,updateCountryStatus } from '@apis/country';

import ConfirmationDialog from '../../../../components/dialogs/delete-data/'; // Import the ConfirmationDialog component


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

export type countryType = {
  id: string;
  name: string;
  dial_code: string;
  currency_code: string;
  currency_symbol: string;
  status: boolean;
};

type CountryWithActionsType = countryType & {
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
const columnHelper = createColumnHelper<CountryWithActionsType>();

const CountryTable = ({ countryData, dictionary }: { countryData: any, dictionary: any }) => {

  // States
  const [rowSelection, setRowSelection] = useState({});
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusCountryId, setStatusCountryId] = useState<string | null>(null);
  const [statusCountry, setstatusCountry] = useState<any | null>(null);


  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(countryData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(countryData.totalResults); // To track the total number of records
  const [data, setData] = useState(countryData.results);
  const [pageSize, setPageSize] = useState(countryData.limit);
  const { checkDemoStatus } = useIsDemoUser();




  const handleStatusToggle = async (country: any) => {
     if (checkDemoStatus()) {
          toast.error(dictionary['navigation'].editError);

        return;
          }

    setstatusCountry(country);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusCountry) {
      const updatedCountry = { ...statusCountry, status: !statusCountry.status };

      try {
        await updateCountryStatus(statusCountry.id.toString(), { status: updatedCountry.status });

        setData((prevData: any[]) => {
          // Check if the user is present in the state
          return prevData.map((country: { id: any; }) =>
            country.id === statusCountry.id ? updatedCountry : country
          );
        });
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);



        setStatusConfirmationOpen(false);
        setstatusCountry(null);
      } catch (error) {
        console.error('Failed to update user status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setstatusCountry(null);
    }
  };

  const columns = useMemo<ColumnDef<CountryWithActionsType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>,
      },
      columnHelper.accessor('name', {
        header: dictionary['navigation'].countryName,
        cell: ({ row }) => <Typography>{row.original.name}</Typography>
      }),
      columnHelper.accessor('dial_code', {
        header: dictionary['navigation'].countryCode,
        cell: ({ row }) => <Typography>{row.original.dial_code}</Typography>
      }),
      columnHelper.accessor('currency_code', {
        header: dictionary['navigation'].currencyCode,
        cell: ({ row }) => <Typography>{row.original.currency_code}</Typography>
      }),
      columnHelper.accessor('currency_symbol', {
        header: dictionary['navigation'].currencySymbol,
        cell: ({ row }) => <Typography>{row.original.currency_symbol}</Typography>
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].status,
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

    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const table = useReactTable({
    data: data as countryType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 25
      }
    },
    enableRowSelection: true,
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

    const getClientId = async () => {

      const session = await getSession();

      const clientId = session?.user?.image?.clientId; // Access clientId

      return { clientId };
    };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {


      const DataKey = getClientId();

      const clientId = (await DataKey).clientId;

      if (clientId === undefined) {

        throw new Error("ClientId is undefined");

      }

      const { results, totalResults } = await getCountryByPagination(pageSearch, newPage, pageSize,clientId);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const DataKey = getClientId();

    const clientId = (await DataKey).clientId;

    if (clientId === undefined) {

      throw new Error("ClientId is undefined");

    }

    const { results, totalResults } = await getCountryByPagination(pageSearch, 1, newPageSize,clientId);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const result = await getCountryByPagination(
          searchTerm,
          1, // Reset to first page on new search
          pageSize,
          clientId
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
              placeholder={dictionary['navigation'].search}
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
              fileName='Country_Export'
              dictionary={dictionary}

            />
            {/* <Button
              variant='contained'
              onClick={() => setAddLanguageOpen(!addLanguageOpen)}
              startIcon={<i className='tabler-plus' />}
            >
              Add Language
            </Button> */}

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
                    {dictionary['navigation'].noDataFound}
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
            dictionary={dictionary}  // Pass the dictionary prop
          />}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />

      </Card>

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

export default CountryTable;
