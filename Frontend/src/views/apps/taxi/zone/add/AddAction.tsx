/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useCallback } from 'react';


import { useRouter,useParams } from 'next/navigation';

import { Stepper, Step, StepLabel, Button, Card, CardContent, Typography } from '@mui/material';
import { useForm, useFormState } from 'react-hook-form';
import { toast } from 'react-toastify';

import CircularProgress from '@mui/material/CircularProgress';

import StepperWrapper from '@core/styles/stepper';
import StepperCustomDot from '@components/stepper-dot';
import ServiceLocation from './ServiceLocation';
import RideNow from './RideNow';
import RideLater from './RideLater';
import SurgePricing from './SurgePricing';
import { createZone } from '@/app/api/apps/taxi/zone';
import { useIsDemoUser } from '@/utils/demoUser'

/** Normalize created zone id from API (mongoose id / _id / Extended JSON / nested data). */
function getCreatedZoneIdFromResponse(payload: unknown): string | undefined {
  if (payload == null || typeof payload !== 'object') return undefined
  const o = payload as Record<string, unknown>

  if ('data' in o && o.data != null && typeof o.data === 'object') {
    const nested = getCreatedZoneIdFromResponse(o.data)

    if (nested) return nested
  }

  const raw = o.id ?? o._id

  if (raw == null) return undefined
  if (typeof raw === 'string' && raw.trim() !== '') return raw

  if (typeof raw === 'object' && raw !== null && '$oid' in raw && typeof (raw as { $oid: string }).$oid === 'string') {
    return (raw as { $oid: string }).$oid
  }

  return String(raw)
}

interface FormValues {
  vehicleTypes: string[];
  paymentTypes: string[];
  vehicleDetails: Record<string, any>;
  unit: string;
  zoneLevel: string;
  primaryZone: string;
  country: string;
  nonServiceZone: boolean;
  serviceLocation: string;
  surgePricing: Record<string, any>;
  biddingZone: boolean;
}

interface AddZoneFormProps {
  lang?: any;
  dictionary?: any;
  subscriptionDetails?: any;
}



