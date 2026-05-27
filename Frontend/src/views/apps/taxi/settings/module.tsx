/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';

import { Button, Card, CardContent, CardHeader, Grid, FormControlLabel, Radio, RadioGroup, FormControl, Box, InputLabel, Select, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';

import { createSetting, updateSetting } from '@/app/api/apps/taxi/setting';

import { useIsDemoUser } from '@/utils/demoUser';

const ModuleTable = ({ translationData, currentTab, activeLanguage, settingsData, dictionary }: { translationData: any[], currentTab: any, activeLanguage: any, settingsData: any[], dictionary: any }) => {
  const [walletsStatus, setWalletsStatus] = useState<string>('no');
  const [referralStatus, setReferralStatus] = useState<string>('no');
  const [walletBasedTripStatus, setWalletBasedTripStatus] = useState<string>('no');
  const [introScreenStatus, setIntroScreenStatus] = useState<string>('no');
  const [ratingStatus, setRatingStatus] = useState<string>('no');
  const [secondaryZone, setSecondaryZone] = useState<string>('no');
  const [smsGateways, setSmsGateways] = useState<string>('no');
  const [smsType, setSmsType] = useState<string>('Twilio');
  const [subScription, setsubScription] = useState<string>('no');
  const [referalRepeat, setReferalRepeat] = useState<string>('no');
  const [tipEnabled, setTipEnabled] = useState<string>('no');

  const { checkDemoStatus } = useIsDemoUser();

  useEffect(() => {
    if (settingsData) {
      const dataMap = settingsData.reduce((acc: { [key: string]: string }, item) => {
        acc[item.name] = item.value;

        return acc;
      }, {});


      setWalletsStatus(dataMap.walletsStatus || 'no');
      setReferralStatus(dataMap.referralStatus || 'no');
      setWalletBasedTripStatus(dataMap.walletBasedTripStatus || 'no');
      setIntroScreenStatus(dataMap.introScreenStatus || 'no');
      setRatingStatus(dataMap.ratingStatus || 'no');
      setSecondaryZone(dataMap.secondaryZone || 'no');
      setSmsGateways(dataMap.smsGateways || 'no');
      setsubScription(dataMap.subScription || 'no');
      setSmsType(dataMap.smsType);
      setReferalRepeat(dataMap.referalRepeat || 'no');
      setTipEnabled(dataMap.tipEnabled || 'no');

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

    formData.append('walletsStatus', walletsStatus);
    formData.append('referralStatus', referralStatus);
    formData.append('walletBasedTripStatus', walletBasedTripStatus);
    formData.append('introScreenStatus', introScreenStatus);
    formData.append('ratingStatus', ratingStatus);
    formData.append('secondaryZone', secondaryZone);
    formData.append('type', 'modules');
    formData.append('smsGateways', smsGateways);
    formData.append('subScription', subScription);
    formData.append('smsType', smsType);
    formData.append('referalRepeat', referalRepeat);
    formData.append('tipEnabled', tipEnabled);

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
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color={walletsStatus === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setWalletsStatus(walletsStatus === 'yes' ? 'no' : 'yes')}
            >
              {walletsStatus === 'yes' ? dictionary['navigation'].DisableWallets : dictionary['navigation'].EnableWallets}
            </Button>
            <RadioGroup
              value={walletsStatus}
              onChange={handleChange(setWalletsStatus)}
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
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color={referralStatus === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setReferralStatus(referralStatus === 'yes' ? 'no' : 'yes')}
            >
              {referralStatus === 'yes' ? dictionary['navigation'].DisableReferral : dictionary['navigation'].EnableReferral}
            </Button>
            <RadioGroup
              value={referralStatus}
              onChange={handleChange(setReferralStatus)}
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
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color={walletBasedTripStatus === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setWalletBasedTripStatus(walletBasedTripStatus === 'yes' ? 'no' : 'yes')}
            >
              {walletBasedTripStatus === 'yes' ? dictionary['navigation'].DisableWalletBasedTrip : dictionary['navigation'].EnableWalletBasedTrip}
            </Button>
            <RadioGroup
              value={walletBasedTripStatus}
              onChange={handleChange(setWalletBasedTripStatus)}
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
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color={introScreenStatus === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setIntroScreenStatus(introScreenStatus === 'yes' ? 'no' : 'yes')}
            >
              {introScreenStatus === 'yes' ? dictionary['navigation'].DisableIntroScreen : dictionary['navigation'].EnableIntroScreen}
            </Button>
            <RadioGroup
              value={introScreenStatus}
              onChange={handleChange(setIntroScreenStatus)}
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


          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color={ratingStatus === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setRatingStatus(ratingStatus === 'yes' ? 'no' : 'yes')}
            >
              {ratingStatus === 'yes' ? dictionary['navigation'].DisableRating : dictionary['navigation'].EnableRating}
            </Button>
            <RadioGroup
              value={ratingStatus}
              onChange={handleChange(setRatingStatus)}
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



          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color={secondaryZone === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setSecondaryZone(secondaryZone === 'yes' ? 'no' : 'yes')}
            >
              {secondaryZone === 'yes' ? dictionary['navigation'].DisableSecondaryZone : dictionary['navigation'].EnableSecondaryZone}
            </Button>
            <RadioGroup
              value={secondaryZone}
              onChange={handleChange(setSecondaryZone)}
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



          <Grid item xs={12} sm={6} md={4}>
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
            <Grid item xs={12} sm={6} md={4}>
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
          )}


          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              color={subScription === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setsubScription(subScription === 'yes' ? 'no' : 'yes')}
            >
              {subScription === 'yes' ? dictionary['navigation'].DisableSubScription : dictionary['navigation'].EnableSubScription}
            </Button>
            <RadioGroup
              value={subScription}
              onChange={handleChange(setsubScription)}
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

          <Grid item xs={12} sm={6} md={4}>
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
            </Grid>

          <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                color={tipEnabled === 'yes' ? 'primary' : 'secondary'}
                onClick={() => setTipEnabled(tipEnabled === 'yes' ? 'no' : 'yes')}
              >
              {tipEnabled === 'yes' ? dictionary['navigation'].DisableTip || 'Disable Tip' : dictionary['navigation'].EnableTip || 'Enable Tip'}
              </Button>
              <RadioGroup
                value={tipEnabled}
                onChange={handleChange(setTipEnabled)}
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

export default ModuleTable;
