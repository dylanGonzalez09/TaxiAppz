/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import { useState, useMemo } from 'react'

import { format } from 'date-fns'

// MUI Imports
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

type dataType = {
  Invoice: string
  time: string
  otp: number
  category: string
  instantTrip: string
}

const TripData: dataType[] = [
  {
    Invoice: 'TAXI_000007',
    time: '01-02-2024 05:47:38 PM',
    otp: 799,
    category: 'LOCAL',
    instantTrip: "No"
  },
]

const columnHelper = createColumnHelper<dataType>()

const TripTable = ({ requestData,dictionary }: { requestData?: any,dictionary:any }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(requestData)
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<dataType, any>[]>(() => [
    columnHelper.accessor('Invoice', {
      header: dictionary['navigation'].TripIdDetails?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Trip Id Details',
      cell: ({ row }) => {
          const formattedDate = format(new Date(data[0].tripStartTime), 'yyyy-MM-dd');
         const formatteTime = format(new Date(data[0].tripStartTime), ' HH:mm:ss');

        
return(
        <div className='flex items-center gap-3'>
          <div>
            <Typography color='text.primary' className='font-medium'>
              {data[0].requestNumber}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {`${formattedDate} , ${formatteTime}`}
            </Typography>
          </div>
        </div>
      )},
    }),
    columnHelper.accessor('otp', {
      header: dictionary['navigation'].OTP,
      cell: ({ row }) => <Typography>{`${data[0].requestOtp}`}</Typography>,
    }),
    columnHelper.accessor('category', {
      header: dictionary['navigation'].Category,
      cell: ({ row }) => (
        <Chip
          label={data[0].tripType}
          color='primary'
          variant='tonal'
          size='small'
        />
      ),
    }),
    columnHelper.accessor('instantTrip', {
      header: dictionary['navigation'].InstantTrip,
      cell: ({ row }) => (
        <Chip
          label={data[0].isInstantTrip ? dictionary['navigation'].true : dictionary['navigation'].No}
          color='primary'
          variant='tonal'
          size='small'
        />
      ),
    }),
  ], [])

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
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  return (
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
            {table.getRowModel().rows.slice(0, table.getState().pagination.pageSize).map(row => (
              <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  )
}

const TripDetailsCard = ({ requestData,dictionary }: { requestData?: any,dictionary:any }) => {

  const data = requestData?.[0] ?? {};
  const billing = data.billingDetails ?? {};
  const zonePrices = data.zonePrice ?? [];
  const vehicleId = data.vehicleDetails?.vehicleId;

  const fallbackBasePrice = data.zonepriceDetails?.ridenowBasePrice?.$numberDecimal;
  const tripBasePrice = data.tripBasePrice;

  // Prefer billing.basePrice, then tripBasePrice, then fallback
  const basePrice =
    billing?.basePrice?.$numberDecimal ??
    billing?.basePrice ??
    tripBasePrice ??
    fallbackBasePrice ??
    '0';

  const currency = data?.requestedCurrencySymbol;
  const unit = data?.unit;
  let extraDistance;

  if(billing?.totalDistance > 0)
  {
     extraDistance = billing?.totalDistance - billing?.baseDistance;
  }
  else{
    extraDistance = 0;
  }
  

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].TripDetails} />
      <TripTable requestData={requestData} dictionary={dictionary} />
      <hr className='my-4 border-t w-full max-w-[800px]' />
      <CardHeader title={dictionary['navigation'].TripBill} />

      <CardContent className='flex flex-col items-end space-y-2'>

        {/* Base Price */}
        <div className='flex justify-between w-full max-w-[400px]'>
          <Typography color='text.primary' className='min-w-[100px]'>
            {dictionary['navigation'].BasePrice} ({billing?.baseDistance} {unit}):
          </Typography>
          <Typography color='text.primary' className='font-medium'>
           {currency} {parseFloat(basePrice).toFixed(2)}
          </Typography>
        </div>

        {/* total distance */}
        { billing?.totalDistance != 0 && (
        <div className='flex justify-between w-full max-w-[400px]'>
          <Typography color='text.primary' className='min-w-[100px]'>
            {dictionary['navigation'].totalDistance}:
          </Typography>
          <Typography color='text.primary' className='font-medium'>
           {billing?.totalDistance}
          </Typography>
        </div>
        )}

        {/* Distance Price */}
        {billing.distancePrice !== null && billing.distancePrice !== undefined && billing.distancePrice !== 0 && (
          <div className='flex justify-between w-full max-w-[400px]'>
            <Typography color='text.primary' className='min-w-[100px]'>
              {dictionary['navigation'].DistancePrice} ({extraDistance} {unit} * {currency}{billing?.pricePerDistance}):
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency} {parseFloat(billing.distancePrice?.$numberDecimal ?? billing.distancePrice).toFixed(2)}
            </Typography>
          </div>
        )}

        {billing.waitingCharge !== null && billing.waitingCharge !== undefined && billing.waitingCharge !== 0 && (
          <div className='flex justify-between w-full max-w-[400px]'>
            <Typography color='text.primary' className='min-w-[100px]'>
              {dictionary['navigation'].waitingCharge}:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency} {parseFloat(billing.waitingCharge?.$numberDecimal ?? billing.waitingCharge).toFixed(2)}
            </Typography>
          </div>
        )}

        <hr className='my-4 border-t w-full max-w-[400px]' />

        {/* Total Amount */}
        {billing.totalAmount && (
          <div className='flex justify-between w-full max-w-[400px]'>
            <Typography color='text.primary' className='font-medium min-w-[100px]'>
              {dictionary['navigation'].Total}:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency} {parseFloat(billing.totalAmount?.$numberDecimal ?? billing.totalAmount).toFixed(2)}
            </Typography>
          </div>
        )}

        <hr className='my-4 border-t w-full max-w-[400px]' />
        {/* V Taxi Commission */}
        {billing.adminCommission !== null && billing.adminCommission !== undefined && billing.adminCommission !== 0 &&(
          <div className='flex justify-between w-full max-w-[400px]'>
            <Typography color='text.primary' className='min-w-[100px]'>
              {dictionary['navigation'].TaxiCommission}:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
             - {currency} {parseFloat(billing.adminCommission?.$numberDecimal ?? billing.adminCommission).toFixed(2)}
            </Typography>
          </div>
        )}

        {/* Service Tax */}
        {billing.serviceTax !== null && billing.serviceTax !== undefined && billing.serviceTax !== 0 && (
          <div className='flex justify-between w-full max-w-[400px]'>
            <Typography color='text.primary' className='min-w-[100px]'>
              {dictionary['navigation'].ServiceTax}:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
             - {currency} {parseFloat(billing.serviceTax?.$numberDecimal ?? billing.serviceTax).toFixed(2)}
            </Typography>
          </div>
        )}

        {/* Driver Commission */}
        {billing.driverCommission && (
          <div className='flex justify-between w-full max-w-[400px]'>
            <Typography color='text.primary' className='font-medium min-w-[100px]'>
              {dictionary['navigation'].driverCommission}:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency} {parseFloat(billing.driverCommission?.$numberDecimal ?? billing.driverCommission).toFixed(2)}
            </Typography>
          </div>
        )}
      </CardContent>
      
    </Card>
  );
};

export default TripDetailsCard


