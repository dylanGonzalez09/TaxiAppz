/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardHeader, Grid, Tabs, Tab } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { toast } from 'react-toastify';

import { createSetting, updateSetting } from '@/app/api/apps/taxi/setting';

import { useIsDemoUser } from '@/utils/demoUser';


const TermsTable = ({ translationData, currentTab, activeLanguage, settingsData,dictionary,langId}: { translationData: any[], currentTab: any, activeLanguage: any, settingsData: any[],dictionary:any,langId:string }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(langId);
  
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      termsCondition: '',// Initialize default value for the terms condition field
      privacyPolicy:''
    }
  });

    const { checkDemoStatus } = useIsDemoUser();

  useEffect(() => {
    if (settingsData && settingsData.length > 0) {
      const termsConditionSetting = settingsData.find(setting => setting.name === `termsCondition_${currentLanguage}`);
      const privacyPolicySetting = settingsData.find(setting => setting.name === `privacyPolicy_${currentLanguage}`);
    
      if (termsConditionSetting) {
        setValue('termsCondition', termsConditionSetting.value);
      }
      else
      {
        setValue('termsCondition', '');
      }

      if (privacyPolicySetting) {
        setValue('privacyPolicy', privacyPolicySetting.value);
      }
      else
      {
        setValue('privacyPolicy', '');
      }
    }
  }, [settingsData,currentLanguage, setValue]);

  const onSubmit = async (data: any) => {

     if (checkDemoStatus()) {
      
      toast.error(dictionary['navigation'].editError);
    
      return;
    }
    
    const termsKey = `termsCondition_${currentLanguage}`;
    const privacyKey = `privacyPolicy_${currentLanguage}`;

    const existingTerms = settingsData.find(setting => setting.name === termsKey);
    const existingPrivacy = settingsData.find(setting => setting.name === privacyKey);

    const formData = new FormData();

    formData.append('type', 'terms');
    formData.append(`termsCondition_${currentLanguage}`, data.termsCondition);
    formData.append(`privacyPolicy_${currentLanguage}`, data.privacyPolicy);

    const isUpdate = !!existingTerms || !!existingPrivacy;
    
    const termsData = isUpdate ? await updateSetting(formData) : await createSetting(formData);

    if (termsData) {
      toast.success(isUpdate ? dictionary['navigation'].SettingTermsandConditionupdatedsuccessfully : dictionary['navigation'].SettingTermsandConditionAddedsuccessfully);
    }
  };

  return (
    <Card>
      <Tabs value={currentLanguage} onChange={(_, newLanguage) => setCurrentLanguage(newLanguage)} variant="fullWidth">
          {(activeLanguage as { id: string; code: string;name: string }[]).map((lang) => (
            <Tab key={lang.id} label={lang.name} value={lang.id} />
          ))}
        </Tabs>
      <CardHeader title="Terms & Condition" />
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
           

            <Grid item xs={12}>
              <Controller
                name="termsCondition" // Use name prop correctly
                control={control}
                rules={{ required: dictionary['navigation'].Termsandconditionisrequired }}
                render={({ field }) => (
                  <>
                    <ReactQuill
                      {...field}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      theme="snow"
                      placeholder={dictionary['navigation'].Addyourtermsandconditionhere}
                    />
                    {errors.termsCondition && <p style={{ color: 'red' }}>{errors.termsCondition.message}</p>}
                  </>
                )}
              />
            </Grid>
            
            <CardHeader title="Privacy Policy" />

            <Grid item xs={12}>
              <Controller
                name="privacyPolicy" // Use name prop correctly
                control={control}
                rules={{ required: 'Privacy Policy is required' }}
                render={({ field }) => (
                  <>
                    <ReactQuill
                      {...field}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      theme="snow"
                      placeholder="Add your Privacy Policy"
                    />
                    {errors.privacyPolicy && <p style={{ color: 'red' }}>{errors.privacyPolicy.message}</p>}
                  </>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>


     
    </Card>
    
  );
};

export default TermsTable;


