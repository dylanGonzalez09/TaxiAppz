/* eslint-disable react-hooks/exhaustive-deps */
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
import { fetchUserComplaintData } from '@/app/api/apps/taxi/complaints'
import TablePaginationComponent from '@/components/TablePaginationComponent'

// Type Definitions
interface ComplaintDataType {
  title: string;
  category: string;
  type: string;
  complaintType: number;
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
  const [tableData, setTableData] = useState<ComplaintDataType[]>(complaintData);
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Fetch complaints data if not provided as props
  useEffect(() => {
    if (complaintData.length === 0) {
      const fetchComplaints = async () => {
        try {
          const response = await fetchUserComplaintData(userId);

          setTableData(response);
        } catch (error) {
          // Handle the error silently (for example, setting an error state)
          setTableData([]); // You can set an empty array or show a message in the UI if needed
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
    {
      accessorKey: 'type',
      header: dictionary['navigation'].Type,
      cell: ({ row }) => <Typography color='text.primary'>{row.original.type}</Typography>,
    },
    {
      accessorKey: 'category',
      header: dictionary['navigation'].Category,
      cell: ({ row }) => <Typography color='text.primary'>{row.original.category}</Typography>,
    },
    {
      accessorKey: 'complaintType',
      header: dictionary['navigation'].ComplaintType,
      cell: ({ row }) => <Typography color='text.primary'>{row.original.complaintType}</Typography>,
    }
  ], [])

  // Table instance
  const table = useReactTable({
    data: tableData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Handle pagination changes
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

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
      <div className='overflow-x-auto'>
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
          
          {tableData.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className='text-center'>
                  {dictionary['navigation'].Nodataavailable}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                <tr key={row.id}>
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
        component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />
    </Card>
  )
}

export default ComplaintTable
