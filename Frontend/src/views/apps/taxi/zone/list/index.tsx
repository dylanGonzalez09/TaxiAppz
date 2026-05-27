/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import classnames from 'classnames'
import type { TextFieldProps } from '@mui/material/TextField'

import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import Switch from '@mui/material/Switch'; // Import the Switch component

import { CSVLink } from 'react-csv';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { Dialog, DialogActions, DialogContent } from '@mui/material';

import { toast } from 'react-toastify';

import type { ThemeColor } from '@core/types'
import type { ZoneType } from '@/types/apps/zoneTypes'
import type { Locale } from '@configs/i18n'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/CustomTablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'
import tableStyles from '@core/styles/table.module.css'
import { useIsDemoUser } from '@/utils/demoUser'

import ConfirmationDialog from '@/components/dialogs/delete-data';
import { deleteByZoneId, getByZoneByPagination, updateZoneStatus } from '@/app/api/apps/taxi/zone';
import ExportOptions from '@/utils/ExportOptions';

import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type ZoneTypeWithAction = ZoneType & {
  action?: string
}


type ZoneStatusType = {
  [key: string]: ThemeColor
}


const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)


  addMeta({ itemRank })

  return itemRank.passed
}

const zoneStatusObj: ZoneStatusType = {
  Active: 'success',
  pending: 'warning',
  InActive: 'secondary'
}

const columnHelper = createColumnHelper<ZoneTypeWithAction>()

