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

import { createDriver, fetchZone, fetchSecondaryZone, updateDriver, getVehicleByZone, getByDriverId } from '@/app/api/apps/taxi/driver';
import { fetchRoles } from '@/app/api/apps/taxi/role';
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle';
import DialogCloseButton from '@/components/dialogs/DialogCloseButton';
import { getByVehicleModelByVehicleId } from '@/app/api/apps/taxi/vehiclemodel';
import { getByBrandByVehicleId, getByBrandId } from '@/app/api/apps/taxi/brand';
import { getVehicleVariantByVehicleModel, getVehicleVariantById } from '@/app/api/apps/taxi/vehicleVariant';
import { fetchActiveCountry, getActiveCountryByPagination } from '@/app/api/apps/taxi/country';
import { getmoduleSetting } from '@/app/api/apps/taxi/setting';

import AsyncDropdown from '@/components/AsyncDropdown';

import { validateTextOnly, validateEmail, validPhoneNumber, validateTextWithNumber } from '@/utils/validation';


interface FormData {
  _id: string;
  firstName: string;

  // lastName: string;
  email: string;
  phoneNumber: string;
  type: string;
  vehicleBrand: string;
  carModel: string;
  vehicleVariant: string;

  // carNumber: string;
  serviceType: string[]; // Changed to array of strings
  serviceLocation: string;
  secondaryZone: any[] | string;
  vehicleModelId?: any;
  vehicleId?: any;
  serviceCategory: string;
  vehicleName?: string;
  vehicleModelName?: string;
  status: any;
  country: string;
  referralCode: string;
  specialPrice: boolean;
  licensePlateNumber: string;
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
  zoneId?: any
}

const defaultValues: FormData = {
  _id: '',
  firstName: '',

  // lastName: '',
  email: '',
  phoneNumber: '',
  type: '',
  vehicleBrand: '',
  carModel: '',
  vehicleVariant: '',

  // carNumber: '',
  serviceType: [], // Default to an empty array
  serviceLocation: '',
  secondaryZone: [], // Default to empty array
  serviceCategory: 'individual', // Default to individual
  vehicleName: '',
  vehicleModelName: '',
  status: '',
  country: '',
  referralCode: '',
  specialPrice: false,
  licensePlateNumber: '',
};

const AddDriverDialog = ({ zoneId, open, setOpen, data, setData, editDriver, setEditDriver, count,
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
  const [vehicleBrands, setVehicleBrands] = useState<any[]>([]);
  const [vehicleVariants, setVehicleVariants] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]); // State for companies
  const [zones, setZones] = useState<any[]>([]);
  const [countries, setCountries] = useState<{ id: string; name: string; dial_code: string; phoneLength: number }[]>([]);
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | null>(null);
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null);
  const [secondaryZone, setSecondaryZone] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const[ModuleData,setModuleData] = useState<any>()

  useEffect(()=>{
    const fechModuleSettings = async()=>{
     const res = await getmoduleSetting()

     setModuleData(res)
    }

    fechModuleSettings()
  },[])

  const ifEnableSecondaryZone = ModuleData?.secondaryZone === 'yes' ? true : false

  const normalizeId = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value._id || value.id || '';
    
return String(value);
  };

  const getOptionId = (item: any): string => {
    if (!item) return '';
    
return String(item.id || item._id || '');
  };

  const normalizeOptions = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    
return [];
  };

  const ensureOptionPresent = (options: any[], selectedId: string, fallbackData: any) => {
    if (!selectedId) return options;
    const exists = options.some((item) => getOptionId(item) === selectedId);

    if (exists) return options;
    if (!fallbackData) return options;
    
return [...options, fallbackData];
  };

  const normalizeArrayOfIds = (value: any): string[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object') return item._id || item.id || '';
          
return '';
        })
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }

    
return [];
  };

  const normalizeServiceTypes = (value: any): string[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value
        .flatMap((item) => {
          if (typeof item === 'string') return item.split(',');
          
return [];
        })
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
    }

    
