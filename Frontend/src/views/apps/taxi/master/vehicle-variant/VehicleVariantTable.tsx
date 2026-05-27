/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client'

import type { ChangeEvent } from 'react'
import React, { useState, useMemo, useCallback } from 'react'

import { useParams } from 'next/navigation'

import classnames from 'classnames'

import TablePagination from '@mui/material/TablePagination'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'

import { MenuItem, Button, Typography, Card, Dialog, DialogActions, DialogContent, IconButton } from '@mui/material'

import { StatusCodes as httpStatus } from 'http-status-codes'

import { toast } from 'react-toastify'

import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'

import tableStyles from '@core/styles/table.module.css'

import { BASE_IMAGE_URL } from '@apis/endpoint'

import { deleteVehicleVariantById, getVehicleVariantByPagination } from '@apis/vehicleVariant'

import ConfirmationDialog from '@/components/dialogs/delete-data'
import AddVehicleVariantDialog from './AddEditDrawer'
import ExportOptions from '@/utils/ExportOptions'
import TablePaginationComponent from '@/components/CustomTablePaginationComponent'
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle'

interface VehicleVariantType {
  id: string
  _id: string
  variantName: string
  description: string
  image: string
  vehicleId: string
  vehicleModelId: string
  vehicleModelName: string
  brandName: string
  brandId: string
  vehicleName: string
  status: boolean
}

const fuzzyFilter: FilterFn<VehicleVariantType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId)

  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase())
}

const columnHelper = createColumnHelper<VehicleVariantType>()

