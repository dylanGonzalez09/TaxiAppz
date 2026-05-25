/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import {
  IconButton, Divider, Button, Drawer, Typography, Grid, MenuItem,
  FormHelperText
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser' 

import CustomTextField from '@core/components/mui/TextField';
import { updateTicketStatus, createTicket, fetchTicket } from '@apis/ticket';
import { validateTextOnly } from '@/utils/validation';

interface NotesObject {
  open?: string;
  'In-Progress'?: string;
  'Action-Taken'?: string;
  closed?: string;
  [key: string]: string | undefined;
}

interface TicketDataType {
  id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  userRoleName: string;
  assignedToId?: string;
  assignedToName?: string;
  notes: NotesObject;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'In-Progress' | 'Action-Taken' | 'closed';
}

interface AddticketDrawerProps {
  open: boolean;
  handleClose: () => void;
  ticketData: any[];
  editData?: any | null;
  setData: (data: any[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPage: number;
  dictionary: any;
}

interface FormValues {
  title: string;
  description: string;
  user: string;
  assignedToId: string;
  status: string;
  notes: NotesObject;
  createdAt: string;
  updatedAt: string;
}

const statusOrder = {
  open: 1,
  'In-Progress': 2,
  'Action-Taken': 3,
  closed: 4,
};

const AddTicketDialog: React.FC<AddticketDrawerProps> = ({
  open, handleClose, ticketData, editData, setData, count, page, onPageChange, rowsPerPage,dictionary
}) => {
  const [loading, setLoading] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [currentNoteEditable, setCurrentNoteEditable] = useState(true);
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const { handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      title: '',
      description: '',
      assignedToId: '',
      user: '',
      status: '',
      notes: {},
      createdAt: '',
      updatedAt: '',
    },
  });

  const currentStatus = watch('status');
  const notesObject = watch('notes') || {};

  useEffect(() => {
    if (editData) {
      // Set basic fields
      setValue('title', editData.title);
      setValue('description', editData.description);
      setValue('status', editData.status);
      setValue('assignedToId', editData.assignedToId || '');
      setValue('user', editData.userId);
      setValue('createdAt', editData.createdAt);
      setValue('updatedAt', editData.updatedAt);
      
      // Set notes object (ensuring it's an object)
      const notesObject = typeof editData.notes === 'object' ? editData.notes : {};

      setValue('notes', notesObject);

      // Determine available statuses based on current status
      const currentStatusOrder = statusOrder[editData.status as keyof typeof statusOrder];

      const statusOptions = Object.entries(statusOrder)
        .filter(([_, order]) => order >= currentStatusOrder)
        .map(([status]) => status);
      
      setAvailableStatuses(statusOptions);
    } else {
      reset();
      setAvailableStatuses(['open']);
      setValue('status', 'open');
      setValue('notes', {});
      setValue('createdAt', new Date().toISOString());
    }
  }, [editData, setValue, reset]);

  // Determine if current status notes is editable when status changes
  useEffect(() => {
    if (!currentStatus) return;
    
    // Check if notes for current status already exists
    const notesForStatus = notesObject[currentStatus];

    setCurrentNoteEditable(!notesForStatus);
  }, [currentStatus, notesObject]);


  

const handleFormSubmit = async (data: FormValues) => {
  setLoading(true);

  try {
    let response;
    const userId = localStorage.getItem('userId');

    if (editData) {
      // Get the current note text if it's being edited
      const currentNoteValue = currentNoteEditable 
        ? document.querySelector<HTMLTextAreaElement>('[name="currentNote"]')?.value 
        : null;
      
      // For status updates, send just the new note and status
      response = await updateTicketStatus(editData.id, { 
        status: data.status,
        note: currentNoteValue || `Status updated to ${data.status}`
      });
    } else {
      // For new tickets
      const updatedNote = { ...data.notes };
      const currentNoteValue = document.querySelector<HTMLTextAreaElement>('[name="currentNote"]')?.value;

      if (currentNoteValue) {
        updatedNote[data.status] = currentNoteValue;
      }
      
      response = await createTicket({ 
        ...data, 
        notes: updatedNote,
        userId 
      });
    }


    const updatedData = ticketData.map((item) =>
      item.id === response.data.id 
        ? {
            ...item,  
            ...response.data 
          }
        : item 
    );
    
    // Update the state with the updated data
    setData(updatedData);
    

    toast.success(editData ? dictionary['navigation'].Ticketupdatedsuccessfully : dictionary['navigation'].Ticketcreatedsuccessfully);
    reset();
    handleClose();
  } catch (error) {
    console.error('Error saving ticket:', error);
    toast.error(dictionary['navigation'].ErrorsavingTicketPleasetryagain);
  } finally {
    setLoading(false);
  }
};
  
  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={() => { handleClose(); reset(); }}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, padding: 2 } }}
    >
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h5'>{editData ? 'Edit Ticket' : 'Add Ticket'}</Typography>
        <IconButton size='small' onClick={() => { handleClose(); reset(); }}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6 p-6'>
        <Grid container spacing={2}>
          {/* <Grid item xs={12}>
            <Controller
              name='title'
              control={control}
              rules={{ required: 'Title is required.', validate: value => validateTextOnly(value, dictionary) }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Title'
                  placeholder='Enter ticket title'
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={!!editData} // Only editable for new tickets
                />
              )}
            />
          </Grid> */}

          <Grid item xs={12}>
            <Controller
              name='description'
              control={control}
              rules={{ required: dictionary['navigation'].Descriptionisrequired }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].Description}
                  placeholder={dictionary['navigation'].Enterticketdescription}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={!!editData} // Only editable for new tickets
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="status"
              control={control}
              rules={{ required: dictionary['navigation'].Statusisrequired }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label={dictionary['navigation'].Status}
                  placeholder={dictionary['navigation'].EnterTicketStatus}
                  {...field}
                  error={!!errors.status}
                  helperText={errors.status?.message}
                  disabled={!editData} // Only enabled for editing
                >
                  {availableStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Grid>

          {currentStatus && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" className="mb-2">
                {dictionary['navigation'].Notefor} {currentStatus} {dictionary['navigation'].status}:
              </Typography>
              {currentNoteEditable ? (
                <CustomTextField
                  name="currentNote"
                  fullWidth
                  label="Note"
                  placeholder="Enter notes for this status"
                  multiline
                  rows={4}
                  className="overflow-auto"
                  defaultValue=""
                  sx={{ maxHeight: 200, overflow: 'auto' }} 

                />
              ) : (
                <div
                className="p-4 border rounded bg-gray-50"
                style={{ maxHeight: '200px', overflow: 'auto' }}
              >
                <Typography variant="body2">
                  {notesObject[currentStatus]}
                </Typography>
              </div>
              
              )}
            </Grid>
          )}

          {/* Display existing notess for reference */}
          {editData && Object.keys(notesObject).length > 0 && (
            <Grid item xs={12} className="mt-4">
              <Typography variant="subtitle1" className="mb-2">
                All Status Notes:
              </Typography>
              <div
              className="border rounded p-3"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
              {Object.entries(notesObject).map(([status, notes]) => (
                <div key={status} className="mb-2">
                  <Typography variant="subtitle2" color="primary" className="font-medium">
                    {status}:
                  </Typography>
                  <Typography variant="body2" className="ml-3">
                    {notes}
                  </Typography>
                </div>
              ))}
            </div>

            </Grid>
          )}
        </Grid>

        <div className='flex justify-end mt-4'>
          <Button type='submit' variant='contained' color='primary' disabled={isSubmitDisabled}>
            {editData ? (loading ? 'Updating...' : 'Update') : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
          </Button>
          <Button onClick={() => { handleClose(); reset(); }} variant='outlined' color='secondary' style={{ marginLeft: '10px' }}>
            {dictionary['navigation'].Cancel}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default AddTicketDialog;