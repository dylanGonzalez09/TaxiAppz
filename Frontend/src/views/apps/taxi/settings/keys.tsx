/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardHeader, Grid } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import CustomTextField from '@/@core/components/mui/TextField';
import { createSetting, updateSetting } from '@/app/api/apps/taxi/setting';

import { useIsDemoUser } from '@/utils/demoUser';

interface KeysTableProps {
  translationData: any[];
  currentTab: any;
  activeLanguage: any;
  dictionary: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const KeysTable = ({ translationData, currentTab, activeLanguage, dictionary }: KeysTableProps) => {
  const { checkDemoStatus } = useIsDemoUser();

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      firebaseDatabaseUrl: '',
      iosDirectionalApiKey: '',
      iosGeoCoderApiKey: '',
      iosDistanceApiKey: '',
      iosPlacesApiKey: '',
      directionalApiKey: '',
      geoCoderApiKey: '',
      distanceApiKey: '',
      placesApiKey: '',
      s3BucketDefaultRegion: '',
      s3BucketSecretAccessKey: '',
      s3BucketKeyId: '',
      s3BucketName: '',
      voodooSmsApiKey: '',
      voodooSmsSenderId: '',
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioSenderId: '',
    }
  });

  useEffect(() => {
    if (translationData.length > 0) {
      translationData.forEach((item: any) => {

        const values = checkDemoStatus() ? "*************************************" : item.value;

        setValue(item.name, values);
      });
    }
  }, [translationData, setValue]);

  const onSubmit = async (data: any) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);
      
      return;
    }

    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value as string);
    
    
    }
   
    formData.append('type', 'keys');

    try {
      const keysData = translationData.length > 0 ? await updateSetting(formData)
        : await createSetting(formData);

      if (keysData) {
        toast.success(translationData.length > 0 ? dictionary['navigation'].Settingsupdatedsuccessfully : dictionary['navigation'].Settingsaddedsuccessfully);
      }
    } catch (error) {
      toast.error(dictionary['navigation'].Failedtoaddsettingkeys);
    }
  };

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].Keys} />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firebaseDatabaseUrl"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].FirebaseDatabaseURL}
                    fullWidth
                    error={!!errors.firebaseDatabaseUrl}
                    helperText={errors.firebaseDatabaseUrl ? dictionary['navigation'].FirebaseDatabaseURLisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="iosDirectionalApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].iOSDirectionalAPIKey}
                    fullWidth
                    error={!!errors.iosDirectionalApiKey}
                    helperText={errors.iosDirectionalApiKey ? dictionary['navigation'].iOSDirectionalAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="iosGeoCoderApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].iOSGeoCoderAPIKey}
                    fullWidth
                    error={!!errors.iosGeoCoderApiKey}
                    helperText={errors.iosGeoCoderApiKey ? dictionary['navigation'].iOSGeoCoderAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="iosDistanceApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].iOSDistanceAPIKey}
                    fullWidth
                    error={!!errors.iosDistanceApiKey}
                    helperText={errors.iosDistanceApiKey ? dictionary['navigation'].iOSDistanceAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="iosPlacesApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].iosPlacesApiKey}
                    fullWidth
                    error={!!errors.iosPlacesApiKey}
                    helperText={errors.iosPlacesApiKey ? dictionary['navigation'].iOSPlacesAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="directionalApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].DirectionalAPIKey}
                    fullWidth
                    error={!!errors.directionalApiKey}
                    helperText={errors.directionalApiKey ? dictionary['navigation'].DirectionalAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="geoCoderApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].GeoCoderAPIKey}
                    fullWidth
                    error={!!errors.geoCoderApiKey}
                    helperText={errors.geoCoderApiKey ? dictionary['navigation'].GeoCoderAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="distanceApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].DistanceAPIKey}
                    fullWidth
                    error={!!errors.distanceApiKey}
                    helperText={errors.distanceApiKey ? dictionary['navigation'].DistanceAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="placesApiKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].PlacesAPIKey}
                    fullWidth
                    error={!!errors.placesApiKey}
                    helperText={errors.placesApiKey ? dictionary['navigation'].PlacesAPIKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="s3BucketDefaultRegion"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].S3BucketDefaultRegion}
                    fullWidth
                    error={!!errors.s3BucketDefaultRegion}
                    helperText={errors.s3BucketDefaultRegion ? dictionary['navigation'].S3BucketDefaultRegionisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="s3BucketSecretAccessKey"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].S3BucketSecretAccessKey}
                    fullWidth
                    error={!!errors.s3BucketSecretAccessKey}
                    helperText={errors.s3BucketSecretAccessKey ? dictionary['navigation'].S3BucketSecretAccessKeyisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="s3BucketKeyId"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].S3BucketKeyID}
                    fullWidth
                    error={!!errors.s3BucketKeyId}
                    helperText={errors.s3BucketKeyId ? dictionary['navigation'].S3BucketKeyIDisrequired : ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="s3BucketName"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    label={dictionary['navigation'].S3BucketName}
                    fullWidth
                    error={!!errors.s3BucketName}
                    helperText={errors.s3BucketName ? dictionary['navigation'].S3BucketNameisrequired : ''}
                  />
                )}
              />
            </Grid>

            {/* Submit button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                {dictionary['navigation'].Submit}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default KeysTable;
