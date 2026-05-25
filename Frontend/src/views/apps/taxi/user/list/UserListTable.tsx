/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import { useState, useMemo, useCallback } from 'react';

import Link from 'next/link';
import { useParams } from 'next/navigation';

// MUI Components
import {
  Card,
  Button,
  Typography,
  IconButton,
  TablePagination,
  MenuItem,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  Tooltip
} from '@mui/material';
import classnames from 'classnames';

// Table Components
import { rankItem } from '@tanstack/match-sorter-utils';
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
} from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import type { RankingInfo } from '@tanstack/match-sorter-utils';

// Utils & Types
import { StatusCodes as httpStatus } from 'http-status-codes';
import { toast } from 'react-toastify';

import type { Locale } from '@configs/i18n';
import { useIsDemoUser } from '@/utils/demoUser';
import { getInitials } from '@/utils/getInitials';
import { getLocalizedUrl } from '@/utils/i18n';
import type { UsersType } from '@/types/apps/userTypes';
import tableStyles from '@core/styles/table.module.css';

// API
import { deleteByUserId, getUserByPagination, updateUserStatus } from '@apis/user';

// Components
import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import CustomAvatar from '@core/components/mui/Avatar';
import EditUserDrawer from './EditUserDrawer';
import AddUserDrawer from './AddUserDrawer';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import ExportOptions from '@/utils/ExportOptions';
import TablePaginationComponent from '@/components/CustomTablePaginationComponent';
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type UsersTypeWithAction = UsersType & {
  action?: string;
  tripsCount?: number;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

return itemRank.passed;
};

const columnHelper = createColumnHelper<UsersTypeWithAction>();

interface UserListTableProps {
  tableData?: any;
  dictionary:any
  showAddButton?: boolean;
  showActionButton?: boolean;
}

const UserListTable = ({ tableData, dictionary, showAddButton ,showActionButton}: UserListTableProps) => {
  // State Management
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [currentUser, setCurrentUser] = useState<UsersType | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusUser, setStatusUser] = useState<UsersType | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(tableData.page - 1);
  const [pageSearch, setPageSearch] = useState('');
  const [totalResults, setTotalResults] = useState(tableData.totalResults);
  const [data, setData] = useState<UsersType[]>(tableData.results);
  const [pageSize, setPageSize] = useState(tableData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState<number | string>('');

  const { isDemoUser, checkDemoStatus } = useIsDemoUser();
  const { lang: locale } = useParams();

  // Helper Functions
  const getAvatar = (params: Pick<UsersType, 'avatar' | 'firstName'>) => {
    const { avatar, firstName } = params;

    if (avatar) {
      return <CustomAvatar src={avatar} size={34} />;
    }


return <CustomAvatar size={34}>{getInitials(firstName as string)}</CustomAvatar>;
  };

  // Event Handlers
  const handleEditUser = (user: UsersType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

return;
    }

    setCurrentUser(user);
    setEditUserOpen(true);
  };

  const handleDeleteClick = (userId: number) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

