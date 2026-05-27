/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useMemo, useState } from 'react';

import {
  Card,
  Button,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Chip
} from '@mui/material';
import { toast } from 'react-toastify';

import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';

import type { ColumnDef } from '@tanstack/react-table';

import classnames from 'classnames';

import { rankItem } from '@tanstack/match-sorter-utils';

import TripleSwitch from './TripleSwitch';
import ConfirmationDialog from '@/components/dialogs/delete-data';
import EditDriverDocument from './AddEditDocument';

import tableStyles from '@core/styles/table.module.css';
import type { DriverDocumentType } from '@/types/apps/driverDocument';
import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint';
import { updateDriverDocumentStatus } from '@/app/api/apps/taxi/driverDocument';

const fuzzyFilter = (row: any, columnId: string, value: any, addMeta: (meta: any) => void) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta({ itemRank });

  return itemRank.passed;
};

const columnHelper = createColumnHelper<DriverDocumentType>();

interface VehicleInfo {
  driverVehicleId?: string | null;
  vehicleMake: string;
  vehicleModelName: string;
  licensePlateNumber: string;
  manufactureYear: number;
  vehicleColor: string;
  passengerCapacity: number;
}

interface VehicleDocuments {
  vehicleInfo: VehicleInfo;
  documents: DriverDocumentType[];
}

interface DocumentData {
  driver: DriverDocumentType[];
  vehicles: VehicleDocuments[];
}

