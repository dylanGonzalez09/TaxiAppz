/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import '@tanstack/table-core';

import { useParams } from 'next/navigation';

import Link from 'next/link'

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TablePagination from '@mui/material/TablePagination';
import classnames from 'classnames';
import type { TextFieldProps } from '@mui/material/TextField';
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

import { getLocalizedUrl } from '@/utils/i18n';
import type { Locale } from '@configs/i18n';
import TablePaginationComponent from '@components/TablePaginationComponent';




import OptionMenu from '@core/components/option-menu';

import CustomTextField from '@core/components/mui/TextField';
import tableStyles from '@core/styles/table.module.css';
import { deleteByCompanyId, getCompanyByPagination, updateCompanyStatus } from '@/app/api/apps/taxi/company';

import ExportOptions from '@/utils/ExportOptions';

import ConfirmationDialog from '@/components/dialogs/delete-data';

import { deleteByUserId } from '@/app/api/apps/taxi/user';


declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

export type CorporateType = {
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  loginId?: string;
  password?: string;
  confirmPassword?: string;
  role?: number | string;
  country?: number | string;
  address?: string;
  commission?: string;
  noOfVehicle?: string;
  active?: boolean;
  id?: string;
  userId?: string;
  status?: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: CorporateType[];
  setData: React.Dispatch<React.SetStateAction<CorporateType[]>>;
  handleClose: () => void;
};


const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

  return itemRank.passed;
};

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />;
};

