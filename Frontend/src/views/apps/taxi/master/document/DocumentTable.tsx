/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import type { ChangeEvent } from 'react';
import React, { useState, useMemo, useCallback } from 'react';

import { useParams } from 'next/navigation';

import TablePagination from '@mui/material/TablePagination';
import { createColumnHelper, flexRender, useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Chip, MenuItem, Button, Typography, Card , Dialog, DialogActions, DialogContent } from '@mui/material';
import Switch from '@mui/material/Switch'; // Import the Switch component

import type { ColumnDef, FilterFn } from '@tanstack/react-table';

import classnames from 'classnames';

import { StatusCodes as httpStatus } from 'http-status-codes';

import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';

import ConfirmationDialog from '@components/dialogs/delete-data/';
import tableStyles from '@core/styles/table.module.css';
import OptionMenu from '@core/components/option-menu';

import { createDocument, deleteByDocumentById, updateDocument, updateDocumentStatus, getDocumentByPagination } from '@apis/document';

import TablePaginationComponent from '@/components/CustomTablePaginationComponent';

import type { DocumentType } from '@/types/apps/masterType';
import CreateNewDocumentDialog from './AddEditDrawer';
import ExportOptions from '@/utils/ExportOptions';
import ConfirmationDialogErrorHandle from '@/components/dialogs/delete-data/index-error-handle';


const fuzzyFilter: FilterFn<DocumentType> = (row, columnId, filterValue) => {
  const cellValue = row.getValue(columnId);


  return typeof cellValue === 'string' && cellValue.toLowerCase().includes(filterValue.toLowerCase());
};

const columnHelper = createColumnHelper<DocumentType>();

const isLockedDefaultDocument = (document: DocumentType) =>
  String(document?.documentName || '').trim().toLowerCase() === 'profile image' &&
  String((document as any)?.type || '').trim().toLowerCase() === 'driver';

