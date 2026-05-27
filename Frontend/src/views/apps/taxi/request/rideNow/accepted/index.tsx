'use client';

// React Imports
import { useState, useMemo, useCallback ,useEffect} from 'react';

import Link from 'next/link';

import { useParams } from 'next/navigation';


// Next Imports

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import TablePagination from '@mui/material/TablePagination';

// Third-party Imports
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,

  // getPaginationRowModel,

  getSortedRowModel,
} from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';


// Component Imports

import { format } from 'date-fns';

import { IconButton, Tooltip } from '@mui/material';

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';

import TablePaginationComponent from '@components/CustomTablePaginationComponent';
import CustomTextField from '@core/components/mui/TextField';

// Util Imports
import ExportOptions from '@/utils/ExportOptions';

// Styles Imports
import tableStyles from '@core/styles/table.module.css';
import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
import { getRequestWithPagination, getChatHistory } from '@/app/api/apps/taxi/request';
import ChatDialog from '../chatDialog';

// Filter Function

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

  return itemRank.passed;
};


// Column Definitions
const columnHelper = createColumnHelper<any>();

const AcceptedTab = ({ AcceptedData, dictionary }: { AcceptedData?: any; dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({});
  const { lang: locale,zoneId } = useParams();
  const zoneIdString = Array.isArray(zoneId) ? zoneId[0] : zoneId;

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(AcceptedData.page || 0);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(AcceptedData.totalResults || 0);
  const [data, setData] = useState(AcceptedData.results || []);
  const [pageSize, setPageSize] = useState(AcceptedData.limit || 10);
  const currentReturnPage = pageIndex;
  const returnQuery = `?returnModule=rideNow&returnTab=accepted&returnPage=${currentReturnPage}&returnPageSize=${pageSize}&returnSearch=${encodeURIComponent(pageSearch)}`;

  // Chat Modal States
const [chatHistory, setChatHistory] = useState<any[]>([]);
const [isChatModalOpen, setIsChatModalOpen] = useState(false);
const [isChatLoading, setIsChatLoading] = useState(false);
const [selectedRequestNumber, setSelectedRequestNumber] = useState('');
const [startDate, setStartDate] = useState<Date | null>();
const [endDate, setEndDate] = useState<Date | null>();
const [paymentOpt, setPaymentOpt] = useState<'CASH' | 'CARD' | 'WALLET' | 'All'>('All')

  useEffect(() => {
    setData(AcceptedData?.results ?? [])
    setTotalResults(AcceptedData?.totalResults ?? 0)
    setPageIndex(AcceptedData?.page ?? 0)
    setPageSize(AcceptedData?.limit ?? 10)
  }, [AcceptedData])

const formatStart = (date: Date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0, 0
  ).toISOString();
};

const formatEnd = (date: Date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23, 59, 59, 999
  ).toISOString();
};

const formattedStartDate = startDate ? formatStart(startDate) : ''
const formattedEndDate = endDate ? formatEnd(endDate) : ''


const handlePaymentOptChange = useCallback(async (e: any) => {
  const paymentOpt = e.target.value as 'CASH' | 'CARD' | 'WALLET' | 'All'

  const res = await getRequestWithPagination(
    pageSearch,
    1,
    pageSize,
    'RIDE_NOW',
    'isDriverStarted',
    paymentOpt,
    formattedStartDate,
    formattedEndDate,
    zoneId
  )

  if (!res) return

  setData(res.results)
  setTotalResults(res.totalResults)
  setPageIndex(0)
  setPaymentOpt(paymentOpt)
}, [startDate, endDate, pageSearch, pageSize, paymentOpt])


const handleDateFilter = useCallback(async () => {
  const res = await getRequestWithPagination(
    pageSearch,
    1,
    pageSize,
    'RIDE_NOW',
    'isDriverStarted',
    paymentOpt,
    formattedStartDate,
    formattedEndDate,
    zoneId
  )

  if (!res) return

  setData(res.results)
  setTotalResults(res.totalResults)
  setPageIndex(0)
}, [startDate, endDate, pageSearch, pageSize, paymentOpt])



useEffect(() => {
  if (startDate && endDate && endDate < startDate) {
    setEndDate(startDate)
  } else {
    handleDateFilter()
  }
}, [startDate, endDate, paymentOpt])

