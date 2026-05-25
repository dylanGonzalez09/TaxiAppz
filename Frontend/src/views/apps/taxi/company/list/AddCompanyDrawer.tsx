/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, MenuItem, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { getSession } from 'next-auth/react';  // For client-side

import CustomTextField from '@core/components/mui/TextField';

import { createCompany, updateCompany } from '@apis/company';
import { fetchActiveLanguage } from '@apis/language';
import { fetchActiveCountry } from '@apis/country';
import { fetchRoles } from '@apis/role';

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';
import {
  validatePassword, validatePasswordsMatch,
  textAndMin, validateTextOnly, validateEmail,
  validatePhoneNumber, validatePhoneWithOutNumber,validateNumeric
} from '@/utils/validation';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';
import { useIsDemoUser } from '@/utils/demoUser' 

// Type Definitions
type AddUserInfoData = {
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: number | string;
  country?: number | string;
  serviceLocation?: number | string;
  address?: string;
  companyCode?: string;
  commission?: string;
  noOfVehicle?: string;
  active?: boolean;
  id?: string;
  userId?: string;
  status?: boolean;
  language?: any;
};

type CompanyType = {
  id?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  password?: string;
  confirmPassword?: string;
  role?: number | string;
  country?: number | string;
  serviceLocation?: number | string;
  address?: string;
  companyCode?: string;
  commission?: string;
  noOfVehicle?: string;
  userId?: string;
  active?: boolean;
  status?: boolean;
  isFleet?: boolean;
  type?: string; // Added type field
  language?: any;

};

// Updated country and zone types
type CountryType = {
  id: number;
  name: string;
  phoneLength?: number;
  dial_code?: string;
};

type ZoneType = {
  _id: string;
  zoneName: string;
};