const VehicleVariantTable = ({ vehicleVariantData, dictionary, zoneId, brandId: brandIdProp }: { vehicleVariantData: any; dictionary: any; zoneId: string; brandId?: string | null }) => {
  const [addVariantOpen, setAddVariantOpen] = useState(false)
  const [editData, setEditData] = useState<VehicleVariantType | undefined>(undefined)
  const [rowSelection, setRowSelection] = useState({})
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteVariantId, setDeleteVariantId] = useState<string | null>(null)

  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(vehicleVariantData?.page -1 || 0) // Convert to 0-based index for the table
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(vehicleVariantData?.totalResults || 0) // To track the total number of records

  const [data, setData] = useState<VehicleVariantType[]>(() => {
    // Normalize initial data to ensure id and brandId fields exist
    const initialResults = vehicleVariantData?.results || []

    
return initialResults.map((variant: any) => ({
      ...variant,
      id: variant.id || variant._id?.toString() || variant._id,
      brandId: variant.brandId?._id || variant.brandId || variant.brandid
    }))
  })

  const [pageSize, setPageSize] = useState(vehicleVariantData?.limit || 10)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorData, setErrorData] = useState('')


  const { id: vehicleModelId, lang: locale } = useParams() as { id: string; lang: string }

  // Get brandId: prefer prop from page (always available), fallback to first variant's brandId
  const brandId: string | null =
    brandIdProp ??
    (data.length > 0 && data[0].brandId
      ? typeof data[0].brandId === 'object' && 'id' in (data[0].brandId as any)
        ? ((data[0].brandId as any).id as string)
        : (data[0].brandId as string)
      : null)

  const handlePageChangeForAddRecord = () => {
    // Create a dummy event object
    const dummyEvent = {
      target: {
        value: pageIndex
      },
      currentTarget: {
        value: pageIndex
      },
      nativeEvent: {} as Event,
      bubbles: false
    } as unknown as ChangeEvent<unknown>

    // Trigger onPageChange with the new page
    handlePageChange(dummyEvent, pageIndex - 1)
  }


  const columns = useMemo<ColumnDef<VehicleVariantType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      },
      columnHelper.accessor('variantName', {
        header: dictionary['navigation'].VariantName || 'Variant Name',
        cell: ({ row }) => (
          <>
            <Typography className='font-medium'>{row.original.variantName}</Typography>
            {row.original.vehicleModelId && (
              <Typography variant='body2' className='text-wrap' style={{ color: 'green' }}>
                {(row.original.vehicleModelId as any).modelname}
              </Typography>
            )}
            {row.original.vehicleModelId && (
              <Typography variant='body2' className='text-wrap' style={{ color: 'orange' }}>
                {(row.original.vehicleModelId as any).brandId.brandName}
              </Typography>
            )}
            {row.original.vehicleModelId && (
              <Typography variant='body2' className='text-wrap' style={{ color: 'blue' }}>
                {(row.original.vehicleModelId as any).brandId.vehicleId.vehicleName}
              </Typography>
            )}
          </>
        )
      }),
      columnHelper.accessor('image', {
        header: dictionary['navigation'].VariantImage || 'Variant Image',
        cell: ({ row }) => {
          const imagePath = row.original.image?.startsWith('/uploads/')
            ? `${BASE_IMAGE_URL}${row.original.image}`
            : `${BASE_IMAGE_URL}/uploads/vehicleVariants/${row.original.image}`
          
          return (
            <img
              src={imagePath}
              alt={row.original.variantName}
              style={{ width: '100px', height: '30px', borderRadius: '4px' }}
            />
          )
        }
      }),


      {
        id: 'actions',
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
                    onClick: () => handleEditClick(row.original)
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, dictionary]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
   
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter as FilterFn<VehicleVariantType>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleEditClick = (rowData: VehicleVariantType) => {
    setEditData(rowData)
    setAddVariantOpen(true)
  }

  const handleDeleteClick = (original: VehicleVariantType) => {
    setDeleteVariantId(original.id)
    setDeleteConfirmationOpen(true)
  }

  const handlePagecurrentForAddRecord = () => {
    // Create a dummy event object
    const dummyEvent = {
      target: {
        value: pageIndex
      },
      currentTarget: {
        value: pageIndex
      },
      nativeEvent: {} as Event,
      bubbles: false
    } as unknown as ChangeEvent<unknown>

    // Trigger onPageChange with the new page
    handlePageChange(dummyEvent, pageIndex)
  }

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteVariantId) {
      try {
        const response = await deleteVehicleVariantById(deleteVariantId)

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg)
          setErrorDialogOpen(true)
        } else {
          if (data.length != 1) {
            setData(data.filter(variant => variant.id !== deleteVariantId))
            handlePagecurrentForAddRecord()
          } else {
            handlePageChangeForAddRecord()
          }
        }

        setErrorData(response.status)
        setDeleteConfirmationOpen(false)
        setDeleteVariantId(null)
      } catch (error) {
        toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthevariant || 'An error occurred while deleting the variant')
      }
    } else {
      setDeleteConfirmationOpen(false)
      setDeleteVariantId(null)
    }
  }

  const handleCloseDialog = () => {
    setAddVariantOpen(false)
    setEditData(undefined)
  }

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      // Backend expects 1-based page index, convert from 0-based UI index.
      const apiPage = Math.max(1, newPage) // Ensure page is at least 1
      const { results, totalResults } = await getVehicleVariantByPagination(vehicleModelId, pageSearch, apiPage, pageSize)

      // Normalize data to ensure id and brandId fields exist
      const normalizedResults = results.map((variant: any) => ({
        ...variant,
        id: variant.id || variant._id?.toString() || variant._id,
        brandId: variant.brandId?._id || variant.brandId || variant.brandid
      }))

      setData(normalizedResults)
      setPageIndex(newPage)
      setTotalResults(totalResults)
    } catch (error) {
      console.error('Error fetching new page data:', error)
    }
  }

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value)

    const { results, totalResults } = await getVehicleVariantByPagination(vehicleModelId, pageSearch, 1, newPageSize)

    // Normalize data to ensure id and brandId fields exist
    const normalizedResults = results.map((variant: any) => ({
      ...variant,
      id: variant.id || variant._id?.toString() || variant._id,
      brandId: variant.brandId?._id || variant.brandId || variant.brandid
    }))

    setPageSize(newPageSize)
    setData(normalizedResults)
    setTotalResults(totalResults)
    setPageIndex(0)
  }

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getVehicleVariantByPagination(
          vehicleModelId,
          searchTerm,
          1, // Reset to first page on new search
          pageSize
        )

        setPageSearch(searchTerm)
        
        // Normalize data to ensure id and brandId fields exist
        const normalizedResults = result.results.map((variant: any) => ({
          ...variant,
          id: variant.id || variant._id?.toString() || variant._id,
          brandId: variant.brandId?._id || variant.brandId || variant.brandid
        }))
        
        setData(normalizedResults)
        setTotalResults(result.totalResults)
        setPageIndex(0) // Reset to first page
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
    },
    [pageSize, vehicleModelId]
  )

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
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

          {/* end pagination */}

          <div className='flex items-center gap-x-4'>
            <CustomTextField select value={pageSize} onChange={e => handlePageSizeChange(e)} className='flex-auto'>
              {[5, 10, 15, 25].map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </CustomTextField>
            {/* {brandId && (
              <Button
                variant='contained'
                startIcon={<i className='tabler-arrow-narrow-left' />}
                onClick={() => {
                  const brandIdValue = typeof brandId === 'object' && brandId !== null && '_id' in brandId 
                    ? brandId 
                    : brandId

                  router.push(getLocalizedUrl(`${zoneId}/apps/taxi/master/vehicle-model/${brandIdValue}`, locale as Locale))
                }}
              >
                {dictionary['navigation'].Back}
              </Button>
            )} */}
            <ExportOptions
              data={data}
              tableContainerId='table-container'
              fileName='VehicleVariant_Export'
              dictionary={dictionary}
            />
            <Button
              variant='contained'
              onClick={() => setAddVariantOpen(true)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].AddVariant || 'Add Variant'}
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto' id='table-container'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
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
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
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
              dictionary={dictionary} // Pass the dictionary prop
            />
          )}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />
      </Card>
      <AddVehicleVariantDialog
        open={addVariantOpen}
        handleClose={handleCloseDialog}
        variantData={data}
        dictionary={dictionary}
        setData={setData}
        editData={editData}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        vehicleModelId={vehicleModelId}
      />
      <ConfirmationDialogErrorHandle
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType='delete-data'
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}
        status={errorData}
      />

      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogContent className='flex items-center flex-col text-center'>
          {/* Error icon */}
          <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
          {/* Error title */}
          <Typography variant='h4' className='mbe-2'>
            {dictionary['navigation'].Error}
          </Typography>
          {/* Error message */}
          <Typography color='text.primary'>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          {/* OK button */}
          <Button variant='contained' color='error' onClick={() => setErrorDialogOpen(false)}>
            {dictionary['navigation'].OK}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default VehicleVariantTable