const handleChatHistoryClick = async (requestNumber: string) => {
  setSelectedRequestNumber(requestNumber);
  setIsChatLoading(true);

  try {
    // Fetch the chat messages first
    const response = await getChatHistory(requestNumber);

    setChatHistory(response?.messages || []);
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    setChatHistory([]);
  } finally {
    setIsChatLoading(false);
    setIsChatModalOpen(true); // open AFTER fetching messages
  }
};


  const columns = useMemo<ColumnDef<any, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => (
        <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      ),
    },
    columnHelper.accessor('requestNumber', {
      header: dictionary['navigation'].RequestId,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Typography
            component={Link}
            href={getLocalizedUrl(`${zoneIdString}/apps/taxi/request/requestView/${row.original._id}${returnQuery}`, locale as Locale)}
            color='primary'
          >{`#${row.original.requestNumber}`}</Typography>
        </div>
      ),
    }),
    columnHelper.accessor('username', {
      header: dictionary['navigation'].UserName|| 'User Name',
      cell: ({ row }) =>
        <div className='flex items-center gap-3'>
          {row.original.userDetails.firstName?.length > 15 ? (
                     <Tooltip title={row.original.userDetails.firstName} arrow placement="bottom">
                       <Typography
                         component={Link}
                         href={getLocalizedUrl(`${zoneIdString}/apps/taxi/user/view/${row.original.userDetails._id}`, locale as Locale)}
                         color="primary"
                         sx={{
                           whiteSpace: 'nowrap',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           maxWidth: 150,
                           display: 'inline-block',
                         }}
                       >
                         {row.original.userDetails.firstName.substring(0, 15) + '...'}
                       </Typography>
                     </Tooltip>
                   ) : (
                     <Typography
                       component={Link}
                       href={getLocalizedUrl(`${zoneIdString}/apps/taxi/user/view/${row.original.userDetails._id}`, locale as Locale)}
                       color="primary"
                       sx={{
                         whiteSpace: 'nowrap',
                         overflow: 'hidden',
                         textOverflow: 'ellipsis',
                         maxWidth: 150,
                         display: 'inline-block',
                       }}
                     >
                       {row.original.userDetails.firstName ?? ''}
                     </Typography>
                   )}
        </div>
    }),
    columnHelper.accessor('driverId', {
      header: dictionary['navigation'].DriverName|| 'Driver Name',
      cell: ({ row }) =>
        <div className='flex items-center gap-3'>
                    {row.original.driverDetails.firstName?.length > 15 ? (
                            <Tooltip title={row.original.driverDetails.firstName} arrow placement="bottom">
                              <Typography
                                component={row.original.driverDetails._id ? Link : 'span'}
                                href={
                                  row.original.driverDetails._id
                                    ? getLocalizedUrl(`${zoneIdString}/apps/taxi/driver/view/${row.original.driverDetails._id}`, locale as Locale)
                                    : undefined
                                }
                                color="primary"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 150,
                                  display: 'inline-block',
                                }}
                              >
                                {row.original.driverDetails.firstName.substring(0, 15) + '...'}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography
                              component={row.original.driverDetails._id ? Link : 'span'}
                              href={
                                row.original.driverDetails._id
                                  ? getLocalizedUrl(`${zoneIdString}/apps/taxi/driver/view/${row.original.driverDetails._id}`, locale as Locale)
                                  : undefined
                              }
                              color="primary"
                              sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: 150,
                                display: 'inline-block',
                              }}
                            >
                              {row.original.driverDetails.firstName ?? ''}
                            </Typography>
                          )}
        </div>
    }),
    columnHelper.accessor('tripStartTime', {
      header: dictionary['navigation'].Date,
      cell: ({ row }) => {
        const dateTime = row.original.tripStartTime;

        // Check if dateTime is not null or undefined
        if (!dateTime) {
          return <Typography variant="body2">{dictionary['navigation'].NoDateAvailable}</Typography>;
        }

        // Create a Date object and format it
        const formattedDate = format(new Date(dateTime), 'yyyy-MM-dd'); // Change the format as needed
        const formatteTime = format(new Date(dateTime), ' HH:mm:ss'); // Change the format as needed

        return (
          <div>
            <Typography>{formattedDate}</Typography>
            <Typography variant="body2">{formatteTime}</Typography>
          </div>
        );
      },
    }),

    columnHelper.accessor('pickupAddress', {
      header: dictionary['navigation'].PickupAddress,
      cell: ({ row }) => {
        const pickupAddress = row.original.placesDetails ? row.original.placesDetails?.pickAddress : "";

        const addressLines: string[] = pickupAddress ? pickupAddress.split(',') : [];

        return (
          <div style={{ maxWidth: '200px', overflowY: 'auto' }}>
            {addressLines.length > 0 ? (
              addressLines.map((line: string, index: number) => (
                <Typography key={index} variant="body2">{line.trim()}</Typography>
              ))
            ) : (
              <Typography variant="body2">{dictionary['navigation'].NoAddress}</Typography>
            )}
          </div>
        );
      },
    }),

    columnHelper.accessor('dropAddress', {
      header: dictionary['navigation'].DropAddress,
      cell: ({ row }) => {
        const dropAddress = row.original.placesDetails ? row.original.placesDetails?.dropAddress : "";

        const addressLines: string[] = dropAddress ? dropAddress.split(',') : [];

        return (
          <div style={{ maxWidth: '200px', overflowY: 'auto' }}>
            {addressLines.length > 0 ? (
              addressLines.map((line: string, index: number) => (
                <Typography key={index} variant="body2">{line.trim()}</Typography>
              ))
            ) : (
              <Typography variant="body2">{dictionary['navigation'].NoAddress}</Typography>
            )}
          </div>
        );
      },
    }),



    columnHelper.accessor('action', {
      header: dictionary['navigation'].Action,
      cell: ({ row }) => (
       <div className='flex items-center gap-1'>
                <Typography
                           component={Link}
                           href={getLocalizedUrl(`${zoneIdString}/apps/taxi/request/requestView/${row.original._id}${returnQuery}`, locale as Locale)}
                           color='primary' className='flex'
                         > <IconButton><i className='tabler-eye text-textSecondary' /></IconButton></Typography>
                 <button
                   onClick={() => handleChatHistoryClick(row.original.requestNumber)}
                   className='flex items-center bg-transparent'
                   title= {dictionary['navigation'].ViewChatHistory||"View Chat History"}
                 >

                   <i className='tabler-message text-textSecondary hover:text-primary cursor-pointer' />
                 </button>
               </div>
      ),
      enableSorting: false,
    }),
  ], [zoneIdString,dictionary, locale, pageIndex, pageSize]);

  const table = useReactTable({
    data: data,
    columns,
    state: {
      rowSelection,
      globalFilter,
    },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    }
  });


  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getRequestWithPagination(pageSearch, newPage, pageSize, "RIDE_NOW", "isDriverStarted",paymentOpt,formattedStartDate,formattedEndDate,zoneIdString);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getRequestWithPagination(pageSearch, 1, newPageSize, "RIDE_NOW", "isDriverStarted",paymentOpt,formattedStartDate,formattedEndDate,zoneIdString);

    setPageSize(newPageSize);

    setData(results);
    setTotalResults(totalResults);
    setPageIndex(1);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getRequestWithPagination(
          searchTerm,
          1,
          pageSize, "RIDE_NOW", "isDriverStarted",paymentOpt,formattedStartDate,formattedEndDate,zoneIdString
        );

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(1);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
   [pageSize, zoneIdString, formattedStartDate, formattedEndDate, paymentOpt]
  );


  return (
    <Card>
      <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
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
        {/* date filter can be added here in future if needed */}
        <div className='flex items-center gap-x-4 mb-4 ml-auto'>
            <AppReactDatepicker
               selected={startDate}
               onChange={(date: Date | null) => setStartDate(date)}
               startDate={startDate}
               endDate={endDate}
               maxDate={endDate || undefined}
               placeholderText={'MM/DD/YYYY'}
               customInput={
                 <CustomTextField
                   label={dictionary['navigation'].StartDate}
                   fullWidth
                 />
               }
            />
          <AppReactDatepicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              placeholderText={'MM/DD/YYYY'}
              customInput={
                <CustomTextField
                  label={dictionary['navigation'].EndDate}
                  fullWidth
                />
              }
            />
        </div>
        <div className='flex items-center gap-x-4 mb-4'>
          <CustomTextField
            select
            value={paymentOpt}
            onChange={(e: any) => handlePaymentOptChange(e)}
            className='is-[120px]'
            label={dictionary['navigation'].PaymentOption || 'Payment Option'}
            >
            <MenuItem value='All'>{dictionary['navigation'].All}</MenuItem>
            <MenuItem value='CASH'>{dictionary['navigation'].Cash}</MenuItem>
            <MenuItem value='CARD'>{dictionary['navigation'].Card}</MenuItem>
            <MenuItem value='WALLET'>{dictionary['navigation'].Wallet}</MenuItem>
          </CustomTextField>
        </div>

        <div className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>
              <CustomTextField
           select
           value={pageSize}
           onChange={handlePageSizeChange}
           className='is-[70px]'
         >
           {[5, 10, 25, 50].map(size => (
             <MenuItem key={size} value={size}>
               {size}
             </MenuItem>
           ))}
         </CustomTextField>
          <ExportOptions
            data={data}
            tableContainerId="table-container"
            fileName='Request_Export'
            dictionary={dictionary}

          />
        </div>
      </CardContent>
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
                          'cursor-pointer select-none': header.column.getCanSort(),
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-xl' />,
                          desc: <i className='tabler-chevron-down text-xl' />,
                        }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  {dictionary['navigation'].Nodataavailable}
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
          {/* Chat Modal */}
                  {isChatModalOpen && (
                    <ChatDialog
                      messages={chatHistory}
                      onClose={() => setIsChatModalOpen(false)}
                      isLoading={isChatLoading}
                      requestId={selectedRequestNumber}
                      currentUserId="user123" //  replace with real logged-in user ID
                    />
                  )}
    </Card>
  );
};

export default AcceptedTab;
