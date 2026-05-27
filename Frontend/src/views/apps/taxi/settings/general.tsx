/* eslint-disable react-hooks/exhaustive-deps */
'use client'
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardHeader, FormControlLabel, Grid, MenuItem, Radio, RadioGroup } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Chip from '@mui/material/Chip';

import CustomTextField from '@/@core/components/mui/TextField';
import { createSetting, updateSetting } from '@/app/api/apps/taxi/setting'; // Ensure you have an updateSetting function
import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint';
import CustomAutocomplete from '@core/components/mui/Autocomplete'
import { useSettings } from '@core/hooks/useSettings'
import { refreshPrimaryColorCache } from '@configs/primaryColorConfig'
import { refreshLogoCache } from '@/configs/logoManager'

import { useIsDemoUser } from '@/utils/demoUser';

interface FormValues {
  primaryColor: string;
  logo: FileList | null;
  feviIcon: FileList | null;
  notificationSound: FileList | null;
  tripSound: FileList | null;
  secondaryColor: string;
  defaultLanguage: string;
  defaultCountry: string | null;
  serviceType: any;
  tipPaymentTypes: any;
  serviceTax: string;

  adminNumber: string;
  headOfficeNumber: string;
  referalTripsCount: string;
  referalRepeat: string;
  referalTripsAmount: string;
  driverBlockWalletBalance: string;
  driverShowingKm: string;
  nearBydriver: string;
  mongoDbUrl: string;
}

interface GeneralTableProps {
  translationData: any[];
  currentTab: any;
  activeLanguage: any;
  activeCountry: any;
  apiData?: any; // Optional apiData for edit mode
  dictionary?: any;
}

