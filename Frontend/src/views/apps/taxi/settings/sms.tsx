/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';

import { Button, Card, CardContent, CardHeader, Grid, FormControlLabel, Radio, RadioGroup, FormControl, Box, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';

import { createSetting, updateSetting } from '@/app/api/apps/taxi/setting';

import { useIsDemoUser } from '@/utils/demoUser';

const SmsTable = ({ translationData, currentTab, activeLanguage, settingsData, dictionary }: { translationData: any[], currentTab: any, activeLanguage: any, settingsData: any[], dictionary: any }) => {
 const [smsGateways, setSmsGateways] = useState<string>('no');
  const [smsType, setSmsType] = useState<string>('Twilio');
  const [voodooSmsApiKey, setVoodooSmsApiKey] = useState<string>('');
  const [voodooSmsSenderId, setVoodooSmsSenderId] = useState<string>('');
  const [twilioAccountSid, setTwilioAccountSid] = useState<string>('');
  const [twilioAuthToken, setTwilioAuthToken] = useState<string>('');
  const [twilioSenderId, setTwilioSenderId] = useState<string>('');

  const { checkDemoStatus } = useIsDemoUser();

  useEffect(() => {
    if (settingsData) {
      const dataMap = settingsData.reduce((acc: { [key: string]: string }, item) => {
        acc[item.name] = item.value;

        return acc;
      }, {});


      setSmsGateways(dataMap.smsGateways || 'no');
      setSmsType(dataMap.smsType);

      setVoodooSmsApiKey(dataMap.voodooSmsApiKey || '');
      setVoodooSmsSenderId(dataMap.voodooSmsSenderId || '');
      setTwilioAccountSid(dataMap.twilioAccountSid || '');
      setTwilioAuthToken(dataMap.twilioAuthToken || '');
      setTwilioSenderId(dataMap.twilioSenderId || '');
    }
  }, [settingsData]);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const handleSubmit = async () => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;
    }

    const formData = new FormData();

  
    formData.append('type', 'modules');
    formData.append('smsGateways', smsGateways);
    formData.append('smsType', smsType);

    if (smsGateways === 'yes') {
      if (smsType === 'Twilio') {
        formData.append('twilioAccountSid', twilioAccountSid);
        formData.append('twilioAuthToken', twilioAuthToken);
        formData.append('twilioSenderId', twilioSenderId);
      } else if (smsType === 'VoodooSMS') {
        formData.append('voodooSmsApiKey', voodooSmsApiKey);
        formData.append('voodooSmsSenderId', voodooSmsSenderId);
      }
    }


    const moduleData = settingsData.length > 0 ? await updateSetting(formData) : await createSetting(formData);

    if (moduleData) {
      toast.success(settingsData.length > 0 ? 'Settings updated successfully' : 'Settings added successfully');
    }
  };

  const handleSmsTypeChange = (event: any) => {
    setSmsType(event.target.value);
  };

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].ModuleSettings} />
      <CardContent>
        <Grid container spacing={3}>
          

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color={smsGateways === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setSmsGateways(smsGateways === 'yes' ? 'no' : 'yes')}
            >
              {smsGateways === 'yes' ? dictionary['navigation'].DisableSmsRegister : dictionary['navigation'].EnableSmsRegister}
            </Button>
            <RadioGroup
              value={smsGateways}
              onChange={handleChange(setSmsGateways)}
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
          </Grid>

          {smsGateways === 'yes' && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="sms-type-label">SMS Gateway</InputLabel>
                  <Select
                    labelId="sms-type-label"
                    value={smsType}
                    label="SMS Gateway"
                    onChange={handleSmsTypeChange}
                  >
                    <MenuItem value="Twilio">Twilio</MenuItem>
                    <MenuItem value="VoodooSMS">VoodooSMS</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {smsType === 'Twilio' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].twilioAccountSid}
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].twilioAuthToken}
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].twilioSenderId}
                      value={twilioSenderId}
                      onChange={(e) => setTwilioSenderId(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </>
              )}

              {smsType === 'VoodooSMS' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].voodooSmsApiKey}
                      value={voodooSmsApiKey}
                      onChange={(e) => setVoodooSmsApiKey(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].voodooSmsSenderId}
                      value={voodooSmsSenderId}
                      onChange={(e) => setVoodooSmsSenderId(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </>
              )}
            </>
          )}


          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
            >
              {dictionary['navigation'].Submit}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SmsTable;