const ZoneListTable = ({ tableData, dictionary,zoneId }: { tableData?: any, dictionary: any,zoneId:any }) => {
  const [status, setStatus] = useState<'active' | 'inactive' | 'block' | ''>('');
  const [addZoneOpen, setAddZoneOpen] = useState(false)
  const [editZoneOpen, setEditZoneOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentZone, setCurrentZone] = useState<ZoneType | null>(null)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteZoneId, setdeleteZoneId] = useState<string | null>(null); // Ensure type consistency
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusZone, setstatusZone] = useState<any | null>(null);


  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(tableData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(tableData.totalResults); // To track the total number of records
  const [data, setData] = useState(tableData.results);
  const [filteredData, setFilteredData] = useState<ZoneType[]>(data)
  const [pageSize, setPageSize] = useState(tableData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');

  const { isDemoUser, checkDemoStatus } = useIsDemoUser();

  const handleEditZone = (zone: ZoneType) => {


    setCurrentZone(zone)
    setEditZoneOpen(true)

  }

  const handleDeleteClick = (zoneid: number) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);

      return;
    }

    setdeleteZoneId(zoneid.toString());
    setDeleteConfirmationOpen(true);

  };


  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteZoneId) {
      try {
        const response = await deleteByZoneId(deleteZoneId);

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        }
        else {
          setData((data: any[]) => data.filter(zone => zone._id.toString() !== deleteZoneId));
        }

        setErrorData(response.status);
        setDeleteConfirmationOpen(false);
        setdeleteZoneId(null);

      } catch (error) {
        toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthezone);
      }
    } else {
      setDeleteConfirmationOpen(false);
      setdeleteZoneId(null);
    }
  };


  const handleStatusToggle = async (zone: any) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
    }

    setstatusZone(zone);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusZone) {
      const updatedZone = { ...statusZone, status: !statusZone.status };

      try {
        const body = {
          status: updatedZone.status
        };

        if (statusZone._id) {

          await updateZoneStatus(statusZone._id.toString(), body);
          setData((prevData: any[]) =>
            prevData.map(zone =>
              zone._id === statusZone._id ? updatedZone : zone
            )
          );

          setStatusConfirmationOpen(false);

          setstatusZone(null);
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

        } else {

          console.error('ZoneId is undefined');

        }
      } catch (error) {

        console.error('Failed to update zone status:', error);

        const fallbackMessage =
          dictionary?.['navigation']?.ErrorupdatingzonePleasetryagain || 'Error updating zone. Please try again';

        const anyErr = error as any;

        const errMessage =
          (error instanceof Error ? error.message : undefined) ||
          anyErr?.response?.data?.message ||
          anyErr?.response?.data?.msg ||
          anyErr?.response?.data?.data?.message ||
          fallbackMessage;

        toast.error(errMessage || fallbackMessage);

        setStatusConfirmationOpen(false);
        setstatusZone(null);

      }
    } else {
      setStatusConfirmationOpen(false);
      setstatusZone(null);
    }
  };





  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getByZoneByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value);
    const { results, totalResults } = await getByZoneByPagination(pageSearch, 1 , newPageSize , zoneId);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };

  //  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

  //   const newPageSize = parseInt(event.target.value);

  //   const { results, totalResults } = await getByZoneByPagination(pageSearch, 1, newPageSize,zoneId);

  //   setPageSize(newPageSize);
  //   setData(results);
  //   setTotalResults(totalResults);
  //   setPageIndex(0);
  // };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getByZoneByPagination(
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




  const { lang: locale } = useParams()

  const columns = useMemo<ColumnDef<ZoneTypeWithAction, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('zoneName', {
        header: dictionary['navigation'].Zone,
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.zoneName}
              </Typography>
              <Typography variant='body2'>{row.original.countrydetails?.name}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('zoneLevel', {
        header: dictionary['navigation'].Zonelevel,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography className='capitalize' color='text.primary'>
              {row.original.zoneLevel != null ? row.original.zoneLevel : "0"}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('country', {
        header: dictionary['navigation'].country,
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {row.original.countrydetails?.name}
          </Typography>
        )
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
      columnHelper.accessor('action', {
        header: dictionary['navigation'].Action,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link href={getLocalizedUrl(`${zoneId}/apps/taxi/zone/view/${row.original._id}`, locale as Locale)} className='flex'>
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>

            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: dictionary['navigation'].Edit,
                  icon: 'tabler-pencil-minus',
                  href: getLocalizedUrl(`${zoneId}/apps/taxi/zone/edit/${row.original._id}`, locale as Locale),
                  linkProps: {
                    className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary',
                  },
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary', onClick: () => handleEditZone(row.original) }
                }
              ]}
            />




            {/* <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Edit',
                  href: getLocalizedUrl(`/apps/taxi/zone/edit/${row.original._id}`, locale as Locale),
                  icon: 'tabler-edit',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary', onClick: () => handleEditZone(row.original) }
                },
                {
                  text: 'Delete',
                  icon: 'tabler-trash',
                  menuItemProps: { className: 'flex items-center gap-2 text-textSecondary', onClick: () => handleDeleteClick(row.original._id) }
                }
              ]}
            /> */}
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: data as any,
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
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })


  return (
    <>
      <Card>
        {/* <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setData={setFilteredData} tableData={data} /> */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
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
          <div className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>

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
              fileName='Zone_Export'
              dictionary={dictionary}

            />
            <Button
              variant='contained'
              component={Link}
              startIcon={<i className='tabler-plus' />}
              href={getLocalizedUrl(`${zoneId}/apps/taxi/zone/add`, locale as Locale)}
              className='is-full sm:is-auto'
            >
              {dictionary['navigation'].CreateZone}
            </Button>
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
                  .map(row => (
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
        {/* start pagination */}
        <TablePagination
          component={() => <TablePaginationComponent
            table={table}  // Pass the table object
            totalResults={totalResults}  // Pass the total results
            pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex}  // Current page index
            pageSize={pageSize}  // Current page size
            handlePageChange={handlePageChange}  // Page change handler
            handlePageSizeChange={handlePageSizeChange}  // Page size change handler
            dictionary={dictionary}  // Pass the dictionary for translations
          />}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />

        {/* end pagination */}
      </Card>

      <ConfirmationDialogErrorHandle
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType="delete-data"
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}
        status={errorData}
      />

      <ConfirmationDialog
        open={statusConfirmationOpen}
        setOpen={setStatusConfirmationOpen}
        confirmationType="status-data"
        onConfirm={handleConfirmStatus}
        dictionary={dictionary}

      />
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogContent className="flex items-center flex-col text-center">
          {/* Error icon */}
          <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
          {/* Error title */}
          <Typography variant="h4" className="mbe-2">
            Error
          </Typography>
          {/* Error message */}
          <Typography color="text.primary">{errorMessage}</Typography>
        </DialogContent>
        <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
          {/* OK button */}
          <Button variant="contained" color="error" onClick={() => setErrorDialogOpen(false)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ZoneListTable
