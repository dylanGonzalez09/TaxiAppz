'use client'

// React Imports
import { useState, useMemo, useCallback } from 'react'

import Link from 'next/link'

import { useParams } from 'next/navigation'

// Next Imports

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

// Component Imports

import { format } from 'date-fns'

import Tooltip from '@mui/material/Tooltip'

import TablePaginationComponent from '@components/CustomTablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import ExportOptions from '@/utils/ExportOptions'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'
import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'
import { getRequestWithPagination } from '@/app/api/apps/taxi/request'

// Filter Function
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper<any>()

const StartedTab = ({ StartedData, dictionary }: { StartedData?: any; dictionary: any }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const { lang: locale } = useParams()

  const [pageIndex, setPageIndex] = useState(StartedData.page - 1)
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(StartedData.totalResults)
  const [data, setData] = useState(StartedData.results)
  const [pageSize, setPageSize] = useState(StartedData.limit)

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
              href={getLocalizedUrl(`/apps/taxi/request/requestView/${row.original._id}`, locale as Locale)}
              color='primary'
            >{`#${row.original.requestNumber}`}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('username', {
        header: dictionary['navigation'].UserName || 'User Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {row.original.userDetails.firstName?.length > 15 ? (
              <Tooltip title={row.original.userDetails.firstName} arrow placement='bottom'>
                <Typography
                  component={Link}
                  href={getLocalizedUrl(
                    `/apps/taxi/user/view/${row.original.userDetails._id}`,
                    locale as Locale
                  )}
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
                component={Link}
                href={getLocalizedUrl(`/apps/taxi/user/view/${row.original.userDetails._id}`, locale as Locale)}
                color='primary'
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 150,
                  display: 'inline-block'
                }}
              >
                {row.original.userDetails.firstName ?? ''}
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('driverId', {
        header: dictionary['navigation'].DriverName || 'Driver Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {row.original.driverDetails.firstName?.length > 15 ? (
              <Tooltip title={row.original.driverDetails.firstName} arrow placement='bottom'>
                <Typography
                  component={row.original.driverDetails._id ? Link : 'span'}
                  href={
                    row.original.driverDetails._id
                      ? getLocalizedUrl(`apps/taxi/driver/view/${row.original.driverDetails._id}`, locale as Locale)
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
                component={row.original.driverDetails._id ? Link : 'span'}
                href={
                  row.original.driverDetails._id
                    ? getLocalizedUrl(`apps/taxi/driver/view/${row.original.driverDetails._id}`, locale as Locale)
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
                {row.original.driverDetails.firstName ?? ''}
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
          const pickupAddress = row.original.placesDetails ? row.original.placesDetails?.pickAddress : ''

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
          const dropAddress = row.original.placesDetails ? row.original.placesDetails?.dropAddress : ''

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
            <Link href={`/apps/taxi/request/requestView/${row.original._id}`} className='flex'>
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
    data: data,
    columns,
    state: {
      rowSelection,
      globalFilter
    },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getRequestWithPagination(
        pageSearch,
        newPage,
        pageSize,
        'RIDE_LATER',
        'isTripStart'
      )

      setData(results)

      setPageIndex(newPage)
      setTotalResults(totalResults)
    } catch (error) {
      console.error('Error fetching new page data:', error)
    }
  }

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value)

    const { results, totalResults } = await getRequestWithPagination(
      pageSearch,
      1,
      newPageSize,
      'RIDE_LATER',
      'isTripStart'
    )

    setPageSize(newPageSize)
    setData(results)
    setTotalResults(totalResults)
    setPageIndex(0)
  }

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getRequestWithPagination(searchTerm, 1, pageSize, 'RIDE_LATER', 'isTripStart')

        setPageSearch(searchTerm)
        setData(result.results)
        setTotalResults(result.totalResults)
        setPageIndex(0) // Reset to first page
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
    },
    [pageSize]
  )

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
        <div className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
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
            table={table} // Pass the table object
            totalResults={totalResults} // Pass the total results
            pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex} // Current page index
            pageSize={pageSize} // Current page size
            handlePageChange={handlePageChange} // Page change handler
            handlePageSizeChange={handlePageSizeChange} // Page size change handler
            dictionary={dictionary} // Pass the dictionary for localization
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

export default StartedTab
