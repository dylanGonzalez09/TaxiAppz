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

// import { validateTextOnly } from '@/utils/validation';


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
  zoneId:any
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
  rowsPerPage,
  zoneId
}) => {
  const [loading, setLoading] = useState(false); // Loading state
  const [zones, setZones] = useState<any[]>([]); // State for storing zones
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;

const validateGroupDocumentName = (value: string, dictionary?: any) => {
  const trimmed = (value || '').trim();

  if (!trimmed) {
    return dictionary?.navigation?.groupDocumentRequired || "Name is required";
  }

  if (trimmed.length < 3) {
    return "Minimum 3 characters required";
  }

  if (trimmed.length > 50) {
    return "Maximum 50 characters allowed";
  }

  // Only letters and spaces for all language
  if (!/^[\p{L}\s]*$/u.test(value)) {
  return dictionary['navigation']?.onlyText || 'Only text characters are allowed';
}

  const withoutSpaces = trimmed.replace(/\s/g, '');

  // Block: sss, aaaa
  if (new Set(withoutSpaces).size === 1) {
    return "Enter a valid document name";
  }

  //  Block: abab, abcabc
  for (let len = 2; len <= Math.floor(withoutSpaces.length / 2); len++) {
    if (withoutSpaces.length % len === 0) {
      const pattern = withoutSpaces.substring(0, len);

      if (pattern.repeat(withoutSpaces.length / len) === withoutSpaces) {
        return "Enter a valid document name";
      }
    }
  }

  //Block: sassjjjjjj / helloooo
  if (/(.)\1{2,}/.test(withoutSpaces)) {
    return "Too many repeated characters";
  }

  return true;
};

  const getClientId = async () => {


    const session = await getSession();

    const clientId = session?.user?.image?.clientId; // Access clientId

    return { clientId };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const dropDownData = await fetch(ENDPOINTS.zone.dropDownList(clientId,zoneId));

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
  }, [dictionary,zoneId]);

  const { handleSubmit, control,trigger, reset, setValue, formState: { errors } } = useForm({
    mode: 'all',
    defaultValues: {
      name: '',
      zoneId: zoneId,
        type: 'driver',

    },
  });

  useEffect(() => {
    if (editData) {
      setValue('name', editData.name);
      setValue('zoneId', editData.zoneId);  // Set the zoneId from editData
      setValue('type', 'driver');


    } else {
      reset(); // Reset form values if no editData
    }
  }, [editData, setValue, reset , zoneId]);


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

      data.type = 'driver';


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
        type: response.type,
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
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : dictionary['navigation'].ErrorsavinggroupdocumentPleasetryagain

      toast.error(errorMessage);
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
             {/* <Grid item xs={12}>
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
            </Grid> */}
               <Grid item xs={12}>
<Controller
  name="name"
  control={control}
  rules={{
    required: dictionary['navigation'].groupDocumentRequired,
    validate: (value) => validateGroupDocumentName(value, dictionary)
  }}
  render={({ field }) => (
    <CustomTextField
      {...field}
      fullWidth
      label={dictionary['navigation'].groupDocument}
      placeholder={dictionary['navigation'].enterGroupDocument}
      error={!!errors.name}
      helperText={errors.name ? errors.name.message : ''}
      onChange={(e) => {
        const value = e.target.value.replace(/^\s+/, ""); // trim start only

        field.onChange(value);
      }}
    />
  )}
/>
</Grid>
               <Grid item xs={12}>
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Type is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Type}
                    {...field}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="driver">Driver</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

          </Grid>
          <div className='flex justify-end mt-4 gap-5'>
            
            <Button
              type='submit'
              variant='contained'
              color='primary'
              disabled={isSubmitDisabled} // Disable button when loading
              endIcon={loading && <CircularProgress size={20} color="inherit" />} // Show loading spinner
            >
              {editData ? (loading ? dictionary['navigation'].Updating : dictionary['navigation'].Update) : (loading ? dictionary['navigation'].Creating : dictionary['navigation'].Create)}
            </Button>
            <Button
              onClick={handleReset}
              variant="outlined"
              color='error'
              
            >
              {dictionary['navigation'].cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddGroupDocumentDrawer;
