/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  Box,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { toast } from 'react-toastify';

import { createSetting, updateSetting } from '@/app/api/apps/taxi/setting';
import { useIsDemoUser } from '@/utils/demoUser';

// List of supported currencies for Stripe
const stripeCurrencies = [
  { code: 'usd', name: 'US Dollar (USD)' },
  { code: 'aed', name: 'United Arab Emirates Dirham (AED)' },
  { code: 'afn', name: 'Afghan Afghani (AFN)' },
  { code: 'all', name: 'Albanian Lek (ALL)' },
  { code: 'amd', name: 'Armenian Dram (AMD)' },
  { code: 'ang', name: 'Netherlands Antillean Gulden (ANG)' },
  { code: 'aoa', name: 'Angolan Kwanza (AOA)' },
  { code: 'ars', name: 'Argentine Peso (ARS)' },
  { code: 'aud', name: 'Australian Dollar (AUD)' },
  { code: 'awg', name: 'Aruban Florin (AWG)' },
  { code: 'azn', name: 'Azerbaijani Manat (AZN)' },
  { code: 'bam', name: 'Bosnia-Herzegovina Convertible Mark (BAM)' },
  { code: 'bbd', name: 'Barbadian Dollar (BBD)' },
  { code: 'bdt', name: 'Bangladeshi Taka (BDT)' },
  { code: 'bgn', name: 'Bulgarian Lev (BGN)' },
  { code: 'bif', name: 'Burundian Franc (BIF)' },
  { code: 'bmd', name: 'Bermudian Dollar (BMD)' },
  { code: 'bnd', name: 'Brunei Dollar (BND)' },
  { code: 'bob', name: 'Bolivian Boliviano (BOB)' },
  { code: 'brl', name: 'Brazilian Real (BRL)' },
  { code: 'bsd', name: 'Bahamian Dollar (BSD)' },
  { code: 'bwp', name: 'Botswanan Pula (BWP)' },
  { code: 'bzd', name: 'Belize Dollar (BZD)' },
  { code: 'cad', name: 'Canadian Dollar (CAD)' },
  { code: 'cdf', name: 'Congolese Franc (CDF)' },
  { code: 'chf', name: 'Swiss Franc (CHF)' },
  { code: 'clp', name: 'Chilean Peso (CLP)' },
  { code: 'cny', name: 'Chinese Yuan (CNY)' },
  { code: 'cop', name: 'Colombian Peso (COP)' },
  { code: 'crc', name: 'Costa Rican Colón (CRC)' },
  { code: 'cve', name: 'Cape Verdean Escudo (CVE)' },
  { code: 'czk', name: 'Czech Koruna (CZK)' },
  { code: 'djf', name: 'Djiboutian Franc (DJF)' },
  { code: 'dkk', name: 'Danish Krone (DKK)' },
  { code: 'dop', name: 'Dominican Peso (DOP)' },
  { code: 'dzd', name: 'Algerian Dinar (DZD)' },
  { code: 'egp', name: 'Egyptian Pound (EGP)' },
  { code: 'etb', name: 'Ethiopian Birr (ETB)' },
  { code: 'eur', name: 'Euro (EUR)' },
  { code: 'fjd', name: 'Fijian Dollar (FJD)' },
  { code: 'fkp', name: 'Falkland Islands Pound (FKP)' },
  { code: 'gbp', name: 'British Pound (GBP)' },
  { code: 'gel', name: 'Georgian Lari (GEL)' },
  { code: 'gip', name: 'Gibraltar Pound (GIP)' },
  { code: 'gmd', name: 'Gambian Dalasi (GMD)' },
  { code: 'gnf', name: 'Guinean Franc (GNF)' },
  { code: 'gtq', name: 'Guatemalan Quetzal (GTQ)' },
  { code: 'gyd', name: 'Guyanaese Dollar (GYD)' },
  { code: 'hkd', name: 'Hong Kong Dollar (HKD)' },
  { code: 'hnl', name: 'Honduran Lempira (HNL)' },
  { code: 'hrk', name: 'Croatian Kuna (HRK)' },
  { code: 'htg', name: 'Haitian Gourde (HTG)' },
  { code: 'huf', name: 'Hungarian Forint (HUF)' },
  { code: 'idr', name: 'Indonesian Rupiah (IDR)' },
  { code: 'ils', name: 'Israeli New Shekel (ILS)' },
  { code: 'inr', name: 'Indian Rupee (INR)' },
  { code: 'isk', name: 'Icelandic Króna (ISK)' },
  { code: 'jmd', name: 'Jamaican Dollar (JMD)' },
  { code: 'jpy', name: 'Japanese Yen (JPY)' },
  { code: 'kes', name: 'Kenyan Shilling (KES)' },
  { code: 'kgs', name: 'Kyrgystani Som (KGS)' },
  { code: 'khr', name: 'Cambodian Riel (KHR)' },
  { code: 'kmf', name: 'Comorian Franc (KMF)' },
  { code: 'krw', name: 'South Korean Won (KRW)' },
  { code: 'kyd', name: 'Cayman Islands Dollar (KYD)' },
  { code: 'kzt', name: 'Kazakhstani Tenge (KZT)' },
  { code: 'lak', name: 'Laotian Kip (LAK)' },
  { code: 'lbp', name: 'Lebanese Pound (LBP)' },
  { code: 'lkr', name: 'Sri Lankan Rupee (LKR)' },
  { code: 'lrd', name: 'Liberian Dollar (LRD)' },
  { code: 'lsl', name: 'Lesotho Loti (LSL)' },
  { code: 'mad', name: 'Moroccan Dirham (MAD)' },
  { code: 'mdl', name: 'Moldovan Leu (MDL)' },
  { code: 'mga', name: 'Malagasy Ariary (MGA)' },
  { code: 'mkd', name: 'Macedonian Denar (MKD)' },
  { code: 'mmk', name: 'Myanmar Kyat (MMK)' },
  { code: 'mnt', name: 'Mongolian Tugrik (MNT)' },
  { code: 'mop', name: 'Macanese Pataca (MOP)' },
  { code: 'mur', name: 'Mauritian Rupee (MUR)' },
  { code: 'mvr', name: 'Maldivian Rufiyaa (MVR)' },
  { code: 'mwk', name: 'Malawian Kwacha (MWK)' },
  { code: 'mxn', name: 'Mexican Peso (MXN)' },
  { code: 'myr', name: 'Malaysian Ringgit (MYR)' },
  { code: 'mzn', name: 'Mozambican Metical (MZN)' },
  { code: 'nad', name: 'Namibian Dollar (NAD)' },
  { code: 'ngn', name: 'Nigerian Naira (NGN)' },
  { code: 'nio', name: 'Nicaraguan Córdoba (NIO)' },
  { code: 'nok', name: 'Norwegian Krone (NOK)' },
  { code: 'npr', name: 'Nepalese Rupee (NPR)' },
  { code: 'nzd', name: 'New Zealand Dollar (NZD)' },
  { code: 'pab', name: 'Panamanian Balboa (PAB)' },
  { code: 'pen', name: 'Peruvian Sol (PEN)' },
  { code: 'pgk', name: 'Papua New Guinean Kina (PGK)' },
  { code: 'php', name: 'Philippine Peso (PHP)' },
  { code: 'pkr', name: 'Pakistani Rupee (PKR)' },
  { code: 'pln', name: 'Polish Złoty (PLN)' },
  { code: 'pyg', name: 'Paraguayan Guarani (PYG)' },
  { code: 'qar', name: 'Qatari Riyal (QAR)' },
  { code: 'ron', name: 'Romanian Leu (RON)' },
  { code: 'rsd', name: 'Serbian Dinar (RSD)' },
  { code: 'rub', name: 'Russian Ruble (RUB)' },
  { code: 'rwf', name: 'Rwandan Franc (RWF)' },
  { code: 'sar', name: 'Saudi Riyal (SAR)' },
  { code: 'sbd', name: 'Solomon Islands Dollar (SBD)' },
  { code: 'scr', name: 'Seychellois Rupee (SCR)' },
  { code: 'sek', name: 'Swedish Krona (SEK)' },
  { code: 'sgd', name: 'Singapore Dollar (SGD)' },
  { code: 'shp', name: 'Saint Helena Pound (SHP)' },
  { code: 'sle', name: 'Sierra Leonean Leone (SLE)' },
  { code: 'sll', name: 'Sierra Leonean Leone (SLL)' },
  { code: 'sos', name: 'Somali Shilling (SOS)' },
  { code: 'srd', name: 'Surinamese Dollar (SRD)' },
  { code: 'std', name: 'São Tomé and Príncipe Dobra (STD)' },
  { code: 'stn', name: 'São Tomé and Príncipe Dobra (STN)' },
  { code: 'szl', name: 'Swazi Lilangeni (SZL)' },
  { code: 'thb', name: 'Thai Baht (THB)' },
  { code: 'tjs', name: 'Tajikistani Somoni (TJS)' },
  { code: 'top', name: 'Tongan Paʻanga (TOP)' },
  { code: 'try', name: 'Turkish Lira (TRY)' },
  { code: 'ttd', name: 'Trinidad and Tobago Dollar (TTD)' },
  { code: 'twd', name: 'New Taiwan Dollar (TWD)' },
  { code: 'tzs', name: 'Tanzanian Shilling (TZS)' },
  { code: 'uah', name: 'Ukrainian Hryvnia (UAH)' },
  { code: 'ugx', name: 'Ugandan Shilling (UGX)' },
  { code: 'uyu', name: 'Uruguayan Peso (UYU)' },
  { code: 'uzs', name: 'Uzbekistani Som (UZS)' },
  { code: 'ves', name: 'Venezuelan Bolívar Soberano (VES)' },
  { code: 'vnd', name: 'Vietnamese Đồng (VND)' },
  { code: 'vuv', name: 'Vanuatu Vatu (VUV)' },
  { code: 'wst', name: 'Samoan Tala (WST)' },
  { code: 'xaf', name: 'Central African CFA Franc (XAF)' },
  { code: 'xcd', name: 'East Caribbean Dollar (XCD)' },
  { code: 'xof', name: 'West African CFA Franc (XOF)' },
  { code: 'xpf', name: 'CFP Franc (XPF)' },
  { code: 'yer', name: 'Yemeni Rial (YER)' },
  { code: 'zar', name: 'South African Rand (ZAR)' },
  { code: 'zmw', name: 'Zambian Kwacha (ZMW)' },
  { code: 'zwl', name: 'Zimbabwean Dollar (ZWL)' }
];

