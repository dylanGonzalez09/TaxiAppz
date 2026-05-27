/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client'

import type { ChangeEvent } from 'react'
import React, { useState, useMemo, useCallback } from 'react'

import Link from 'next/link'
  
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

import { deleteBrandById, getBrandByPagination } from '@apis/brand'
import type { Locale } from '@configs/i18n'
import { getLocalizedUrl } from '@/utils/i18n'

import ConfirmationDialog from '@/components/dialogs/delete-data'
import AddBrandDialog from './AddEditDrawer'
import ExportOptions from '@/utils/ExportOptions'
import TablePaginationComponent from '@/components/CustomTablePaginationComponent'
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle'

interface BrandType {
  id: string
  _id: string
  brandName: string
  vehicleName: string
  image: string
  vehicleId: string
  status: boolean
}

const fuzzyFilter: FilterFn<BrandType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId)

  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase())
}

const columnHelper = createColumnHelper<BrandType>()

const BrandTable = ({ brandData, dictionary, zoneId }: { brandData: any; dictionary: any; zoneId:string }) => {
  const [addBrandOpen, setAddBrandOpen] = useState(false)
  const [editData, setEditData] = useState<BrandType | undefined>(undefined)
  const [rowSelection, setRowSelection] = useState({})
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteBrandId, setDeleteBrandId] = useState<string | null>(null)

  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(brandData?.page - 1 || 0)
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(brandData?.totalResults || 0)

  const [data, setData] = useState<BrandType[]>(() => {
    // Normalize initial data to ensure id field exists
    const initialResults = brandData?.results || []

    
return initialResults.map((brand: any) => ({
      ...brand,
      id: brand.id || brand._id?.toString() || brand._id
    }))
  })

  const [pageSize, setPageSize] = useState(brandData?.limit || 10)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorData, setErrorData] = useState('')

  const { id: vehicleId, lang: locale } = useParams() as { id: string; lang: string }

  const handlePageChangeForAddRecord = () => {
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

    // Ensure we don't go to negative page
    const targetPage = Math.max(0, pageIndex - 1)

    handlePageChange(dummyEvent, targetPage)
  }


  const columns = useMemo<ColumnDef<BrandType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      },
      columnHelper.accessor('brandName', {
        header: dictionary['navigation'].BrandName || 'Brand Name',
        cell: ({ row }) => (
          <>
            <Typography className='font-medium'>{row.original.brandName}</Typography>
            {row.original.vehicleName && (
              <Typography variant='body2' className='text-wrap' style={{ color: 'green' }}>
                {row.original.vehicleName}
              </Typography>
            )}
          </>
        )
      }),
      columnHelper.accessor('image', {
        header: dictionary['navigation'].BrandImage || 'Brand Image',
        cell: ({ row }) => {
          const imagePath = row.original.image?.startsWith('/uploads/')
            ? `${BASE_IMAGE_URL}${row.original.image}`
            : `${BASE_IMAGE_URL}/uploads/brands/${row.original.image}`
          
          return (
            <img
              src={imagePath}
              alt={row.original.brandName}
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
            <IconButton>
              <Link
                href={getLocalizedUrl(`${zoneId}/apps/taxi/master/vehicle-model/${row.original._id || row.original.id}`, locale as Locale)}
                className='flex'
              >
                <i className='tabler-arrow-right bg-primary' />
              </Link>
            </IconButton>
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
    initialState: {
      pagination: {
        pageSize: 25
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter as FilterFn<BrandType>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleEditClick = (rowData: BrandType) => {
    setEditData(rowData)
    setAddBrandOpen(true)
  }

  const handleDeleteClick = (original: BrandType) => {
    setDeleteBrandId(original._id || original.id)
    setDeleteConfirmationOpen(true)
  }

  const handlePagecurrentForAddRecord = () => {
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

    // Ensure we don't go to negative page
    const targetPage = Math.max(0, pageIndex)

    handlePageChange(dummyEvent, targetPage)
  }

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteBrandId) {
      try {
        const response = await deleteBrandById(deleteBrandId)

        if (!response) {
          toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthebrand || 'An error occurred while deleting the brand')
          setDeleteConfirmationOpen(false)
          setDeleteBrandId(null)
          
return
        }

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg)
          setErrorDialogOpen(true)
          setErrorData(response.status)
        } else if (response.status === httpStatus.OK || response.status === 200) {
          // Successfully deleted
          if (data.length != 1) {
            setData(data.filter(brand => {
              const brandId = brand._id || brand.id

              
return brandId !== deleteBrandId
            }))
            handlePagecurrentForAddRecord()
          } else {
            handlePageChangeForAddRecord()
          }

          toast.success(dictionary['navigation'].Branddeletedsuccessfully || 'Brand deleted successfully')
        }

        setDeleteConfirmationOpen(false)
        setDeleteBrandId(null)
      } catch (error) {
        console.error('Delete error:', error)
        toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthebrand || 'An error occurred while deleting the brand')
        setDeleteConfirmationOpen(false)
        setDeleteBrandId(null)
      }
    } else {
      setDeleteConfirmationOpen(false)
      setDeleteBrandId(null)
    }
  }

  const handleCloseDialog = () => {
    setAddBrandOpen(false)
    setEditData(undefined)
  }

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      // Ensure newPage is not negative
      const safePage = Math.max(0, newPage)
      const { results, totalResults } = await getBrandByPagination(vehicleId, pageSearch, safePage, pageSize)

      // Normalize data to ensure id field exists
      const normalizedResults = results.map((brand: any) => ({
        ...brand,
        id: brand.id || brand._id?.toString() || brand._id
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

    const { results, totalResults } = await getBrandByPagination(vehicleId, pageSearch, 1, newPageSize)

    // Normalize data to ensure id field exists
    const normalizedResults = results.map((brand: any) => ({
      ...brand,
      id: brand.id || brand._id?.toString() || brand._id
    }))

    setPageSize(newPageSize)
    setData(normalizedResults)
    setTotalResults(totalResults)
    setPageIndex(0)
  }

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getBrandByPagination(
          vehicleId,
          searchTerm,
          1,
          pageSize
        )

        setPageSearch(searchTerm)
        
        // Normalize data to ensure id field exists
        const normalizedResults = result.results.map((brand: any) => ({
          ...brand,
          id: brand.id || brand._id?.toString() || brand._id
        }))
        
        setData(normalizedResults)
        setTotalResults(result.totalResults)
        setPageIndex(0)
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
    },
    [pageSize, vehicleId]
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

          <div className='flex items-center gap-x-4'>
            <CustomTextField select value={pageSize} onChange={e => handlePageSizeChange(e)} className='flex-auto'>
              {[5, 10, 15, 25].map(size => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </CustomTextField>
              {/* <Button
                            variant='contained'
                            startIcon={<i className='tabler-arrow-narrow-left' />}
                            href={ getLocalizedUrl(`${zoneId}/apps/taxi/master/vehicle`, locale as Locale)}
                          >
                            {dictionary['navigation'].Back}
                        </Button> */}
            <ExportOptions
              data={data}
              tableContainerId='table-container'
              fileName='Brand_Export'
              dictionary={dictionary}
            />
            <Button
              variant='contained'
              onClick={() => setAddBrandOpen(true)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].AddBrand || 'Add Brand'}
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
      <AddBrandDialog
        open={addBrandOpen}
        handleClose={handleCloseDialog}
        brandData={data}
        dictionary={dictionary}
        setData={setData}
        editData={editData}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        vehicleId={vehicleId}
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
          <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
          <Typography variant='h4' className='mbe-2'>
            {dictionary['navigation'].Error}
          </Typography>
          <Typography color='text.primary'>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' color='error' onClick={() => setErrorDialogOpen(false)}>
            {dictionary['navigation'].OK}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BrandTable
