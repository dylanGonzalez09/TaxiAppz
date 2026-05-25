/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent} from 'react';
import React, { useEffect, useState } from 'react';

import {
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  MenuItem,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';

import { getSession } from 'next-auth/react';

import { useIsDemoUser } from '@/utils/demoUser' 


import CustomTextField from '@core/components/mui/TextField';

import { createRental, updateRental, fetchCountries, fetchZone, fetchVehicle, fetchDocumentCount } from '@apis/rental';


import DialogCloseButton from '@/components/dialogs/DialogCloseButton';


import { validateTextOnly } from '@/utils/validation';

import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';


// Define the types for the vehiclePrices array
interface VehiclePrices {
  vehicleId: string;
  price: number;
  graceTime: number;
  extraKmPrice: number;
}

interface RentalDataType {
  id: string;
  km: number;
  hour: number;
  countryId: string;
  zoneId: string;
  clientId: string;
  vehiclePrices: VehiclePrices[];
  status: boolean;
}

interface AddRentalDialogProps {
  open: boolean;
  handleClose: () => void;
  rentalData: any[];
  dictionary?: any;
  editData?: any | null;
  setData: (data: any[]) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void
  rowsPerPage: number;
  zoneId?: string;
}

const AddRentalDialog: React.FC<AddRentalDialogProps> = ({
  open,
  handleClose,
  rentalData,
  editData,
  setData, count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary,
  zoneId
}) => {
  // Add new state for zone unit
  const [zoneUnit, setZoneUnit] = useState<string>('KM');
  const [countries, setCountries] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { checkDemoStatus } = useIsDemoUser();
  const isSubmitDisabled = checkDemoStatus() || loading;
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [selectedCurrency,setCurrency] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'all',
    defaultValues: {
      hour: 0,
      km: '',
      countryId: '',
      zoneId: '',
      vehiclePrices: vehicles.map(() => ({
        price: '',
        graceTime:'',
        extraKmPrice: '',
      })),
    },
  });

  useEffect(() => {
    if (editData) {
      // If editData exists, reset the form with the existing data
      reset({
        hour: editData.hour,
        km: editData.km,
        countryId: editData.countryId,
        zoneId: editData.zoneId,
        vehiclePrices: editData.vehiclePrices.map((priceData: any) => ({
          price: priceData.price,
          graceTime: priceData.graceTime,
          extraKmPrice: priceData.extraKmPrice,
        })), 
      });
      setCurrency(editData.currency);
    } else {
      reset({
        hour: 0,
        km: '',
        countryId: '',
        zoneId: '',
        vehiclePrices: vehicles.map(() => ({
          price: '',
          graceTime: '',
          extraKmPrice: '',
        })),
      });
      setCurrency(null);
    }
  }, [editData, vehicles, reset]);
  
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

        const dropDownData = await fetch(ENDPOINTS.rental.dropDownList(clientId));
        const data = await dropDownData.json();

        setVehicles(data.data.vehicle);

        if (zoneId) {
          const filteredZone = data.data.zone.filter((zone:any) => zone._id === zoneId);

          if (filteredZone.length > 0) {
            setZones(filteredZone);
            setValue('zoneId', filteredZone[0]._id);
            setZoneUnit(filteredZone[0].unit || 'KM');
            
            const matchingCountry = data.data.country.find((country:any) => 
              country.id === filteredZone[0].country
            );

            if (matchingCountry) {
              setCountries([matchingCountry]);
              setValue('countryId', matchingCountry.id);
              setCurrency(matchingCountry.currency_symbol);
            }
          }
        } else {
          setZones(data.data.zone);
          setCountries(data.data.country);
          
          // Set default country and currency for new records
          if (data.data.country.length > 0) {
            const defaultCountry = data.data.country[0];

            setCountries([defaultCountry]);
            setValue('countryId', defaultCountry.id, { shouldValidate: true }); // Add shouldValidate
            setCurrency(defaultCountry.currency_symbol);
          }
        }
      } catch (error) {
        toast.error(dictionary['navigation'].Failedtofetchdata);
      }
    };

    // Fetch data when dialog opens
    if (open) {
      fetchData();
    }
  }, [zoneId, setValue, open]);

  // Reset form with default values when dialog opens
  useEffect(() => {
    if (open && !editData && countries.length > 0) {
      reset({
        hour: 0,
        km: '',
        countryId: countries[0]?.id || '',
        zoneId: '',
        vehiclePrices: vehicles.map(() => ({
          price: '',
          graceTime: '',
          extraKmPrice: '',
        })),
      });
    }
  }, [open, editData, countries, vehicles, reset]);

  const hourValue = watch("hour", documentCount);
 
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetchDocumentCount();

    
        if (response?.count !== undefined) {  // ✅ Extract count properly
          // setDocumentCount(response.count + 1);
          // setValue("hour", response.count + 1);
        }
      } catch (error) {
        console.error("Error fetching document count:", error);
      }
    };
    
    fetchCount();
  }, [setValue]);

  const handleDrawerClose = () => {
    // Clear form data
    reset({
      hour: 0,
      km: '',
      countryId: '',
      zoneId: '',
      vehiclePrices: vehicles.map(() => ({
        price: '',
        graceTime: '',
        extraKmPrice: '',
      })),
    });

    // Reset states
    if (!zoneId) {
      setZones([]);
      setCountries([]);
    }

    setCurrency(null);
    
    // Close dialog
    handleClose();
  };

  const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id === countryId);

    if (selectedCountry) {
      setCurrency(selectedCountry.currency_symbol);
    }
  };
  
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
  setLoading(true);

  try {
    const vehiclePrices = Array.isArray(data.vehiclePrices)
      ? data.vehiclePrices.map((priceData: any, index: number) => ({
          vehicleId: vehicles[index]?.id,
          price: parseFloat(priceData.price) || 0,
          graceTime: parseFloat(priceData.graceTime) || 0,
          extraKmPrice: parseFloat(priceData.extraKmPrice) || 0,
        }))
      : [];

    const newItem = {
      hour: data.hour,
      km: data.km,
      countryId: data.countryId,
      zoneId: data.zoneId,
      vehiclePrices,
    };


    const response = editData
      ? await updateRental(editData._id, newItem)
      : await createRental(newItem);



      
      // if (!response.success) {
      //   toast.error(response.message)
      //   return
      // }

    if (response) {
      const updatedRentalData = editData
        ? rentalData.map(item => (item.id === editData.id ? response : item))
        : [response, ...rentalData];

      setData(updatedRentalData);
      handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);

      toast.success(
        editData
          ? dictionary['navigation'].Rentalupdatedsuccessfully
          : dictionary['navigation'].Rentalcreatedsuccessfully
      );

      reset();
      handleDrawerClose();
    }
  } catch (error: any) {
    console.error('Error submitting rental:', error?.response?.data || error.message);

    const backendMessage: string = error?.response?.data?.message;

    if (backendMessage?.includes('already exists')) {
      const zoneObj = zones.find(z => z._id === data.zoneId);
      
      const zoneName = zoneObj?.zoneName || 'this zone';
      
      toast.error(
        `Rental already exists for zone km and  hour(s).`
      );
    } else {
      toast.error(backendMessage || 'Error saving rental. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};


  // Add this effect to set zone value when zones are loaded
  useEffect(() => {
    if (zones.length > 0 && zoneId) {
      const selectedZone = zones.find(zone => zone._id === zoneId);

      if (selectedZone) {
        setValue('zoneId', selectedZone._id);
      }
    }
  }, [zones, zoneId, setValue]);

  // Add helper function for unit-specific messages
  type ZoneUnit = 'KM' | 'MILE';

  const getUnitSpecificMessage = (type: 'label' | 'error' | 'extraPrice') => {
    const messages: Record<ZoneUnit, { label: string; error: any; extraPrice: string }> = {
      KM: {
        label: 'KM',
        error: dictionary['navigation'].kmisrequired,
        extraPrice: 'Extra KM Price'
      },
      MILE: {
        label: 'Mile',
        error: dictionary['navigation'].mileisrequired,
        extraPrice: 'Extra Mile Price'
      }
    };

    const unit = (zoneUnit as ZoneUnit) in messages ? (zoneUnit as ZoneUnit) : 'KM';

    
return messages[unit][type];
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleDrawerClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleDrawerClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle>{editData ? dictionary['navigation'].EditPricing : dictionary['navigation'].AddPricing}</DialogTitle>


      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={4}>
        
          <Grid item xs={6}>
            <Controller
              name="hour"
              control={control}
              render={({ field }) => (
              <CustomTextField
              {...field}
              fullWidth
              type="number"
              label={dictionary['navigation'].Hour}
              value={hourValue} // ✅ Dynamically updates using watch()
              InputProps={{
                inputProps: { min: 0, max: 24, step: 1 },
              }}
             disabled={!!editData}
              />
            )}
            />
          </Grid>

          <Grid item xs={6}>
            <Controller
              name="km"
              control={control}
              rules={{ required: getUnitSpecificMessage('error') }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={`${getUnitSpecificMessage('label')} *`}
                  placeholder={`Enter ${getUnitSpecificMessage('label').toLowerCase()}`}
                  error={!!errors.km}
                  helperText={errors.km?.message}
                />
              )}
            />
          </Grid>
        

              <Grid item xs={6}>
            <Controller
              name="countryId"
              control={control}
                rules={{ required: dictionary['navigation'].Countryisrequired }}
               render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].Country}
                  error={!!errors.countryId}
                   helperText={errors.countryId?.message}
                   disabled
                   value={countries.length === 1 ? countries[0].name : 
                          countries.find(country => country.id === field.value)?.name || ''}
                />
              )}
            />
          </Grid>

               <Grid item xs={6}>
            <Controller
              name="zoneId"
              control={control}
                rules={{ required: dictionary['navigation'].Zoneisrequired }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label={dictionary['navigation'].Zone}
                  error={!!errors.zoneId}
                   helperText={errors.zoneId?.message}
                   disabled
                   value={zones.find(zone => zone._id === field.value)?.zoneName || ''}
                />
              )}
            />
          </Grid>


            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{dictionary['navigation'].VehicleID}</TableCell>
                      <TableCell>{dictionary['navigation'].Price}</TableCell>
                      <TableCell>{dictionary['navigation'].GraceTimeInMins}</TableCell>
                      <TableCell>{`${getUnitSpecificMessage('extraPrice')} `}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicles.map((vehicle, index) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <CustomTextField
                            value={vehicle.vehicleName}
                            disabled
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`vehiclePrices.${index}.price`}
                            control={control}
                            rules={{ required: dictionary['navigation'].Priceisrequired }}
                            render={({ field }) => (
                              <CustomTextField
                                {...field}
                                fullWidth
                                placeholder={dictionary['navigation'].Enterprice}
                                error={!!errors.vehiclePrices?.[index]?.price}
                                helperText={errors.vehiclePrices?.[index]?.price?.message}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      {selectedCurrency || ''}
                                    </InputAdornment>
                                  )
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`vehiclePrices.${index}.graceTime`}
                            control={control}
                            rules={{ required: dictionary['navigation'].graceTimeisrequired}}
                            render={({ field }) => (
                              <CustomTextField
                                {...field}
                                fullWidth
                                placeholder={dictionary['navigation'].EntergraceTime}
                                error={!!errors.vehiclePrices?.[index]?.graceTime}
                                helperText={errors.vehiclePrices?.[index]?.graceTime?.message}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            name={`vehiclePrices.${index}.extraKmPrice`}
                            control={control}
                            rules={{ required: dictionary['navigation'].ExtraKMPriceisrequired }}
                            render={({ field }) => (
                              <CustomTextField
                                {...field}
                                fullWidth
                                placeholder={`Enter ${getUnitSpecificMessage('extraPrice')}`}
                                error={!!errors.vehiclePrices?.[index]?.extraKmPrice}
                                helperText={errors.vehiclePrices?.[index]?.extraKmPrice?.message}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      {selectedCurrency || ''}
                                    </InputAdornment>
                                  )
                                }}
                              />
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDrawerClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitDisabled}
          >
            {loading ? <CircularProgress size={24} /> : editData ? dictionary['navigation'].Update : dictionary['navigation'].Add }
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddRentalDialog;
