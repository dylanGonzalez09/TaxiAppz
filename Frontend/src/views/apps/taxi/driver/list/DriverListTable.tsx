/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

// React Imports
import type { ChangeEvent } from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';

// Next Imports
import { useParams } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';

import TablePagination from '@mui/material/TablePagination';
import { toast } from 'react-toastify';

import Switch from '@mui/material/Switch';

// Third-party Imports
import classnames from 'classnames';
import { rankItem } from '@tanstack/match-sorter-utils';
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import type { RankingInfo } from '@tanstack/match-sorter-utils';

// Type Imports
import { StatusCodes as httpStatus } from 'http-status-codes';
import { Dialog, DialogActions, DialogContent, IconButton, Link, Tooltip } from '@mui/material';

import type { Locale } from '@configs/i18n';
import { useIsDemoUser } from '@/utils/demoUser'




// Component Imports
import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';
import TablePaginationComponent from '@components/CustomTablePaginationComponent';
import CustomTextField from '@core/components/mui/TextField';

// Util Imports
import tableStyles from '@core/styles/table.module.css';

import { getInitials } from '@/utils/getInitials';
import { getLocalizedUrl } from '@/utils/i18n';

// Style Imports
import AddDriverDrawer from './AddEditDrawer';
import ExportOptions from '@/utils/ExportOptions';

import ConfirmationDialog from '@/components/dialogs/delete-data';
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';
import { deleteDriverById, getDriverByPagination, updateDriverStatus } from '@/app/api/apps/taxi/driver';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type DriverDataWithAction = any & {
  action?: string;
  _id: string;
};


const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

  return itemRank.passed;
};


// Column Definitions
const columnHelper = createColumnHelper<DriverDataWithAction>();