const GeneralTable: React.FC<GeneralTableProps> = ({ translationData, currentTab, activeLanguage, activeCountry, apiData, dictionary }) => {

  const [logo, setLogo] = useState<File | null>(null);
  const [feviIcon, setFeviIcon] = useState<File | null>(null);
  const [notificationSound, setNotificationSound] = useState<File | null>(null);
  const [tripSound, setTripSound] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [feviIconPreview, setFeviIconPreview] = useState<string | null>(null);
  const [notificationSoundPreview, setNotificationSoundPreview] = useState<string | null>(null);
  const [tripSoundPreview, setTripSoundPreview] = useState<string | null>(null);
  const [serviceType, setServiceType] = useState<any>(['LOCAL', 'RENTAL', 'OUTSTATION']);
  const [tipPaymentTypes, setTipPaymentTypes] = useState<any>(['CARD', 'CASH', 'WALLET']);
  const [referalRepeat, setReferalRepeat] = useState<string>('no');
  const { settings, updateSettings } = useSettings();

  const { checkDemoStatus } = useIsDemoUser();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      primaryColor: settings.primaryColor || '#000000',
      secondaryColor: '#000000',
      defaultLanguage: activeLanguage[0] || '',
      defaultCountry: activeCountry[0] || '',
      serviceType: '',
      tipPaymentTypes: '',
      serviceTax: '',
      logo: null,
      feviIcon: null,
      notificationSound: null,
      tripSound: null
    }
  });

  useEffect(() => {
    if (apiData) {
      const settingsMap = new Map(apiData.map((item: any) => [item.name, item.value]));
      const primaryColor = (settingsMap.get('primaryColor') as string) || '#000000';
      const secondaryColor = (settingsMap.get('secondaryColor') as string) || '#000000';
      const serviceTypeString = (settingsMap.get('serviceType') as string) || '';
      const serviceType = serviceTypeString ? serviceTypeString.split(',') : [];
      const tipPaymentTypesString = (settingsMap.get('tipPaymentTypes') as string) || '';
      const tipPaymentTypes = tipPaymentTypesString ? tipPaymentTypesString.split(',') : [];
      const serviceTax = (settingsMap.get('serviceTax') as string) || '';

      const adminNumber = (settingsMap.get('adminNumber') as string) || '';
      const headOfficeNumber = (settingsMap.get('headOfficeNumber') as string) || '';
      const referalTripsCount = (settingsMap.get('referalTripsCount') as string) || '';
      const referalRepeat = (settingsMap.get('referalRepeat') as string) || '';
      const referalTripsAmount = (settingsMap.get('referalTripsAmount') as string) || '';
      const driverBlockWalletBalance = (settingsMap.get('driverBlockWalletBalance') as string) || '';
      const driverShowingKm = (settingsMap.get('driverShowingKm') as string) || '';
      const nearBydriver = (settingsMap.get('nearBydriver') as string) || '';
      const mongoDbUrl = (settingsMap.get('mongoDbUrl') as string) || '';

      setValue('primaryColor', primaryColor);
      setValue('secondaryColor', secondaryColor);
      setValue('defaultLanguage', settingsMap.get('defaultLanguage') || activeLanguage[0]);
      setValue('defaultCountry', settingsMap.get('defaultCountry') || activeCountry[0]);
      setValue('serviceType', serviceType);
      setValue('tipPaymentTypes', tipPaymentTypes);
      setValue('serviceTax', serviceTax);

      setValue('adminNumber', adminNumber);
      setValue('headOfficeNumber', headOfficeNumber);
      setValue('referalTripsCount', referalTripsCount);
      setValue('referalRepeat', referalRepeat);
      setValue('referalTripsAmount', referalTripsAmount);
      setValue('driverBlockWalletBalance', driverBlockWalletBalance);
      setValue('driverShowingKm', driverShowingKm);
      setValue('nearBydriver', nearBydriver);
      setValue('mongoDbUrl', mongoDbUrl);



      setReferalRepeat(referalRepeat);

      if (settingsMap.get('logo')) {
        setLogoPreview(`${BASE_IMAGE_URL}/uploads/setting/${settingsMap.get('logo') as string}`);
      }

      if (settingsMap.get('feviIcon')) {
        setFeviIconPreview(`${BASE_IMAGE_URL}/uploads/setting/${settingsMap.get('feviIcon') as string}`);
      }

      if (settingsMap.get('notificationSound')) {
        setNotificationSoundPreview(`${BASE_IMAGE_URL}/uploads/setting/${settingsMap.get('notificationSound') as string}`);
      }

      if (settingsMap.get('tripSound')) {
        setTripSoundPreview(`${BASE_IMAGE_URL}/uploads/setting/${settingsMap.get('tripSound') as string}`);
      }
    }
  }, [apiData, setValue, activeLanguage]);

  const handleLogoChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];

      setLogo(file);
      const reader = new FileReader();

      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFeviIconChange = (files: FileList | null) => {
    if (files && files[0]) {

      const file = files[0];

      setFeviIcon(file);
      const reader = new FileReader();

      reader.onloadend = () => {
        setFeviIconPreview(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleSoundChange = (files: FileList | null, setPreview: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (files && files[0]) {
      const file = files[0];
      const soundPreview = URL.createObjectURL(file);

      setPreview(soundPreview);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
    }



    const formData = new FormData();

    if (data.logo?.[0]) {
      formData.append('logo', data.logo[0]);
    }

    if (data.feviIcon?.[0]) {
      formData.append('feviIcon', data.feviIcon[0]);
    }

    if (data.notificationSound?.[0]) {
      formData.append('notificationSound', data.notificationSound[0]);
    }

    if (data.tripSound?.[0]) {
      formData.append('tripSound', data.tripSound[0]);
    }

    formData.append('type', 'general');
    formData.append('primaryColor', data.primaryColor || '');
    formData.append('secondaryColor', data.secondaryColor || '');
    formData.append('defaultLanguage', data.defaultLanguage || '');
    formData.append('defaultCountry', data.defaultCountry || '');
    formData.append('serviceType', data.serviceType || '');
    formData.append('tipPaymentTypes', data.tipPaymentTypes || '');
    formData.append('adminNumber', data.adminNumber || '');
    formData.append('headOfficeNumber', data.headOfficeNumber || '');
    formData.append('serviceTax', data.serviceTax || '');

    // formData.append('promoType', data.promoType || '');
    formData.append('referalTripsCount', data.referalTripsCount || '');
    formData.append('referalRepeat', referalRepeat || 'no');
    formData.append('referalTripsAmount', data.referalTripsAmount || '');
    formData.append('driverBlockWalletBalance', data.driverBlockWalletBalance || '');
    formData.append('driverShowingKm', data.driverShowingKm || '');
    formData.append('nearBydriver', data.nearBydriver || '');


    const settingData = translationData.length > 0
      ? await updateSetting(formData)
      : await createSetting(formData);

    if (settingData) {
      toast.success(translationData.length > 0 ? dictionary['navigation'].Settingsupdatedsuccessfully : dictionary['navigation'].Settingsaddedsuccessfully);
      updateSettings({ primaryColor: data.primaryColor })

      try {
        await refreshPrimaryColorCache();
        await refreshLogoCache()

      } catch (err) {
        console.error('Failed to refresh primary color cache:', err);
      }
    }
  };

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].GeneralSettings} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            {/* Logo upload */}
            {/* <Grid item xs={12} sm={4}>
              <Controller
                name="applicationName"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].applicationName}
                    fullWidth
                    error={!!errors.applicationName}
                    helperText={errors.applicationName ? 'Application Name is required' : ''}
                  />
                )}
              />
            </Grid> */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="logo"
                control={control}
                render={({ field: { onChange, onBlur, ref } }) => (
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {logoPreview && (
                      <div>
                        <img
                          src={logoPreview}
                          alt={dictionary['navigation'].LogoPreview}
                          style={{
                            maxWidth: '100px',
                            height: '70px',
                            border: '1px solid #ddd',
                            padding: '5px',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].Logo}
                      type="file"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ accept: 'image/*' }}
                      inputRef={ref}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;

                        onChange(target.files);
                        handleLogoChange(target.files);
                      }}
                      onBlur={onBlur}
                    />
                  </div>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="feviIcon"
                control={control}
                render={({ field: { onChange, onBlur, ref } }) => (
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {feviIconPreview && (
                      <div>
                        <img
                          src={feviIconPreview}
                          alt="feviIcon Preview"
                          style={{
                            maxWidth: '100px',
                            height: '70px',
                            border: '1px solid #ddd',
                            padding: '5px',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].favicon}
                      type="file"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ accept: 'image/*' }}
                      inputRef={ref}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;

                        onChange(target.files);
                        handleFeviIconChange(target.files);
                      }}
                      onBlur={onBlur}
                    />
                  </div>
                )}
              />
            </Grid>
            {/* Notification Sound upload */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="notificationSound"
                control={control}
                render={({ field: { onChange, onBlur, ref } }) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].NotificationSound}
                      type="file"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ accept: 'audio/*' }}
                      inputRef={ref}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;

                        onChange(target.files);
                        handleSoundChange(target.files, setNotificationSoundPreview);
                      }}
                      onBlur={onBlur}
                    />
                    {notificationSoundPreview && (
                      <audio controls src={notificationSoundPreview} style={{ marginTop: '10px' }} />
                    )}
                  </div>
                )}
              />
            </Grid>

            {/* Trip Sound upload */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="tripSound"
                control={control}
                render={({ field: { onChange, onBlur, ref } }) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {tripSoundPreview && (
                      <audio controls src={tripSoundPreview} style={{ marginTop: '10px' }} />
                    )}
                    <CustomTextField
                      fullWidth
                      label={dictionary['navigation'].TripSound}
                      type="file"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ accept: 'audio/*' }}
                      inputRef={ref}
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;

                        onChange(target.files);
                        handleSoundChange(target.files, setTripSoundPreview);
                      }}
                      onBlur={onBlur}
                    />
                  </div>
                )}
              />
            </Grid>

            {/* Primary color */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="primaryColor"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].PrimaryColor}
                    type="color"
                    {...field}
                  />
                )}
              />
            </Grid>

            {/* Secondary color */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="secondaryColor"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={dictionary['navigation'].SecondaryColor}
                    type="color"
                    {...field}
                  />
                )}
              />
            </Grid>


            {/* Default language */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="defaultLanguage"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    select
                    label={dictionary['navigation'].DefaultLanguage}
                    {...field}
                    error={!!errors.defaultLanguage}
                  >
                    {activeLanguage.map((language: any) => (
                      <MenuItem key={language.id} value={language.id}>
                        {language.code}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>


            {/* Default language */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="defaultCountry"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    select
                    label={dictionary['navigation'].DefaultCountry}
                    {...field}
                    error={!!errors.defaultCountry}
                  >
                    {activeCountry.map((country: any) => (
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
                name="serviceType"
                control={control}
                rules={{ required: dictionary['navigation'].Atleastoneservicetypeisrequired }}
                render={({ field }) => (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    options={[
                              dictionary['navigation'].RENDAL || 'RENDAL',
                              dictionary['navigation'].LOCAL || 'LOCAL',
                              dictionary['navigation'].OUTSTATION || 'OUTSTATION' ]}
                    id="autocomplete-service-types"
                    getOptionLabel={option => option}
                    value={Array.isArray(field.value) ? field.value : []}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label={dictionary['navigation'].AvailableServiceTypes}
                        placeholder={dictionary['navigation'].ServiceTypes}
                        error={!!errors.serviceType}
                        helperText={typeof errors.serviceType?.message === 'string' ? errors.serviceType.message : ''}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} key={index} size="small" />
                      ))
                    }
                    onChange={(event, value) => {
                      field.onChange(value);
                    }}
                  />
                )}
              />

              {/* <Controller
                name="serviceType"
                control={control}
                rules={{ required: 'At least one service type is required' }}
                render={({ field }) => (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    options={['LOCAL', 'RENTAL', 'OUTSTATION']}
                    id="autocomplete-service-types"
                    getOptionLabel={option => option}
                    value={Array.isArray(field.value) ? field.value : []}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label="Available Service Types"
                        placeholder="Service Types"
                        error={!!errors.serviceType}
                        helperText={typeof errors.serviceType?.message === 'string' ? errors.serviceType.message : ''}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} key={index} size="small" />
                      ))
                    }
                    onChange={(event, value) => {
                      field.onChange(value);
                    }}
                  />
                )}
              /> */}


            </Grid>
                        <Grid item xs={12} sm={6}>

              <Controller
                name={"tipPaymentTypes"}
                control={control}
                rules={{ required: dictionary['navigation'].TipPaymentTypesrRequired || 'Tip Payment Types is required' }}
                render={({ field }) => (
                  <CustomAutocomplete
                    multiple
                    limitTags={2}
                    options={[
                              dictionary['navigation'].CASH || 'CASH',
                              dictionary['navigation'].CARD || 'CARD',
                              dictionary['navigation'].WALLET || 'WALLET' ]}
                    id="autocomplete-tip-payment-types"
                    getOptionLabel={option => option}
                    value={Array.isArray(field.value) ? field.value : []}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label={dictionary['navigation'].TipPaymentTypes || 'Tip Payment Types'}
                        placeholder={dictionary['navigation'].TipPaymentTypes || 'Tip Payment Types'}
                        error={!!errors.tipPaymentTypes}
                        helperText={typeof errors.tipPaymentTypes?.message === 'string' ? errors.tipPaymentTypes.message : ''}
                      />
                    )}
                    renderTags={(tagValue, getTagProps) =>
                      tagValue.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} key={index} size="small" />
                      ))
                    }
                    onChange={(event, value) => {
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </Grid>


            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceTax"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].ServiceTaxinpercentage}
                    fullWidth
                    error={!!errors.serviceTax}
                    helperText={errors.serviceTax ? 'Service Tax is required' : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="adminNumber"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].AdminNumber}
                    fullWidth
                    error={!!errors.adminNumber}
                    helperText={errors.adminNumber ? dictionary['navigation'].AdminNumberisrequired : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="headOfficeNumber"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].HeadOfficeNumber || 'Head Office Number'}
                    fullWidth
                    error={!!errors.headOfficeNumber}
                    helperText={errors.headOfficeNumber ? (dictionary['navigation'].HeadOfficeNumberisrequired || 'Head Office Number is required') : ''}
                  />
                )}
              />
            </Grid>


            {/* Default language */}
            {/* <Grid item xs={12} sm={6}>
              <Controller
                name="promoType"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    select
                    label="Promo Type"
                    {...field}
                    error={!!errors.promoType}
                  >
                    {promoType.map((promoType: any) => (
                      <MenuItem key={promoType} value={promoType}>
                        {promoType}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid> */}


            {/* Referal Trips Count */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="referalTripsCount"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].ReferalTripsCount}
                    fullWidth
                    error={!!errors.referalTripsCount}
                    helperText={errors.referalTripsCount ? dictionary['navigation'].ReferalTripsCountisrequired : ''}

                    // disabled={referalRepeat !== 'yes'}

                  />
                )}
              />
            </Grid>



            <Grid item xs={12} sm={6}>
              <Controller
                name="referalTripsAmount"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].ReferalTripsAmount}
                    fullWidth
                    error={!!errors.referalTripsAmount}
                    helperText={errors.referalTripsAmount ? dictionary['navigation'].ReferalTripsAmountisrequired : ''}
                  />
                )}
              />
            </Grid>


            <Grid item xs={12} sm={6}>
              <Controller
                name="driverBlockWalletBalance"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].DriverBlockWalletBalance}
                    fullWidth
                    error={!!errors.driverBlockWalletBalance}
                    helperText={errors.driverBlockWalletBalance ? dictionary['navigation'].driverBlockWalletBalance : ''}
                  />
                )}
              />
            </Grid>



            {/* <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color={referalRepeat === 'yes' ? 'primary' : 'secondary'}
                onClick={() => setReferalRepeat(referalRepeat === 'yes' ? 'no' : 'yes')}
              >
                {referalRepeat === 'yes' ? dictionary['navigation'].DisableReferral : dictionary['navigation'].EnableReferral}
              </Button>
              <RadioGroup
                value={referalRepeat}
                onChange={handleChange(setReferalRepeat)}
              >
                <FormControlLabel
                  value="yes"
                  control={<Radio />}
                  label={dictionary['navigation'].Yes}
                />
                <FormControlLabel
                  value="no"
                  control={<Radio />}
                  label={dictionary['navigation'].No}
                />
              </RadioGroup>
            </Grid> */}

            <Grid item xs={12} sm={6}>
              <Controller name="driverShowingKm" control={control} render={({ field }) => (
                <CustomTextField {...field} label={dictionary['navigation'].DriverShowingKm} fullWidth
                  error={!!errors.driverShowingKm} helperText={errors.driverShowingKm ? dictionary['navigation'].DriverShowingKmisrequired : ''}
                />
              )}
              />
            </Grid>
           <Grid item xs={12} sm={6}>
              <Controller name="nearBydriver" control={control} render={({ field }) => (
                <CustomTextField {...field} label={dictionary['navigation'].NearByDriver} fullWidth
               placeholder={dictionary['navigation'].EnterValueInMeters}  // ✅ From dictionary

                  error={!!errors.nearBydriver} helperText={errors.nearBydriver ? dictionary['navigation'].NearByDriverisrequired : ''}
                />
              )}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained">
                {dictionary['navigation'].SaveChanges}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default GeneralTable;
