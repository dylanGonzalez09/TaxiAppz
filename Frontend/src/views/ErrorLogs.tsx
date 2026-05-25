/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import type { ChangeEvent} from 'react';

import React, { useCallback,useState, useMemo, useEffect } from 'react';

import type { TextFieldProps } from '@mui/material/TextField';
import {createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card, IconButton, Link, Chip } from '@mui/material';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import TablePagination from '@mui/material/TablePagination';

import CustomTextField from '@core/components/mui/TextField';

import ExportOptions from '@/utils/ExportOptions';


import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

import { getErrorLogs } from '@/app/api/apps/taxi/request';

// import IconButton from '@mui/material/IconButton';
import tableStyles from '@core/styles/table.module.css';




const fuzzyFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);

  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
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

const columnHelper = createColumnHelper<any>();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const getStatusColor = (statusCode: number) => {
  
  if (statusCode >= 500) return 'error';
  if (statusCode >= 400) return 'warning';
  
  return 'success';
};

const ErrorLogTable = ({ staticGroup, dictionary }: { staticGroup: any, dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [selectedError, setSelectedError] = useState<any | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(staticGroup.page - 1);
  const [pageSearch, setPageSearch] = useState('');
  const [totalResults, setTotalResults] = useState(staticGroup.totalResults);
  const [data, setData] = useState(staticGroup.results);
  const [pageSize, setPageSize] = useState(staticGroup.limit);


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
      
            const { results, totalResults } = await getErrorLogs(pageSearch, newPage, pageSize);
      
            setData(results);
            setPageIndex(newPage);
            setTotalResults(totalResults);
          } catch (error) {
            console.error("Error fetching new page data:", error);
          }
        };
      
        const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      
          const newPageSize = parseInt(event.target.value);
      
          const { results, totalResults } = await getErrorLogs(pageSearch, 1, newPageSize);
      
          setPageSize(newPageSize);
          setData(results);
          setTotalResults(totalResults);
          setPageIndex(0);
        };
      
      
        const handleSearch = useCallback(
          async (searchTerm: string) => {
            try {
              const result = await getErrorLogs(
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
  
        const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation']?.serialNo || 'S.No',
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    columnHelper.accessor('message', {
      header: dictionary['navigation']?.message || 'Error Message',
      cell: ({ row }) => (
        <Typography 
          className='font-medium' 
          sx={{ 
            maxWidth: '300px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={row.original.message}
        >
          {row.original.message}
        </Typography>
      ),
    }),
    columnHelper.accessor('url', {
      header: dictionary['navigation']?.url || 'URL',
      cell: ({ row }) => (
        <Typography 
          className='font-medium text-blue-600'
          sx={{ 
            maxWidth: '200px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={row.original.url}
        >
          {row.original.url}
        </Typography>
      ),
    }),
    columnHelper.accessor('method', {
      header: dictionary['navigation']?.method || 'Method',
      cell: ({ row }) => (
        <Chip 
          label={row.original.method} 
          size="small"
          color={row.original.method === 'GET' ? 'primary' : 
                 row.original.method === 'POST' ? 'success' : 
                 row.original.method === 'PUT' ? 'warning' : 'default'}
        />
      ),
    }),
    columnHelper.accessor('statusCode', {
      header: dictionary['navigation']?.statusCode || 'Status Code',
      cell: ({ row }) => (
        <Chip 
          label={row.original.statusCode} 
          size="small"
          color={getStatusColor(row.original.statusCode)}
        />
      ),
    }),
    columnHelper.accessor('timestamp', {
      header: dictionary['navigation']?.timestamp || 'Timestamp',
      cell: ({ row }) => (
        <Typography className='font-medium text-gray-600'>
          {formatDate(row.original.timestamp)}
        </Typography>
      ),
    }),
    columnHelper.accessor('user', {
      header: dictionary['navigation']?.user || 'User',
      cell: ({ row }) => (
        <Typography className='font-medium'>
          {row.original.user ? (typeof row.original.user === 'string' ? row.original.user : row.original.user.name || row.original.user.id) : 'Anonymous'}
        </Typography>
      ),
    }),
    columnHelper.display({
      id: 'action',
      header: dictionary['navigation']?.Action || 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <IconButton
            onClick={() => setSelectedError(row.original)}
            title="View Stack Trace"
          >
            <i className='tabler-eye text-textSecondary' />
          </IconButton>
          <IconButton
            onClick={() => navigator.clipboard.writeText(JSON.stringify(row.original, null, 2))}
            title="Copy Error Details"
          >
            <i className='tabler-copy text-textSecondary' />
          </IconButton>
        </div>
      ),
      enableSorting: false
    })

  ], [dictionary]);


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

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder={dictionary['navigation']?.search || 'Search...'}
          />
          <div className='flex items-center gap-x-4'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className='flex-auto'
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='ErrorLog_Export'
              dictionary={dictionary}
            />
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
                          className={`flex items-center ${header.column.getIsSorted() ? 'cursor-pointer select-none' : ''}`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() ? (
                            header.column.getIsSorted() === 'asc' ? <i className='tabler-chevron-up text-xl' /> : <i className='tabler-chevron-down text-xl' />
                          ) : null}
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
                    {dictionary['navigation']?.noDataAvailable || 'No data available'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={row.getIsSelected() ? 'selected' : ''}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
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
                 dictionary={dictionary}  // Pass the dictionary for localization
               />}
               count={totalResults}
               page={pageIndex}
               onPageChange={handlePageChange}
               rowsPerPage={pageSize}
               onRowsPerPageChange={handlePageSizeChange}
             />
      </Card>

      {/* Stack Trace Modal/Dialog */}
      {selectedError && (
       <Card 
        sx={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: '80%', 
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 1300, // ⬅️ Increase z-index
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4 
        }}
        >

          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Error Details</Typography>
            <IconButton onClick={() => setSelectedError(null)}>
              <i className='tabler-x' />
            </IconButton>
          </div>
          
          <div className="space-y-4">
            <div>
              <Typography variant="subtitle2" className="font-bold">Message:</Typography>
              <Typography variant="body2">{selectedError.message}</Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" className="font-bold">URL:</Typography>
              <Typography variant="body2" className="text-blue-600">{selectedError.url}</Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" className="font-bold">Method:</Typography>
              <Typography variant="body2">{selectedError.method}</Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" className="font-bold">Status Code:</Typography>
              <Typography variant="body2">{selectedError.statusCode}</Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" className="font-bold">Timestamp:</Typography>
              <Typography variant="body2">{formatDate(selectedError.timestamp)}</Typography>
            </div>
            
            {selectedError.body && (
              <div>
                <Typography variant="subtitle2" className="font-bold">Request Body:</Typography>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                  {JSON.stringify(selectedError.body, null, 2)}
                </pre>
              </div>
            )}
            
            <div>
              <Typography variant="subtitle2" className="font-bold">Stack Trace:</Typography>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto whitespace-pre-wrap">
                {selectedError.stack}
              </pre>
            </div>
          </div>
        </Card>
      )}
      
      {/* Backdrop */}
      {selectedError && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[1299]"
          onClick={() => setSelectedError(null)}
        />
      )}
    </>
  );
};

export default ErrorLogTable;