const DocumentTable = ({
  staticGroup,
  dictionary,
  initialType = 'All',
  selectedGroupDocumentId,
}: {
  staticGroup: any;
  dictionary: any;
  initialType?: 'All' | 'driver' | 'vehicle';
  selectedGroupDocumentId?: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<DocumentType | undefined>(undefined);
  const [rowSelection, setRowSelection] = useState({});
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteGroupDocumentId, setDeleteGroupDocumentId] = useState<string | null>(null);
  const [statusConfirmationOpen, setStatusConfirmationOpen] = useState(false);
  const [statusDocument, setStatusDocument] = useState<DocumentType | null>(null);

  const [globalFilter, setGlobalFilter] = useState('');
  const [currentType, setCurrentType] = useState<'All' | 'driver' | 'vehicle'>(initialType);
  const [pageIndex, setPageIndex] = useState(staticGroup.page - 1);
  const [pageSearch, setPageSearch] = useState("");
  const [totalResults, setTotalResults] = useState(staticGroup.totalResults); // To track the total number of records
  const [data, setData] = useState<DocumentType[]>(staticGroup.results);
  const [pageSize, setPageSize] = useState(staticGroup.limit);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorData, setErrorData] = useState('');
  const { isDemoUser, checkDemoStatus } = useIsDemoUser();
  const { lang: locale, zoneId } = useParams();

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


  const handleAddPageChangeForAddRecord = (count: number, rowsPerPage: number, onPageChange: (event: ChangeEvent<unknown>, page: number) => void) => {
    const newPage = Math.floor(count / rowsPerPage);

    // Create a dummy event object
    const dummyEvent = {
      target: {
        value: newPage,
      },
      currentTarget: {
        value: newPage,
      },
      nativeEvent: {} as Event,
      bubbles: false,
    } as unknown as ChangeEvent<unknown>;

    // Trigger onPageChange with the new page
    onPageChange(dummyEvent, newPage + 1);
  };

  const handleStatusToggle = async (document: DocumentType) => {
    if (isLockedDefaultDocument(document)) {
      toast.error(
        dictionary['navigation'].DefaultDriverProfileImageDocumentCannotBeModified ||
          'Default Driver profile image document cannot be modified'
      );

return;
    }

    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

    return;
      }

    setStatusDocument(document);
    setStatusConfirmationOpen(true);
  };

 const handleConfirmStatus = async (confirmed: boolean) => {
  if (!confirmed || !statusDocument) {
    setStatusConfirmationOpen(false);
    setStatusDocument(null);

    return;
  }

  const updatedStatus = !statusDocument.status;

  try {
    await updateDocumentStatus(
      statusDocument._id.toString(), // ✅ USE _id
      { status: updatedStatus },
      zoneId
    );

    setData(prev =>
      prev.map(doc =>
        doc._id === statusDocument._id
          ? { ...doc, status: updatedStatus }
          : doc
      )
    );

    toast.success(dictionary['navigation'].statusUpdatedSuccessfully);
  } catch (error: any) {
    console.error('Failed to update document status:', error);
    toast.error(error?.message || dictionary['navigation'].Anerroroccurredwhileupdatingthedocument);
  } finally {
    setStatusConfirmationOpen(false);
    setStatusDocument(null);
  }
};


  const columns = useMemo<ColumnDef<DocumentType, any>[]>(
    () => [
      {
        id: 'serialNo',
        header: dictionary['navigation'].serialNo,
        cell: ({ row }) => (
          <Typography>{(pageIndex == 0 ? 0 : pageIndex - 1) * pageSize + row.index + 1}</Typography>
        ),
      },
     columnHelper.accessor('documentName', {
      header: dictionary['navigation'].documentName,
      cell: ({ row }) => (
        <>
          <Typography className='font-medium'>
            {row.original.documentName}
          </Typography>
          <Typography
            variant='body2'
            className='text-wrap'
            style={{ color: 'green' }}
          >
            {row.original.type}
          </Typography>
        </>
      ),
    }),

      columnHelper.accessor('required', {
        header: dictionary['navigation'].required,
        cell: ({ row }) => (
          <Chip
            label={row.original.required ? dictionary['navigation'].Yes : dictionary['navigation'].No}
            variant='tonal'
            color={row.original.required ? 'success' : 'primary'}
            size='small'
          />
        ),
      }),
      columnHelper.accessor('identifier', {
        header: dictionary['navigation'].identifier,
        cell: ({ row }) => (
          <Chip
            label={row.original.identifier ? dictionary['navigation'].Yes : dictionary['navigation'].No}
            variant='tonal'
            color={row.original.identifier ? 'success' : 'primary'}
            size='small'
          />
        ),
      }),
      columnHelper.accessor('expiryDate', {
        header: dictionary['navigation'].expiredDate,
        cell: ({ row }) => (
          <Chip
            label={row.original.expiryDate ? dictionary['navigation'].Yes : dictionary['navigation'].No}
            variant='tonal'
            color={row.original.expiryDate ? 'success' : 'primary'}
            size='small'
          />
        ),
      }),

      // columnHelper.accessor('issueDate', {
      //   header: dictionary['navigation'].issueDate,
      //   cell: ({ row }) => (
      //     <Chip
      //       label={row.original.issueDate ? dictionary['navigation'].Yes : dictionary['navigation'].No}
      //       variant='tonal'
      //       color={row.original.issueDate ? 'success' : 'primary'}
      //       size='small'
      //     />
      //   ),
      // }),
      columnHelper.accessor('imageRequired', {
        header: dictionary['navigation'].imageRequired,
        cell: ({ row }) => (
          <Chip
            label={row.original.imageRequired ? dictionary['navigation'].Yes : dictionary['navigation'].No}
            variant='tonal'
            color={row.original.imageRequired ? 'success' : 'primary'}
            size='small'
          />
        ),
      }),
      columnHelper.accessor('status', {
        header: dictionary['navigation'].Status,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Switch
              checked={row.original.status}
              onChange={() => handleStatusToggle(row.original)} // Toggle status on switch change
              disabled={isLockedDefaultDocument(row.original)}
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
      {
        id: 'actions',
        header: dictionary['navigation'].actions,
        cell: ({ row }) => (
          isLockedDefaultDocument(row.original) ? (
            <Typography variant='body2' color='text.secondary'>
              -
            </Typography>
          ) : (
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-textSecondary'
              options={[
                {
                  text: dictionary['navigation'].Edit,
                  icon: 'tabler-pencil-minus',
                  menuItemProps: {
                    onClick: () => handleEditClick(row.original),
                  },
                },
              ]}
            />
          )
        ),
        enableSorting: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, dictionary]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter as FilterFn<DocumentType>,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEditClick = (rowData: DocumentType) => {
    if (isLockedDefaultDocument(rowData)) {
      toast.error(
        dictionary['navigation'].DefaultDriverProfileImageDocumentCannotBeModified ||
          'Default Driver profile image document cannot be modified'
      );

return;
    }

    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
      }

    setEditData(rowData);
    setDialogOpen(true);
  };

  const handleDeleteClick = (original: DocumentType) => {
    if (isLockedDefaultDocument(original)) {
      toast.error(
        dictionary['navigation'].DefaultDriverProfileImageDocumentCannotBeModified ||
          'Default Driver profile image document cannot be modified'
      );

return;
    }

    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].deleteError);

      return;
      }

    setDeleteGroupDocumentId(original._id);
    setDeleteConfirmationOpen(true);
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

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (confirmed && deleteGroupDocumentId) {
      try
      {
        const response = await deleteByDocumentById(deleteGroupDocumentId)

        if(response){
          toast.success(dictionary['navigation'].Documentdeletedsuccessfully || 'Document deleted successfully');


        const { results, totalResults } = await getDocumentByPagination(
          pageSearch,
          pageIndex + 1,
          pageSize,
          currentType === 'All' ? undefined : currentType,
          selectedGroupDocumentId,
          zoneId
        );

        setData(results);
        setTotalResults(totalResults);

        setDeleteConfirmationOpen(false);
        setDeleteGroupDocumentId(null);
      }
      }
      catch (error) {
        toast.error((error as Error)?.message || dictionary['navigation'].Anerroroccurredwhiledeletingthedocument);
      }
    }
    else
    {
      setDeleteConfirmationOpen(false);
      setDeleteGroupDocumentId(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditData(undefined);
  };

  const handleSaveDocument = async (newDocument: any) => {
    try {
      if (editData) {
        const dataDocument = newDocument[0];

        const dataWithoutId = {
          documentName: dataDocument.documentName,
          required: dataDocument.required,
          identifier: dataDocument.identifier,
          expiryDate: dataDocument.expiryDate,
          issueDate: dataDocument.issueDate,
          imageRequired: dataDocument.imageRequired,
          documentId: dataDocument.documentId,
          clientId: dataDocument.clientId,
          status: dataDocument.status,
        }

        await updateDocument(editData.id || editData._id, dataWithoutId);
        toast.success(dictionary['navigation'].Documentupdatedsuccessfully || 'Document updated successfully');

        const { results, totalResults } = await getDocumentByPagination(
          pageSearch,
          1,
          pageSize,
          currentType === 'All' ? undefined : currentType,
          selectedGroupDocumentId,
          zoneId
        );

        setData(results);
        setTotalResults(totalResults);
      } else {
        await createDocument({ newDocument });
        toast.success(dictionary['navigation'].Documentcreatedsuccessfully || 'Document created successfully');

        const { results, totalResults } = await getDocumentByPagination(
          pageSearch,
          1,
          pageSize,
          currentType === 'All' ? undefined : currentType,
          selectedGroupDocumentId,
          zoneId
        );

        setData(results);
        setTotalResults(totalResults);
        setPageIndex(0);
      }

      handleCloseDialog();
    } catch (error: any) {
      toast.error(error?.message || dictionary['navigation'].Anerroroccurredwhilecreatingthedocument);
    }
  };

  const handlePageChange = async (event: unknown, newPage: number) => {
    try {
      const { results, totalResults } = await getDocumentByPagination(
        pageSearch,
        newPage,
        pageSize,
        currentType === 'All' ? undefined : currentType,
        selectedGroupDocumentId,
        zoneId
      );

      setData(results);
      setPageIndex(newPage);
      setTotalResults(totalResults);
    } catch (error) {
      console.error("Error fetching new page data:", error);
    }
  };

  const handlePageSizeChange = async (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newPageSize = parseInt(event.target.value);

    const { results, totalResults } = await getDocumentByPagination(
      pageSearch,
      1,
      newPageSize,
      currentType === 'All' ? undefined : currentType,
      selectedGroupDocumentId,
      zoneId
    );

    setPageSize(newPageSize);
    setData(results);
    setTotalResults(totalResults);
    setPageIndex(0);
  };


  const handleSearch = useCallback(
    async (searchTerm: string, typeFilter: string = currentType) => {
      try {
        const result = await getDocumentByPagination(
          searchTerm,
          pageIndex + 1,
          pageSize,
          typeFilter === 'All' ? undefined : typeFilter,
          selectedGroupDocumentId,
          zoneId
        );

        setPageSearch(searchTerm);
        setData(result.results);
        setTotalResults(result.totalResults);
        setPageIndex(0); // Reset to first page
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    },
    [pageSize, currentType, selectedGroupDocumentId, zoneId]
  );

  const handleTypeFilter = useCallback(
    async (typeFilter: 'All' | 'driver' | 'vehicle') => {
      setCurrentType(typeFilter);
      await handleSearch(pageSearch, typeFilter);
    },
    [handleSearch, pageSearch]
  );


  return (
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
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

          {/* end pagination */}

          <div className='flex items-center gap-x-4'>

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
             <CustomTextField
                        select
                        fullWidth
                        value={currentType}
                        onChange={e => handleTypeFilter(e.target.value as 'All' | 'driver' | 'vehicle')}
                        className='is-[140px] flex-auto'
                        disabled={!!selectedGroupDocumentId}
                      >
                        <MenuItem value='All'>{dictionary['navigation'].All}</MenuItem>
                        <MenuItem value='driver'>{dictionary['navigation'].driver}</MenuItem>
                        <MenuItem value='vehicle'>{dictionary['navigation'].vehicle}</MenuItem>
                      </CustomTextField>
            <ExportOptions
              data={data}
              tableContainerId="table-container"
              fileName='Document_Export'
              dictionary={dictionary}

            />

            <Button
              variant='contained'
              onClick={() => setDialogOpen(true)}
              startIcon={<i className='tabler-plus' />}
            >
              {dictionary['navigation'].addGroupDocument}
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
                  .map((row) => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    );
                  })}
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
      <CreateNewDocumentDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        documentToEdit={editData}
        onSave={handleSaveDocument}
         count={totalResults}
        page={pageIndex}
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        dictionary={dictionary}
        zoneId={zoneId}
        selectedGroupDocumentId={selectedGroupDocumentId}
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
    </>
  );
};

export default DocumentTable;