const AddAction: React.FC<AddZoneFormProps> = ({ lang, dictionary, subscriptionDetails }: { lang?: string, dictionary?: any, subscriptionDetails?: any }) => {
  const router = useRouter();

  const steps = [
    { title: dictionary['navigation'].ServiceLocation, subtitle: dictionary['navigation'].Wheredoyouneedtheservice },
    { title: dictionary['navigation'].RideNow, subtitle: dictionary['navigation'].Getacarimmediately },
    { title: dictionary['navigation'].RideLater, subtitle: dictionary['navigation'].Scheduleforafuturetime },
    { title: dictionary['navigation'].SurgePrice, subtitle: dictionary['navigation'].Understandpricingduringpeaktimes }
  ];

  const [activeStep, setActiveStep] = useState(0);
  const [zoneLevel, setZoneLevel] = useState('PRIMARY');
  const [unitLevel, setUnitLevel] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<string[]>([]);
  const [surgePricingData, setSurgePricingData] = useState<Record<string, any>>({});
  const [polygonCoordinates, setPolygonCoordinates] = useState<{ lat: number; lng: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const { checkDemoStatus } = useIsDemoUser();
  const [currency, setCurrency] = useState<string>(''); // Add this state
  const params = useParams() as { lang?: string; zoneId?: string };

  const { control, handleSubmit, trigger, setValue, getValues, clearErrors } = useForm<FormValues>({
    mode: 'all',
    defaultValues: {
      zoneLevel: 'PRIMARY',
      primaryZone: '',
      vehicleTypes: [],
      paymentTypes: [],
      vehicleDetails: {},
      surgePricing: {}
    }
  });

  const { errors: formErrors } = useFormState({ control });

  const handleChangeZoneLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
    setZoneLevel(event.target.value as string);
  };

  const handleChangeUnitLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUnitLevel(event.target.value as string);
  };

  const handlePolygonComplete = (coordinates: { lat: number; lng: number }[]) => {
    setPolygonCoordinates(coordinates);
  };

  const handleChangeVehicles = (value: string[], vehicleObjects?: any[]) => {
    const ids = value;

    const objects =
      vehicleObjects?.map((v: any) => ({ ...v, id: v.id ?? v._id })) ??
      selectedVehicles.filter((v: any) => ids.includes(v._id || v.id));

    setSelectedVehicles(objects);
    setVehicleTypes(ids);
    setValue('vehicleTypes', ids);
    const currentVehicleDetails = getValues('vehicleDetails') || {};
    const updatedVehicleDetails: Record<string, any> = {};

    // Keep only currently selected vehicles and initialize missing entries.
    ids.forEach((vehicleId) => {
      updatedVehicleDetails[vehicleId] = currentVehicleDetails[vehicleId] || {};
    });

    // Also drop surge pricing entries for vehicles that were removed.
    setSurgePricingData((prev) => {
      const next: Record<string, any> = {};

      ids.forEach((vehicleId) => {
        if (prev?.[vehicleId]) next[vehicleId] = prev[vehicleId];
      });
      
return next;
    });

    setValue('vehicleDetails', updatedVehicleDetails);
  };

  const handleStepClick = async (step: number) => {
    const isStepValid = await trigger();

    if (isStepValid || step < activeStep) {
      setActiveStep(step);
    }
  };

  const handleNext = useCallback(async () => {
    const isStepValid = await trigger();

    if (activeStep === 0) {
      if (polygonCoordinates.length === 0) {
        toast.error(dictionary['navigation'].Apolygonmustbedrawntoproceed); // Show error
        

        return;
      }
    }

    if (isStepValid) {
      setActiveStep(prev => prev + 1);
    }
  }, [dictionary,trigger, polygonCoordinates, activeStep]);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const onSubmit = useCallback(async (data: FormValues) => {
    if (checkDemoStatus()) {
      toast.error(dictionary['navigation'].editError);

      return;

    }

    setLoading(true); // Set loading to true

    // Show loading toast
    const toastId = toast.loading(dictionary['navigation'].Submittingyourdata);


    const zonePriceData = Object.keys(data.vehicleDetails)
      .filter(key => key !== "[object Object]")
      .map(key => {
        const details = data.vehicleDetails[key];

        return {
          vehicleId: key,
          ...details
        };
      });

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

    const zoneData = {
      zoneLevel: data.zoneLevel,
      unit: unitLevel,
      country: data.country,
      currency: currency,
      nonServiceZone: data.nonServiceZone || false,
      biddingZone: data.biddingZone || false,
      paymentTypes: data.paymentTypes,
      zoneName: data.serviceLocation,
      mapCooder: roundedCoordinates,

      // PRIMARY zones have no parent; empty string breaks Mongo ObjectId cast on the server.
      primaryZoneId:
        data.zoneLevel === 'SECONDARY' && data.primaryZone && String(data.primaryZone).trim() !== ''
          ? data.primaryZone
          : undefined,
      zonePriceData: zonePriceData,
      zonesurgePriceData: convertedSurgePricing,
    };

    let hasRedirected = false;

    try {


      const createZoneData = await createZone(zoneData);

      if (createZoneData) {
        const createdZoneId = getCreatedZoneIdFromResponse(createZoneData);
        const activeLang = lang || params?.lang || 'en';
        const isPrimary = data.zoneLevel === 'PRIMARY';

        // PRIMARY: URL uses the new zone id. SECONDARY: URL stays on the parent primary zone id (not the new zone).
        let routeZoneId: string | undefined;

        if (isPrimary) {
          routeZoneId = createdZoneId;
        } else {
          routeZoneId =
            (data.primaryZone && String(data.primaryZone).trim()) ||
            (params?.zoneId && String(params.zoneId).trim()) ||
            undefined;
        }

        if (routeZoneId) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('defaultZoneId', routeZoneId);
          }

          const targetUrl = `/${activeLang}/${routeZoneId}/apps/taxi/zone/list`;

          hasRedirected = true;
          toast.dismiss(toastId);
          toast.success(dictionary['navigation'].Zonecreatedsuccessfully);
          router.replace(targetUrl);

          return;
        }

        toast.error(dictionary['navigation'].ErrorcreatingzonePleasetryagain);
        setLoading(false);

        return;
      }
    } catch (error) {
      toast.error(dictionary['navigation'].ErrorcreatingzonePleasetryagain);
      console.error("Error creating zone:", error);
    } finally {
      if (!hasRedirected) {
        setLoading(false);
        toast.dismiss(toastId); // Dismiss only when staying on this page
      }
    }

  }, [checkDemoStatus, dictionary, surgePricingData, polygonCoordinates, unitLevel, currency, router, lang, params?.lang, params?.zoneId]);

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
            setValue={setValue}
            clearErrors={clearErrors} // Pass clearErrors
            formErrors={formErrors}
            zoneLevel={zoneLevel}
            handleChangeUnitLevel={handleChangeUnitLevel}
            handleChangeZoneLevel={handleChangeZoneLevel}
            handleChangeVehicles={handleChangeVehicles}
            selectedVehicles={selectedVehicles}
            setVehicleTypes={setVehicleTypes}
            setPaymentTypes={setPaymentTypes}
            paymentTypes={paymentTypes}
            onPolygonComplete={handlePolygonComplete}
            initialCoordinates={polygonCoordinates}
            dictionary={dictionary}
            setCurrency={setCurrency}
            subscriptionDetails={subscriptionDetails}
          />
        );

      case 1:
        return (
          <RideNow
            control={control}
            unit={unitLevel}
            selectedVehicles={selectedVehicles}
            isRideNow={true}
            currency={currency}
            dictionary={dictionary}
          />
        );

      case 2:
        return (
          <RideLater
            control={control}
            unit={unitLevel}
            selectedVehicles={selectedVehicles}
            isRideNow={false}
            currency={currency}
            dictionary={dictionary}

          />
        );

      case 3:
        return (
          <SurgePricing
            selectedVehicles={selectedVehicles}
            onSurgePriceChange={handleSurgePricingChange}
            currency={currency}
            dictionary={dictionary}

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
                disabled={activeStep === 0 || loading} // Disable back button if on the first step or loading
                onClick={handleBack} >
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

export default AddAction;
