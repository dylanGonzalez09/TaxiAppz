/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';

import { useParams } from 'next/navigation';

import { Controller, useWatch } from 'react-hook-form';

import { Grid, MenuItem, Button, Chip } from '@mui/material';

import { validateTextOnly } from '@/utils/validation';

import CustomTextField from '@core/components/mui/TextField'; // Adjust path if needed
import CustomAutocomplete from '@core/components/mui/Autocomplete'; // Adjust path if needed
import PolygonDrawingMap from './mapDraw'; // Adjust path if needed
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';
import { fetchZone, getByZoneId } from '@/app/api/apps/taxi/zone';
import { getUserRole } from '@/utils/demoUser'
import { normalizeMapZonePath } from '@/views/apps/taxi/zone/mapZoneUtils';
import {getmoduleSetting} from '@apis/setting'

interface ServiceLocationProps {
  control: any;
  setValue: any;
  formErrors: any;
  clearErrors: any; // Ensure clearErrors is included here
  zoneLevel: string;
  handleChangeUnitLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeZoneLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeVehicles: (value: string[], vehicleObjects?: any[]) => void;
  selectedVehicles: any[];
  setVehicleTypes: (value: string[]) => void;
  setPaymentTypes: (value: string[]) => void;
  paymentTypes: string[];
  onPolygonComplete: (coordinates: { lat: number; lng: number }[]) => void;
  initialCoordinates: { lat: number; lng: number }[];
  dictionary: any;
  setCurrency: (currency: string) => void;
  subscriptionDetails?: string; // Optional prop for subscription detail
}