const DriverListTable = ({ driverData, dictionary, showAddButton, showActionButton, subscriptionDetails }: { driverData?: any; dictionary: any; showAddButton?: boolean; showActionButton?: boolean, subscriptionDetails?: string }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentStatus, setCurrentStatus] = useState<'All' | 'Active' | 'Block'>('All');
  const [rowSelection, setRowSelection] = useState({});
  const [addDriverOpen, setAddDriverOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<DriverDataWithAction | null>(null);

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteDriverId, setdeleteDriverId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusDriver, setstatusDrivery] = useState<any | null>(null);
  const { lang: locale } = useParams();


  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(driverData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(driverData.totalResults); // To track the total number of records
  const [data, setData] = useState(driverData.results);
  const [filteredData, setFilteredData] = useState(data);
  const [pageSize, setPageSize] = useState(driverData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');
  const { isDemoUser, checkDemoStatus } = useIsDemoUser();


  const handleEditClick = (user: any) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
    }

    setEditDriver(user);
    setAddDriverOpen(true);
  }

  const handleDeleteClick = (driverId: any) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);

      return;
    }

    setdeleteDriverId(driverId.toString()); // Convert number to string
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {

    if (confirmed && deleteDriverId) {


      try {
        const response = await deleteDriverById(deleteDriverId);

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        } else {
          if (data.length != 1) {
            setData((prevData: any[]) => prevData.filter(driver => driver._id !== deleteDriverId));
            handlePagecurrentForAddRecord()
          } else {
            handlePageChangeForAddRecord();
          }

          toast.success('Deleted successfully');
        }

        setErrorData(response.status)
        setDeleteConfirmationOpen(false);
        setdeleteDriverId(null);
      } catch (error) {
        toast.error(dictionary['navigation'].Anerroroccurredwhiledeletingthedriver);
      }
    } else {
      setDeleteConfirmationOpen(false);
      setdeleteDriverId(null);
    }
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


  const handleStatusToggle = async (driver: any) => {
    setstatusDrivery(driver);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {

    if (confirmed && statusDriver) {
      const updatedDriver = { ...statusDriver, status: !statusDriver.status };

      try {
        const body = {
          status: !statusDriver.status
        };

        if (statusDriver._id) {
          const response = await updateDriverStatus(statusDriver._id.toString(), body);

          if (response.status === httpStatus.FORBIDDEN) {
            setErrorMessage(response.msg);
            setErrorDialogOpen(true);
          } else {
            setData((prevData: any[]) =>
              prevData.map(driver =>
                driver._id === statusDriver._id ? updatedDriver : driver
              )
            );
          toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

          }

          setErrorData(response.status)
          setStatusConfirmationOpen(false);
          setstatusDrivery(null);
        } else {
          console.error('UserId is undefined');
        }
      } catch (error) {
        console.error('Failed to update driver status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setstatusDrivery(null); // Clear the statusDriver after the operation
    }
  };



  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getDriverByPagination(pageSearch, newPage, pageSize);

      // Apply the status filter after fetching the new page
      const filteredResults = results.filter((driver: { status: boolean }) => {
        if (currentStatus === 'Active' && driver.status !== true) return false;
        if (currentStatus === 'Block' && driver.status !== false) return false;

        return true;
      });

      setData(filteredResults);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };


  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getDriverByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };

  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getDriverByPagination(
          searchTerm,
          1,
          pageSize
        );



        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(0);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [pageSize]
  );



  const columns = useMemo<ColumnDef<DriverDataWithAction, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
      columnHelper.accessor('firstName', {
        header: dictionary['navigation'].driverName?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'Driver Name',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({ firstName: row.original.firstName ? row.original.firstName : "" })}
            <div className='flex flex-col'>
              {row.original.firstName?.length > 15 ? (
                <Tooltip title={row.original.firstName} arrow placement="bottom">
                  <Typography
                    component={row.original.userId ? Link : 'span'}
                    href={
                      row.original.userId
                        ? getLocalizedUrl(
                          showAddButton
                            ? `apps/taxi/driver/view/${row.original.userId}`
                            : `apps/taxi/wallet/driver/view/${row.original.userId}`,
                          locale as Locale
                        )
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
                    {row.original.firstName.substring(0, 15) + '...'}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography
                  component={row.original.userId ? Link : 'span'}
                  href={
                    row.original.userId
                      ? getLocalizedUrl(`apps/taxi/driver/view/${row.original.userId}`, locale as Locale)
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
                  {row.original.firstName}
                </Typography>
              )}

              <Typography variant='body2'>
                {checkDemoStatus() && row.original.phoneNumber.length > 5
                  ? row.original.phoneNumber.slice(0, row.original.phoneNumber.length - 5) + '*****'
                  : row.original.phoneNumber}
              </Typography>
              <Typography variant='body2' sx={{ color: row.original.onlineBy === 'Online' ? 'success.main' : 'error.main' }}>{row.original.onlineBy}</Typography>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('trip', {
        header: dictionary['navigation'].TripCount,
        cell: ({ row }) => <Typography> {row.original.tripCount != null ? row.original.tripCount : "0"}</Typography>,
      }),
      columnHelper.accessor('wallet', {
        header: dictionary['navigation'].Wallet,
        cell: ({ row }) => <Typography> {row.original.Wallet != null ? row.original.Wallet : "0"}</Typography>,
      }),
      columnHelper.accessor('rating', {
        header: dictionary['navigation'].Rating,
        cell: ({ row }) => <Typography>{`${row.original.rating != null ? row.original.rating != 0 ? row.original.rating : "5" : "5"}`}</Typography>,
      }),

      columnHelper.accessor('vehicleName', {
        header: dictionary['navigation'].VehicleName,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.vehicleName}
              </Typography>
              <Typography variant='body2'>{row.original.vehicleModelName}</Typography>
            </div>
          </div>
        ),
      }),

      ...(subscriptionDetails === "yes"
        ? [
          columnHelper.accessor('subscriptionName', {
            header: 'Subscription',
            cell: ({ row }) => (
              <div className='flex items-center gap-3'>
                <div className='flex flex-col'>
                  <Typography className='font-medium' color='text.primary'>
                    {row.original.subscriptionName}
                  </Typography>
                  <Typography variant='body2'>{row.original.isDriverSubscriptionValid}</Typography>
                  <Typography variant='body2'>
                    {row.original.remainingDays != null
                      ? row.original.remainingDays + " days Remaining"
                      : "false"}
                  </Typography>
                </div>
              </div>
            ),
          }),
        ]
        : []),


      columnHelper.accessor('status', {
        header: dictionary['navigation'].status,
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
        header: dictionary['navigation'].action,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link
                href={showAddButton
                  ? getLocalizedUrl(`/apps/taxi/driver/view/${row.original.userId}`, locale as Locale)
                  : getLocalizedUrl(`/apps/taxi/wallet/driver/view/${row.original.userId}`, locale as Locale)}
                className='flex'
              >
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>

            {showActionButton && (
              <OptionMenu
                iconButtonProps={{ size: 'medium' }}
                iconClassName='text-textSecondary'
                options={[
                  {
                    text: dictionary['navigation'].document,
                    icon: 'tabler-script',
                    href: getLocalizedUrl(`/apps/taxi/driver/document/${row.original._id}`, locale as Locale),
                    linkProps: {
                      className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary',
                    },
                  },
                  {
                    text: dictionary['navigation'].edit,
                    icon: 'tabler-pencil-minus',
                    menuItemProps: {
                      onClick: () => handleEditClick(row.original),
                    },
                  },
                  {
                    text: dictionary['navigation'].delete,
                    icon: 'tabler-trash',
                    menuItemProps: {
                      onClick: () => handleDeleteClick(row.original._id),
                    },
                  },
                ]}
              />
            )}
          </div>
        )
      }),

    ],
    [dictionary, locale, pageIndex, pageSize]
  );

  const table = useReactTable({
    data: filteredData as any[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const getAvatar = (params: Pick<any, 'firstName'>) => {
    const { firstName } = params;

    return (
      <CustomAvatar skin='light' size={34}>
        {getInitials(firstName)}
      </CustomAvatar>
    );

  };

  useEffect(() => {
    const filteredData = data.filter((driver: { status: boolean }) => {
      if (currentStatus === 'Active' && driver.status !== true) return false;
      if (currentStatus === 'Block' && driver.status !== false) return false;

      return true;
    });

    setFilteredData(filteredData);
  }, [currentStatus, data]);




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
        <div className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>

          <div className='flex items-center gap-2'>
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
          </div>
          <CustomTextField
            select
            fullWidth
            value={currentStatus}
            onChange={e => setCurrentStatus(e.target.value as 'All' | 'Active' | 'Block')}
            className='is-[140px] flex-auto'
          >
            <MenuItem value='All'>{dictionary['navigation'].All}</MenuItem>
            <MenuItem value='Active'>{dictionary['navigation'].active}</MenuItem>
            <MenuItem value='Block'>{dictionary['navigation'].block}</MenuItem>
          </CustomTextField>
          <ExportOptions
            data={data}
            tableContainerId="table-container"
            fileName='Driver_Export'
            dictionary={dictionary}

          />

          {showAddButton && (
            <Button
              variant="contained"
              onClick={() => {
                setEditDriver(null);
                setAddDriverOpen(true);
              }}
              startIcon={<i className="tabler-plus" />}
              className="is-full sm:is-auto"
            >
              {dictionary['navigation'].addNew}
            </Button>
          )}

          {/* <CustomTextField
            select
            id='select-status'
            value={status}
            onChange={e => {
              const newValue = e.target.value as 'active' | 'inactive' | 'block' | '';

              setStatus(newValue);
            }}
            className='is-[160px]'
            SelectProps={{ displayEmpty: true }}
          >

            <MenuItem value=''>Driver Status</MenuItem>
            <MenuItem value='active'>Active</MenuItem>
            <MenuItem value='inactive'>Inactive</MenuItem>
            <MenuItem value='block'>Block</MenuItem>

          </CustomTextField> */}

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
                      <>
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
                  {dictionary['navigation'].noDataFound}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows
                .slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )
          }
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
          dictionary={dictionary}  // Pass the dictionary for localization
        />}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handlePageSizeChange}
      />

      {/* end pagination */}
      <AddDriverDrawer
        open={addDriverOpen}
        setOpen={setAddDriverOpen}
        data={data}
        setData={setData}
        handleClose={() => setAddDriverOpen(false)}
        editDriver={editDriver}
        setEditDriver={setEditDriver}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        dictionary={dictionary}
      />

      <ConfirmationDialogErrorHandle
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType="delete-data"
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}
        status={errorData}
      />

      <ConfirmationDialogErrorHandle
        open={statusConfirmationOpen}
        setOpen={setStatusConfirmationOpen}
        confirmationType="status-data"
        onConfirm={handleConfirmStatus}
        dictionary={dictionary}
        status={errorData}
      />

      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogContent className="flex items-center flex-col text-center">
          {/* Error icon */}
          <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
          {/* Error title */}
          <Typography variant="h4" className="mbe-2">
            {dictionary['navigation'].Error}
          </Typography>
          {/* Error message */}
          <Typography color="text.primary">{errorMessage}</Typography>
        </DialogContent>
        <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
          {/* OK button */}
          <Button variant="contained" color="error" onClick={() => setErrorDialogOpen(false)}>
            {dictionary['navigation'].OK}
          </Button>
        </DialogActions>
      </Dialog>

    </Card>
  );
};

export default DriverListTable;
