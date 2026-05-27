/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import { fetchGroupTicketsByAdmin } from '@/app/api/apps/taxi/ticket'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// 1. Update Type Definition to match your JSON data
interface ComplaintDataType {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  assignedToId: string | null;
  assignedToName: string;
}

interface ComplaintDetailsProps {
  userId: string;
  complaintData: ComplaintDataType[];
  dictionary: any;
}

// Extend the table core types for filtering
declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

// Fuzzy Filter Function
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

// ComplaintTable Component
const ComplaintTable = ({ userId, complaintData, dictionary }: ComplaintDetailsProps) => {
  // 2. Remove manual pagination state (page, rowsPerPage). Let TanStack handle it.
  const [tableData, setTableData] = useState<ComplaintDataType[]>(complaintData);
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Fetch complaints data if not provided as props
  useEffect(() => {
    if (complaintData.length === 0) {
      const fetchComplaints = async () => {
        try {
          const response = await fetchGroupTicketsByAdmin(userId);

          setTableData(response);
        } catch (error) {
          setTableData([]); 
        }
      };

      fetchComplaints();
    }
  }, [userId, complaintData]);
  
  // Column definitions
  const columns = useMemo<ColumnDef<ComplaintDataType>[]>(() => [
    {
      id: 'serialNo',
      header: dictionary['navigation'].Sl,
      cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
    },
    {
      accessorKey: 'title',
      header: dictionary['navigation'].Complaint,
      cell: ({ row }) => <Typography color='text.primary'>{row.original.title}</Typography>,
    },

    // 3. Updated columns to match the provided JSON structure
    {
      accessorKey: 'userName',
      header: dictionary['navigation'].User, // Assuming this key exists in your dictionary
      cell: ({ row }) => <Typography color='text.primary'>{row.original.userName}</Typography>,
    },
    {
      accessorKey: 'assignedToName',
      header: dictionary['navigation'].AssignedTo, // Assuming this key exists
      cell: ({ row }) => <Typography color='text.primary'>{row.original.assignedToName}</Typography>,
    },
    {
      accessorKey: 'status',
      header: dictionary['navigation'].Status,
      cell: ({ row }) => <Typography color='text.primary'>{row.original.status}</Typography>,
    }
  ], [dictionary])

  // Table instance
  const table = useReactTable({
    data: tableData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    enableRowSelection: true, // Only if you actually need checkboxes
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Enables built-in pagination logic
    // 4. Set initial page size
    initialState: {
        pagination: {
            pageSize: 5
        }
    }
  })

  // 5. Remove manual handleChange handlers. Pass table methods directly to TablePagination.

  return (
    <Card>
      <CardHeader title={`${dictionary['navigation'].ComplaintList} (${tableData.length ?? 0})`} className='flex flex-wrap gap-2' />
      
      <div className='flex items-center justify-between p-6 gap-4'>
        <CustomTextField
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder={dictionary['navigation'].SearchComplaint}
        />
      </div>
      <div className='overflow-x-auto' id="table-container">
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          
          {/* 6. Use table.getRowModel().rows directly. Do NOT slice manually. */}
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  {dictionary['navigation'].Nodataavailable}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
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
        component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={(event) => table.setPageSize(Number(event.target.value))}
      />
    </Card>
  )
}

export default ComplaintTable