// New component for vehicle document tables
const VehicleDocumentsTable = ({
  vehicle,
  columns,
  dictionary,
}: {
  vehicle: VehicleDocuments;
  columns: any;
  dictionary: any;
}) => {

  const table = useReactTable({
    data: vehicle.documents,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 25 } }
  });

  return (
    <Card sx={{ mb: 4 }}>
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {dictionary['navigation'].VehicleDocuments || 'Vehicle Documents'} - {vehicle.vehicleInfo.vehicleMake} {vehicle.vehicleInfo.vehicleModelName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${dictionary['navigation'].LicensePlate || 'License'}: ${vehicle.vehicleInfo.licensePlateNumber}`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${dictionary['navigation'].Year || 'Year'}: ${vehicle.vehicleInfo.manufactureYear}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${dictionary['navigation'].Capacity || 'Capacity'}: ${vehicle.vehicleInfo.passengerCapacity}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>
      <div className='overflow-x-auto'>
        <table className={classnames(tableStyles.table, 'w-full')}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                  <Typography variant="body2" color="textSecondary">
                    {dictionary['navigation'].NoDocumentsFound || 'No documents found'}
                  </Typography>
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
    </Card>
  );
};


const DocumentStatusTable = ({
  data,
  driverDataId,
  dictionary
}: {
  data: DocumentData;
  driverDataId: string;
  dictionary: any;
}) => {
  const [driverDocuments, setDriverDocuments] = useState<DriverDocumentType[]>(data.driver);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [DocumentId, setDocumentId] = useState<string | null>(null);
  const [confirmationType, setConfirmationType] = useState<'approve' | 'deny' | undefined>();
  const [addDocumentDrawerOpen, setAddDocumentDrawerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DriverDocumentType | null>(null);
  const [driverId, setDriverId] = useState<string | null>(driverDataId);

  const handleStatusToggle = async (
    documentId: string,
    driverDocumentId: string,
    newStatus: 'approved' | 'notapproved' | 'denied' | 'notUploaded'
  ) => {
    const updatedStatus =
      newStatus === 'approved'
        ? 'APPROVED'
        : newStatus === 'denied'
        ? 'DENIED'
        : newStatus === 'notapproved'
        ? 'WAITINGFORAPPROVAL'
        : 'NOTUPLOADED';

    setDocumentId(driverDocumentId);
    setConfirmationType(updatedStatus === 'APPROVED' ? 'approve' : 'deny');
    setCurrentDocumentId(driverDocumentId);
    setConfirmationDialogOpen(true);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedImageUrl(null);
  };

  const handleConfirmStatusChange = async (confirmed: boolean) => {
    if (confirmed && currentDocumentId) {

      const updatedStatus =
        confirmationType === 'approve'
          ? 'APPROVED'
          : confirmationType === 'deny'
          ? 'DENIED'
          : 'WAITINGFORAPPROVAL';

      const updateBody = { documentStatus: updatedStatus };

      try {
        if (DocumentId !== null) {
          const updateStatus = await updateDriverDocumentStatus(DocumentId, updateBody);

          // ❗ if backend says error → do NOT update state
          if (updateStatus.success === false) {
            toast.error(updateStatus.message || 'Error updating document status');

            return;
          }

          // ✔ API success → now update state
          setDriverDocuments(prevData =>
            prevData.map(item =>
              item.driverDocumentId === currentDocumentId
                ? { ...item, documentStatus: updatedStatus }
                : item
            )
          );

          toast.success(dictionary['navigation'].DocumentStatusUpdated || 'Document status updated successfully');
        }
      } catch (error) {
        console.error("Error updating document status:", error);
        toast.error(dictionary['navigation'].ErrorUpdatingDocument || 'Error updating document status');
      }
    }
  };


  const handleOpenAddDocumentDrawer = (doc?: DriverDocumentType) => {
    setSelectedDocument(doc || null);
    setAddDocumentDrawerOpen(true);
  };

  const handleCloseAddDocumentDrawer = () => {
    setAddDocumentDrawerOpen(false);
  };

  const columns = useMemo(() => [
    columnHelper.accessor('documentName', {
      header: dictionary['navigation'].documentName,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.documentName}
            </Typography>
            <Typography variant='body2'>{row.original.categoryName}</Typography>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('documentImage', {
      header: dictionary['navigation'].DocumentImage,
      cell: ({ row }) => {

        const imageUrl = row.original.documentImage;

        return (
          <div
            style={{
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
            }}
          >
            {imageUrl ? (
              <img
                src={`${BASE_IMAGE_URL}${imageUrl}`}
                alt={row.original.documentImage}
                style={{ width: '50px', height: '50px' }}
                className="cursor-pointer"
                onClick={() => handleImageClick(`${BASE_IMAGE_URL}${imageUrl}`)}
              />
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                style={{
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: '12px',
                }}
              >
                {dictionary['navigation'].NoImage}
              </Typography>
            )}
          </div>
        );
      }
    }),
    columnHelper.accessor('documentStatus', {
      header: dictionary['navigation'].Documentstatus,
      cell: ({ row }) => {
        const status = row.original.documentStatus || 'NOTUPLOADED';

        const formattedStatus =
          status === 'WAITINGFORAPPROVAL' ? 'Not Approved' :
          status === 'APPROVED' ? 'Approved' :
          status === 'DENIED' ? 'Denied' :
          'Not Uploaded';

        return (
          <Typography
            variant="body2"
            color={
              status === 'APPROVED' ? 'success.main' :
              status === 'DENIED' ? 'error.main' :
              status === 'NOTUPLOADED' ? 'text.secondary' : 'text.primary'
            }
          >
            {formattedStatus}
          </Typography>
        );
      }
    }),
    columnHelper.accessor('documentStatus', {
      header: dictionary['navigation'].approvedDenied,
      cell: ({ row }) => {
        const { documentStatus, documentId, driverDocumentId } = row.original;
        const status = documentStatus || 'NOTUPLOADED';
        const isDisabled = status === 'NOTUPLOADED' || !row.original.isUploaded;

        const statusMapping: any = {
          APPROVED: 'approved',
          DENIED: 'denied',
          NOTUPLOADED: 'notUploaded',
        };

        const switchValue = statusMapping[status] || "";

        const handleStatusChange = (newStatus: any) => {
          handleStatusToggle(documentId, driverDocumentId, newStatus);
        };

        return (
          <TripleSwitch
            confirm={(newStatus, callback) => {
              handleStatusChange(newStatus);
              callback(true);
            }}
            defaultValue={switchValue}
            onChange={handleStatusChange}
            disabled={isDisabled}
          />
        );
      }
    }),
    columnHelper.accessor('expiryStatus', {
      header: dictionary['navigation'].expiryStatus,
      cell: ({ row }) => {
        const hasExpiryDate = row.original.expiryDate;
        const expiryStatus = row.original.expiryStatus;

        return hasExpiryDate ? (
          <Typography
            variant="body2"
            color={expiryStatus ? 'error.main' : 'success.main'}
          >
            {expiryStatus ? dictionary['navigation'].Expired : dictionary['navigation'].NotExpired}
          </Typography>
        ) : (
          <Typography variant='body2'>{dictionary['navigation'].NoData}</Typography>
        );
      }
    }),
    columnHelper.accessor('documentId', {
      header: dictionary['navigation'].actions,
      cell: ({ row }) => (
        <Button
          size="small"
          variant="contained"
          onClick={() => handleOpenAddDocumentDrawer(row.original)}
        >
          <i className="tabler-pencil-minus" />
        </Button>
      )
    })
  ], [dictionary]);

  const driverTable = useReactTable({
    data: driverDocuments,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 25 } }
  });

  return (
    <Box>
      {/* Driver Documents Section */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {dictionary['navigation'].DriverDocuments || 'Driver Documents'}
          </Typography>
        </Box>
        <div className='overflow-x-auto'>
          <table className={classnames(tableStyles.table, 'w-full')}>
            <thead>
              {driverTable.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {driverTable.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography variant="body2" color="textSecondary">
                      {dictionary['navigation'].NoDocumentsFound || 'No documents found'}
                    </Typography>
                  </td>
                </tr>
              ) : (
                driverTable.getRowModel().rows.map(row => (
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
      </Card>

      {/* Image Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dictionary['navigation'].DocumentImage}</DialogTitle>
        <DialogContent>
          {selectedImageUrl && (
            <img src={selectedImageUrl} alt="Document" style={{ width: '100%', height: 'auto' }} />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmationDialogOpen}
        setOpen={setConfirmationDialogOpen}
        confirmationType={confirmationType === 'approve' ? 'approved-denied' : 'denied-approved'}
        onConfirm={handleConfirmStatusChange}
        dictionary={dictionary}
      />

      {/* Edit Document Drawer */}
      <EditDriverDocument
        open={addDocumentDrawerOpen}
        handleClose={handleCloseAddDocumentDrawer}
        documentData={driverDocuments}
        setData={(newData) => {
          const filteredData = typeof newData === 'function' ? newData(driverDocuments) : newData;

          setDriverDocuments(filteredData.filter((d: any) => !d.driverVehicleId));
        }}
        documentToEdit={selectedDocument}
        driverId={driverId}
        dictionary={dictionary}
      />

    </Box>
  );
};

export default DocumentStatusTable;
