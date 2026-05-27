/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'

// import type { SelectChangeEvent } from '@mui/material'

import { Tooltip } from '@mui/material'


import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  filterFns,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import { format } from 'date-fns'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';

import TablePaginationComponent from '@components/CustomTablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import ExportOptions from '@/utils/ExportOptions'
import tableStyles from '@core/styles/table.module.css'

import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'

import { getRequestWithPagination } from '@/app/api/apps/taxi/request'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })
  
return itemRank.passed
}

const columnHelper = createColumnHelper<any>()

export type PaymentOpt = 'CASH' | 'CARD' | 'WALLET'

const PaymentTripsTable = ({
  initialData,
  dictionary,
  paymentOpt,

  // rideType,

  zoneId
}: {
  initialData: any
  dictionary: any
  paymentOpt: PaymentOpt
  rideType?: 'RIDE_NOW' | 'RIDE_LATER',
  zoneId:any
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const { lang: locale } = useParams()

  const [pageIndex, setPageIndex] = useState(initialData?.page ?? 1)
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(initialData?.totalResults ?? 0)
  const [data, setData] = useState(initialData?.results ?? [])
  const [pageSize, setPageSize] = useState(initialData?.limit ?? 10)
  const [startDate, setStartDate] = useState<Date | null>();
  const [endDate, setEndDate] = useState<Date | null>();
  const [RideType, setRideType] = useState<'RIDE_NOW' | 'RIDE_LATER'>('RIDE_NOW')

  useEffect(() => {
    setData(initialData?.results ?? [])
    setTotalResults(initialData?.totalResults ?? 0)
    setPageIndex((initialData?.page ?? 1) - 1)
    setPageSize(initialData?.limit ?? 10)
  }, [initialData])

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


const handleRideTypeChange = useCallback(async (e: any) => {
  const rideType = e.target.value as 'RIDE_NOW' | 'RIDE_LATER'

  const res = await getRequestWithPagination(
    pageSearch,
    1,
    pageSize,
    rideType,
    'isCompleted',
    paymentOpt,
    formattedStartDate,
    formattedEndDate,
    zoneId
  )

  if (!res) return

  setData(res.results)
  setTotalResults(res.totalResults)
  setPageIndex(0)
  setRideType(rideType)
}, [startDate, endDate, pageSearch, pageSize, paymentOpt, RideType])


const handleDateFilter = useCallback(async () => {
  const res = await getRequestWithPagination(
    pageSearch,
    1,
    pageSize,
    RideType,
    'isCompleted',
    paymentOpt,
    formattedStartDate,
    formattedEndDate,
    zoneId
  )

  if (!res) return

  setData(res.results)
  setTotalResults(res.totalResults)
  setPageIndex(0)
}, [startDate, endDate, pageSearch, pageSize, paymentOpt, RideType])


useEffect(() => {
  if (startDate && endDate && endDate < startDate) {
    setEndDate(startDate)
  } else {
    handleDateFilter()
  }
}, [startDate, endDate, RideType])


  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      },
      columnHelper.accessor('requestNumber', {
        header: dictionary['navigation'].RequestId,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography
              component={Link}
              href={getLocalizedUrl(`/${zoneId}/apps/taxi/request/requestView/${row.original._id}`, locale as Locale)}
              color='primary'
            >{`#${row.original.requestNumber}`}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('username', {
        header: dictionary['navigation'].UserName || 'User Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {row.original.userDetails?.firstName?.length > 15 ? (
              <Tooltip title={row.original.userDetails.firstName} arrow placement='bottom'>
                <Typography
                  component={Link}
                  href={getLocalizedUrl(`/${zoneId}/apps/taxi/user/view/${row.original.userDetails._id}`, locale as Locale)}
                  color='primary'
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 150,
                    display: 'inline-block'
                  }}
                >
                  {row.original.userDetails.firstName.substring(0, 15) + '...'}
                </Typography>
              </Tooltip>
            ) : (
              <Typography
                component={row.original.userDetails?._id ? Link : 'span'}
                href={
                  row.original.userDetails?._id
                    ? getLocalizedUrl(`/${zoneId}/apps/taxi/user/view/${row.original.userDetails._id}`, locale as Locale)
                    : undefined
                }
                color='primary'
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 150,
                  display: 'inline-block'
                }}
              >
                {row.original.userDetails?.firstName ?? ''}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('driverId', {
        header: dictionary['navigation'].DriverName || 'Driver Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {row.original.driverDetails?.firstName?.length > 15 ? (
              <Tooltip title={row.original.driverDetails.firstName} arrow placement='bottom'>
                <Typography
                  component={row.original.driverDetails?._id ? Link : 'span'}
                  href={
                    row.original.driverDetails?._id
                      ? getLocalizedUrl(`/${zoneId}/apps/taxi/driver/view/${row.original.driverDetails._id}`, locale as Locale)
                      : undefined
                  }
                  color='primary'
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 150,
                    display: 'inline-block'
                  }}
                >
                  {row.original.driverDetails.firstName.substring(0, 15) + '...'}
                </Typography>
              </Tooltip>
            ) : (
              <Typography
                component={row.original.driverDetails?._id ? Link : 'span'}
                href={
                  row.original.driverDetails?._id
                    ? getLocalizedUrl(`/${zoneId}/apps/taxi/driver/view/${row.original.driverDetails._id}`, locale as Locale)
                    : undefined
                }
                color='primary'
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 150,
                  display: 'inline-block'
                }}
              >
                {row.original.driverDetails?.firstName ?? ''}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('tripStartTime', {
        header: dictionary['navigation'].Date,
        cell: ({ row }) => {
          const dateTime = row.original.tripStartTime

          if (!dateTime) {
            return <Typography variant='body2'>{dictionary['navigation'].NoDateAvailable}</Typography>
          }

          const formattedDate = format(new Date(dateTime), 'yyyy-MM-dd')
          const formatteTime = format(new Date(dateTime), ' HH:mm:ss')

          return (
            <div>
              <Typography>{formattedDate}</Typography>
              <Typography variant='body2'>{formatteTime}</Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('pickupAddress', {
        header: dictionary['navigation'].PickupAddress,
        cell: ({ row }) => {
          const pickupAddress = row.original.placesDetails?.pickAddress ?? ''
          const addressLines: string[] = pickupAddress ? pickupAddress.split(',') : []

          return (
            <div style={{ maxWidth: '200px', overflowY: 'auto' }}>
              {addressLines.length > 0 ? (
                addressLines.map((line: string, index: number) => (
                  <Typography key={index} variant='body2'>
                    {line.trim()}
                  </Typography>
                ))
              ) : (
                <Typography variant='body2'>{dictionary['navigation'].NoAddress}</Typography>
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('dropAddress', {
        header: dictionary['navigation'].DropAddress,
        cell: ({ row }) => {
          const dropAddress = row.original.placesDetails?.dropAddress ?? ''
          const addressLines: string[] = dropAddress ? dropAddress.split(',') : []

          return (
            <div style={{ maxWidth: '200px', overflowY: 'auto' }}>
              {addressLines.length > 0 ? (
                addressLines.map((line: string, index: number) => (
                  <Typography key={index} variant='body2'>
                    {line.trim()}
                  </Typography>
                ))
              ) : (
                <Typography variant='body2'>{dictionary['navigation'].NoAddress}</Typography>
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('action', {
        header: dictionary['navigation'].Action,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <Link href={getLocalizedUrl(`/${zoneId}/apps/taxi/request/requestView/${row.original._id}`, locale as Locale)} className='flex'>
              <i className='tabler-eye text-textSecondary' />
            </Link>
          </div>
        ),
        enableSorting: false
      })
    ],
    [dictionary, locale, pageIndex, pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: filterFns as any,
    state: { rowSelection, globalFilter },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  useEffect(() => {
    table.setPageSize(pageSize)
  }, [pageSize])

//   const fetchPage = useCallback(
//     async (search: string, page: number, limit: number) => {
//       const res = await getRequestWithPagination(
//         search, 
//         page, 
//         limit, 
//         RideType, 
//         'isCompleted', 
//         paymentOpt,
//         formattedStartDate,
//         formattedEndDate,
//         zoneId
//       )

//       if (!res) return null
      
// return res
//     },
//     [paymentOpt, RideType]
//   )

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const res = await getRequestWithPagination(
        pageSearch,
        newPage,
        pageSize,
        RideType,
        'isCompleted',
        paymentOpt,
        formattedStartDate,
        formattedEndDate,
        zoneId
    )

      if (!res) return
      setData(res.results)
      setPageIndex(newPage)
      setTotalResults(res.totalResults)
    } catch (error) {
      console.error('Error fetching new page data:', error)
    }
  }

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value);
    const { results, totalResults } = await getRequestWithPagination(pageSearch, 1, newPageSize, RideType, "isCompleted", paymentOpt, formattedStartDate, formattedEndDate, zoneId);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };

  const handleSearch = useCallback(async (searchTerm: string) => {
    try {
      const result = await getRequestWithPagination(
        searchTerm, 
        1, 
        pageSize, 
        RideType, 
        "isCompleted", 
        paymentOpt,
        formattedStartDate,
        formattedEndDate,
        zoneId
      );


      setPageSearch(searchTerm);
      setData(result.results);
      setTotalResults(result.totalResults);
      setPageIndex(0);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }, [pageSize, zoneId]);

  return (
    <Card>
      <CardContent className='flex justify-between flex-col items-start md:items-center md:flex-row gap-4'>
        <div className='flex items-center gap-x-4'>
          <CustomTextField
            variant='outlined'
            placeholder={dictionary['navigation'].Search}
            value={globalFilter}
            onChange={e => {
              const searchTerm = e.target.value

              setGlobalFilter(searchTerm)
              handleSearch(searchTerm)
            }}
            className='flex-auto'
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
            value={RideType}
            onChange={(e: any) => handleRideTypeChange(e)}
            className='is-[120px]'
            label={dictionary['navigation'].RideType || 'Ride Type'}
            >
            <MenuItem value='RIDE_NOW'>{dictionary['navigation'].RideNow}</MenuItem>
            <MenuItem value='RIDE_LATER'>{dictionary['navigation'].RideLater}</MenuItem>
          </CustomTextField>
        </div>
        <div className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>
          <CustomTextField select value={pageSize} onChange={handlePageSizeChange} className='is-[70px]'>
            {[5, 10, 25, 50].map(size => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </CustomTextField>
          <ExportOptions data={data} tableContainerId='table-container' fileName='Request_Export' dictionary={dictionary} />
        </div>
      </CardContent>

      <div className='overflow-x-auto' id='table-container'>
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
        component={() => (
          <TablePaginationComponent
            table={table}
            totalResults={totalResults}
            pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            dictionary={dictionary}
          />
        )}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handlePageSizeChange}
      />
    </Card>
  )
}

export default PaymentTripsTable
