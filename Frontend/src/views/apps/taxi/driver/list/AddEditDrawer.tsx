/* eslint-disable import/no-unresolved */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ChangeEvent } from 'react';
import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import Checkbox from '@mui/material/Checkbox';
import { toast } from 'react-toastify';

import { useIsDemoUser } from '@/utils/demoUser'

import CustomTextField from '@core/components/mui/TextField';

import { createDriver, fetchZone, updateDriver,getVehicleByZone } from '@/app/api/apps/taxi/driver';
import { fetchRoles } from '@/app/api/apps/taxi/role';
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle';
import { fetchCompany } from '@/app/api/apps/taxi/company';
import DialogCloseButton from '@/components/dialogs/DialogCloseButton';
import { getByVehicleModelByVehicleId } from '@/app/api/apps/taxi/vehiclemodel';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';

import { validateTextOnly, validateEmail, validatePhoneNumber, validPhoneNumber } from '@/utils/validation';


interface FormData {
  _id: string;
  firstName: string;

  // lastName: string;
  email: string;
  phoneNumber: string;
  type: string;
  carModel: string;
  carNumber: string;
  serviceType: string[]; // Changed to array of strings
  serviceLocation: string;
  serviceCategory: string;
  companyId?: string; // Optional field for company name
  vehicleName?: string;
  vehicleModelName?: string;
  status: any;
  country: string;
  referralCode: string;
}

interface AddDriverDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: FormData[];
  setData: (data: FormData[]) => void;
  editDriver: FormData | null;
  handleClose: () => void;
  setEditDriver: (driver: FormData | null) => void;
  count: number;
  dictionary: any;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPage: number;
}

const defaultValues: FormData = {
  _id: '',
  firstName: '',

  // lastName: '',
  email: '',
  phoneNumber: '',
  type: '',
  carModel: '',
  carNumber: '',
  serviceType: [], // Default to an empty array
  serviceLocation: '',
  serviceCategory: 'individual', // Default to individual
  companyId: '',
  vehicleName: '',
  vehicleModelName: '',
  status: '',
  country: '',
  referralCode: '',
};

