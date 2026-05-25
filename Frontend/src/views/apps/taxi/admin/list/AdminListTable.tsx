/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import type { ChangeEvent} from 'react';
import { useCallback, useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import classnames from 'classnames';
import { toast } from 'react-toastify';

// import Chip from '@mui/material/Chip'
import type { RankingInfo } from '@tanstack/match-sorter-utils';

import { rankItem } from '@tanstack/match-sorter-utils';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import Switch from '@mui/material/Switch'; // Import the Switch component


import { StatusCodes as httpStatus } from 'http-status-codes';

import { Dialog, DialogActions, DialogContent,IconButton, Link  } from '@mui/material';

import { useIsDemoUser } from '@/utils/demoUser'

import OptionMenu from '@core/components/option-menu';
import CustomTextField from '@core/components/mui/TextField';
import tableStyles from '@core/styles/table.module.css';

import { deleteByUserId, getAdminByPagination, updateUserStatus } from '@apis/user';

import AddAdminDrawer from './AddAdminDrawer';
import EditPasswordDrawer from './EditPasswordDrawer';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';
import ExportOptions from '@/utils/ExportOptions';
import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

export type AdminType = {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  password?: string;
  roleIds?:any;
  confirmPassword?: string;
  role?: any;
  gender?: string;
  language?: string;
  country?: string;
  address?: string;
  active?: boolean;
  primaryZone?: any;
  zoneId?: string;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

return itemRank.passed;
};

const columnHelper = createColumnHelper<AdminType>();

const AdminTable = ({ tableData, dictionary }: { tableData?: any; dictionary: any}) => {
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminType | null>(null);
  const [editPassword, setEditPassword] = useState<AdminType | null>(null);
  const [passwordChangeId, setPasswordChangeId] = useState<string | null>(null);
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteAdminId, setdeleteAdminId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusAdmin, setstatusAdmin] = useState<AdminType | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(tableData.page - 1);
  const [pageSearch, setPageSearch] = useState('');
  const [totalResults, setTotalResults] = useState(tableData.totalResults);
  const [data, setData] = useState(tableData.results);
  const [pageSize, setPageSize] = useState(tableData.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');


  const { checkDemoStatus } = useIsDemoUser();

  // Handle Delete Click
  const handleDeleteClick = (adminId: number) => {

    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);

return;
    }

    setdeleteAdminId(adminId.toString());
    setDeleteConfirmationOpen(true);
  };

  const handlePasswordChangeClick = (admin: AdminType) => {
    if(checkDemoStatus())
    {
      toast.error(dictionary['navigation'].passwordChangeError);

return;
    }

    setEditPassword(admin);
    setPasswordChangeId(admin.id.toString());
    setEditPasswordOpen(true);
  }

  const handleEditClick = (admin: AdminType) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
    }

    setEditAdmin(admin);
    setAddAdminOpen(true);
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



  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteAdminId) {
      try {
        const response = await deleteByUserId(deleteAdminId);

        if (response.status === httpStatus.FORBIDDEN) {
          setErrorMessage(response.msg);
          setErrorDialogOpen(true);
        } else {
        if(data.length != 1){
          setData((prevData: any[]) => prevData.filter(admin => admin.id.toString() !== deleteAdminId));
          handlePagecurrentForAddRecord()
        }else{
          handlePageChangeForAddRecord();
        }

        toast.success(dictionary['navigation'].deleteSuccess);
      }

      setErrorData(response.status)
      setDeleteConfirmationOpen(false);
      setdeleteAdminId(null);

      } catch (error) {
        toast.error("An error occurred while deleting the admin");
      }
    } else {
      setDeleteConfirmationOpen(false);
      setdeleteAdminId(null);
    }
  };

  const handleStatusToggle = async (admin: AdminType) => {
     if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setstatusAdmin(admin);
    setStatusConfirmationOpen(true);
  };

  const handleConfirmStatus = async (confirmed: boolean) => {

    if (confirmed && statusAdmin) {
      const updatedAdmin = { ...statusAdmin, active: !statusAdmin.active };

      try {
        const body = {
          active: !statusAdmin.active,
        };

        await updateUserStatus(statusAdmin.id.toString(), body);
        setData((prevData: any[]) =>
          prevData.map(admin =>
            admin.id === statusAdmin.id ? updatedAdmin : admin
          )
        );

        setStatusConfirmationOpen(false);
        setstatusAdmin(null);
       toast.success(dictionary['navigation'].statusUpdatedSuccessfully);

      } catch (error) {
        console.error('Failed to update admin status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setstatusAdmin(null);
    }
  };


  const handlePageChange = async (event: unknown, newPage: number) => {
    try {

      const { results, totalResults } = await getAdminByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getAdminByPagination(pageSearch, 1, newPageSize);

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getAdminByPagination(
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

  const columns = useMemo<ColumnDef<AdminType, any>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].serialNo,
      cell: ({ row }) => (
        <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
      ),
    },
    columnHelper.accessor('firstName', {
      header: dictionary['navigation'].name,
      cell: ({ row }) => <Typography className="font-medium">{row.original.firstName} {row.original.lastName}</Typography>
    }),
    columnHelper.accessor('email', {
      header: dictionary['navigation'].email,
      cell: ({ row }) => {
        const email = row.original.email;
        const isDemo = checkDemoStatus();
          const maskedEmail = isDemo ? email?.replace(/^.{5}/, '*****') : email;

        return <Typography>{maskedEmail}</Typography>;
      }
    }),
    columnHelper.accessor('role', {
      header: dictionary['navigation'].role,
      cell: ({ row }) => {
        const roles = row.original?.roleIds.map((role: { role: string }) => role.role) || [];


return (
          <Typography>
            {roles.map((role: string, index: number) => (
              <div key={index}>{role}</div>
            ))}
          </Typography>
        );
      }
    }),
    columnHelper.accessor('active', {
      header: dictionary['navigation'].status,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Switch
            checked={row.original.active}
            onChange={() => handleStatusToggle(row.original)}
            color={row.original.active ? 'success' : 'error'}
            sx={{ /* same styles */ }}
          />
        </div>
      )
    }),
    {
      id: 'actions',
      header: dictionary['navigation'].actions,
      cell: ({ row }) => (
        <div className="flex items-center">
          <OptionMenu
            options={[
              {
                text: dictionary['navigation'].edit,
                icon: 'tabler-pencil-minus',
                menuItemProps: {
                  onClick: () => handleEditClick(row.original),
                }
              },
              {
                text: dictionary['navigation'].changePassword,
                icon: 'tabler-lock',
                menuItemProps:{
                  onClick: () => handlePasswordChangeClick(row.original)
                }
              },
              {
                text: dictionary['navigation'].delete,
                icon: 'tabler-trash',
                menuItemProps: {
                  onClick: () => handleDeleteClick(row.original.id),
                }
              }
            ]}
          />
        </div>
      ),
      enableSorting: false
    }
  ], [data, pageIndex, pageSize]);


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
  });


  return (
    <>
      <Card>
        <div className="flex flex-wrap justify-between gap-4 p-6">
          <div className="flex items-center gap-x-4">
            <CustomTextField
              variant="outlined"
              placeholder={dictionary['navigation'].searchPlaceholder}
              value={globalFilter}
              onChange={(e) => {
                const searchTerm = e.target.value;

                setGlobalFilter(searchTerm);
                handleSearch(searchTerm);
              }}
              className="flex-auto"
            />
          </div>
          <div className="flex items-center gap-x-4">
            <CustomTextField
              select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e)}
              className="flex-auto"
            >
              {[5, 10, 15, 25].map(size => (
                <MenuItem key={size} value={size}>{size}</MenuItem>
              ))}
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName="Admin_Export"
              dictionary={dictionary}
            />
              <Button
                variant="contained"
                onClick={() => {
                  setEditAdmin(null); // Clear editAdmin to indicate adding mode
                  setAddAdminOpen(true);
                }}
                startIcon={<i className="tabler-plus" />}
              >
            {dictionary['navigation'].addNew}
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto" id="table-container">
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
                            asc: <i className="tabler-chevron-up text-xl" />,
                            desc: <i className="tabler-chevron-down text-xl" />,
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
                  <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
                    {dictionary['navigation'].noDataFound}
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
      </Card>
      <AddAdminDrawer
        open={addAdminOpen}
        setOpen={setAddAdminOpen}
        data={data}
        setData={setData}
        handleClose={() => setAddAdminOpen(false)}
        editAdmin={editAdmin}
        setEditAdmin={setEditAdmin}
        count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        dictionary={dictionary}
      />

      <EditPasswordDrawer
        open={editPasswordOpen}
        dictionary={dictionary}
        handleClose={() => setEditPasswordOpen(false)}
        userId={passwordChangeId!}
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
          {/* Error icon */}
          <i className={classnames('tabler-alert-circle text-[88px] mbe-6 text-error')} />
          {/* Error title */}
          <Typography variant="h4" className="mbe-2">
            {dictionary['navigation'].error}
          </Typography>
          {/* Error message */}
          <Typography color="text.primary">{errorMessage}</Typography>
        </DialogContent>
        <DialogActions className="justify-center pbs-0 sm:pbe-16 sm:pli-16">
          {/* OK button */}
          <Button variant="contained" color="error" onClick={() => setErrorDialogOpen(false)}>
           {dictionary['navigation'].ok}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminTable;