return;
    }

    setDeleteUserId(userId.toString());
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (!confirmed || !deleteUserId) {
      setDeleteConfirmationOpen(false);
      setDeleteUserId(null);

return;
    }

    try {
      const response = await deleteByUserId(deleteUserId);

      if (response.status === httpStatus.FORBIDDEN) {
        setErrorMessage(response.msg || dictionary['navigation'].deleteForbidden);
        setErrorDialogOpen(true);
      } else {
        if (data.length !== 1) {
          setData(prevData => prevData.filter(user => user.id.toString() !== deleteUserId));
          handlePageCurrentForAddRecord();
        } else {
          handlePageChangeForAddRecord();
        }

        // toast.success(dictionary['navigation'].deleteSuccess);
      }

      setErrorData(response.status);
      setDeleteConfirmationOpen(false);
      setDeleteUserId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(dictionary['navigation'].deleteError);
    }
  };

  const handleStatusToggle = (user: UsersType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

return;
    }

    setStatusUser(user);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (!confirmed || !statusUser) {
      setStatusConfirmationOpen(false);
      setStatusUser(null);

return;
    }

    const updatedUser = { ...statusUser, active: !statusUser.active };

    try {
      await updateUserStatus(statusUser.id.toString(), { active: updatedUser.active });

      setData(prevData =>
        prevData.map(user =>
          user.id === statusUser.id ? updatedUser : user
        )
      );

      toast.success(
        updatedUser.active
          ? dictionary['navigation'].statusActivated
          : dictionary['navigation'].statusDeactivated
      );

      setStatusConfirmationOpen(false);
      setStatusUser(null);
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(dictionary['navigation'].statusUpdateError);
      setStatusConfirmationOpen(false);
    }
  };

  // Pagination Functions
  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getUserByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Page change error:", error);
      toast.error(dictionary['navigation'].pageLoadError);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value);

    try {

      const { results, totalResults } = await getUserByPagination(pageSearch, pageIndex, newPageSize);

      setPageSize(newPageSize);
      setData(results);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Page size change error:", error);
      toast.error(dictionary['navigation'].pageSizeError);
    }
  };

  const handlePageChangeForAddRecord = () => {
    handlePageChange({} as ChangeEvent<unknown>, pageIndex - 1);
  };

  const handlePageCurrentForAddRecord = () => {
    handlePageChange({} as ChangeEvent<unknown>, pageIndex);
  };

  // Search Function
  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {

        const result = await getUserByPagination(searchTerm, 0, pageSize);

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(0);
      } catch (error) {
        console.error("Search error:", error);
        toast.error(dictionary['navigation'].searchError);
      }
    },
    [pageSize, dictionary]
  );

  // Table Columns
  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
    () => [
        {
              id: 'serialNo',
              header: dictionary['navigation'].serialNo,
              cell: ({ row }) => (
                <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
              ),
            },
      columnHelper.accessor('firstName', {
        header: dictionary['navigation'].UserName,
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: row.original.avatar, firstName: row.original.firstName })}
            <div className='flex flex-col'>
            {row.original.firstName?.length > 15 ? (
  <Tooltip title={row.original.firstName} arrow placement="bottom">
    <Typography
      component={row.original.id ? Link : 'span'}
      href={
        row.original.id
          ? getLocalizedUrl(
              showAddButton
                ? `apps/taxi/user/view/${row.original.id}`
                : `apps/taxi/wallet/user/view/${row.original.id}`,
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
    component={row.original.id ? Link : 'span'}
    href={
      row.original.id
        ? getLocalizedUrl(
            showAddButton
              ? `apps/taxi/user/view/${row.original.id}`
              : `apps/taxi/wallet/user/view/${row.original.id}`,
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
    {row.original.firstName}
  </Typography>
)}

              <Typography variant='body2'>
                {checkDemoStatus() && row.original.phoneNumber?.length > 5
                  ? `${row.original.phoneNumber.slice(0, -5)}*****`
                  : row.original.phoneNumber}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('Trip', {
        header: dictionary['navigation'].tripCount,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography className='capitalize' color='text.primary'>
              {row.original.tripsCount || 0}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('Wallet', {
        header: dictionary['navigation'].wallet,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography className='capitalize' color='text.primary'>
              {row.original.Wallet != null ? row.original.Wallet : "0"}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('rating', {
        header: dictionary['navigation'].rating,
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {`${row.original.rating != null ? row.original.rating != "0" ?  row.original.rating : "5" : "5"}`}
          </Typography>
        )
      }),
      columnHelper.accessor('active', {
        header: dictionary['navigation'].Status,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Switch
              checked={row.original.active}
              onChange={() => handleStatusToggle(row.original)}
              color={row.original.active ? 'success' : 'error'}
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: row.original.active ? 'green' : 'red',
                },
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: row.original.active ? 'green' : 'red',
                },
                '& .MuiSwitch-thumb': {
                  backgroundColor: 'white',
                },
                '& .MuiSwitch-track': {
                  backgroundColor: row.original.active ? 'green' : 'red',
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
          href={getLocalizedUrl(
            showAddButton
              ? `/apps/taxi/user/view/${row.original._id}`
              : `/apps/taxi/wallet/user/view/${row.original._id}`,
            locale as Locale
          )}
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
              text: dictionary['navigation'].edit,
              icon: 'tabler-pencil-minus',
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => handleEditUser(row.original)
              }
            },
            {
              text: dictionary['navigation'].delete,
              icon: 'tabler-trash',
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => handleDeleteClick(row.original.id)
              }
            }
          ]}
        />
      )}
    </div>
  ),
  enableSorting: false
})

    ],
    [data, dictionary, locale, showAddButton]
  );

  // React Table Instance
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
  });

  return (
    <>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex items-center gap-x-4'>
            <CustomTextField
              variant="outlined"
              placeholder={dictionary['navigation'].search}
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
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='is-[70px]'
            >
              {[5, 10, 15, 25].map(size => (
                <MenuItem key={size} value={size.toString()}>
                  {size}
                </MenuItem>
              ))}
            </CustomTextField>

            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='User_Export'
              dictionary={dictionary}
            />

            {showAddButton && (
              <Button
                variant='contained'
                startIcon={<i className='tabler-plus' />}
                onClick={() => setAddUserOpen(true)}
                className='is-full sm:is-auto'
              >
                {dictionary['navigation'].addNewUser}
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
            {table.getFilteredRowModel()?.rows?.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {dictionary['navigation'].noDataAvailable}
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

        <TablePagination
          component={() => <TablePaginationComponent
            table={table}  // Pass the table object
            totalResults={totalResults}  // Pass the total results
            pageIndex={pageIndex == 0 ? pageIndex + 1 : pageIndex}  // Current page index
            pageSize={pageSize}  // Current page size
           handlePageChange={handlePageChange}  // Page change handler
            handlePageSizeChange={handlePageSizeChange}  // Page size change handler
            dictionary={dictionary} // Pass the dictionary prop
          />}
          count={totalResults}
          page={pageIndex}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
        />
      </Card>

      {/* Dialogs and Drawers */}
      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(false)}
        userData={data}
        setData={setData}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        dictionary={dictionary}
      />

      <EditUserDrawer
        open={editUserOpen}
        userData={data}
        setData={setData}
        handleClose={() => setEditUserOpen(false)}
        initialData={currentUser}
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

      <ConfirmationDialog
        open={statusConfirmationOpen}
        setOpen={setStatusConfirmationOpen}
        confirmationType="status-data"
        onConfirm={handleConfirmStatus}
        dictionary={dictionary}
      />

      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogContent className="flex items-center flex-col text-center">
          <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
          <Typography variant="h4" className="mbe-2">
            {dictionary['navigation'].error}
          </Typography>
          <Typography color="text.primary">{errorMessage}</Typography>
        </DialogContent>
        <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
          <Button variant="contained" color="error" onClick={() => setErrorDialogOpen(false)}>
            {dictionary['navigation'].ok}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserListTable;
