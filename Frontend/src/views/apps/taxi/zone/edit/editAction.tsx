/* eslint-disable react-hooks/exhaustive-deps */
// EditAction.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'react-toastify';

import { Stepper, Step, StepLabel, Button, Card, CardContent, Typography } from '@mui/material';
import { useForm, useFormState } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';

import StepperWrapper from '@core/styles/stepper';
import StepperCustomDot from '@components/stepper-dot';
import ServiceLocation from './ServiceLocation';
import RideNow from './RideNow';
import RideLater from './RideLater';
import SurgePricing from './SurgePricing';
import { getByZoneId, updateZone } from '@/app/api/apps/taxi/zone';

import { useIsDemoUser } from '@/utils/demoUser' 

interface FormValues {
  vehicleTypes: string[];
  paymentTypes: string[];
  vehicleDetails: Record<string, any>;
  unit:string;
  zoneLevel: string;
  primaryZone: string;
  country: string;
  serviceLocation: string;
  nonServiceZone: string;
  surgePricing: Record<string, any>;
  currency: string;
  biddingZone: boolean;
}

interface EditZoneFormProps {
  lang: any;
  zoneId: string; // Pass the zone ID for editing
  dictionary:any;
  subscriptionDetails?: any; // Optional prop for subscription details
}

const steps = [
  { title: 'Service Location', subtitle: 'Location' },
  { title: 'Ride Now', subtitle: 'Car' },
  { title: 'Ride Later', subtitle: 'Calendar' },
  { title: 'Surge Price', subtitle: 'Money' }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditAction: React.FC<EditZoneFormProps> = ({ lang, zoneId,dictionary,subscriptionDetails}) => {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [zoneLevel, setZoneLevel] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<string[]>([]);
  const [surgePricingData, setSurgePricingData] = useState<Record<string, any>>({});
  const [pricingData, setPricingData] = useState<Record<string, any>>({});
  const [polygonCoordinates, setPolygonCoordinates] = useState<{ lat: number; lng: number }[]>([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [unitLevel, setUnitLevel] = useState('');
  const [currency, setCurrency] = useState<string>('');
  const [primaryZoneData, setPrimaryZoneData] = useState('');
  const { checkDemoStatus } = useIsDemoUser();

  const [nonServiceZoneData, setnonServiceZoneData] = useState('');

  const [biddingZoneData, setbiddingZoneDatas] = useState('');


  const { control, handleSubmit, trigger, setValue, getValues, reset } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      vehicleTypes: [],
      paymentTypes: [],
      vehicleDetails: {},
      surgePricing: {}
    }
  });

  const { errors: formErrors } = useFormState({ control });

  // Fetch data for the edit view
  useEffect(() => {
    const fetchData = async () => {
      const zoneData = await getByZoneId(zoneId);
      
      setData(zoneData[0]);
      reset({
        vehicleTypes: zoneData[0].vehicleTypes,
        paymentTypes: zoneData[0].paymentTypes,
        vehicleDetails: zoneData[0].zonePriceDetails,
        unit:zoneData[0].unit,
        zoneLevel: zoneData[0].zoneLevel,
        primaryZone: zoneData[0].primaryZone,
        country: zoneData[0].country,
        serviceLocation: zoneData[0].zoneName,
        surgePricing: zoneData[0].zonesurgePriceData,
      });
      const primaryZone = zoneData[0].primaryZoneId || '';

      setPrimaryZoneData(primaryZone);
      setUnitLevel(zoneData[0].unit);
      setCurrency(zoneData[0].countrydetails.currency_symbol);

      setZoneLevel(zoneData[0].zoneLevel);
      setSelectedVehicles(zoneData[0].vehicleTypes);
      setVehicleTypes(zoneData[0].vehicleTypes);
      setPaymentTypes(zoneData[0].paymentTypes);
      setSurgePricingData(zoneData[0].zoneSurgePriceDetails);
      setPricingData(zoneData[0].zonePriceDetails);
      setPolygonCoordinates(zoneData[0].mapZone);
      setnonServiceZoneData(zoneData[0].nonServiceZone);
      setbiddingZoneDatas(zoneData[0].biddingZone);
    };

    fetchData();

  }, [zoneId, reset]);

  const handleChangeZoneLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
    const { value } = event.target;

    setZoneLevel(value as string);
  };

  const handleChangeUnitLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUnitLevel(event.target.value as string);
  };

  const handleChangeVehicles = (value: string[]) => {
    setSelectedVehicles(value);
    setVehicleTypes(value);
    setValue('vehicleTypes', value);
    const updatedVehicleDetails = { ...getValues('vehicleDetails') };

    value.forEach(vehicle => {
      if (!updatedVehicleDetails[vehicle]) {
        updatedVehicleDetails[vehicle] = {};
      }
    });
    setValue('vehicleDetails', updatedVehicleDetails);
  };



  const handlePricingChange = (vehicleId: string, name: string, value: string) => {
    setPricingData(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [name]: value
      }
    }));
  };


  const handleStepClick = async (step: number) => {
    const isStepValid = await trigger();

    if (isStepValid || step < activeStep) {
      setActiveStep(step);
    }
  };

  const handleNext = useCallback(async () => {
    const isStepValid = await trigger();

    if (isStepValid) {
      setActiveStep(prev => prev + 1);
    }
  }, [trigger]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const onSubmit = useCallback(async (data: FormValues) => {
         if (checkDemoStatus()) {
              toast.error(dictionary['navigation'].editError);
              
        return;  
    
      }
    
      setLoading(true); // Set loading to true


    const zonePriceData = Object.keys(data.vehicleDetails)
      .filter(key => key !== "[object Object]") // Filter out the unwanted key
      .map(key => {
        const details = data.vehicleDetails[key];


        return {
          vehicleId: key,
          ...details
        };
      });

    const vehicleTypes: any[] = data.vehicleTypes;

    const filteredZonePriceData = zonePriceData.filter(vt =>
      vehicleTypes.some(rv => rv.id === vt.vehicleId)
    );

    const convertedSurgePricing = Object.keys(surgePricingData).flatMap(vehicleId => {
      return surgePricingData[vehicleId].map((surgeDetails: any) => {
        return {
          vehicleId,
          ...surgeDetails
        };
      });
    });

    const roundedCoordinates = polygonCoordinates.map(coord => ({
      lat: parseFloat(coord.lat.toFixed(8)),
      lng: parseFloat(coord.lng.toFixed(8))
    }));


    const zoneData: any = {
      unit:data.unit,
      zoneLevel: data.zoneLevel,
      country: data.country,
      currency: currency, 
      paymentTypes: data.paymentTypes,
      zoneName: data.serviceLocation,
      mapCooder: roundedCoordinates,
      zonePriceData: filteredZonePriceData,
      zonesurgePriceData: convertedSurgePricing,
    };

    if (data.nonServiceZone != undefined) {
      zoneData.nonServiceZone = data.nonServiceZone || false
    }
    
    if (data.biddingZone != undefined) {
      zoneData.biddingZone = data.biddingZone || false
    }


    if (data.primaryZone) {
      zoneData.primaryZoneId = data.primaryZone
    }


    const updateZoneData = await updateZone(zoneId, zoneData);

    if (updateZoneData) {

      const ZoneData = `/apps/taxi/zone/list`;

      router.push(ZoneData);
      setLoading(false);
    }

  }, [zoneId, surgePricingData, polygonCoordinates]);

  const handleSurgePricingChange = (surgePricing: Record<string, any>) => {


    
    setSurgePricingData(surgePricing);
    setValue('surgePricing', surgePricing); // Sync with react-hook-form
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ServiceLocation
            control={control}
            formErrors={formErrors}
            zoneLevel={zoneLevel}
            handleChangeUnitLevel={handleChangeUnitLevel}
            handleChangeZoneLevel={handleChangeZoneLevel}
            handleChangeVehicles={handleChangeVehicles}
            selectedVehicles={selectedVehicles}
            setVehicleTypes={setVehicleTypes}
            setPaymentTypes={setPaymentTypes}
            paymentTypes={paymentTypes}
            onPolygonComplete={setPolygonCoordinates}
            existingData={data}
            initialCoordinates={polygonCoordinates}
            primaryZoneData={primaryZoneData}
            nonServiceZoneData={nonServiceZoneData}
            dictionary={dictionary}
            setCurrency={setCurrency}
            subscriptionDetails={subscriptionDetails}
            biddingZone={biddingZoneData}
          />
        );
      case 1:
        return (
          <RideNow
            control={control}
            unit={unitLevel}
            setValue={setValue}
            existingValues={pricingData}
            selectedVehicles={selectedVehicles}
            isRideNow={true}
            currency={currency}
            onPricingChange={handlePricingChange}
            dictionary={dictionary}
          />
        );
      case 2:
        return (
          <RideLater
            control={control}
            unit={unitLevel}
            setValue={setValue}
            existingValues={pricingData}
            selectedVehicles={selectedVehicles}
            isRideNow={false}
            onPricingChange={handlePricingChange}
            dictionary={dictionary}
            currency={currency}
          />
        );
      case 3:
        return (
          <SurgePricing
            selectedVehicles={selectedVehicles}
            onSurgePriceChange={handleSurgePricingChange}
            existingSurgePrices={surgePricingData}
            dictionary={dictionary}
            currency={currency}
    
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <StepperWrapper>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={index} onClick={() => handleStepClick(index)}>
              <StepLabel StepIconComponent={StepperCustomDot}>
                <div className='step-label'>
                  <div>
                    <Typography className='step-title'>{step.title}</Typography>
                    <Typography className='step-subtitle'>{step.subtitle}</Typography>
                  </div>
                </div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </StepperWrapper>
      <Card className='mt-4'>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent(activeStep)}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <Button
                variant="contained"
                color="secondary"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                {dictionary['navigation'].Back}
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="button"
                onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (activeStep === steps.length - 1 ? dictionary['navigation'].Submit : dictionary['navigation'].Continue)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default EditAction;