const PaymentTable = ({
  translationData,
  currentTab,
  activeLanguage,
  settingsData,
  dictionary
}: {
  translationData: any[],
  currentTab: any,
  activeLanguage: any,
  settingsData: any[],
  dictionary: any
}) => {
  const [paymentGateways, setPaymentGateways] = useState<string>('no');
  const [paymentType, setPaymentType] = useState<string>('Stripe');

  // Stripe fields
  const [stripeEnvironment, setStripeEnvironment] = useState<string>('test');
  const [stripeTestSecretKey, setStripeTestSecretKey] = useState<string>('');
  const [stripeTestPublishableKey, setStripeTestPublishableKey] = useState<string>('');
  const [stripeLiveSecretKey, setStripeLiveSecretKey] = useState<string>('');
  const [stripeLivePublishableKey, setStripeLivePublishableKey] = useState<string>('');
  const [stripeCurrency, setStripeCurrency] = useState<string>('usd');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState<string>('');

  // PayPal fields
  const [paypalClientId, setPaypalClientId] = useState<string>('');
  const [paypalSecret, setPaypalSecret] = useState<string>('');
  const [paypalMode, setPaypalMode] = useState<string>('sandbox');

  // Razorpay fields
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState<string>('');
  const [razorpayCurrency, setRazorpayCurrency] = useState<string>('INR');

  const { checkDemoStatus } = useIsDemoUser();

  useEffect(() => {
    if (settingsData) {
      const dataMap = settingsData.reduce((acc: { [key: string]: string }, item) => {
        acc[item.name] = item.value;

        return acc;
      }, {});

      setPaymentGateways(dataMap.paymentGateways || 'no');
      setPaymentType(dataMap.paymentType || 'Stripe');

      // Stripe
      setStripeEnvironment(dataMap.stripeEnvironment || 'test');
      setStripeTestSecretKey(dataMap.stripeTestSecretKey || '');
      setStripeTestPublishableKey(dataMap.stripeTestPublishableKey || '');
      setStripeLiveSecretKey(dataMap.stripeLiveSecretKey || '');
      setStripeLivePublishableKey(dataMap.stripeLivePublishableKey || '');
      setStripeCurrency(dataMap.stripeCurrency || 'usd');
      setStripeWebhookSecret(dataMap.stripeWebhookSecret || '');

      // PayPal
      setPaypalClientId(dataMap.paypalClientId || '');
      setPaypalSecret(dataMap.paypalSecret || '');
      setPaypalMode(dataMap.paypalMode || 'sandbox');

      // Razorpay
      setRazorpayKeyId(dataMap.razorpayKeyId || '');
      setRazorpayKeySecret(dataMap.razorpayKeySecret || '');
      setRazorpayCurrency(dataMap.razorpayCurrency || 'INR');
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
    formData.append('paymentGateways', paymentGateways);
    formData.append('paymentType', paymentType);

    if (paymentGateways === 'yes') {
      if (paymentType === 'Stripe') {
        formData.append('stripeEnvironment', stripeEnvironment);
        formData.append('stripeTestSecretKey', stripeTestSecretKey);
        formData.append('stripeTestPublishableKey', stripeTestPublishableKey);
        formData.append('stripeLiveSecretKey', stripeLiveSecretKey);
        formData.append('stripeLivePublishableKey', stripeLivePublishableKey);
        formData.append('stripeCurrency', stripeCurrency);

        // formData.append('stripeWebhookSecret', stripeWebhookSecret);
      } else if (paymentType === 'PayPal') {
        formData.append('paypalClientId', paypalClientId);
        formData.append('paypalSecret', paypalSecret);
        formData.append('paypalMode', paypalMode);
      } else if (paymentType === 'Razorpay') {
        formData.append('razorpayKeyId', razorpayKeyId);
        formData.append('razorpayKeySecret', razorpayKeySecret);
        formData.append('razorpayCurrency', razorpayCurrency);
      }
    }

    const moduleData = settingsData.length > 0
      ? await updateSetting(formData)
      : await createSetting(formData);

    if (moduleData) {
      toast.success(
        settingsData.length > 0
          ? dictionary['navigation'].settingsUpdated
          : dictionary['navigation'].settingsAdded
      );
    }
  };

  const handlePaymentTypeChange = (event: any) => {
    setPaymentType(event.target.value);
  };

  return (
    <Card>
      <CardHeader title={dictionary['navigation'].paymentSettings} />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color={paymentGateways === 'yes' ? 'primary' : 'secondary'}
              onClick={() => setPaymentGateways(paymentGateways === 'yes' ? 'no' : 'yes')}
            >
              {paymentGateways === 'yes'
                ? dictionary['navigation'].disablePayment
                : dictionary['navigation'].enablePayment}
            </Button>
            <RadioGroup
              value={paymentGateways}
              onChange={handleChange(setPaymentGateways)}
            >
              <FormControlLabel
                value="yes"
                control={<Radio />}
                label={dictionary['navigation'].yes}
              />
              <FormControlLabel
                value="no"
                control={<Radio />}
                label={dictionary['navigation'].no}
              />
            </RadioGroup>
          </Grid>

          {paymentGateways === 'yes' && (
            <>
              {/* <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="payment-type-label">
                    {dictionary['navigation'].paymentGateway}
                  </InputLabel>
                  <Select
                    labelId="payment-type-label"
                    value={paymentType}
                    label={dictionary['navigation'].paymentGateway}
                    onChange={handlePaymentTypeChange}
                  >
                    <MenuItem value="Stripe">Stripe</MenuItem>
                    <MenuItem value="PayPal">PayPal</MenuItem>
                    <MenuItem value="Razorpay">Razorpay</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="stripe-currency-label">
                    {dictionary['navigation'].method_payment}
                  </InputLabel>
                  <Select
                    labelId="stripe-currency-label"
                    value={paymentType}
                    label={dictionary['navigation'].method_payment}
                    onChange={handlePaymentTypeChange}
                  >
                    <MenuItem value="Stripe">Stripe</MenuItem>
                    <MenuItem value="PayPal">PayPal</MenuItem>
                    <MenuItem value="Razorpay">Razorpay</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {paymentType === 'Stripe' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="stripe-environment-label">
                        {dictionary['navigation'].stripeEnvironment}
                      </InputLabel>
                      <Select
                        labelId="stripe-environment-label"
                        value={stripeEnvironment}
                        label={dictionary['navigation'].stripeEnvironment}
                        onChange={(e) => setStripeEnvironment(e.target.value)}
                      >
                        <MenuItem value="test">Test/Staging</MenuItem>
                        <MenuItem value="live">Live/Production</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>


                  {stripeEnvironment === 'test' ? (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={dictionary['navigation'].stripeTestSecretKey}
                          value={stripeTestSecretKey}
                          onChange={(e) => setStripeTestSecretKey(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={dictionary['navigation'].stripeTestPublishableKey}
                          value={stripeTestPublishableKey}
                          onChange={(e) => setStripeTestPublishableKey(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={dictionary['navigation'].stripeLiveSecretKey}
                          value={stripeLiveSecretKey}
                          onChange={(e) => setStripeLiveSecretKey(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label={dictionary['navigation'].stripeLivePublishableKey}
                          value={stripeLivePublishableKey}
                          onChange={(e) => setStripeLivePublishableKey(e.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="stripe-currency-label">
                        {dictionary['navigation'].stripeCurrency}
                      </InputLabel>
                      <Select
                        labelId="stripe-currency-label"
                        value={stripeCurrency}
                        label={dictionary['navigation'].stripeCurrency}
                        onChange={(e) => setStripeCurrency(e.target.value)}
                      >
                        {stripeCurrencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {/* <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].stripeWebhookSecret}
                      value={stripeWebhookSecret}
                      onChange={(e) => setStripeWebhookSecret(e.target.value)}
                      fullWidth
                    />
                  </Grid> */}
                </>
              )}

              {paymentType === 'PayPal' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].paypalClientId}
                      value={paypalClientId}
                      onChange={(e) => setPaypalClientId(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].paypalSecret}
                      value={paypalSecret}
                      onChange={(e) => setPaypalSecret(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="paypal-mode-label">
                        {dictionary['navigation'].paypalMode}
                      </InputLabel>
                      <Select
                        labelId="paypal-mode-label"
                        value={paypalMode}
                        label={dictionary['navigation'].paypalMode}
                        onChange={(e) => setPaypalMode(e.target.value)}
                      >
                        <MenuItem value="sandbox">Sandbox</MenuItem>
                        <MenuItem value="live">Live</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {paymentType === 'Razorpay' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].razorpayKeyId}
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].razorpayKeySecret}
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={dictionary['navigation'].razorpayCurrency}
                      value={razorpayCurrency}
                      onChange={(e) => setRazorpayCurrency(e.target.value)}
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
              {dictionary['navigation'].submit}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PaymentTable;