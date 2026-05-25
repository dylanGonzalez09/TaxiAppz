/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState, useMemo, useEffect, useCallback } from 'react';


import Link from 'next/link';
import { useParams } from 'next/navigation';

import { format } from 'date-fns';


import type { TextFieldProps } from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { MenuItem, Typography, Card, Tooltip } from '@mui/material';

import { getLocalizedUrl } from '@/utils/i18n'
import type { Locale } from '@configs/i18n'
import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/CustomTablePaginationComponent';
import ExportOptions from '@/utils/ExportOptions';
import tableStyles from '@core/styles/table.module.css';
import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

type DocumentExpiryType = {
  
  // driverName: string;
  
  documentName: string;
  expiryDate: string;
  userId?: string;
 
  // phoneNumber?: string;

};

const fuzzyFilter: FilterFn<DocumentExpiryType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);


  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};


const columnHelper = createColumnHelper<DocumentExpiryType>();

const DocumentExpiryTable = ({ staticGroup, dictionary,driverId }: { staticGroup: any, dictionary: any,driverId: string }) => {
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const { lang: locale } = useParams();
  const { checkDemoStatus } = useIsDemoUser();

  const [pageIndex, setPageIndex] = useState(staticGroup.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(staticGroup.totalResults);
  const [data, setData] = useState(staticGroup.results);
  const [pageSize, setPageSize] = useState(staticGroup.limit);

  const columns = useMemo<ColumnDef<DocumentExpiryType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => (
        <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
    
      ),
    
    },
    
    // columnHelper.accessor('driverName', {
    //   header: dictionary['navigation'].driverName?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Driver Name',

    //   cell: ({ row }) => {
    //     const name = row.original.driverName ?? '';
    //     const showTooltip = name.length > 15;
    //     const displayName = showTooltip ? `${name.slice(0, 15)}...` : name;
    
    //     return (
    //       <div className="flex items-center gap-3">
    //         {showTooltip ? (
    //           <Tooltip title={name} arrow placement="bottom">
    //             <Typography
    //               component={Link}
    //               href={getLocalizedUrl(`/apps/taxi/driver/view/${row.original.userId}`, locale as Locale)}
    //               color="primary"
    //               sx={{
    //                 whiteSpace: 'nowrap',
    //                 overflow: 'hidden',
    //                 textOverflow: 'ellipsis',
    //                 maxWidth: 150,
    //                 display: 'inline-block',
    //               }}
    //             >
    //               {displayName}
    //             </Typography>
    //           </Tooltip>
    //         ) : (
    //           <Typography
    //             component={Link}
    //             href={getLocalizedUrl(`/apps/taxi/driver/view/${row.original.userId}`, locale as Locale)}
    //             color="primary"
    //           >
    //             {displayName}
    //           </Typography>
    //         )}
    //       </div>
    //     );
    //   },
    // }),    
    // columnHelper.accessor('phoneNumber', {
    //   header: dictionary['navigation'].phoneNumber,
    //   cell: ({ row }) => (
    //     <Typography className='font-medium'>
    //       {checkDemoStatus() && (row.original.phoneNumber?.length ?? 0) > 5
    //         ? row.original.phoneNumber?.slice(0, row.original.phoneNumber?.length - 5) + '*****'
    //         : row.original.phoneNumber}
    //     </Typography>
    //   ),
    // }),
    
    columnHelper.accessor('documentName', {
      header: dictionary['navigation'].documentName,
      cell: ({ row }) => <Typography className='font-medium'>{row.original.documentName}</Typography>,
    }),
    columnHelper.accessor('expiryDate', {
      header: dictionary['navigation'].expiryDate,
      cell: ({ row }) => {
        const date = new Date(row.original.expiryDate);


        return <Typography className='font-medium'>{date.toLocaleDateString()}</Typography>
      },
    }),
  ], [data, dictionary]);

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });




  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await fetchExpiryDocument(driverId,pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await fetchExpiryDocument(driverId,pageSearch, pageIndex, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await fetchExpiryDocument(
          driverId,
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
            fileName='ExpiryDocument_Export'
            dictionary={dictionary}

          />
        </div>
      </div>
      <div className='overflow-x-auto'>
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
                  {dictionary['navigation'].noDataAvailable}
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
      {/* start pagination */}
    {/* start pagination */}
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
      {/* end pagination */}
    </Card>
  );
};

export default DocumentExpiryTable;
