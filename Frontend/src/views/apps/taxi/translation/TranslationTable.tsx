'use client'
import React, { useEffect, useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { TextFieldProps } from '@mui/material/TextField';

import classnames from 'classnames';

import { toast } from 'react-toastify';





import { rankItem } from '@tanstack/match-sorter-utils';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table';
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import type { RankingInfo } from '@tanstack/match-sorter-utils';

import ExportOptions from '@/utils/ExportOptions';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';
import TablePaginationComponent from '@components/TablePaginationComponent';
import tableStyles from '@core/styles/table.module.css';
import { createTranslation, deleteByKey } from '@apis/translation';



declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type VersionWithActionsType = any & {
  actions?: string;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({
    itemRank
  });

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
  // States
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <CustomTextField {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
};

const TranslationTable = ({ translationData, currentTab, activeLanguage, dictionary }: { translationData: any[], currentTab: any, dictionary: any, activeLanguage: any }) => {
  const [addVersionOpen, setAddVersionOpen] = useState(false);
  const [newTranslation, setNewTranslation] = useState({ code: '', key: '', value: '', data: '' });
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState(translationData);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editCell, setEditCell] = useState<{ rowIndex: number; columnId: string } | null>(null);
  const [editedColumn, setEditedColumn] = useState('');
  const [editedRow, setEditedRow] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editedTab, setEditedTab] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [codes, setCodes] = useState<string[]>(activeLanguage);
  const [selectedCode, setSelectedCode] = useState("");

  const handleSaveEdit = async () => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].editError);

      return;
      }

    if (currentTab == "web") {
      if (editCell) {
        const updatedData = [...data];

        const jsonData = {
          code: editedColumn,
          key: editedRow,
          value: editValue,
          data: "update"
        }



        await createTranslation(jsonData);

        updatedData[editCell.rowIndex][editCell.columnId] = editValue;
        setData(updatedData);
        setEditCell(null);
        setEditDialogOpen(false);
      }

    } else {
      if (editCell) {
        const updatedData = [...data];

        const jsonData = {
          code: `mob_${editedColumn}`,
          key: editedRow,
          value: editValue,
          data: "update"
        }



        await createTranslation(jsonData);

        updatedData[editCell.rowIndex][editCell.columnId] = editValue;
        setData(updatedData);
        setEditCell(null);
        setEditDialogOpen(false);
      }
    }
  };

  const handleAddTranslation = async () => {

    if (currentTab == "mobile") {
      newTranslation.code = `mob_${selectedCode}`;
      newTranslation.data = 'add';
      await createTranslation(newTranslation);
      const convertedTranslation = mobileconvertTranslation(newTranslation, activeLanguage)

      setData([...data, convertedTranslation]);
      setAddVersionOpen(false);
      setSelectedCode("")
      setNewTranslation({ code: '', key: '', value: '', data: '' });
    } else {
      newTranslation.code = selectedCode;
      newTranslation.data = 'add';
      await createTranslation(newTranslation);
      const convertedTranslation = convertTranslation(newTranslation, activeLanguage)

      setData([...data, convertedTranslation]);
      setAddVersionOpen(false);
      setSelectedCode("")
      setNewTranslation({ code: '', key: '', value: '', data: '' });
    }
  };



  function convertTranslation(translation: any, languages: string[]): Record<string, string> {
    const result: Record<string, string> = { key: translation.key };

    languages.forEach(lang => {
      result[lang] = lang === translation.code ? translation.value : '';
    });

    return result;
  }


  function mobileconvertTranslation(translation: any, languages: string[]): Record<string, string> {
    const languageCode = translation.code.replace(/^mob_|^web_/, '');

    const result: Record<string, string> = { key: translation.key };

    languages.forEach(lang => {
      result[lang] = lang === languageCode ? translation.value : '';
    });

    return result;
  }

  const {  checkDemoStatus } = useIsDemoUser();

  const handleEditClick = (rowIndex: number, columnId: string) => {
    if (currentTab == 1) {
      setEditedRow(data[rowIndex].key);
      setEditedColumn(`mob_${columnId}`)
      setEditedTab("Mobile")
    } else {
      setEditedRow(data[rowIndex].key);
      setEditedColumn(columnId)
      setEditedTab("Web")
    }

    const value = data[rowIndex][columnId];

    setEditValue(value);
    setEditCell({ rowIndex, columnId });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = async (original: any) => {
    if (checkDemoStatus()) {
     toast.error(dictionary['navigation'].deleteError);

      return;
      }

    await deleteByKey(original.key);
    setData(data.filter((version) => version.key !== original.key));
  };

  const columns = useMemo<ColumnDef<VersionWithActionsType, any>[]>(() => {
    if (data.length === 0) return [];
    const keys = Object.keys(data[0]);
    const columnHelper = createColumnHelper<VersionWithActionsType>();

    return [
      {
        id: 'serialNo',
        header: dictionary['navigation'].SNo,
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      },
      ...keys.map((key) =>
        columnHelper.accessor(key, {
          header: key.charAt(0).toUpperCase() + key.slice(1),
          cell: ({ row }) => (
            <Typography
              onClick={() => handleEditClick(row.index, key)}
              className="cursor-pointer"
            >
              {row.original[key] != "" ? row.original[key] : "null"}
            </Typography>
          )
        })
      ),
      columnHelper.accessor('actions', {
        header: dictionary['navigation'].Actions,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => handleDeleteClick(row.original)}>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const table = useReactTable({
    data: data as any[],
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
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder={dictionary['navigation'].Search}
          />

          <div className='flex items-center gap-x-4'>


            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className='flex-auto'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='15'>15</MenuItem>
              <MenuItem value='25'>25</MenuItem>
            </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='Translation_Export'
              dictionary={dictionary}

            />
            <Button
              variant='contained'
              onClick={() => setAddVersionOpen(!addVersionOpen)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].AddTranslation}
            </Button>
          </div>
        </div>
        <div className='overflow-x-auto' id="table-container">
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <i className='tabler-chevron-up text-xl' />
                            ),
                            desc: (
                              <i className='tabler-chevron-down text-xl' />
                            )
                          }[header.column.getIsSorted() as 'asc' | 'desc'] ??
                            null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={table.getVisibleFlatColumns().length}
                    className='text-center'
                  >
                    {dictionary['navigation'].Nodataavailable}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(
                    0,
                    table.getState().pagination.pageSize
                  )
                  .map((row) => (
                    <tr
                      key={row.id}
                      className={classnames({
                        selected: row.getIsSelected()
                      })}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => (
            <TablePaginationComponent table={table} dictionary={dictionary}/>
          )}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={
            table.getState().pagination.pageSize
          }
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
              ;
          }}
        />
      </Card>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>{dictionary['navigation'].Edit}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            {dictionary['navigation'].Cancel}
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            {dictionary['navigation'].Save}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={addVersionOpen} onClose={() => setAddVersionOpen(false)}>
        <DialogTitle>{dictionary['navigation'].AddTranslation}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={dictionary['navigation'].Code}
            select
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            fullWidth
          >
            {codes.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label={dictionary['navigation'].Key}
            value={newTranslation.key}
            onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
            fullWidth
          />
          <TextField
            margin="dense"
            label={dictionary['navigation'].Value}
            value={newTranslation.value}
            onChange={(e) => setNewTranslation({ ...newTranslation, value: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddVersionOpen(false)} color="primary">
            {dictionary['navigation'].Cancel}
          </Button>
          <Button onClick={handleAddTranslation} color="primary">
            {dictionary['navigation'].Add}
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default TranslationTable;
