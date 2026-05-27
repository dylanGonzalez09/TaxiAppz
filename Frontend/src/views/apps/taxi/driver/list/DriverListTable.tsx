/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

// React Imports
import { stringify } from 'querystring';

import type { ChangeEvent } from 'react';

import { useState, useEffect, useMemo, useCallback } from 'react';

import Link from 'next/link';

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
import { Dialog, DialogActions, DialogContent, IconButton, Tooltip } from '@mui/material';

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

import { fetchUserRating } from '@/app/api/apps/taxi/rating';


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

const formatRegistrationDateTime = (driver: any) => {
  if (driver.regDate) {
    return `${driver.regDate}${driver.regTime ? ` / ${driver.regTime}` : ''}`;
  }

  const createdValue = driver.createdAt ?? driver.createAt;

  if (!createdValue) return '-';

  const createdDate = new Date(createdValue);

  if (Number.isNaN(createdDate.getTime())) return '-';

  const date = createdDate.toLocaleDateString('en-GB');

  const time = createdDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${date} / ${time}`;
};


// Column Definitions
const columnHelper = createColumnHelper<DriverDataWithAction>();

const DriverListTable = ({zoneId, driverData, dictionary, showAddButton, showActionButton, subscriptionDetails }: { zoneId?:any ,driverData?: any; dictionary: any; showAddButton?: boolean; showActionButton?: boolean, subscriptionDetails?: string }) => {
  const isSubscriptionEnabled = String(subscriptionDetails || '').trim().toLowerCase() === 'yes';

  const normalizedDriverData = {
    page: Number(driverData?.page) > 0 ? Number(driverData.page) : 1,
    totalResults: Number(driverData?.totalResults) >= 0 ? Number(driverData.totalResults) : 0,
    results: Array.isArray(driverData?.results) ? driverData.results : [],
    limit: Number(driverData?.limit) > 0 ? Number(driverData.limit) : 10,
  }

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
  const [pageIndex, setPageIndex] = useState(normalizedDriverData.page);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(normalizedDriverData.totalResults); // To track the total number of records
  const [data, setData] = useState(normalizedDriverData.results);

  // const [filteredData, setFilteredData] = useState(data);
  const [pageSize, setPageSize] = useState(normalizedDriverData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');
  const { isDemoUser, checkDemoStatus } = useIsDemoUser();
  const [status, setStatus] = useState<string>('all');
  const currentReturnPage = pageIndex > 0 ? pageIndex : 1;
  const returnQuery = `?returnPage=${currentReturnPage}&returnPageSize=${pageSize}&returnSearch=${encodeURIComponent(pageSearch)}`;

  const [userRole, setUserRole] = useState<string>('');
  const [ratingCountByUserId, setRatingCountByUserId] = useState<Record<string, number>>({});

    useEffect(() => {
      const role = localStorage.getItem('userRole') || '';

      setUserRole(role);


    }, []);

  useEffect(() => {
    const loadRatingCounts = async () => {
      const uniqueUserIds = Array.from(
        new Set(
          (Array.isArray(data) ? data : [])
            .map((item: any) => String(item?.userId || ''))
            .filter(Boolean)
        )
      );

      if (uniqueUserIds.length === 0) {
        setRatingCountByUserId({});

return;
      }

      const results = await Promise.all(
        uniqueUserIds.map(async userId => {
          const ratings = await fetchUserRating(userId);


return [userId, Array.isArray(ratings) ? ratings.length : 0] as const;
        })
      );

      const nextMap: Record<string, number> = {};

      results.forEach(([userId, count]) => {
        nextMap[userId] = count;
      });
      setRatingCountByUserId(nextMap);
    };

    loadRatingCounts();
  }, [data]);

  const handleEditClick = (user: any) => {

    setEditDriver(user);
    setAddDriverOpen(true);
  }

  const handleDeleteClick = (driverId: any) => {

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
      const response = await getDriverByPagination(pageSearch, newPage, pageSize, zoneId, status);
      const results = Array.isArray(response?.results) ? response.results : [];
      const total = Number(response?.totalResults) >= 0 ? Number(response.totalResults) : 0;

      // Apply the status filter after fetching the new page
      // const filteredResults = results.filter((driver: { status: boolean }) => {
      //   if (currentStatus === 'Active' && driver.status !== true) return false;
      //   if (currentStatus === 'Block' && driver.status !== false) return false;

      //   return true;
      // });

      setData(results);
      setPageIndex(newPage);
      setTotalResults(total);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };


  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const response = await getDriverByPagination(pageSearch, 1, newPageSize, zoneId, status);
    const results = Array.isArray(response?.results) ? response.results : [];
    const total = Number(response?.totalResults) >= 0 ? Number(response.totalResults) : 0;

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(total);
    setPageIndex(1);
  };

  const handleStatusChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newStatus = event.target.value || 'all';

    const response = await getDriverByPagination(pageSearch, 1, pageSize, zoneId, newStatus);
    const results = Array.isArray(response?.results) ? response.results : [];
    const total = Number(response?.totalResults) >= 0 ? Number(response.totalResults) : 0;



    setData(results);
    setStatus(newStatus);
    setTotalResults(total);
    setPageIndex(1);
  }


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getDriverByPagination(
          searchTerm,
          1,
          pageSize,
          zoneId,
          status
        );


        setPageSearch(searchTerm);
        setData(Array.isArray(result?.results) ? result.results : []);
        setTotalResults(Number(result?.totalResults) >= 0 ? Number(result.totalResults) : 0);
        setPageIndex(1);
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [pageSize, zoneId]
  );



  const columns = useMemo<ColumnDef<DriverDataWithAction, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex - 1) * pageSize + row.index + 1}</Typography>
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
                            ? `${zoneId}/apps/taxi/driver/view/${row.original.userId}${returnQuery}`
                            : `${zoneId}/apps/taxi/wallet/driver/view/${row.original.userId}${returnQuery}`,
                          locale as Locale
                        )
                        : undefined
                    }
                    color="primary"
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 350,
                      display: 'inline-block',
                    }}
                  >
                    {row.original.firstName}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography
                  component={row.original.userId ? Link : 'span'}
                  href={
                      row.original.userId
                        ? getLocalizedUrl(
                          showAddButton
                            ? `${zoneId}/apps/taxi/driver/view/${row.original.userId}${returnQuery}`
                            : `${zoneId}/apps/taxi/wallet/driver/view/${row.original.userId}${returnQuery}`,
                          locale as Locale
                        )
                        : undefined
                    }
                  color="primary"
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 350,
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
              <Typography variant='body2' sx={{ color: row.original.onlineBy === 'Online' ? 'success.main' : 'error.main' }}>{dictionary['navigation'][row.original.onlineBy]}</Typography>
            </div>
          </div>
        ),
      }),

      columnHelper.accessor('regDate', {
        header: dictionary['navigation'].RegDateTime,
        cell: ({ row }) => <Typography>{formatRegistrationDateTime(row.original)}</Typography>,
      }),

      columnHelper.accessor('Trip', {
        header: dictionary['navigation'].TripCount,
        cell: ({ row }) => {

          return(

              <Typography>
                {row.original.tripCount != null ? row.original.tripCount : "0"}
              </Typography>

            );
          }
      }),


        columnHelper.accessor('wallet', {
        header: dictionary['navigation'].Wallet,
        cell: ({ row }) => <Typography> {row.original.Wallet != null ? row.original.Wallet : "0"}</Typography>,
      }),

      columnHelper.accessor('rating', {
        header: dictionary['navigation'].Rating,
       cell: ({ row }) => (
            <Typography className='capitalize' color='text.primary'>
                {Number(row.original?.rating || 0)}
              </Typography>
                        ),
       }),

      // columnHelper.accessor('vehicleName', {
      //   header: dictionary['navigation'].VehicleName,
      //   cell: ({ row }) => (
      //     <div className='flex items-center gap-3'>
      //       <div className='flex flex-col'>
      //         <Typography className='font-medium' color='text.primary'>
      //           {row.original.vehicleName}
      //         </Typography>
      //         <Typography variant='body2'>{row.original.vehicleModelName}</Typography>
      //       </div>
      //     </div>
      //   ),
      // }),
      // ...(isSubscriptionEnabled
      //   ? [
      //     columnHelper.accessor('subscriptionName', {
      //       header: 'Subscription',
      //       cell: ({ row }) => (
      //         <div className='flex items-center gap-3'>
      //           <div className='flex flex-col'>
      //             <Typography className='font-medium' color='text.primary'>
      //               {row.original.subscriptionName}
      //             </Typography>
      //             <Typography variant='body2'>{row.original.isDriverSubscriptionValid}</Typography>
      //             <Typography variant='body2'>
      //               {row.original.remainingDays != null
      //                 ? row.original.remainingDays + " days Remaining"
      //                 : "false"}
      //             </Typography>
      //           </div>
      //         </div>
      //       ),
      //     }),
      //   ]
      //   : []),


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

      // columnHelper.accessor('action', {
      //   header: dictionary['navigation'].action,
      //   cell: ({ row }) => (
      //     <div className='flex items-center'>
      //       <IconButton>
      //         <Link
      //           href={showAddButton
      //             ? getLocalizedUrl(`${zoneId}/apps/taxi/driver/view/${row.original.userId}`, locale as Locale)
      //             : getLocalizedUrl(`${zoneId}/apps/taxi/wallet/driver/view/${row.original.userId}`, locale as Locale)}
      //           className='flex'
      //         >
      //           <i className='tabler-eye text-textSecondary' />
      //         </Link>
      //       </IconButton>

      //       {showActionButton && (
      //         <OptionMenu
      //           iconButtonProps={{ size: 'medium' }}
      //           iconClassName='text-textSecondary'
      //           options={[
      //             {
      //               text: dictionary['navigation'].document,
      //               icon: 'tabler-script',
      //               href: getLocalizedUrl(`${zoneId}/apps/taxi/driver/document/${row.original._id}`, locale as Locale),
      //               linkProps: {
      //                 className: 'flex items-center is-full plb-2 pli-4 gap-2 text-textSecondary',
      //               },
      //             },
      //             {
      //               text: dictionary['navigation'].edit,
      //               icon: 'tabler-pencil-minus',
      //               menuItemProps: {
      //                 onClick: () => handleEditClick(row.original),
      //               },
      //             },
      //             {
      //               text: dictionary['navigation'].delete,
      //               icon: 'tabler-trash',
      //               menuItemProps: {
      //                 onClick: () => handleDeleteClick(row.original._id),
      //               },
      //             },
      //           ]}
      //         />
      //       )}
      //     </div>
      //   )
      // }),

      columnHelper.accessor('action', {
        header: dictionary['navigation'].action,
        cell: ({ row }) => {
          // Define all options
          const allOptions = [
            {
              text: dictionary['navigation'].document,
              icon: 'tabler-script',
              href: getLocalizedUrl(`${zoneId}/apps/taxi/driver/document/${row.original._id}`, locale as Locale),
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
          ];

          const filteredOptions = allOptions.filter(option => {

            return true;
          });

          return (
            <div className='flex items-center'>
              <IconButton>
                <Link
                  href={showAddButton
                    ? getLocalizedUrl(`${zoneId}/apps/taxi/driver/view/${row.original.userId}${returnQuery}`, locale as Locale)
                    : getLocalizedUrl(`${zoneId}/apps/taxi/wallet/driver/view/${row.original.userId}${returnQuery}`, locale as Locale)}
                  className='flex'
                >
                  <i className='tabler-eye text-textSecondary' />
                </Link>
              </IconButton>

              {showActionButton && (
                <OptionMenu
                  iconButtonProps={{ size: 'medium' }}
                  iconClassName='text-textSecondary'
                  options={filteredOptions}
                />
              )}
            </div>
          );
        }
      }),


    ],
    [checkDemoStatus, dictionary, handleDeleteClick, handleEditClick, isSubscriptionEnabled, locale, pageIndex, pageSize, ratingCountByUserId, showActionButton, showAddButton, zoneId]
  );


const table = useReactTable({
  data: data as any[],
  columns,
  filterFns: {
    fuzzy: fuzzyFilter,
  },
  state: {
    rowSelection,

    // Remove globalFilter from state
  },
  initialState: {
    pagination: {
      pageSize: 25,
    },
  },
  enableRowSelection: true,

  // Remove globalFilterFn
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),

  // Remove onGlobalFilterChange
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

// useEffect(() => {
//   setFilteredData(data);
// }, [data]);




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
              value={status}
              onChange={(e) => handleStatusChange(e)}
              className='flex-auto'
              style={{ minWidth: '150px' }}
            >
              <MenuItem value='all'>{dictionary['navigation'].All}</MenuItem>
              <MenuItem value='pending'>{dictionary['navigation'].Pending}</MenuItem>

            </CustomTextField>
          </div>

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

          {/* <CustomTextField
            select
            fullWidth
            value={currentStatus}
            onChange={e => setCurrentStatus(e.target.value as 'All' | 'Active' | 'Block')}
            className='is-[140px] flex-auto'
          >
            <MenuItem value='All'>{dictionary['navigation'].All}</MenuItem>
            <MenuItem value='Active'>{dictionary['navigation'].active}</MenuItem>
            <MenuItem value='Block'>{dictionary['navigation'].block}</MenuItem>
          </CustomTextField> */}
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
          pageIndex={pageIndex}  // Current page index
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
        zoneId={zoneId}
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