const ServiceLocation: React.FC<ServiceLocationProps> = ({
  control,
  setValue,
  formErrors,
  clearErrors, // Make sure to pass this prop
  zoneLevel,
  handleChangeUnitLevel,
  handleChangeZoneLevel,
  handleChangeVehicles,
  selectedVehicles,
  setVehicleTypes,
  setPaymentTypes,
  paymentTypes,
  onPolygonComplete,
  initialCoordinates,
  dictionary,
  setCurrency,
  subscriptionDetails
}) => {
  const getVehicleId = (v: any) => String(v?.id || v?._id || '');
  const [primaryZoneRules, setPrimaryZoneRules] = useState<{ required?: string | boolean }>({});
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState<{ lat: number, lng: number }[]>([]); // State to store polygon coordinates
  const [selectedShape, setSelectedShape] = useState<google.maps.Polygon | null>(null);
  const [countries, setCountries] = useState<{ id: string; name: string, currency_symbol: any }[]>([]);
  const [vehicle, setVehicle] = useState<{ id: string; vehicleName: string }[]>([]);
  const [zoneData, setZoneData] = useState<any[]>([]);
  const [primaryVehicleIds, setPrimaryVehicleIds] = useState<string[]>([]);
  const [primaryBoundaryPath, setPrimaryBoundaryPath] = useState<{ lat: number; lng: number }[]>([]);
  const [options, setOptions] = useState<{zoneLevel: string[];unit: string[];}>({zoneLevel: [],unit: []});

  const [peerSecondaryZones, setPeerSecondaryZones] = useState<
    { zoneId: string; coordinates: { lat: number; lng: number }[] }[]
  >([]);

  const primaryZoneId = useWatch({ control, name: 'primaryZone' });
  const watchedVehicleTypes = useWatch({ control, name: 'vehicleTypes' }) || [];
  const { lang: locale,zoneId } = useParams();
  const zoneIdString = Array.isArray(zoneId) ? zoneId[0] : zoneId;
  const userRole = getUserRole();
  const isNoZoneContext = !zoneIdString;


  useEffect(() => {
    const loadOptions = async () => {
      const data = await zonelevelFromLocal();

      setOptions(data);
    };

    loadOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [countrydata, vehicleData] = await Promise.all([
        fetchActiveCountry(),
        fetchVehicle(zoneIdString)
      ]);

      setVehicle(vehicleData);
      setCountries(countrydata);
    };

    fetchData();
  }, [zoneIdString]);

  useEffect(() => {
    const fetchPrimaryZonesForSecondary = async () => {
      if (zoneLevel !== 'SECONDARY' || !zoneIdString) {
        setZoneData([]);

return;
      }

      const zones = await fetchZone(zoneIdString);

      setZoneData(zones);
    };

    fetchPrimaryZonesForSecondary();
  }, [zoneLevel, zoneIdString]);

  useEffect(() => {
    if (zoneLevel !== 'SECONDARY') {
      setPrimaryBoundaryPath([]);
      setPeerSecondaryZones([]);
      setPrimaryVehicleIds([]);

return;
    }

    const id = primaryZoneId != null && String(primaryZoneId).trim() !== '' ? String(primaryZoneId) : '';

    if (!id) {
      setPrimaryBoundaryPath([]);
      setPeerSecondaryZones([]);
      setPrimaryVehicleIds([]);

return;
    }

    let cancelled = false;

    (async () => {
      const res = await getByZoneId(id, zoneIdString);

      if (cancelled) return;

      const zone = Array.isArray(res) ? res[0] : res;
      const path = normalizeMapZonePath(zone?.mapZone);
      const primaryVehiclesRaw = Array.isArray(zone?.vehicleTypes) ? zone.vehicleTypes : [];

      const allowedIds = primaryVehiclesRaw
        .map((v: any) => String(v?._id || v?.id || v || ''))
        .filter(Boolean);

      setPrimaryBoundaryPath(path);
      setPrimaryVehicleIds(allowedIds);

      const rawSecondaries = zone?.secondaryZones;

      if (Array.isArray(rawSecondaries) && rawSecondaries.length > 0) {
        setPeerSecondaryZones(
          rawSecondaries
            .map((sz: any) => ({
              zoneId: String(sz._id ?? sz.id ?? ''),
              coordinates: normalizeMapZonePath(sz.mapZone),
            }))
            .filter(p => p.zoneId && p.coordinates.length >= 3)
        );
      } else {
        setPeerSecondaryZones([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [zoneLevel, primaryZoneId, zoneIdString]);

  useEffect(() => {
    if (zoneLevel !== 'SECONDARY') return;
    if (primaryVehicleIds.length === 0) return;

    const currentIds = (watchedVehicleTypes || []).map((v: any) => String(v)).filter(Boolean);
    const prunedIds = currentIds.filter((id: string) => primaryVehicleIds.includes(id));

    if (prunedIds.length !== currentIds.length) {
      const prunedObjects = vehicle.filter(v => prunedIds.includes(getVehicleId(v)));

      setValue('vehicleTypes', prunedIds);
      setVehicleTypes(prunedIds);
      handleChangeVehicles(prunedIds, prunedObjects);
    }
  }, [zoneLevel, primaryVehicleIds, watchedVehicleTypes, vehicle, setValue, setVehicleTypes, handleChangeVehicles]);

  const handlePolygonComplete = (coordinates: { lat: number; lng: number }[]) => {
    setPolygonCoordinates(coordinates);
    onPolygonComplete(coordinates);
  };

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (map && place.geometry?.location) {
      const { location } = place.geometry;

      map.setCenter(location);
      new google.maps.Marker({
        position: location,
        map: map,
        title: place.name
      });
    }
  }, [map]);

const zonelevelFromLocal = async() => {
  try {

    const moduleSettings =  await getmoduleSetting()

    const result = moduleSettings?.secondaryZone;

    return {
      zoneLevel:
        userRole === 'Master admin'
          ? ['SECONDARY']
          : result === 'no'
          ? ['PRIMARY']
          : ['PRIMARY', 'SECONDARY'],

      unit:[
        dictionary['navigation'].KM || 'KM' ,
        dictionary['navigation'].Mile || 'MILE'
      ],
    };
  } catch (err) {
    return {
      zoneLevel: ['PRIMARY', 'SECONDARY'],
       unit:[
        dictionary['navigation'].KM || 'KM' ,
        dictionary['navigation'].Mile || 'MILE'
      ],
    };
  }
};


  useEffect(() => {
    if (isNoZoneContext) {
      setValue('zoneLevel', 'PRIMARY');
      setValue('primaryZone', '');
      handleChangeZoneLevel({ target: { value: 'PRIMARY' } } as React.ChangeEvent<{ value: unknown }>);
    }
  }, [isNoZoneContext, setValue, handleChangeZoneLevel]);

  useEffect(() => {
    setPrimaryZoneRules(zoneLevel === 'SECONDARY' ? { required: 'Primary Zone is required' } : {});
  }, [zoneLevel]);

const handleAutocompleteChange = (event: React.ChangeEvent<{}>, value: any[], type: 'vehicle' | 'payment') => {
    if (type === 'vehicle') {
      const ids = value.map((v: any) => getVehicleId(v)).filter(Boolean);

      setVehicleTypes(ids);
      handleChangeVehicles(ids, value);
    } else {
      setPaymentTypes(value as string[]);
    }
  };

  const handleRemoveZone = () => {

    if (selectedShape) {

      selectedShape.setMap(null);
      setSelectedShape(null);
    }
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={4}>
        <Controller
          name="serviceLocation"
          control={control}
          rules={{ required: dictionary['navigation'].ServiceLocationAreaZoneNameisrequired ,
            validate : (value) => validateTextOnly(value,dictionary)
          }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              fullWidth
              label={dictionary['navigation'].ServiceLocationAreaZoneName}
              error={Boolean(formErrors.serviceLocation)}
              helperText={formErrors.serviceLocation?.message || ''}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name="country"
          control={control}
          rules={{ required: dictionary['navigation'].Countryisrequired }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label={dictionary['navigation'].Country}
              error={Boolean(formErrors.country)}
              helperText={formErrors.country?.message || ''}
              onChange={(e) => {
              field.onChange(e);
              const selectedCountry = countries.find(c => c.id === e.target.value);

              if (selectedCountry) {
                setCurrency(selectedCountry.currency_symbol);
              }
            }}
            >
              {countries.map(country => (
                <MenuItem key={country.id} value={country.id}>
                  {country.name}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
      </Grid>

      {[
        { name: 'zoneLevel', label: dictionary['navigation'].ZoneLevel, options: options.zoneLevel }
      ].map(({ name, label, options }) => (
        <Grid item xs={12} sm={4} key={name}>
          <Controller
            name={name}
            control={control}
            rules={{ required: `${label} ${dictionary['navigation'].isrequired}` }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label={label}
                disabled={isNoZoneContext}
                onChange={(e) => {
                  field.onChange(e);
                  if (name === 'zoneLevel') handleChangeZoneLevel(e);
                }}
                error={Boolean(formErrors[name])}
                helperText={formErrors[name]?.message || ''}
              >
                {options.map(option => (
                  <MenuItem key={option} value={option}>
                    {dictionary['navigation'][option] || option}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>
      ))}


      {[
        { name: 'unit', label: dictionary['navigation'].unit, options: options.unit }
      ].map(({ name, label, options }) => (
        <Grid item xs={12} sm={4} key={name}>
          <Controller
            name={name}
            control={control}
            rules={{ required: `${label} ${dictionary['navigation'].isrequired}` }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                label={label}
                onChange={(e) => {
                  field.onChange(e);
                  handleChangeUnitLevel(e);
                }}
                error={Boolean(formErrors[name])}
                helperText={formErrors[name]?.message || ''}
              >
                {options.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>
      ))}

      <Grid item xs={12} sm={4}>
        <Controller
          name="primaryZone"
          control={control}
          rules={{ required: primaryZoneRules.required }}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label={dictionary['navigation'].PrimaryZone}
              disabled={zoneLevel !== 'SECONDARY'}
              error={Boolean(formErrors.primaryZone)}
              helperText={formErrors.primaryZone?.message || ''}
            >
              {zoneData.map(option => (
                <MenuItem key={option._id} value={option._id}>
                  {option.zoneName}
                </MenuItem>
              ))}
            </CustomTextField>
          )}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Controller
          name="vehicleTypes"
          control={control}
          rules={{ required: dictionary['navigation'].Atleastonevehicletypeisrequired }}
          render={({ field, fieldState }) => (
            (() => {
              const options =
                zoneLevel === 'SECONDARY'
                  ? vehicle.filter(v => primaryVehicleIds.includes(getVehicleId(v)))
                  : vehicle;

              const selectedIds = (field.value || []).map((val: any) => String(typeof val === 'string' ? val : getVehicleId(val)));
              const selectedOptions = options.filter(v => selectedIds.includes(getVehicleId(v)));

              return (
            <CustomAutocomplete
              multiple
              limitTags={2}
              options={options}
              id="autocomplete-vehicle-types"
              getOptionLabel={(option) => option.vehicleName || ''}
              value={selectedOptions}
              isOptionEqualToValue={(option, value) => getVehicleId(option) === getVehicleId(value)}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label={dictionary['navigation'].AvailableVehicle}
                  placeholder={dictionary['navigation'].Type}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message || ''}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    label={option.vehicleName}
                    {...getTagProps({ index })}
                    key={getVehicleId(option)}
                    size="small"
                  />
                ))
              }
              onChange={(event, value) => {
                const ids = value.map((v: any) => getVehicleId(v)).filter(Boolean);

                field.onChange(ids);
                handleAutocompleteChange(event, value, 'vehicle');

                // Clear the error if there's a valid selection
                if (value.length > 0) {
                  clearErrors('vehicleTypes'); // Now this should work correctly
                }
              }}
            />
              );
            })()
          )}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name="paymentTypes"
          control={control}
          rules={{ required: dictionary['navigation'].Atleastonepaymenttypeisrequired }}
          render={({ field }) => (
            <CustomAutocomplete
              multiple
              limitTags={2}
              options={[
                    dictionary['navigation'].Cash || 'Cash',
                    dictionary['navigation'].Card || 'Card',
                    dictionary['navigation'].Wallet || 'Wallet'
                  ]}
              id='autocomplete-payment-types'
              getOptionLabel={option => option || ''}
              value={field.value}
              renderInput={params => (
                <CustomTextField
                  {...params}
                  name="paymentTypes"
                  label={dictionary['navigation'].AvailablePaymentMethods}
                  placeholder={dictionary['navigation'].PaymentTypes}
                  error={Boolean(formErrors.paymentTypes)}
                  helperText={formErrors.paymentTypes?.message || ''}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} key={index} size='small' />
                ))
              }
              onChange={(event, value) => {
                field.onChange(value);
                handleAutocompleteChange(event, value, 'payment');
              }}
            />
          )}
        />
      </Grid>


      {/* Non-Service Zone and Bidding Zone are intentionally hidden in UI */}


      <Grid item xs={12} sm={10}>
        <CustomTextField
          fullWidth
          id="pac-input"
          label={dictionary['navigation'].Search}
          placeholder={dictionary['navigation'].Search}
          onChange={event => {
            const input = event.target.value;

            if (input.length >= 2) {
              const autocomplete = new google.maps.places.AutocompleteService();

              autocomplete.getPlacePredictions({ input }, (predictions: google.maps.places.AutocompletePrediction[] | null, status: any) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                  const placeId = predictions[0]?.place_id;

                  if (placeId && map) {
                    const placesService = new google.maps.places.PlacesService(map);

                    placesService.getDetails({ placeId }, (place: google.maps.places.PlaceResult | null, status: any) => {
                      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        handlePlaceSelect(place);
                      }
                    });
                  }
                }
              });
            }
          }}
        />
      </Grid>


      <Grid item xs={12} sm={2}>
        <Button variant="contained" color="primary" style={{ marginTop: '18px' }} onClick={handleRemoveZone}>
          {dictionary['navigation'].RemoveZone}
        </Button>
      </Grid>

      <Grid item xs={12}>
        <PolygonDrawingMap
          setMap={setMap}
          setPolygonCoordinates={setPolygonCoordinates}
          setSelectedShape={setSelectedShape}
          onPolygonComplete={handlePolygonComplete}
          initialCoordinates={initialCoordinates}
          referencePolygonCoordinates={primaryBoundaryPath}
          referencePolygonKey={`${zoneLevel}:${zoneLevel === 'SECONDARY' ? String(primaryZoneId ?? '') : ''}`}
          zonesDisplayOnly={false}
          suppressSoloPrimaryOverlay={zoneLevel === 'SECONDARY'}
          peerSecondaryZones={peerSecondaryZones}
        />
      </Grid>
    </Grid>
  );
};

export default ServiceLocation;
