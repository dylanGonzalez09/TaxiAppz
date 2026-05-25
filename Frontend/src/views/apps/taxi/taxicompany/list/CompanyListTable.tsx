/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import type { ChangeEvent} from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react'

import '@tanstack/table-core'

import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import classnames from 'classnames'
import type { TextFieldProps } from '@mui/material/TextField'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { rankItem } from '@tanstack/match-sorter-utils'


import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

import { toast } from 'react-toastify';

import Switch from '@mui/material/Switch' // Import the Switch component

import type { Locale } from '@configs/i18n'


import { useIsDemoUser } from '@/utils/demoUser'

import OptionMenu from '@core/components/option-menu'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/CustomTablePaginationComponent'
import tableStyles from '@core/styles/table.module.css'
import { deleteByCompanyId, getCompanyByPagination, updateCompanyStatus } from '@apis/company'

import { getLocalizedUrl } from '@/utils/i18n'
import ExportOptions from '@/utils/ExportOptions'

import ConfirmationDialog from '@/components/dialogs/delete-data'
import { deleteByUserId } from '@/app/api/apps/taxi/user'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export type CompanyType = {
  id?: string
  companyName?: string
  companyEmail?: string
  phoneNumber?: string
  password?: string
  confirmPassword?: string
  role?: number | string
  gender?: string
  language?: number | string
  country?: number | string
  status?: boolean
  active?: boolean
  userId?: string
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Sample Data
const columnHelper = createColumnHelper<CompanyType>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CompanyTable = ({
  tableData,
  dictionary,
  privillageData
}: {
  tableData?: any
  dictionary: any
  privillageData: any
}) => {
  const [addCompanyOpen, setAddCompanyOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<CompanyType | null>(null)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false)
  const [statusCompany, setstatusCompany] = useState<CompanyType | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
  const [deleteCompanyId, setdeleteCompanyId] = useState<string | null>(null)
  const [deleteUserId, setdeleteUserId] = useState<string | null>(null)

  const [pageIndex, setPageIndex] = useState(tableData.page - 1)
  const [pageSearch, setPageSearch] = useState('')
  const [totalResults, setTotalResults] = useState(tableData.totalResults) // To track the total number of records
  const [data, setData] = useState(tableData.results)
  const [pageSize, setPageSize] = useState(tableData.limit)
  const { lang: locale } = useParams()

  const { isDemoUser, checkDemoStatus } = useIsDemoUser();


  const handleDeleteClick = (companyId: string, userId: string) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].editError);

      return;
      }

    setdeleteCompanyId(companyId)
    setdeleteUserId(userId) // Convert number to string
    setDeleteConfirmationOpen(true)
  }

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteCompanyId && deleteUserId) {
      try {
        8
        await deleteByCompanyId(deleteCompanyId)

        await deleteByUserId(deleteUserId)

        if (data.length != 1) {
          setData((prevData: any[]) => prevData.filter(company => company.id !== deleteCompanyId)) // Convert id to string for comparison
          handlePagecurrentForAddRecord()
        } else {
          handlePageChangeForAddRecord();
        }

        setDeleteConfirmationOpen(false)
        setdeleteCompanyId(null)
      } catch (error) {
        // Handle error (e.g., show an error message)
      }
    } else {
      setDeleteConfirmationOpen(false)
      setdeleteCompanyId(null)
    }
  }

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

  const handleStatusToggle = async (company: CompanyType) => {
    setstatusCompany(company)
    setStatusConfirmationOpen(true)
  }

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusCompany) {
      const updatedCompany = { ...statusCompany, status: !statusCompany.status }

      try {
        const body = {
          status: !statusCompany.status
        }

        if (statusCompany.id) {
          await updateCompanyStatus(statusCompany.id.toString(), body)

          // Assume you have this API function
          setData((prevData: any[]) =>
            prevData.map(company => (company.id === statusCompany.id ? updatedCompany : company))
          )
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

          setStatusConfirmationOpen(false)
          setstatusCompany(null)
        } else {
          console.error('UserId is undefined')
        }
      } catch (error) {
        console.error('Failed to update company status:', error)
        setStatusConfirmationOpen(false)
      }
    } else {
      setStatusConfirmationOpen(false)
      setstatusCompany(null) // Clear the statusCompany after the operation
    }
  }

  // Start pagination

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getCompanyByPagination(pageSearch, newPage, pageSize)

      setData(results)
      setPageIndex(newPage)
      setTotalResults(totalResults)
    } catch (error) {
      console.error('Error fetching new page data:', error)
    }
  }

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value)

    const { results, totalResults } = await getCompanyByPagination(pageSearch, pageIndex, newPageSize)

    setPageSize(newPageSize)
    setData(results)
    setTotalResults(totalResults)
  }

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getCompanyByPagination(
          searchTerm,
          1, // Reset to first page on new search
          pageSize
        )

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

  // End pagination

  const columns = useMemo<ColumnDef<CompanyType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      },
      columnHelper.accessor('companyName', {
        header: dictionary['navigation'].CompanyName,
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.companyName}
          </Typography>
        )
      }),
      columnHelper.accessor('companyEmail', {
        header: dictionary['navigation'].CompanyEmail,
        cell: ({ row }) => <Typography>{row.original.companyEmail}</Typography>
      }),
      columnHelper.accessor('role', {
        header: dictionary['navigation'].Role,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cell: ({ row }) => <Typography>{dictionary['navigation'].Company}</Typography>
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
                  color: row.original.status ? 'green' : 'red' // Color for unchecked state
                },
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: row.original.status ? 'green' : 'red' // Color for checked state
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: 'white' // Inner knob color
                },
                '& .MuiSwitch-track': {
                  backgroundColor: row.original.status ? 'green' : 'red' // Track color
                }
              }}
            />
          </div>
        )
      }),
      {
        id: 'actions',
        header: dictionary['navigation'].Actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                // Check if user has 'Edit' privilege
                {
                  text: dictionary['navigation'].Edit,
                  icon: 'tabler-pencil',
                  href: getLocalizedUrl(`/apps/taxi/company/list/editcompany/${row.original.id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary'
                  }
                },

                // Check if user has 'Delete' privilege
                privillageData.includes('Delete') && {
                  text: dictionary['navigation'].Delete,
                  icon: 'tabler-trash',
                  menuItemProps: {
                    onClick: () => {
                      if (row.original.id !== undefined && row.original.userId !== undefined) {
                        handleDeleteClick(row.original.id.toString(), row.original.userId?.toString())
                      } else {
                        console.error('ID or userId is undefined')
                      }
                    }
                  }
                }
              ]} // Remove any `false` options
            />
          </div>
        ),
        enableSorting: false
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

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
  })

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
            <ExportOptions
              data={data}
              tableContainerId='table-container'
              fileName='Company_Export'
              dictionary={dictionary}
            />
            {privillageData.includes('Add') && (
              <Button
                variant='contained'

                // onClick={() => {
                //   setEditCompany(null)
                //   setAddCompanyOpen(true)
                // }}
                href={getLocalizedUrl('apps/taxi/company/list/addcompany', locale as Locale)}
                startIcon={<i className='tabler-plus' />}
              >
                {dictionary['navigation'].AddNewCompany}
              </Button>
            )}
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
              {table.getFilteredRowModel().rows.length === 0 ? (
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
        {/* start pagination */}
        <TablePagination
          component={() => (
            <TablePaginationComponent
              table={table} // Pass the table object
              totalResults={totalResults} // Pass the total results
              pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex} // Current page index
              pageSize={pageSize} // Current page size
              handlePageChange={handlePageChange} // Page change handler
              handlePageSizeChange={handlePageSizeChange} // Page size change handler
              dictionary={dictionary}
            />
          )}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />

        {/* end pagination */}
      </Card>
      {/* <AddCompany
        open={addCompanyOpen}
        setOpen={setAddCompanyOpen}
        data={data}
        setData={setData}
        handleClose={() => setAddCompanyOpen(false)}
        editCompany={editCompany}
        setEditCompany={setEditCompany}
      /> */}

      <ConfirmationDialog
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType='delete-data'
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}
      />
      <ConfirmationDialog
        open={statusConfirmationOpen}
        setOpen={setStatusConfirmationOpen}
        confirmationType='status-data'
        onConfirm={handleConfirmStatus}
        dictionary={dictionary}
      />
    </>
  )
}

export default CompanyTable