// Sample Data
const columnHelper = createColumnHelper<CorporateType>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CorporateTable = ({ tableData, dictionary,privillageData }: {  tableData:any, dictionary: any,privillageData:any}) => {
  const [editCorporate, setEditCorporate] = useState<CorporateType | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusCorporate, setstatusCorporate] = useState<CorporateType | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteCorporateId, setdeleteCorporateId] = useState<string | null>(null);
  const [deleteUserId, setdeleteUserId] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(tableData.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(tableData.totalResults); // To track the total number of records
  const [data, setData] = useState<any[]>(tableData.results);

  const [pageSize, setPageSize] = useState(tableData.limit);
  const { lang: locale } = useParams();



  const handleDeleteClick = (corporateId: string, userId: string) => {
    setdeleteCorporateId(corporateId);
    setdeleteUserId(userId)// Convert number to string
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteCorporateId && deleteUserId) {
      try {
        await deleteByCompanyId(deleteCorporateId);

        // await deleteByUserId(deleteUserId);

        setData((prevData: any[]) => prevData.filter(corporate => corporate.id !== deleteCorporateId)); // Convert id to string for comparison
        setDeleteConfirmationOpen(false);
        setdeleteCorporateId(null);
      } catch (error) {
        // Handle error (e.g., show an error message)
      }
    } else {
      setDeleteConfirmationOpen(false);
      setdeleteCorporateId(null);
    }
  };




  const handleStatusToggle = async (corporate: CorporateType) => {
    setstatusCorporate(corporate);
    setStatusConfirmationOpen(true);
  };
  
  // const handleStatusToggle = async (corporate: CorporateType) => {
  //   // Flip the status of the corporate row
  //   const updatedCorporate = { ...corporate, status: !corporate.status };


  //   // Update the status in the table data
  //   setData(prevData =>
  //     prevData.map(item =>
  //       item.id === corporate.id ? updatedCorporate : item
  //     )
  //   );
  //   setstatusCorporate(corporate);
  //   setStatusConfirmationOpen(true);
  // };

  const handleConfirmStatus = async (confirmed: boolean) => {
    if (confirmed && statusCorporate) {
      const updatedCorporate = { ...statusCorporate, status: !statusCorporate.status };

      try {
        const body = {
          status: !statusCorporate.status
        };

        if (statusCorporate.id) {
          await updateCompanyStatus(statusCorporate.id.toString(), body);

          // Assume you have this API function
          setData((prevData: any[]) =>
            prevData.map(corporate =>
              corporate.id === statusCorporate.id ? updatedCorporate : corporate
            )
          );

          setStatusConfirmationOpen(false);
          setstatusCorporate(null);
        } else {
          console.error('UserId is undefined');
        }
      } catch (error) {
        console.error('Failed to update corporate status:', error);
        setStatusConfirmationOpen(false);
      }
    } else {
      setStatusConfirmationOpen(false);
      setstatusCorporate(null); // Clear the statusCorporate after the operation
    }
  };




  // Start pagination


  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getCompanyByPagination(pageSearch, newPage, pageSize);

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    const newPageSize = parseInt(event.target.value);

    // const { results, totalResults } = await getCompanyByPagination(pageSearch, pageIndex, newPageSize);

    
    setPageSize(newPageSize);
    
    // setData(results);
    
    setTotalResults(totalResults);
  };


  const handleSearch = useCallback(
    async (searchTerm: string) => {
      try {
        const result = await getCompanyByPagination(
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

  // End pagination


  const columns = useMemo<ColumnDef<CorporateType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      },
      columnHelper.accessor('companyName', {
        header: 'Company Name',
        cell: ({ row }) => (
          <Typography className='font-medium' color='text.primary'>
            {row.original.companyName}
          </Typography>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email}</Typography>
      }),
      columnHelper.accessor('role', {
        header: 'Role',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        cell: ({ row }) => <Typography>corporate</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Switch
              checked={row.original.status} // This ensures the switch is controlled
              onChange={() => handleStatusToggle(row.original)} // Toggle status
              color={row.original.status ? 'success' : 'error'} // Color based on status
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
  header: 'Actions',
  cell: ({ row }) => (
    <div className='flex items-center'>
      <OptionMenu
        iconButtonProps={{ size: 'medium' }}
        iconClassName='text-textSecondary'
        options={[
         {
            text: 'View',
            icon: 'tabler-eye',
            href: getLocalizedUrl(`/apps/taxi/corporatecompany/viewcorporatecompany/${row.original.id}`, locale as Locale),
            linkProps: {
              className: 'flex is-full plb-2 pli-4 gap-2'
            }
          },
          privillageData.includes('Edit') && {
            text: 'Edit',
            icon: 'tabler-edit',
            href: getLocalizedUrl(`/apps/taxi/corporatecompany/editcorporatecomapany/${row.original.id}`, locale as Locale),
            linkProps: {
              className: 'flex is-full plb-2 pli-4 gap-2'
            }
          },
          privillageData.includes('Delete') && {
            text: 'Delete',
            icon: 'tabler-trash',
            menuItemProps: {
             
              onClick: () => {
                const { id, userId } = row.original;
                
                if (id && userId) {
                  handleDeleteClick(id.toString(), userId.toString());
                } else {
                  console.error('ID or userId is undefined');
                }
              }
            }
          }
        ].filter(Boolean)}
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
  });

  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <div className='flex items-center gap-x-4'>
            <DebouncedInput
              value={globalFilter}
              onChange={(value) => setGlobalFilter(String(value))}
              placeholder={dictionary['navigation'].search}
            />
          </div>
          <div className='flex items-center gap-x-4'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className='flex-auto'
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='Corporate_Export'
              dictionary={dictionary}

            />
          {privillageData.includes('Add') && (
            <Button
              variant='contained'
              component={Link}
              href={getLocalizedUrl('apps/taxi/corporatecompany/addcorporatecompany', locale as Locale)}
              startIcon={<i className='tabler-plus' />}
              className='is-full sm:is-auto'
            >
              Add New Corporate
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
                    No data available
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
          component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />

        {/* end pagination */}

      </Card>



      <ConfirmationDialog
        open={deleteConfirmationOpen}
        setOpen={setDeleteConfirmationOpen}
        confirmationType="delete-data"
        onConfirm={handleConfirmDelete}
        dictionary={dictionary}

      />
      <ConfirmationDialog
        open={statusConfirmationOpen}
        setOpen={setStatusConfirmationOpen}
        confirmationType="status-data"
        onConfirm={handleConfirmStatus}
        dictionary={dictionary}

      />
    </>
  );
};

export default CorporateTable;
