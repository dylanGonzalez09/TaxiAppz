/* eslint-disable react-hooks/exhaustive-deps */
// EditAction.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react';

import { useRouter, useParams } from 'next/navigation';

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
import { normalizeMapZonePath } from '@/views/apps/taxi/zone/mapZoneUtils';

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
  currentZoneId: string; 
  editZoneId: string; 
  dictionary:any;
}

const steps = [
  { title: 'Service Location', subtitle: 'Location' },
  { title: 'Ride Now', subtitle: 'Car' },
  { title: 'Ride Later', subtitle: 'Calendar' },
  { title: 'Surge Price', subtitle: 'Money' }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EditAction: React.FC<EditZoneFormProps> = ({ currentZoneId, lang, editZoneId, dictionary}) => {
  const router = useRouter();
  const params = useParams();

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

  /** Per-vehicle zone price row active (ZonePrice.status); false = deactivated for this zone. */
  const [vehicleZonePriceActive, setVehicleZonePriceActive] = useState<Record<string, boolean>>({});

  /** Primary zone vehicle status map for immediate toggle validation in SECONDARY edit. */
  const [primaryVehicleStatusMap, setPrimaryVehicleStatusMap] = useState<Record<string, boolean>>({});

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
      const zoneData = await getByZoneId(editZoneId);
      const zone = Array.isArray(zoneData) ? zoneData[0] : zoneData;

      if (!zone) return;

      const rawVehicleTypes = zone.vehicleTypes || [];
      let vehicleIds = rawVehicleTypes.map((v: any) =>
        typeof v === 'string' ? v : v?._id || v?.id
      ).filter(Boolean);

      if (vehicleIds.length === 0 && zone.zonePriceDetails && typeof zone.zonePriceDetails === 'object') {
        vehicleIds = Object.keys(zone.zonePriceDetails).filter(k => k && k !== '[object Object]');
      }

      const vehicleObjects = rawVehicleTypes.length > 0
        ? rawVehicleTypes.map((v: any) => ({ ...v, id: v?.id ?? v?._id }))
        : [];

      setData(zone);
      reset({
        vehicleTypes: vehicleIds,
        paymentTypes: zone.paymentTypes,
        vehicleDetails: zone.zonePriceDetails,
        unit: zone.unit,
        zoneLevel: zone.zoneLevel,
        primaryZone: zone.primaryZoneId ? String(zone.primaryZoneId) : '',
        country: zone.country,
        serviceLocation: zone.zoneName,
        surgePricing: zone.zonesurgePriceData,
      });
      const primaryZone = zone.primaryZoneId || '';

      setPrimaryZoneData(primaryZone);
      setUnitLevel(zone.unit);
      setCurrency(zone.countrydetails.currency_symbol);

      setZoneLevel(zone.zoneLevel);
      setSelectedVehicles(vehicleObjects.length > 0 ? vehicleObjects : vehicleIds.map((id: string) => ({ _id: id, id, vehicleName: '' })));
      setVehicleTypes(vehicleIds);
      setPaymentTypes(zone.paymentTypes);
      setSurgePricingData(zone.zoneSurgePriceDetails);
      setPricingData(zone.zonePriceDetails);
      setPolygonCoordinates(normalizeMapZonePath(zone.mapZone));
      setnonServiceZoneData(zone.nonServiceZone);
      setbiddingZoneDatas(zone.biddingZone);

      const zpd = zone.zonePriceDetails && typeof zone.zonePriceDetails === 'object' ? zone.zonePriceDetails : {};
      const initialActive: Record<string, boolean> = {};

      vehicleIds.forEach((id: string) => {
        const pd = (zpd as Record<string, any>)[id];

        initialActive[id] = pd == null || pd.status == null ? true : Boolean(pd.status);
      });
      setVehicleZonePriceActive(initialActive);
    };

    fetchData();

  }, [editZoneId, reset]);

  useEffect(() => {
    const isSecondary = String(zoneLevel).toUpperCase() === 'SECONDARY';

    if (!isSecondary) {
      setPrimaryVehicleStatusMap({});
      
return;
    }

    const selectedPrimaryId = String(getValues('primaryZone') || primaryZoneData || '').trim();

    if (!selectedPrimaryId) {
      setPrimaryVehicleStatusMap({});
      
return;
    }

    let cancelled = false;

    (async () => {
      const res = await getByZoneId(selectedPrimaryId, currentZoneId);

      if (cancelled) return;

      const primaryZone = Array.isArray(res) ? res[0] : res;

      const zonePriceDetails =
        primaryZone?.zonePriceDetails && typeof primaryZone.zonePriceDetails === 'object'
          ? (primaryZone.zonePriceDetails as Record<string, any>)
          : {};

      const map: Record<string, boolean> = {};

      Object.keys(zonePriceDetails).forEach((vehicleId: string) => {
        map[vehicleId] = zonePriceDetails[vehicleId]?.status === true;
      });
      setPrimaryVehicleStatusMap(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [zoneLevel, primaryZoneData, currentZoneId, getValues]);

  const handleChangeZoneLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
    const { value } = event.target;

    setZoneLevel(value as string);
  };

  const handleChangeUnitLevel = (event: React.ChangeEvent<{ value: unknown }>) => {
    setUnitLevel(event.target.value as string);
  };

  const handleChangeVehicles = (value: string[], vehicleObjects?: any[]) => {
    const ids = value;

    const objects = vehicleObjects?.map((v: any) => ({ ...v, id: v.id ?? v._id }))
      ?? selectedVehicles.filter((v: any) => ids.includes(v._id || v.id));

    setSelectedVehicles(objects);
    setVehicleTypes(ids);
    setValue('vehicleTypes', ids);
    const currentVehicleDetails = getValues('vehicleDetails') || {};
    const updatedVehicleDetails: Record<string, any> = {};

    // Keep only currently selected vehicles and initialize missing entries.
    ids.forEach((id: string) => {
      updatedVehicleDetails[id] = currentVehicleDetails[id] || {};
    });

    setVehicleZonePriceActive(prev => {
      const next: Record<string, boolean> = {};

      ids.forEach((id: string) => {
        next[id] = prev[id] !== undefined ? prev[id] : true;
      });

      return next;
    });

    // Also drop surge pricing entries for vehicles that were removed.
    setSurgePricingData((prev) => {
      const next: Record<string, any> = {};

      ids.forEach((id: string) => {
        if (prev?.[id]) next[id] = prev[id];
      });
      
return next;
    });

    setValue('vehicleDetails', updatedVehicleDetails);
  };



  const handlePricingChange = (vehicleId: string, name: string, value: string | boolean) => {
    setPricingData(prev => ({
      ...prev,
      [vehicleId]: {
        ...prev[vehicleId],
        [name]: value
      }
    }));
  };

  const handleVehicleZonePriceActiveChange = useCallback((vehicleId: string, active: boolean) => {
    const id = String(vehicleId);
    const isSecondary = String(zoneLevel).toUpperCase() === 'SECONDARY';

    if (active && isSecondary && primaryVehicleStatusMap[id] !== true) {
      const vehicleName =
        selectedVehicles.find((v: any) => String(v?.id ?? v?._id ?? '') === id)?.vehicleName || 'this vehicle';

      toast.error(`Please enable ${vehicleName} in primary zone first`);
      
return;
    }

    setVehicleZonePriceActive(prev => ({ ...prev, [id]: active }));
    setValue(`vehicleDetails.${id}.status`, active);
    setPricingData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), status: active }
    }));
  }, [setValue, zoneLevel, primaryVehicleStatusMap, selectedVehicles]);


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
      const toastId = toast.loading(dictionary['navigation'].Submittingyourdata);


    const zonePriceData = Object.keys(data.vehicleDetails)
      .filter(key => key !== "[object Object]") // Filter out the unwanted key
      .map(key => {
        const details = data.vehicleDetails[key];
        const active = vehicleZonePriceActive[key] !== false;

        return {
          vehicleId: key,
          ...details,
          status: active
        };
      });

    const vehicleTypesRaw: any[] = data.vehicleTypes || [];
    const vehicleIds = vehicleTypesRaw.map((v: any) => (typeof v === 'string' ? v : v?._id || v?.id)).filter(Boolean);

    const filteredZonePriceData = zonePriceData.filter(vt =>
      vehicleIds.includes(vt.vehicleId)
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
      unit: data.unit,
      zoneLevel: data.zoneLevel,
      country: data.country,
      currency: currency,
      paymentTypes: data.paymentTypes,
      zoneName: data.serviceLocation,
      mapCooder: roundedCoordinates,
      zonePriceData: filteredZonePriceData,
      zonesurgePriceData: convertedSurgePricing,
      vehicleTypes: vehicleIds,
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


    try {
      const updateZoneData = await updateZone(editZoneId, zoneData);

      if (updateZoneData) {
        toast.dismiss(toastId);
        toast.success(dictionary['navigation'].Zoneupdatedsuccessfully || 'Zone updated successfully');
        const activeLang = lang || (typeof params?.lang === 'string' ? params.lang : undefined) || 'en';
        const targetUrl = `/${activeLang}/${currentZoneId}/apps/taxi/zone/list`;

        router.replace(targetUrl);
        
return;
      }

      toast.dismiss(toastId);
      toast.error(dictionary['navigation'].ErrorupdatingzonePleasetryagain || 'Error updating zone. Please try again');
    } catch (error) {
      toast.dismiss(toastId);

      const fallbackMessage =
        dictionary['navigation'].ErrorupdatingzonePleasetryagain || 'Error updating zone. Please try again';

      const errorMessage = error instanceof Error ? error.message : fallbackMessage;

      toast.error(errorMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }

  }, [checkDemoStatus, dictionary, editZoneId, surgePricingData, polygonCoordinates, currency, currentZoneId, router, lang, params?.lang, vehicleZonePriceActive]);

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
            biddingZone={biddingZoneData}
            zoneId={editZoneId}
            currentZoneId={currentZoneId}
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
            vehicleZonePriceActive={vehicleZonePriceActive}
            onVehicleZonePriceActiveChange={handleVehicleZonePriceActiveChange}
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
            vehicleZonePriceActive={vehicleZonePriceActive}
            onVehicleZonePriceActiveChange={handleVehicleZonePriceActiveChange}
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
            vehicleZonePriceActive={vehicleZonePriceActive}
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
                disabled={activeStep === 0 || loading}
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
