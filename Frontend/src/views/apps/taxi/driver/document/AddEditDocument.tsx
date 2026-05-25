/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Dispatch, SetStateAction } from 'react';
import React, { useState, useEffect, useRef } from 'react';

import { Drawer, Divider, IconButton, Typography, Button, InputAdornment } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { UseFormSetError } from 'react-hook-form';

import CircularProgress from '@mui/material/CircularProgress';

import { parse, format } from 'date-fns'; // Import date-fns for date formatting
import { StatusCodes as httpStatus } from 'http-status-codes';

import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField';
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';
import type { DriverDocumentType } from '@/types/apps/driverDocument';

import { createDriverDocument, updateDriverDocument } from '@/app/api/apps/taxi/driverDocument';

import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint';

interface EditDriverDocumentProps {
  open: boolean;
  handleClose: () => void;
  documentData: DriverDocumentType[];
  setData: Dispatch<SetStateAction<DriverDocumentType[]>>;
  documentToEdit: DriverDocumentType | null;
  driverId: string | null;
  dictionary : any;
}

const EditDriverDocument: React.FC<EditDriverDocumentProps> = ({
  open,
  handleClose,
  documentToEdit,
  setData,
  driverId,
  dictionary
}) => {
  const { control, handleSubmit, reset, formState: { errors }, setValue } = useForm<DriverDocumentType>({
    defaultValues: documentToEdit || {}
  });

  const { checkDemoStatus } = useIsDemoUser();

  const [fileName, setFileName] = useState<string>(documentToEdit?.documentImage || '');
  const [documentImagePreview, setDocumentImagePreview] = useState<string | null>(documentToEdit?.documentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false); // Loading state

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [driverDataId, setdriverDataId] = useState<string | null>(driverId);

  useEffect(() => {
    reset(documentToEdit || {});
    setFileName(documentToEdit?.documentImage || '');
    setDocumentImagePreview(documentToEdit?.documentImage ? `${BASE_IMAGE_URL}${documentToEdit?.documentImage}` : null);
  }, [documentToEdit, reset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setError: UseFormSetError<any>) => {
    const file = e.target.files?.[0];

    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    
      if (!validTypes.includes(file.type)) {
        setError('documentImage', {
          type: 'manual',
          message: 'Only PNG, JPEG, and JPG formats are allowed.',
        });
        
        return;
      }
      
      setFileName(file.name);
      setDocumentImagePreview(URL.createObjectURL(file));
    }
  };

  // Fixed date conversion function
  const parseDate = (dateString: string) => {
    if (!dateString) return null;
    
    try {
      // For format MM/DD/YYYY (like "05/22/2026")
      const parts = dateString.split('/');

      if (parts.length !== 3) return null;
      
      const month = parseInt(parts[0], 10) - 1; // Months are 0-based
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      
      // Verify the date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date created:', dateString);
        
return null;
      }
      
      return date;
    } catch (error) {
      console.error('Date parsing error:', error, dateString);
      
return null;
    }
  };

  // Function to properly format date to ISO string
  const formatToISOString = (dateString: string) => {
    const parsedDate = parseDate(dateString);

    
return parsedDate ? format(parsedDate, 'yyyy-MM-dd') : '';
  };

  const handleFormSubmit = async (data: DriverDocumentType) => {
    setLoading(true); // Start loading

    const updatedDocument = {
      ...data,
      documentImage: fileInputRef.current?.files?.[0] ? URL.createObjectURL(fileInputRef.current.files[0]) : fileName,
    };

    // Properly format dates
    const issueDate = updatedDocument.issueDateValue ? formatToISOString(updatedDocument.issueDateValue) : '';
    const expiryDate = updatedDocument.expiryDateValue ? formatToISOString(updatedDocument.expiryDateValue) : '';

    const formData = new FormData();
    const driverStatus = 'WAITINGFORAPPROVAL';

    formData.append('driverId', driverDataId || '');
    formData.append('issueDate', issueDate || '');
    formData.append('expiryDate', expiryDate || '');
    formData.append('documentId', updatedDocument._id || '');
    formData.append('identifier', updatedDocument.identifierValue || '');
    formData.append('documentStatus', driverStatus);

    if (fileInputRef.current?.files?.[0]) {
      formData.append('documentImage', fileInputRef.current.files[0]);
    } else if (fileName) {
      formData.append('documentImage', fileName);
    }

    formData.append('status', 'true');

    let response;

    try {
      if (data.driverDocmentId === '') {
        response = await createDriverDocument(formData);
      } else {
        response = await updateDriverDocument(data.driverDocmentId, formData);
      }

      if (response.status === httpStatus.INTERNAL_SERVER_ERROR) {
        setError(
          'documentImage', {
          type: 'manual',
          message: response.data.message,
        });
      } 
      else {
        updatedDocument.documentImage = response.documentImage;

        setData(prevData =>
          prevData.map(item =>
            item.documentId === data.documentId ? updatedDocument : item
          )
        );
        handleClose();
      }
    } catch (error) {
      console.error('Error updating document:', error);

      // Optionally handle the error state here
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  const handleReset = () => {
    handleClose();
  };

  const isRequired = documentToEdit?.required ?? false;
  const isSubmitDisabled = checkDemoStatus() || loading;

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={handleReset}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-6'>
        <Typography variant='h5'>{dictionary['navigation'].EditDocument}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <Controller
            name='documentName'
            control={control}
            rules={{ required: isRequired ? dictionary['navigation'].documentisrequired : false }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label={dictionary['navigation'].DocumentName}
                placeholder={dictionary['navigation'].EnterDocumentName}
                error={!!errors.documentName}
                helperText={errors.documentName ? dictionary['navigation'].Thisfieldisrequired : ''}
              />
            )}
          />

          {/* Conditionally render identifier field */}
          {documentToEdit?.identifier && (
            <Controller
              name='identifierValue'
              control={control}
              rules={{ required: isRequired ? dictionary['navigation'].Identifierisrequired : false }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].Identifier}
                  placeholder={dictionary['navigation'].EnterIdentifier}
                  error={!!errors.identifierValue}
                  helperText={errors.identifierValue ? dictionary['navigation'].Thisfieldisrequired : ''}
                />
              )}
            />
          )}

          {/* Conditionally render expiryDate field with AppReactDatepicker */}
          {documentToEdit?.expiryDate && (
            <Controller
              name='expiryDateValue'
              control={control}
              rules={{ required: isRequired ? dictionary['navigation'].ExpiryDateisrequired : false }}
              render={({ field: { onChange, value } }) => {
                // Safely parse the date
                let parsedDate = null;

                try {
                  if (value) {
                    // Try to parse as MM/DD/YYYY format
                    parsedDate = parse(value, 'MM/dd/yyyy', new Date());
                    
                    // Verify the date is valid
                    if (isNaN(parsedDate.getTime())) {
                      console.warn('Failed to parse date in MM/dd/yyyy format, trying alternative format');

                      // Try alternative format DD/MM/YYYY
                      parsedDate = parse(value, 'dd/MM/yyyy', new Date());
                      
                      if (isNaN(parsedDate.getTime())) {
                        console.error('Invalid date format:', value);
                        parsedDate = null;
                      }
                    }
                  }
                } catch (error) {
                  console.error('Date parsing error:', error);
                  parsedDate = null;
                }

                return (
                  <AppReactDatepicker
                    selected={parsedDate}
                    id='expiry-date-picker'
                    onChange={(date: Date | null) => {
                      // Convert the selected date to 'MM/DD/YYYY' format (to match your data format)
                      const dateString = date ? format(date, 'MM/dd/yyyy') : '';

                      setValue('expiryDateValue', dateString);
                      onChange(dateString);
                    }}
                    placeholderText={dictionary['navigation'].SelectExpiryDate}
                    customInput={<CustomTextField 
                      label={dictionary['navigation'].ExpiryDate} 
                      fullWidth 
                      error={!!errors.expiryDateValue}
                      helperText={errors.expiryDateValue ? dictionary['navigation'].ExpiryDateisrequired : ''}
                    />}
                  />
                );
              }}
            />
          )}

          {/* Conditionally render issueDate field with AppReactDatepicker */}
          {documentToEdit?.issueDate && (
            <Controller
              name='issueDateValue'
              control={control}
              rules={{ required: isRequired ? dictionary['navigation'].IssueDateisrequired : false }}
              render={({ field: { onChange, value } }) => {
                // Safely parse the date
                let parsedDate = null;

                try {
                  if (value) {
                    // Try to parse as MM/DD/YYYY format
                    parsedDate = parse(value, 'MM/dd/yyyy', new Date());
                    
                    // Verify the date is valid
                    if (isNaN(parsedDate.getTime())) {
                      console.warn('Failed to parse date in MM/dd/yyyy format, trying alternative format');

                      // Try alternative format DD/MM/YYYY
                      parsedDate = parse(value, 'dd/MM/yyyy', new Date());
                      
                      if (isNaN(parsedDate.getTime())) {
                        console.error('Invalid date format:', value);
                        parsedDate = null;
                      }
                    }
                  }
                } catch (error) {
                  console.error('Date parsing error:', error);
                  parsedDate = null;
                }

                return (
                  <AppReactDatepicker
                    selected={parsedDate}
                    id='issue-date-picker'
                    onChange={(date: Date | null) => {
                      // Convert the selected date to 'MM/DD/YYYY' format (to match your data format)
                      const dateString = date ? format(date, 'MM/dd/yyyy') : '';

                      setValue('issueDateValue', dateString);
                      onChange(dateString);
                    }}
                    placeholderText={dictionary['navigation'].SelectIssueDate}
                    customInput={<CustomTextField 
                      label={dictionary['navigation'].IssueDate} 
                      fullWidth 
                      error={!!errors.issueDateValue}
                      helperText={errors.issueDateValue ? dictionary['navigation'].IssueDateisrequired : ''}
                    />}
                  />
                );
              }}
            />
          )}

          <div className='flex flex-col items-center'>
            {documentImagePreview && (
              <img
                src={`${documentImagePreview}`}
                alt="Image Preview"
                style={{ width: '100px', height: '100px', borderRadius: '4px', marginTop: '10px' }}
              />
            )}
            <Controller
              name='documentImage'
              control={control}
              render={({ field: { onChange } }) => (
                <CustomTextField
                  type="file"
                  fullWidth
                  label={dictionary['navigation'].DocumentImage}
                  margin="normal"
                  onChange={e => {
                    const input = e.target as HTMLInputElement;

                    onChange(input.files);

                    if (input.files && input.files[0]) {
                      handleFileUpload(e as React.ChangeEvent<HTMLInputElement>, setError as UseFormSetError<any>);
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconButton>
                          <i className='tabler-image' />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputRef={fileInputRef}
                  error={!!errors.documentImage}
                  helperText={errors.documentImage?.message}
                />
              )}
            />
          </div>

          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={isSubmitDisabled} sx={{ position: 'relative' }}>
              {loading ? dictionary['navigation'].Updating : dictionary['navigation'].update}
              {loading && (
                <CircularProgress size={24} color="inherit" sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
              )}
            </Button>
            <Button variant='tonal' color='error' onClick={handleReset}>
              {dictionary['navigation'].Cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default EditDriverDocument;

// Proper error setting function for external use
function setError(field: string, config: { type: string; message: any }) {
  console.error(`Error in field ${field}: ${config.message}`);

  // This is a placeholder - the actual setError function is passed from react-hook-form
}