const AddDriverDialog = ({ open, setOpen, data, setData, editDriver, setEditDriver, count,
  page,
  onPageChange,
  dictionary,
  rowsPerPage }: AddDriverDialogProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue, watch, reset, trigger, formState: { errors } } = useForm<FormData>({
    defaultValues,
    mode: 'all',
  });

  const { checkDemoStatus } = useIsDemoUser();

  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]); // State for companies
  const [zones, setZones] = useState<any[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string; dial_code: string; phoneLength: number }[]>([]);
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesData = await fetchCompany();
        const zoneData = await fetchZone();
        const countryData = await fetchActiveCountry();

        setCompanies(companiesData);
        setZones(zoneData);
        setCountries(countryData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (editDriver) {
      reset(editDriver);
    }
  }, [editDriver, reset]);

  useEffect(() => {
    const fetchVehicleModels = async () => {
      const selectedType = watch('type');


      if (selectedType) {
        try {
          const vehicleModelsData = await getByVehicleModelByVehicleId(selectedType);

          setVehicleModels(vehicleModelsData);
        } catch (error) {
          console.error("Error fetching vehicle models:", error);
        }
      } else {
        setVehicleModels([]);
      }
    };

    fetchVehicleModels();
  }, [watch('type')]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const currentServiceTypes = watch('serviceType') || [];

    if (checked) {
      // Add the service type if it’s checked
      setValue('serviceType', [...currentServiceTypes, name]);
    } else {
      // Remove the service type if it’s unchecked
      setValue('serviceType', currentServiceTypes.filter((type) => type !== name));
    }
  };

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
    onPageChange(dummyEvent, 1);
  };

  const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id === countryId);

    if (selectedCountry) {
      setSelectedPhoneLength(selectedCountry.phoneLength);
      setSelectedDialCode(selectedCountry.dial_code);
      trigger('phoneNumber');
      setValue('country', countryId);
    }
  };

  const onSubmit = async (formData: FormData) => {
    setLoading(true);

    const roles = await fetchRoles();
    
    const filteredIds = roles
      .filter((item: { role: string }) => item.role === "Driver")
      .map((item: { id: any }) => item.id);

    const selectedVehicle = vehicleTypes.find((v) => v.id === formData.type);
    const selectedModel = vehicleModels.find((vm) => vm.id === formData.carModel);

    const dataToSubmit = new FormData();

    dataToSubmit.append('firstName', formData.firstName);

    // Only append email if it exists and is not empty
    if (formData.email && formData.email.trim() !== '') {
      dataToSubmit.append('email', formData.email);
    }

    dataToSubmit.append('phoneNumber', formData.phoneNumber);
    dataToSubmit.append('roleIds', filteredIds.join(','));
    dataToSubmit.append('type', formData.type);
    dataToSubmit.append('carNumber', formData.carNumber);
    dataToSubmit.append('serviceLocation', formData.serviceLocation);
    dataToSubmit.append('serviceCategory', formData.serviceCategory);
    dataToSubmit.append('serviceType', formData.serviceType.join(',')); // Join array for submission
    dataToSubmit.append('country', formData.country);

    if(formData.referralCode) {  
    dataToSubmit.append('referralCode', formData.referralCode);
    }

    // Append additional fields if available
    if (formData.carModel) {
      dataToSubmit.append('carModel', formData.carModel);
    }

    if (formData.serviceCategory === 'company') {
      dataToSubmit.append('companyId', formData.companyId ?? '');
    }

    try {

      if (editDriver) {
        await updateDriver(editDriver._id, dataToSubmit);
      } else {
        await createDriver(dataToSubmit);
      }

      // formData.vehicleName = selectedVehicle.vehicleName;
      // formData.vehicleModelName = selectedModel.modelname;
      // formData.status = editDriver?.status ? true : false;

      const updatedData = editDriver
        ? data.map((driver) =>
          driver._id === editDriver._id ? { ...driver, ...formData } : driver
        )
        : [formData, ...data];

      setData(updatedData);


      if(!editDriver){
         handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
      }

      toast.success(dictionary['navigation'].DriversaveSuccessfully);
      setOpen(false);
    } catch (error) {
      console.error("Error saving driver:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (editDriver) {

        handleServiceLocationChange(editDriver.serviceLocation);



        const updatedEditDriver = {
          ...editDriver,
          serviceType: editDriver.serviceType ? editDriver.serviceType[0].split(',') : [],
          serviceCategory: editDriver.serviceCategory || 'individual',
          country: editDriver.country,

          companyName: companies.find((company) => company.id === editDriver.companyId)?.id || '',

          vehicleModel: editDriver.carModel,

        };

        reset(updatedEditDriver);
      } else {
        reset(defaultValues);
      }
    }
  }, [open, editDriver, reset]);

  const handleClose = () => {
    setOpen(false);
    setSelectedDialCode(null);
    setEditDriver(null);
  };

  const isSubmitDisabled = checkDemoStatus() || loading;

  // Add handler for service location change
  const handleServiceLocationChange = async (zoneId: string) => {
    try {
      // Fetch vehicles for selected zone
      const vehicleTypesData = await getVehicleByZone(zoneId);

      setVehicleTypes(vehicleTypesData);
      
      // Reset vehicle type and model when zone changes
      // setValue('type', '');
      // setValue('carModel', '');
    } catch (error) {
      console.error("Error fetching vehicles for zone:", error);
      setVehicleTypes([]);
    }
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle>{editDriver ? dictionary['navigation'].editDriver : dictionary['navigation'].AddDriver}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: dictionary['navigation'].FirstNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].FirstName}
                    {...field}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: dictionary['navigation'].LastNameisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].lastName}
                    {...field}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid> */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{  validate: value => validateEmail(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].email}
                    type="email"
                    {...field}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="country"
                control={control}
                rules={{ required: dictionary['navigation'].Countryisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Country}
                    {...field}
                    onChange={e => {
                      handleCountryChange(e.target.value);
                    }}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: dictionary['navigation'].PhoneNumberisrequired,

                  // validate: value => {
                  //   // Remove non-digits
                  //   const digitsOnly = value.replace(/\D/g, '');

                  //   // Remove the country code from the start
                  //   const dialCodeDigits = selectedDialCode?.replace(/\D/g, '') || '';
                  //   const phoneWithoutDialCode = digitsOnly.replace(new RegExp(`^${dialCodeDigits}`), '');

                  //   // Check if remaining number is 10 digits
                  //   return phoneWithoutDialCode.length === 10 || dictionary['navigation'].PhoneNumbermustbe10digits;
                  // }
                  validate: value => validatePhoneNumber(value, dictionary)
                }}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].PhoneNumber}
                    {...field}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    onBlur={() => trigger('phoneNumber')}
                    InputProps={{
                      startAdornment: selectedDialCode && (
                        <InputAdornment position="start">
                          {selectedDialCode}
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
 <Grid item xs={12} sm={6}>
              <Controller
                name="serviceLocation"
                control={control}
                rules={{ required: dictionary['navigation'].ServiceLocationisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].ServiceLocation}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleServiceLocationChange(e.target.value);
                    }}
                    error={!!errors.serviceLocation}
                    helperText={errors.serviceLocation?.message}
                  >
                    {zones.map((zone) => (
                      <MenuItem key={zone._id} value={zone._id}>
                        {zone.zoneName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                rules={{ required: dictionary['navigation'].VehicleTypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].VehicleType}
                    {...field}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    disabled={!watch('serviceLocation')}
                  >
                    {vehicleTypes.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicleName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
           <Grid item xs={12} sm={6}>
  <Controller
    name="carModel"
    control={control}
    rules={{ required: dictionary['navigation'].VehicleIsrequired }}
    render={({ field }) => (
      <CustomTextField
        select
        fullWidth
        label={dictionary['navigation'].VehicleModel}
        {...field}
        error={!!errors.carModel}  // changed from errors.type
        helperText={errors.carModel?.message}  // changed from errors.type
        disabled={!watch('type')}
      >
        {vehicleModels.length > 0 ? (
          vehicleModels.map((vehicleModel) => (
            <MenuItem key={vehicleModel.id} value={vehicleModel.id}>
              {vehicleModel.modelname}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>{dictionary['navigation'].Novehiclemodelsavailable}</MenuItem>
        )}
      </CustomTextField>
    )}
  />
</Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="carNumber"
                control={control}
                rules={{ required: dictionary['navigation'].CarNumberisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                   label={dictionary['navigation'].CarNumber}
                    {...field}
                    error={!!errors.carNumber}
                    helperText={errors.carNumber?.message}
                  />
                )}
              />
            </Grid>
           
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{dictionary['navigation'].serviceType}</FormLabel>
                <Controller
      name="serviceType"
      control={control}
      rules={{
        validate: (value) =>
          value && value.length > 0 || dictionary['navigation'].ServiceTypeIsRequired,
      }}
      render={({ field: { value, onChange } }) => {
        return (
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    name="RENTAL"
                    checked={value.includes('RENTAL')}
                    onChange={handleCheckboxChange}
                  />
                }
                label={dictionary['navigation'].Rental}
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Checkbox
                    name="LOCAL"
                    checked={value.includes('LOCAL')}
                    onChange={handleCheckboxChange}
                  />
                }
                label={dictionary['navigation'].Local}
              />
            </Grid>
          </Grid>
        );
      }}
    />
    {errors.serviceType && (
      <FormHelperText>{errors.serviceType.message}</FormHelperText>
    )}
  </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceCategory"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].ServiceCategory}
                    {...field}
                  >
                    <MenuItem value="individual">{dictionary['navigation'].Individual}</MenuItem>
                    <MenuItem value="company">{dictionary['navigation'].Company}</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>
            {watch('serviceCategory') === 'company' && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="companyId"
                  control={control}
                  rules={{ required: watch('serviceCategory') === 'company' && dictionary['navigation'].CompanyNameisrequired }}
                  render={({ field }) => (
                    <CustomTextField
                      select
                      fullWidth
                      label={dictionary['navigation'].CompanyName}
                      {...field}
                      error={!!errors.companyId}
                    >
                      {companies.map((company) => (
                        <MenuItem key={company._id} value={company._id}>
                          {company.companyName}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Controller
                name="referralCode"
                control={control}
                rules={{ required: dictionary['navigation'].ReferralCodeisrequired, validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].ReferralCode}
                    {...field}
                    error={!!errors.referralCode}
                    helperText={errors.referralCode?.message}
                  />
                )}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Service Type</FormLabel>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="RENTAL"
                          checked={watch('serviceType').includes('RENTAL')}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Rental"
                    />
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="LOCAL"
                          checked={watch('serviceType').includes('LOCAL')}
                          onChange={handleCheckboxChange}
                        />
                      }
                      label="Local"
                    />
                  </Grid>
                </Grid>
              </FormControl>
            </Grid> */}
          </Grid>
       <DialogActions>
  <Button onClick={handleClose} color="secondary">
    {dictionary['navigation'].Cancel}
  </Button>
  <Button
    type="submit"
    variant="contained"
    disabled={isSubmitDisabled}
    startIcon={loading ? <CircularProgress size={20} /> : null}
  >
    {editDriver
      ? dictionary['navigation'].Update // Show "Update" when editing
      : dictionary['navigation'].submit} 
  </Button>
</DialogActions>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;
