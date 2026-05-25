/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
import React, { useState, useEffect, ChangeEvent } from 'react';

import { toast } from 'react-toastify';
import {
  IconButton,
  Divider,
  Button,
  Drawer,
  Typography,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FormControl,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useForm, Controller } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';

import MenuItem from '@mui/material/MenuItem';

import { getSession } from 'next-auth/react';  // For client-side

import CustomTextField from '@core/components/mui/TextField';

import { createGroupDocument, updateGroupDocument } from '@apis/groupDocument';

import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

import { useIsDemoUser } from '@/utils/demoUser' 

import { validateTextOnly } from '@/utils/validation';


import type { GroupDocumentType } from '@/types/apps/masterType';


interface AddGroupDocumentDrawerProps {
  open: boolean;
  handleClose: () => void;
  groupDocumentData: GroupDocumentType[];
  dictionary: any;
  editData?: GroupDocumentType;
  setData: React.Dispatch<React.SetStateAction<GroupDocumentType[]>>;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
}

const AddGroupDocumentDrawer: React.FC<AddGroupDocumentDrawerProps> = ({
  open,
  handleClose,
  groupDocumentData,
  dictionary,
  editData,
  setData,
  count,
  page,
  onPageChange,
  rowsPerPage
}) => {
  const [loading, setLoading] = useState(false); // Loading state
  const [zones, setZones] = useState<any[]>([]); // State for storing zones
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

  const getClientId = async () => {


    const session = await getSession();

    const clientId = session?.user?.image?.clientId; // Access clientId
    const companyId = session?.user?.image?.companyId; // Access companyId

    return { clientId, companyId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const dropDownData = await fetch(ENDPOINTS.zone.dropDownList(clientId));

        const data = await dropDownData.json();

        setZones(data.data.zone);

      } catch (error) {
        toast.error(dictionary['navigation'].Failedtofetchdata);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const { handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    mode: 'all',
    defaultValues: {
      name: '',
      zoneId: '',

    },
  });

  useEffect(() => {
    if (editData) {
      setValue('name', editData.name);
      setValue('zoneId', editData.zoneId);  // Set the zoneId from editData

    } else {
      reset(); // Reset form values if no editData
    }
  }, [editData, setValue, reset]);


  // Helper function to handle page change logic
  const handlePageChangeForAddRecord = (count: number, rowsPerPage: number, onPageChange: (event: ChangeEvent<unknown>, page: number) => void) => {
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
    onPageChange(dummyEvent,  1);
  };


  const handleFormSubmit = async (data: any) => {
    setLoading(true); // Start loading

    try {
      let response;


      // Call the appropriate API function
      if (editData) {
        data.status = editData.status;
        response = await updateGroupDocument(editData.id, data);
      } else {
        data.status = "true";
        response = await createGroupDocument(data);
      }

      const newData: GroupDocumentType = {
        id: response.id,
        name: response.name,
        zoneId: response.zoneId,
        zoneName: zones.find(zone => zone.id === response.zoneId)?.zoneName || 'Unknown Zone',
        status: true
      };

      if (response) {
        // Update local data
        const updatedGroupDocumentData = editData
          ? groupDocumentData.map(item => item.id === newData.id ? newData : item)
          : [newData,...groupDocumentData];

          setData(updatedGroupDocumentData);
          handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);


        // if (rowsPerPage != groupDocumentData.length || editData) {
        //   setData(updatedGroupDocumentData);
        // } else {
        //   handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
        // }

        // Show success message
        toast.success(editData ? dictionary['navigation'].Groupdocumentupdatedsuccessfully : dictionary['navigation'].Groupdocumentcreatedsuccessfully);

        // Clear form values and close drawer
        reset();
        handleClose();
      } else {
        throw new Error('API response error');
      }
    } catch (error) {
      // Show error message if something goes wrong
      toast.error(dictionary['navigation'].ErrorsavinggroupdocumentPleasetryagain);
    } finally {
      setLoading(false); // Start loading
    }
  };

  const handleReset = () => {
    handleClose();
    reset(); // Clear form values when drawer is closed
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      onClose={handleReset}
      variant='temporary'
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5'>
        <Typography variant='h5'>{editData ? dictionary['navigation'].EditGroupDocument : dictionary['navigation'].AddGroupDocument}</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-textSecondary text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: dictionary['navigation'].groupDocumentRequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label={dictionary['navigation'].groupDocument}
                    placeholder={dictionary['navigation'].enterGroupDocument}
                    error={!!errors.name}
                    helperText={errors.name ? errors.name.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="zoneId"
                control={control}
                rules={{ required: dictionary['navigation'].ZoneTypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Zone}
                    {...field}
                    error={!!errors.zoneId}
                    helperText={errors.zoneId?.message}
                  >
                    {zones.map((zone) => (
                      <MenuItem key={zone.id} value={zone.id}>
                        {zone.zoneName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
          </Grid>
          <div className='flex justify-end mt-4'>
            <Button
              onClick={handleReset}
              variant="outlined"
              color="secondary"
              style={{ marginRight: '10px' }}
            >
              {dictionary['navigation'].cancel}
            </Button>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
            >
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddGroupDocumentDrawer;