// Props for AddCompanyDrawer
interface AddCompanyDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: CompanyType[];
  setData: (data: CompanyType[]) => void;
  handleClose: () => void;
  editCompany: CompanyType | null;
  setEditCompany: (company: CompanyType | null) => void;
  count: number;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPage: number;
  dictionary: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AddCompanyDrawer = ({ open, setOpen, data, setData, handleClose, editCompany, setEditCompany, count,
  page,
  onPageChange,
  rowsPerPage,
  dictionary }: AddCompanyDrawerProps) => {
  const { control, handleSubmit, reset, setValue, formState: { errors, touchedFields }, trigger, watch } = useForm<AddUserInfoData>({
    mode: 'all', // Validate on change and on blur
    defaultValues: {
      companyName: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      emergencyNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      country: '',
      serviceLocation: '',
      address: '',
      companyCode: '',
      commission: '',
      noOfVehicle: '',
      language: ''
    }
  });

  const { checkDemoStatus } = useIsDemoUser();

  const [roles, setRoles] = useState<{ id: number; role: string }[]>([]);
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([]);
  const [zones, setZones] = useState<ZoneType[]>([]);
  const [countries, setCountries] = useState<CountryType[]>([]);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedPhoneLength, setSelectedPhoneLength] = useState<number | undefined>();
  const [selectedDialCode, setSelectedDialCode] = useState<string | undefined>();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const DataKey = getClientId();
        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {
          throw new Error("ClientId is undefined");
        }

        const dropDownData = await fetch(ENDPOINTS.company.dropDownList(clientId));
        const data = await dropDownData.json();

        setRoles(data.data.role);
        setLanguages(data.data.language);
        setCountries(data.data.country);
        setZones(data.data.zone);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Helper function to add headers to the request
  const getClientId = async () => {
    const session = await getSession();
    const clientId = session?.user?.image?.clientId; // Access clientId
    const companyId = session?.user?.image?.companyId; // Access companyId

    return { clientId, companyId };
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

  useEffect(() => {
    if (open) {
      if (editCompany) {
        reset({
          companyName: editCompany.companyName || '',
          firstName: editCompany.firstName || '',
          lastName: editCompany.lastName || '',
          email: editCompany.email || '',
          phoneNumber: editCompany.phoneNumber || '',
          emergencyNumber: editCompany.emergencyNumber || '',
          companyCode: editCompany.companyCode || '',
          commission: editCompany.commission || '',
          noOfVehicle: editCompany.noOfVehicle || '',
          role: editCompany.role || '',
          country: editCompany.country || '',
          serviceLocation: editCompany.serviceLocation || '',
          address: editCompany.address || '',
          language: editCompany.language || '',
        });
      } else {
        reset({
          companyName: '',
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          emergencyNumber: '',
          password: '',
          confirmPassword: '',
          role: '',
          country: '',
          serviceLocation: '',
          address: '',
          companyCode: '',
          commission: '',
          noOfVehicle: '',
          language : ''
        });
      }
    }
  }, [open, editCompany, reset]);

  const handleCountryChange = (countryId: string) => {
    const selectedCountry = countries.find(c => c.id.toString() === countryId);

    if (selectedCountry) {
      setSelectedPhoneLength(selectedCountry.phoneLength);
      setSelectedDialCode(selectedCountry.dial_code);
      trigger('phoneNumber');
      setValue('country', countryId);
    }
  };

  const handleLanguageChange = (languageId: string) => {  
    const selectedLanguage = languages.find(lang => lang.id.toString() === languageId);

    if (selectedLanguage) {
      setValue('language', selectedLanguage.id);
    }
  }

  const handleServiceLocationChange = (serviceLocationId: string) => {
    setValue('serviceLocation', serviceLocationId);
  };

  const onSubmit = async (formData: AddUserInfoData) => {
    setLoading(true);

    try {
      if (editCompany) {
        const filteredIds = roles
          .filter(item => item.role === "Company")
          .map(item => item.id);

        const updateCompanyData: any = {
          companyName: formData.companyName || '',
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          email: formData.email || '',
          active: true,
          companyCode: formData.companyCode || '',
          commission: formData.commission || '',
          noOfVehicle: formData.noOfVehicle || '',
          phoneNumber: formData.phoneNumber || '',
          emergencyNumber: formData.emergencyNumber || '',
          roleIds: filteredIds,
          address: formData.address || '',
          userId: editCompany.userId || '',
          status: true,
          country: formData.country || '',
          serviceArea: formData.serviceLocation || '',
          isFleet: true,
          type: 'FLEET',
          language: formData.language || ''


        };

        if (editCompany.id?.toString()) {
          await updateCompany(editCompany.id?.toString(), updateCompanyData);
        }

        const updatedCompany: CompanyType = {
          id: editCompany.id,
          companyName: formData.companyName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || '',
          role: formData.role || '',
          active: editCompany.active,
          companyCode: formData.companyCode || '',
          commission: formData.commission || '',
          noOfVehicle: formData.noOfVehicle || '',
          phoneNumber: formData.phoneNumber || '',
          emergencyNumber: formData.emergencyNumber || '',
          address: formData.address || '',
          userId: editCompany.userId || '',
          status: true,
          country: formData.country || '',
          serviceLocation: formData.serviceLocation || '',
          isFleet: true,
          type:"FLEET",
          language: formData.language || ''

        };

        setData(data.map((company: CompanyType) => company.id === editCompany.id ? updatedCompany : company));
        toast.success('Company updated successfully');
      } else {
        const filteredIds = roles
          .filter(item => item.role === "Company")
          .map(item => item.id);

        const newData: any = {
          companyName: formData.companyName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || '',
          active: true,
          companyCode: formData.companyCode || '',
          commission: formData.commission || '',
          noOfVehicle: formData.noOfVehicle || '',
          phoneNumber: formData.phoneNumber || '',
          emergencyNumber: formData.emergencyNumber || '',
          roleIds: filteredIds,
          password: formData.password || '',
          address: formData.address || '',
          status: true,
          country: formData.country || '',
          serviceArea: formData.serviceLocation || '',
          isFleet: true,
          type:"FLEET",
          language: formData.language || ''

        };

        const createdData = await createCompany(newData);

        if (createdData.message) {
          toast.error(createdData.message);
          setLoading(false); // Reset loading state
        } else {
          const newCompany: CompanyType = {
            id: createdData.id,
            companyName: formData.companyName,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email || '',
            active: true,
            companyCode: formData.companyCode || '',
            commission: formData.commission || '',
            noOfVehicle: formData.noOfVehicle || '',
            phoneNumber: formData.phoneNumber || '',
            emergencyNumber: formData.emergencyNumber || '',
            address: formData.address || '',
            status: true,
            country: formData.country || '',
            serviceLocation: formData.serviceLocation || '',
            isFleet: true,
            type:"FLEET",
            language: formData.language || '',
          };

          setData([newCompany, ...data]);
          toast.success('New Company created successfully');
          handlePageChangeForAddRecord(count, rowsPerPage, onPageChange);
          handleCloseDrawer();
        }
      }
    } catch (error) {
      toast.error('An error occurred while processing the request');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleCloseDrawer = () => {
    setOpen(false);
    setEditCompany(null);
    reset();
    setLoading(false); // Reset loading state
  };

  const handleClickShowPassword = () => setIsPasswordShown(prev => !prev);
  const isSubmitDisabled = checkDemoStatus() || loading;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleCloseDrawer}
      maxWidth='md'
      scroll='body'
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleCloseDrawer} disableRipple>
        <i className='tabler-x' />
      </DialogCloseButton>
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {editCompany ? 'Edit Company Information' : 'Add Company Information'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <Grid container spacing={5}>
            {/* Form fields */}
            <Grid item xs={12} sm={4}>
              <Controller
                name='companyName'
                control={control}
                rules={{ required: 'Company Name is required',validate: value => textAndMin(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Company Name *'
                    placeholder='Enter company name'
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='firstName'
                control={control}
                rules={{ required: 'First Name is required',validate: value => textAndMin(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='First Name *'
                    placeholder='Enter first name'
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='lastName'
                control={control}
                rules={{ required: 'Last Name is required', validate: value => validateTextOnly(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Last Name *'
                    placeholder='Doe'
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='email'
                control={control}
                rules={{ required: 'Email is required', validate: value => validateEmail(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Email *'
                    placeholder='Enter email'
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='phoneNumber'
                control={control}
                rules={{ required: 'Phone Number is required',validate: value => validatePhoneNumber(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Phone Number *'
                    placeholder='Enter phone number'
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="country"
                control={control}
                rules={{ required: dictionary?.navigation?.Countryisrequired || 'Country is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary?.navigation?.Country || 'Country'}
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
            <Grid item xs={12} sm={4}>
              <Controller
                name="serviceLocation"
                control={control}
                rules={{ required: dictionary?.navigation?.serviceLocationisrequired || 'Service Location is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary?.navigation?.serviceLocation || 'Service Location'}
                    {...field}
                    onChange={e => {
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
            <Grid item xs={12} sm={4}>
              <Controller
                name='emergencyNumber'
                control={control}
                rules={{ validate: value => validatePhoneWithOutNumber(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Emergency Number'
                    placeholder='Enter emergency number'
                    error={!!errors.emergencyNumber}
                    helperText={errors.emergencyNumber?.message}
                  />
                )}
              />
            </Grid>
         
            {editCompany === null && (
              <>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='password'
                    control={control}
                    rules={{ required: 'Password is required', validate: value => validatePassword(value, dictionary) }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Password *'
                        placeholder='Enter password'
                        type={isPasswordShown ? 'text' : 'password'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle password visibility'
                              >
                                {isPasswordShown ? '🙈' : '👁️'}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name='confirmPassword'
                    control={control}
                    rules={{
                      required: 'Confirm Password is required',
                     validate: validatePasswordsMatch(watch('password'))
                    }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        fullWidth
                        label='Confirm Password *'
                        placeholder='Enter Confirm password'
                        type={isPasswordShown ? 'text' : 'password'}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                edge='end'
                                onClick={handleClickShowPassword}
                                onMouseDown={e => e.preventDefault()}
                                aria-label='toggle password visibility'
                              >
                                {isPasswordShown ? '🙈' : '👁️'}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={4}>
              <Controller
                name='companyCode'
                control={control}
                rules={{ required: 'Company Code is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Company Code *'
                    placeholder='Enter company code'
                    error={!!errors.companyCode}
                    helperText={errors.companyCode?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='commission'
                control={control}
               rules={{ required: 'Admin Commission is required', validate: value => validateNumeric(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Admin Commission *'
                    placeholder='Enter Admin Commission %'
                    error={!!errors.commission}
                    helperText={errors.commission?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name='noOfVehicle'
                control={control}
                 rules={{ required: 'Number of Vehicles is required', validate: value => validateNumeric(value, dictionary) }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='No. of Vehicles *'
                    placeholder='Enter number of vehicles'
                    error={!!errors.noOfVehicle}
                    helperText={errors.noOfVehicle?.message}
                  />
                )}
              />
            </Grid>
                <Grid item xs={12} sm={4}>
              <Controller
                name="language"
                control={control}
                rules={{ required: dictionary?.navigation?.Languageisrequired || 'language is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label={dictionary?.navigation?.language || 'language'}
                    {...field}
                    onChange={e => {
                      handleLanguageChange(e.target.value);
                    }}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  >
                    {languages.map((language) => (
                      <MenuItem key={language.id} value={language.id}>
                        {language.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='address'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Address'
                    placeholder='Enter address'
                    rows={4}
                    multiline
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='gap-4 px-6 pb-4'>
          <Button variant='outlined' onClick={handleCloseDrawer}>
            Cancel
          </Button>

          <Button
            variant='contained'
            type='submit'
            disabled={isSubmitDisabled}
            sx={{ position: 'relative' }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                }} />
                Submitting...
              </>
            ) : (
              editCompany ? 'Update' : 'Submit'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCompanyDrawer;