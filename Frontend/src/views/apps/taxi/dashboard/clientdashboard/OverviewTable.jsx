/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

// React Imports
import { useState, useMemo } from "react";

// Next Imports
import Link from "next/link";
import { useParams } from "next/navigation";

// MUI Imports
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { Tooltip } from '@mui/material';

// API Imports

// Third-party Imports
import classnames from "classnames";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from "@tanstack/react-table";

// Components Imports
import CustomAvatar from "@core/components/mui/Avatar";
import OptionMenu from "@core/components/option-menu";
import TablePaginationComponent from "@components/TablePaginationComponent";

// Util Imports
import tableStyles from "@core/styles/table.module.css";

import { getLocalizedUrl } from "@/utils/i18n";

// Style Imports
import { getByLastTrips } from "@/app/api/apps/taxi/request";

export const chipColor = {
  "completed": { color: "success" }, // Can map to 'primary' or 'default' if you prefer
  "Trip Started": { color: "primary" },
  "arrived": { color: "warning" },
  "cancelled": { color: "error" },
  "oil leakage": { color: "info" }
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

return itemRank.passed;
};

// Column Definitions
const columnHelper = createColumnHelper();

const LastRequestTable = ({lastRequests,dictionary,zoneId}) => {
  const [vehicleData, setVehicleData] = useState(lastRequests);

  const [rowSelection, setRowSelection] = useState({});

  const { lang: locale } = useParams();


  const columns = useMemo(
    () => [

      columnHelper.accessor("_id", {
        header: dictionary['navigation'].requestNumber,
        cell: ({ row }) => {
          const Status = row.original.status

          return (
          <div className="flex items-center gap-4">
            <CustomAvatar skin="light" color="secondary">
              <i className="tabler-car text-[28px]" />
            </CustomAvatar>
          <Typography
            component={Link}
            href={getLocalizedUrl(`${zoneId}/apps/taxi/request/requestView/${row.original._id}`, locale)}
            className="font-medium"

          // color="text.primary"

          color={
                Status === "completed"
                  ? "#00c867"
                  : Status === "Trip Started"
                  ? "primary"
                  : Status === "arrived"
                  ? "warning"
                  : Status === "cancelled"
                  ? "error"
                  : Status === "oil leakage"
                  ? "info"
                  : "default" // Default color if no match
              }
        >

              {row.original.requestNumber}
            </Typography>
          </div>
        )},
      }),
      columnHelper.accessor("pickupAddress", {
        header: dictionary['navigation'].StartingRoute,
         cell: ({ row }) => {
              const address = row.original.pickupAddress != 'N/A' ? row.original.pickupAddress : '';
              const truncatedAddress = address.length > 25 ? address.substring(0, 25) + '...' : address;

              return (
                <Tooltip title={address} arrow>
                  <Typography>{truncatedAddress}</Typography>
                </Tooltip>
              );
            }
          }),
      columnHelper.accessor("dropAddress", {
        header: dictionary['navigation'].EndingRoute,
      cell: ({ row }) => {
             const address = row.original.dropAddress != 'N/A' ? row.original.dropAddress : '';
             const truncatedAddress = address.length > 25 ? address.substring(0, 25) + '...' : address;

             return (
               <Tooltip title={address} arrow>
                 <Typography>{truncatedAddress}</Typography>
               </Tooltip>
             );
           }
         }),

      columnHelper.accessor("status", {
        header: dictionary['navigation'].Status,
        cell: ({ row }) => {
          const status = row.original.status;


return (
            <Chip
              label={row.original.status}
              size="small"
              color={
                status === "completed"
                  ? "success"
                  : status === "Trip Started"
                  ? "primary"
                  : status === "arrived"
                  ? "warning"
                  : status === "cancelled"
                  ? "error"
                  : status === "oil leakage"
                  ? "info"
                  : "default" // Default color if no match
              }
            />
          );
        },
      }),


    ],
    [locale,dictionary,zoneId]
  );

  const table = useReactTable({
    data: vehicleData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].Last5Requests} />
      <div className="overflow-x-auto" id="table-container">
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          "flex items-center": header.column.getIsSorted(),
                          "cursor-pointer select-none": header.column.getCanSort(),
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === "asc" ? (
                            <i className="tabler-chevron-up text-xl" />
                          ) : (
                            <i className="tabler-chevron-down text-xl" />
                          )
                        ) : null}
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
                  {dictionary['navigation'].Nodataavailable}
                </td>
              </tr>
            ) : (
              table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map((row) => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      {/* <TablePagination
        component={() => <TablePaginationComponent table={table} dictionary={dictionary} />}
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      /> */}
    </Card>
  );
};

export default LastRequestTable;