return [];
  };

  useEffect(() => {
    const role = localStorage.getItem('userRole') || '';

    setUserRole(role);


  }, [setValue]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const zoneData = await fetchZone(zoneId);

        const countryData = await fetchActiveCountry();

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

  const watchedType = watch('type');
  const watchedCarModel = watch('carModel');
  const watchedVehicleBrand = watch('vehicleBrand');
  const watchedVehicleVariant = watch('vehicleVariant');

  useEffect(() => {
    const fetchVehicleDependencies = async () => {
      const selectedType = normalizeId(watchedType);
      const selectedBrand = normalizeId(watchedVehicleBrand);

      if (selectedType) {
        try {
          const [vehicleModelsData, vehicleBrandsData] = await Promise.all([
            getByVehicleModelByVehicleId(selectedType, zoneId),
            getByBrandByVehicleId(selectedType, zoneId),
          ]);

          setVehicleModels(normalizeOptions(vehicleModelsData));
          let normalizedBrands = normalizeOptions(vehicleBrandsData);

          // Keep selected brand visible in edit mode even if not returned in filtered list.
          if (selectedBrand) {
            const currentBrand = await getByBrandId(selectedBrand, zoneId);

            normalizedBrands = ensureOptionPresent(normalizedBrands, selectedBrand, currentBrand);
          }

          setVehicleBrands(normalizedBrands);
        } catch (error) {
          console.error("Error fetching vehicle dependencies:", error);
          setVehicleModels([]);
          setVehicleBrands([]);
        }
      } else {
        setVehicleModels([]);
        setVehicleBrands([]);
        setValue('carModel', '');
        setValue('vehicleBrand', '');
        setValue('vehicleVariant', '');
      }
    };

    fetchVehicleDependencies();
  }, [watchedType, watchedVehicleBrand, zoneId]);

  useEffect(() => {
    const fetchVariants = async () => {
      const selectedModel = normalizeId(watchedCarModel);
      const selectedVariant = normalizeId(watchedVehicleVariant);

      if (selectedModel) {
        try {
          const variantsData = await getVehicleVariantByVehicleModel(selectedModel, zoneId);
          let normalizedVariants = normalizeOptions(variantsData);

          // Keep selected variant visible in edit mode even if not returned in filtered list.
          if (selectedVariant) {
            const currentVariant = await getVehicleVariantById(selectedVariant, zoneId);

            normalizedVariants = ensureOptionPresent(normalizedVariants, selectedVariant, currentVariant);
          }

          setVehicleVariants(normalizedVariants);
        } catch (error) {
          console.error("Error fetching vehicle variants:", error);
          setVehicleVariants([]);
        }
      } else {
        setVehicleVariants([]);
        setValue('vehicleVariant', '');
      }
    };

    fetchVariants();
  }, [watchedCarModel, watchedVehicleVariant, zoneId]);

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

    const typeId = normalizeId(formData.type);
    const carModelId = normalizeId(formData.carModel);
    const selectedVehicle = vehicleTypes.find((v) => getOptionId(v) === typeId);
    const selectedModel = vehicleModels.find((vm) => getOptionId(vm) === carModelId);

    const dataToSubmit = new FormData();

    dataToSubmit.append('firstName', formData.firstName);

    // Only append email if it exists and is not empty
    if (formData.email && formData.email.trim() !== '') {
      dataToSubmit.append('email', formData.email);
    }

    dataToSubmit.append('phoneNumber', formData.phoneNumber);
    dataToSubmit.append('roleIds', filteredIds.join(','));
    dataToSubmit.append('type', typeId);

    // dataToSubmit.append('carNumber', formData.carNumber);
    dataToSubmit.append('serviceLocation', formData.serviceLocation);

    if (Array.isArray(formData.secondaryZone)) {
      formData.secondaryZone.forEach((zoneId) => {
        dataToSubmit.append('secondaryZone', zoneId);
      });
    } else if (typeof formData.secondaryZone === 'string') {
      dataToSubmit.append('secondaryZone', formData.secondaryZone || '');
    }

    dataToSubmit.append('serviceCategory', formData.serviceCategory);
    dataToSubmit.append('serviceType', formData.serviceType.join(',')); // Join array for submission

    dataToSubmit.append('country', formData.country);
    dataToSubmit.append('referralCode', formData.referralCode);
    dataToSubmit.append('specialPrice', formData.specialPrice.toString());
    dataToSubmit.append('licensePlateNumber', formData.licensePlateNumber);
    dataToSubmit.append('vehicleBrand', formData.vehicleBrand);
    dataToSubmit.append('vehicleVariant', formData.vehicleVariant);

    // Append additional fields if available
    if (carModelId) {
      dataToSubmit.append('carModel', carModelId);
    }

    try {

      if (editDriver) {
        await updateDriver(editDriver._id, dataToSubmit);
      } else {

        // Get current date and time
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const currentTimeString = currentDate.toTimeString().split(' ')[0]; // HH:MM:SS format

        dataToSubmit.append('regDate', currentDateString);
        dataToSubmit.append('regTime', currentTimeString);

        await createDriver(dataToSubmit, zoneId);
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


      if (!editDriver) {
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
        const loadEditData = async () => {
          try {
            const driverDetailsResponse = await getByDriverId(editDriver._id, zoneId);
            const detailData = Array.isArray(driverDetailsResponse) ? driverDetailsResponse[0] : driverDetailsResponse;
            const sourceData = { ...editDriver, ...(detailData || {}) };

            const serviceLocationId = normalizeId(sourceData.serviceLocation);

            const typeId = normalizeId(
              sourceData.vehicleId ||
              sourceData.type ||
              sourceData.vehicle?._id
            );

            const carModelId = normalizeId(
              sourceData.vehicleModelId ||
              sourceData.carModel ||
              sourceData.vehicle?.vehicleModelId
            );

            const vehicleBrandId = normalizeId(
              sourceData.vehicleBrand ||
              sourceData.vehicleBrandId ||
              sourceData.vehicle?.vehicleBrandId
            );

            const vehicleVariantId = normalizeId(
              sourceData.vehicleVariant ||
              sourceData.vehicleVariantId ||
              sourceData.vehicle?.vehicleVariantId
            );

            const countryId = normalizeId(sourceData.country);
            const secondaryZoneIds = normalizeArrayOfIds(sourceData.secondaryZone);
            const serviceTypes = normalizeServiceTypes(sourceData.serviceType);

            if (serviceLocationId) {
              await handleServiceLocationChange(serviceLocationId, true);
            }

            if (typeId) {
              const [vehicleModelsData, vehicleBrandsData] = await Promise.all([
                getByVehicleModelByVehicleId(typeId, zoneId),
                getByBrandByVehicleId(typeId, zoneId),
              ]);

              setVehicleModels(normalizeOptions(vehicleModelsData));
              let normalizedBrands = normalizeOptions(vehicleBrandsData);

              if (vehicleBrandId) {
                const currentBrand = await getByBrandId(vehicleBrandId, zoneId);

                normalizedBrands = ensureOptionPresent(normalizedBrands, vehicleBrandId, currentBrand);
              }

              setVehicleBrands(normalizedBrands);
            }

            if (carModelId) {
              const variantsData = await getVehicleVariantByVehicleModel(carModelId, zoneId);
              let normalizedVariants = normalizeOptions(variantsData);

              if (vehicleVariantId) {
                const currentVariant = await getVehicleVariantById(vehicleVariantId, zoneId);

                normalizedVariants = ensureOptionPresent(normalizedVariants, vehicleVariantId, currentVariant);
              }

              setVehicleVariants(normalizedVariants);
            }

            reset({
              ...defaultValues,
              ...sourceData,
              serviceLocation: serviceLocationId,
              type: typeId,
              carModel: carModelId,
              serviceType: serviceTypes,
              secondaryZone: secondaryZoneIds,
              serviceCategory: sourceData.serviceCategory || 'individual',
              country: countryId,
              specialPrice: Boolean(sourceData.specialPrice),
              vehicleBrand: vehicleBrandId,
              vehicleVariant: vehicleVariantId,
              licensePlateNumber: sourceData.licensePlateNumber || sourceData.carNumber || '',
              referralCode: sourceData.referralCode || '',
            });

            if (countryId) {
              handleCountryChange(countryId);
            }
          } catch (error) {
            console.error("Error loading edit data:", error);
          }
        };

        loadEditData();
      } else {
        reset(defaultValues);
      }
    }
  }, [open, editDriver, reset, userRole]);

  const handleClose = () => {
    setOpen(false);
    setSelectedDialCode(null);
    setEditDriver(null);
  };

  const isSubmitDisabled = checkDemoStatus() || loading;

  // Add handler for service location change
  const handleServiceLocationChange = async (zoneId: string, keepSecondarySelection = false) => {
    try {
      // Fetch vehicles for selected zone
      const vehicleTypesData = await getVehicleByZone(zoneId);

      setVehicleTypes(vehicleTypesData);

      const secondaryZoneData = await fetchSecondaryZone(zoneId);


      setSecondaryZone(secondaryZoneData);

      if (!keepSecondarySelection) {
        setValue('secondaryZone', []);
      }

      // Reset vehicle type and model when zone changes
      // setValue('type', '');
      // setValue('carModel', '');
    } catch (error) {
      console.error("Error fetching vehicles for zone:", error);
      setVehicleTypes([]);
      setSecondaryZone([]);
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
                    label={dictionary['navigation'].FirstName+' *'}
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
                rules={{
                  required: dictionary['navigation'].Emailisrequired,
                  validate: (value) => validateEmail(value, dictionary)
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="email"
                    label={
                      <>
                        {dictionary['navigation'].email+' *'}
                       
                      </>
                    }
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <Controller
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
              /> */}
              <Controller
                name="country"
                control={control}
                rules={{ required: dictionary['navigation'].Countryisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].Country+' *'}
                    {...field}
                    onChange={e => {
                      field.onChange(e.target.value);
                      handleCountryChange(e.target.value);
                    }}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={country.id}>
                        {`${country.name} (${country.dial_code})`}
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
                  validate: value => {
                     const digitsOnly = (value || '').replace(/\D/g, '');
                   
                     //  block repeated numbers like 9999999999
                     if (/^(\d)\1+$/.test(digitsOnly)) {
                       return 'Phone number cannot be all same digits';
                     }
                   
                     const dialCodeDigits = (selectedDialCode || '').replace(/\D/g, '');
                   
                     const phoneWithoutDialCode = digitsOnly.replace(
                       new RegExp(`^${dialCodeDigits}`),
                       ''
                     );
                   
                     if (phoneWithoutDialCode && /^0+$/.test(phoneWithoutDialCode)) {
                       return 'Enter a valid phone number';
                     }
                   
                     return validPhoneNumber(value, selectedPhoneLength, dictionary);
                   }
                }}
                
                render={({ field, fieldState }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].PhoneNumber+' *'}
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
                    label={dictionary['navigation'].ServiceLocation+' *'}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
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

            {ifEnableSecondaryZone && (
              <Grid item xs={12} sm={6}>
              <Controller
                name="secondaryZone"
                control={control}
                rules={{ required: dictionary['navigation'].SecondaryZonesRequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].SecondaryZone+' *'}
                    {...field}
                    SelectProps={{
                      multiple: true,
                      value: field.value || [],
                      onChange: (e) => field.onChange(e.target.value),
                    }}
                    error={!!errors.secondaryZone}
                    helperText={errors.secondaryZone?.message}
                    disabled={!watch('serviceLocation')}
                  >
                    {secondaryZone.map((zone) => (
                      <MenuItem key={zone._id} value={zone._id}>
                        {zone.zoneName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                rules={{ required: dictionary['navigation'].VehicleTypeisrequired }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].VehicleType+' *'}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    disabled={!watch('serviceLocation')}
                  >
                    {vehicleTypes.map((vehicle) => (
                      <MenuItem key={getOptionId(vehicle)} value={getOptionId(vehicle)}>
                        {vehicle.vehicleName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="vehicleBrand"
                control={control}
                rules={{
                  required: dictionary['navigation'].VehicleBrandRequired || 'Vehicle Brand is required',
                }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].VehicleBrand+' *' || 'Vehicle Brand'}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors.vehicleBrand}
                    helperText={errors.vehicleBrand?.message}
                    disabled={!watch('type')}
                  >
                    {vehicleBrands.length > 0 ? (
                      vehicleBrands.map((brand) => (
                        <MenuItem key={brand.id || brand._id} value={brand.id || brand._id}>
                          {brand.brandName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{dictionary['navigation'].Novehiclebrandsavailable || 'No vehicle brands available'}</MenuItem>
                    )}
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
                    label={dictionary['navigation'].VehicleModel+' *'}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors.carModel}
                    helperText={errors.carModel?.message}
                    disabled={!watch('type')}
                  >
                    {vehicleModels.length > 0 ? (
                      vehicleModels.map((vehicleModel) => (
                        <MenuItem key={getOptionId(vehicleModel)} value={getOptionId(vehicleModel)}>
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
                name="vehicleVariant"
                control={control}
                rules={{
                  required: dictionary['navigation'].VehicleVariantRequired || 'Vehicle Variant is required',
                }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary['navigation'].VehicleVariant+' *' || 'Vehicle Variant'}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={!!errors.vehicleVariant}
                    helperText={errors.vehicleVariant?.message}
                    disabled={!watch('carModel')}
                  >
                    {vehicleVariants.length > 0 ? (
                      vehicleVariants.map((variant) => (
                        <MenuItem key={variant.id || variant._id} value={variant.id || variant._id}>
                          {variant.variantName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>{dictionary['navigation'].Novehiclevariantsavailable || 'No vehicle variants available'}</MenuItem>
                    )}
                  </CustomTextField>
                )}
              />
            </Grid>
            {/*
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
            </Grid> */}
            {/* Replace the 4 duplicate carNumber fields with these: */}

            <Grid item xs={12} sm={6}>
              <Controller
                name="licensePlateNumber"
                control={control}
                rules={{
                  required: dictionary['navigation'].LicensePlateNumberRequired,
                  validate: value => validateTextWithNumber(value, dictionary)
                }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].LicensePlateNumber+' *'}
                    {...field}
                    error={!!errors.licensePlateNumber}
                    helperText={errors.licensePlateNumber?.message}
                  />
                )}
              />
            </Grid>


            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{dictionary['navigation'].serviceType+' *'}</FormLabel>
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
          <DialogActions className='flex gap-5'>
            <Button onClick={handleClose} variant='outlined' color='error'>
              {dictionary['navigation'].Cancel}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitDisabled}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {editDriver
                ? dictionary['navigation'].Update
                : dictionary['navigation'].submit}
            </Button>
          </DialogActions>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverDialog;










