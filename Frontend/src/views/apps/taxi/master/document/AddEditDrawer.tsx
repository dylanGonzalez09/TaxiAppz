/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
'use client';

import { useState, useEffect, ChangeEvent } from 'react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Checkbox,
  Select,
  MenuItem,
  InputBase,
  IconButton,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

import {getActiveGroupDocumentByPagination} from '@apis/groupDocument';
import { useIsDemoUser } from '@/utils/demoUser'

import { fetchDocument } from '@/app/api/apps/taxi/document';
import AsyncDropdown from '@/components/AsyncDropdown';

import {validateInputContent} from '@/utils/validation'

// Define types for the document
interface Document {
  documentName: string;
  required: boolean;
  identifier: boolean;
  expiryDate: boolean;
  issueDate: boolean;
  imageRequired: boolean;
  documentId: string;
  status?: boolean; // Optional field
  zoneId?: any
}

// Define types for the component props
interface CreateNewDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  documentToEdit?: Document; // Optional, as it might be undefined
  onSave: (documents: any) => void; // Update the type to handle an array of documents
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  dictionary: any;
  zoneId?: any; // Optional, as it might be undefined
  selectedGroupDocumentId?: string;
}


const CreateNewDocumentDialog = ({ open, onClose, documentToEdit, onSave,count,
  page,
  onPageChange,
  dictionary,
  zoneId,
  selectedGroupDocumentId,
  rowsPerPage}: CreateNewDocumentDialogProps) => {
  const [loading, setLoading] = useState(false); // Loading state

  const [documents, setDocuments] = useState<Document[]>([
    {
      documentName: '',
      required: false,
      identifier: false,
      expiryDate: false,
      issueDate: false,
      imageRequired: true,
      documentId: '',
      status: true,
    }
  ]);

  const [groupbyOptions, setGroupbyOptions] = useState<{ name: string, id: string }[]>([]);
  const [errors, setErrors] = useState<{ [key: number]: { documentName?: string, documentId?: string } }>({});
  const [existingGroupbyIds, setExistingGroupbyIds] = useState<any[]>([]); // Store existing groupby IDs
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  useEffect(() => {
    if (open) {
      if (documentToEdit) {
        setDocuments([documentToEdit]);
      } else {
        setDocuments([{
          documentName: '',
          required: false,
          identifier: false,
          expiryDate: false,
          issueDate: false,
          imageRequired: true,
          documentId: selectedGroupDocumentId || '',
          status: true
        }]);
      }
    }
  }, [open, documentToEdit, selectedGroupDocumentId]);

  useEffect(() => {
    const loadGroupOptions = async () => {
      if (!open) return;

      try {
        const response = await getActiveGroupDocumentByPagination('', 1, 100, zoneId);
        const results = Array.isArray(response?.results) ? response.results : [];

        setGroupbyOptions(
          results.map((item: any) => ({
            id: String(item?.id || item?._id || ''),
            name: String(item?.name || '')
          }))
        );
      } catch (error) {
        setGroupbyOptions([]);
      }
    };

    loadGroupOptions();
  }, [open, zoneId]);

  const addDocument = () => {
    setDocuments([...documents, {
      documentName: '',
      required: false,
      identifier: false,
      expiryDate: false,
      issueDate: false,
      imageRequired: true,
      documentId: selectedGroupDocumentId || '',
      status: true
    }]);
  };

  const deleteDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Document, value: any) => {
    const updatedDocuments = [...documents];

    updatedDocuments[index] = { ...updatedDocuments[index], [field]: value };


    // Check if the selected groupby ID already exists
    if (field === 'documentId' && existingGroupbyIds.includes(value)) {
      // Disable all fields except `documentName`
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        documentId: value,
        required: false,
        identifier: false,
        expiryDate: false,
        issueDate: false,
        imageRequired: true,
      };
    }

    setDocuments(updatedDocuments);
  };

  // const isFieldDisabled = (index: number, field: keyof Document) => {
  //   const doc = documents[index];

  //   // Disable all fields except `documentName` if `groupby` ID exists
  //   return (
  //     field !== 'documentName' &&
  //     existingGroupbyIds.some(
  //       (existing) => existing.documentId === doc.documentId
  //     )
  //   );

  // };

  const validateDocuments = () => {
    const newErrors: { [key: number]: { documentName?: string, documentId?: string } } = {};

    documents.forEach((doc, index) => {
      const fieldErrors: { documentName?: string, documentId?: string } = {};

      if (doc.documentName.trim() === '') {
        fieldErrors.documentName = dictionary['navigation'].DocumentNameisrequired;
      }

      if (doc.documentId.trim() === '') {
        fieldErrors.documentId = dictionary['navigation'].GroupByisrequired;
      }

      if (Object.keys(fieldErrors).length > 0) {
        newErrors[index] = fieldErrors;
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateDocuments()) {
      setLoading(true); // Start loading

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        onSave(documents); // Pass the entire documents array to the onSave handler
        onClose();
      } catch (error) {
        console.error('Error saving documents:', error);
      } finally {
        setLoading(false); // Reset loading state
      }
    }
  };



  const handleReset = () => {
    setDocuments([{
      documentName: '',
      required: false,
      identifier: false,
      expiryDate: false,
      issueDate: false,
      imageRequired: true,
      documentId: selectedGroupDocumentId || '',
      status: true
    }]);
    setErrors({}); // Clear errors on reset
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={handleReset} maxWidth="lg" fullWidth>
      <DialogTitle>
        <div className='flex items-center justify-between'>
          <Typography variant='h5'>{documentToEdit ? dictionary['navigation'].EditDocument : dictionary['navigation'].AddDocument}</Typography>
          <IconButton size='small' onClick={handleReset}>
            <CancelIcon fontSize='small' />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item container spacing={1} alignItems="center">
            <Grid item xs={2}><strong>{dictionary['navigation'].DocumentName}</strong></Grid>
            <Grid item xs={1}><strong>{dictionary['navigation'].Required}</strong></Grid>
            <Grid item xs={2}><strong>{dictionary['navigation'].Identifier}</strong></Grid>
            <Grid item xs={1.5}><strong>{dictionary['navigation'].ExpiredDate}</strong></Grid>
            <Grid item xs={1.5}><strong>{dictionary['navigation'].ImageRequired}</strong></Grid>
            {/* <Grid item xs={1.5}><strong>{dictionary['navigation'].ImageRequired}</strong></Grid> */}
            <Grid item xs={1.5}><strong>{dictionary['navigation'].GroupBY}</strong></Grid>
            <Grid item xs={2}>
              {!documentToEdit && (
                <IconButton
                  onClick={addDocument}
                  style={{ backgroundColor: '#4caf50', color: 'white' }}
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              )}
            </Grid>
          </Grid>
          {documents.map((doc, index) => (
            <Grid item container spacing={1} alignItems="center" key={index}>
              <Grid item xs={2}>
                <InputBase
                  value={doc.documentName}
                  onChange={(e) => handleChange(index, 'documentName', e.target.value)}
                  placeholder={dictionary['navigation'].DocumentName}
                  fullWidth
                                   
                  style={{ borderBottom: '1px solid #ccc' }}
                />
                {errors[index]?.documentName && (
                  <FormHelperText error>{errors[index].documentName}</FormHelperText>
                )}
              </Grid>
              <Grid item xs={1}>
                <Checkbox
                  checked={doc.required}
                  onChange={(e) => handleChange(index, 'required', e.target.checked)}
                />
                {dictionary['navigation'].Yes}
              </Grid>
              <Grid item xs={2}>
                <Checkbox
                  checked={doc.identifier}
                  onChange={(e) => handleChange(index, 'identifier', e.target.checked)}
                />
                {dictionary['navigation'].Yes}
              </Grid>
              <Grid item xs={1.5}>
                <Checkbox
                  checked={doc.expiryDate}
                  onChange={(e) => handleChange(index, 'expiryDate', e.target.checked)}

                  // disabled={isFieldDisabled(index, 'expiryDate')}
                />
                {dictionary['navigation'].Yes}
              </Grid>
              {/* <Grid item xs={1.5}>
                <Checkbox
                  checked={doc.issueDate}
                  onChange={(e) => handleChange(index, 'issueDate', e.target.checked)}
                />
                Yes
              </Grid> */}
              <Grid item xs={1.5}>
                <Checkbox
                  checked={true}
                  onChange={(e) => handleChange(index, 'imageRequired', e.target.checked)}
                  disabled
                />
                {dictionary['navigation'].Yes}
              </Grid>
              <Grid item xs={3}>
                {(() => {
                  const selectedOption = groupbyOptions.find(option => option.id === doc.documentId) || null;

                  return (
                <AsyncDropdown
                    label={dictionary['navigation'].GroupBy}
                    apiFunction={getActiveGroupDocumentByPagination}
                    extraParams={[zoneId]}
                    value={selectedOption}
                    getOptionLabel={(option: any) => option.name || ''}
                    onChange={(value: any) => {
                      handleChange(index, 'documentId', value?.id || '')
                    }}
                    error={!!errors[index]?.documentId}
                    helperText={errors[index]?.documentId}
                    disabled={!!documentToEdit || !!selectedGroupDocumentId}
                  />
                  );
                })()}
              </Grid>
              <Grid item xs={1}>
                {documents.length > 1 && (
                  <IconButton onClick={() => deleteDocument(index)}>
                    <CancelIcon style={{ color: '#ff1744' }} />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'right', padding: '16px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={isSubmitDisabled} // Disable button when loading
          endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
        >
          {loading ? dictionary['navigation'].Saving : dictionary['navigation'].SAVE}
        </Button>      </DialogActions>
    </Dialog>
  );
};

export default CreateNewDocumentDialog;
