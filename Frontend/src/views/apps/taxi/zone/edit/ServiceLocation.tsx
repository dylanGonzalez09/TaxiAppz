/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';

import { Controller, useWatch } from 'react-hook-form';
import { Grid, MenuItem, Button, Chip, Typography } from '@mui/material';

import CustomTextField from '@core/components/mui/TextField'; // Adjust path if needed
import CustomAutocomplete from '@core/components/mui/Autocomplete'; // Adjust path if needed
import PolygonDrawingMap from './mapDraw'; // Adjust path if needed
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';
import { fetchZone, getByZoneId } from '@/app/api/apps/taxi/zone';
import { getUserRole } from '@/utils/demoUser'
import { normalizeMapZonePath } from '@/views/apps/taxi/zone/mapZoneUtils';
import { validateTextOnly } from '@/utils/validation';


interface Step1Props {
  control: any;
  formErrors: any;
  zoneLevel: string;
  handleChangeUnitLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeZoneLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeVehicles: (value: string[], vehicleObjects?: any[]) => void;
  selectedVehicles: string[];
  setVehicleTypes: React.Dispatch<React.SetStateAction<string[]>>;
  setPaymentTypes: React.Dispatch<React.SetStateAction<string[]>>;
  paymentTypes: string[];
  onPolygonComplete: (coordinates: { lat: number; lng: number }[]) => void;
  existingData?: any;
  initialCoordinates: { lat: number; lng: number }[];
  primaryZoneData?: string;
  nonServiceZoneData?: string;
  dictionary: any;
  setCurrency: any;
  biddingZone?: string;
  zoneId?:any;
  currentZoneId?:any;
}

interface Vehicle {
  _id: string
  vehicleName: string
  image: string
  capacity: number
  serviceType: string
  sortingorder: number
  highlightImage: string
  status: boolean
  clientId?: string
  zoneId?: string
}

const ServiceLocation: React.FC<Step1Props> = ({
  control,
  formErrors,
  zoneLevel,
  handleChangeUnitLevel,
  handleChangeZoneLevel,
  handleChangeVehicles,
  selectedVehicles,
  setVehicleTypes,
  setPaymentTypes,
  paymentTypes,
  onPolygonComplete,
  existingData,
  initialCoordinates,
  primaryZoneData,
  nonServiceZoneData,
  dictionary,
  setCurrency,
  biddingZone,
  zoneId,
  currentZoneId
}) => {
  const getVehicleId = (v: any) => String(v?._id || v?.id || '');
  const [primaryZoneRules, setPrimaryZoneRules] = useState<{ required?: string | boolean }>({});
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState<{ lat: number, lng: number }[]>(existingData?.mapZone || []);
  const [selectedShape, setSelectedShape] = useState<google.maps.Polygon | null>(null);
  const [countries, setCountries] = useState<{ id: string; name: string, currency_symbol: any }[]>([]);

  // const [vehicle, setVehicle] = useState<{ id: string; role: string }[]>([]);
  const [vehicle, setVehicle] = useState<{_id: string,vehicleName: string,status: boolean}[]>([]);
  const [zoneData, setZoneData] = useState<any[]>([]);
  const [primaryVehicleIds, setPrimaryVehicleIds] = useState<string[]>([]);
  const [primaryZoneDatas, setPrimaryZoneData] = useState('');
  const [nonServiceZoneDatas, setNonServiceZoneData] = useState(nonServiceZoneData);
  const [biddingZoneDatas, setbiddingZoneDatas] = useState(biddingZone);
  const [primaryBoundaryPath, setPrimaryBoundaryPath] = useState<{ lat: number; lng: number }[]>([]);

  const [peerSecondaryZones, setPeerSecondaryZones] = useState<
    { zoneId: string; coordinates: { lat: number; lng: number }[] }[]
  >([]);

  const primaryZoneId = useWatch({ control, name: 'primaryZone' });
  const watchedVehicleTypes = useWatch({ control, name: 'vehicleTypes' }) || [];
  const userRole = getUserRole();

  const isSecondaryZone = String(zoneLevel).toUpperCase() === 'SECONDARY';



  useEffect(() => {

    setNonServiceZoneData(nonServiceZoneDatas);
    setbiddingZoneDatas(biddingZoneDatas);

    const fetchData = async () => {
      const [countryData, vehicleData, zoneData] = await Promise.all([fetchActiveCountry(zoneId), fetchVehicle(zoneId), fetchZone(currentZoneId)]);

      setVehicle(vehicleData);
      setCountries(countryData);
      setZoneData(zoneData);
    };

    fetchData();
  }, []);

  useEffect(() => {

    setNonServiceZoneData(nonServiceZoneDatas);
    setbiddingZoneDatas(biddingZoneDatas);

    if (existingData) {


      setPrimaryZoneRules(
        String(existingData.zoneLevel).toUpperCase() === 'SECONDARY' ? { required: 'Primary Zone is required' } : {}
      );
      const vTypes = existingData.vehicleTypes || [];

      setVehicleTypes(vTypes);
      setPaymentTypes(existingData.paymentTypes || []);
      setPolygonCoordinates(normalizeMapZonePath(existingData.mapZone));

      setPrimaryZoneData(existingData.primaryZoneId || '');

      setNonServiceZoneData(existingData.nonServiceZone);
      setbiddingZoneDatas(existingData.biddingZone);
    }
  }, [existingData, setVehicleTypes, setPaymentTypes, setPrimaryZoneData]);

  useEffect(() => {
    if (!isSecondaryZone) {
      setPrimaryBoundaryPath([]);
      setPeerSecondaryZones([]);
      setPrimaryVehicleIds([]);
      
return;
    }

    const rawId =
      primaryZoneId != null && String(primaryZoneId).trim() !== ''
        ? String(primaryZoneId)
        : primaryZoneDatas && String(primaryZoneDatas).trim() !== ''
          ? String(primaryZoneDatas)
          : '';

    if (!rawId) {
      setPrimaryBoundaryPath([]);
      setPeerSecondaryZones([]);
      setPrimaryVehicleIds([]);
      
return;
    }

    let cancelled = false;

    const editedId = zoneId != null && String(zoneId).trim() !== '' ? String(zoneId) : '';

    (async () => {
      const res = await getByZoneId(rawId, currentZoneId);

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
            .filter(
              p =>
                p.zoneId &&
                p.coordinates.length >= 3 &&
                (!editedId || p.zoneId !== editedId)
            )
        );
      } else {
        setPeerSecondaryZones([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSecondaryZone, primaryZoneId, primaryZoneDatas, currentZoneId, zoneId]);

  useEffect(() => {
    if (!isSecondaryZone) return;
    if (primaryVehicleIds.length === 0) return;

    const currentIds = (watchedVehicleTypes || [])
      .map((v: any) => String(typeof v === 'string' ? v : getVehicleId(v)))
      .filter(Boolean);

    const prunedIds = currentIds.filter((id: string) => primaryVehicleIds.includes(id));

    if (prunedIds.length !== currentIds.length) {
      const prunedObjects = vehicle.filter(v => prunedIds.includes(getVehicleId(v)));

      setVehicleTypes(prunedIds);
      handleChangeVehicles(prunedIds, prunedObjects);
    }
  }, [isSecondaryZone, primaryVehicleIds, watchedVehicleTypes, vehicle, setVehicleTypes, handleChangeVehicles]);

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

  const options = {
    zoneLevel: userRole === 'Master admin' ? ['Select Zone Level','SECONDARY'] :  ['Select Zone Level', 'PRIMARY', 'SECONDARY'],
    unit: ['KM', 'MILE'],
  };

  useEffect(() => {
    setPrimaryZoneRules(isSecondaryZone ? { required: 'Primary Zone is required' } : {});
  }, [isSecondaryZone]);

  const handleAutocompleteChange = (event: React.ChangeEvent<{}>, value: string[], type: 'vehicle' | 'payment') => {
    if (type === 'vehicle') {
      setVehicleTypes(value);
      handleChangeVehicles(value);
    } else {
      setPaymentTypes(value);
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
          defaultValue={existingData?.serviceLocation || ''}
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
          defaultValue={existingData?.country || ''}
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              disabled
              label={dictionary['navigation'].Country}
              error={Boolean(formErrors.country)}
              helperText={formErrors.country?.message || ''}
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
            defaultValue={existingData?.zoneLevel || ''}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                fullWidth
                disabled={name === 'zoneLevel'}
                label={label}
                onChange={(e) => {
                  field.onChange(e);
                  if (name === 'zoneLevel') handleChangeZoneLevel(e);
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

      {[
        { name: 'unit', label: 'Unit', options: options.unit }
      ].map(({ name, label, options }) => (
        <Grid item xs={12} sm={4} key={name}>
          <Controller
            name={name}
            control={control}
            rules={{ required: `${label} ${dictionary['navigation'].isrequired}` }}
            defaultValue={existingData?.unit || ''}
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
          defaultValue={primaryZoneDatas || ''}  // Ensure a fallback value is provided
          render={({ field }) => (
            <CustomTextField
              {...field}
              select
              fullWidth
              label={dictionary['navigation'].PrimaryZone}
              disabled={!isSecondaryZone}
              error={Boolean(formErrors.primaryZone)}
              helperText={formErrors.primaryZone?.message || ''}
              onChange={(e) => {
                field.onChange(e.target.value);
                setPrimaryZoneData(e.target.value);
              }}
              value={field.value || primaryZoneDatas}
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
          render={({ field, fieldState }) => {
            const ids = (field.value || []).map((v: any) => String(typeof v === 'string' ? v : getVehicleId(v))).filter(Boolean);

            const options = vehicle.filter(v => {
              if (v.status !== true) return false;
              if (!isSecondaryZone) return true;
              
return primaryVehicleIds.includes(getVehicleId(v));
            });

            const selectedObjects = options.filter(v => ids.includes(getVehicleId(v)));

            return (
              <CustomAutocomplete
                multiple
                disableClearable
                options={options}
                getOptionLabel={(option) => option.vehicleName}
                value={selectedObjects}
                isOptionEqualToValue={(option, value) => getVehicleId(option) === getVehicleId(value)}
                renderInput={(params) => (
                  <CustomTextField
                    {...params}
                    label={dictionary['navigation'].AvailableVehicle}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, onDelete: _remove, ...tagProps } = getTagProps({ index });

                    return (
                      <Chip
                        key={key}
                        variant='outlined'
                        label={option.vehicleName}
                        {...tagProps}
                      />
                    );
                  })
                }
                onChange={(event, value) => {
                  const selectedIds = value.map(v => getVehicleId(v)).filter(Boolean);

                  field.onChange(selectedIds);
                  handleChangeVehicles(selectedIds, value);
                }}
              />
            );
          }}
        />
      </Grid>


      {/* Non-Service Zone and Bidding Zone are intentionally hidden in UI */}




      {/* {subscriptionDetails === "yes" && (
        <>
          {biddingZoneDatas === "no" && (
            <Grid item xs={12} sm={4}>
              <Controller
                name="biddingZone"
                control={control}
                defaultValue={'no'}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value === 'yes'}
                        onChange={(e) => field.onChange(e.target.checked ? 'yes' : 'no')}
                      />
                    }
                    label={dictionary['navigation'].biddingZone}
                  />
                )}
              />
            </Grid>
          )}

          {biddingZoneDatas === "yes" && (
            <Grid item xs={12} sm={4}>
              <Controller
                name="biddingZone"
                control={control}
                defaultValue={'yes'}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value === 'yes'}
                        onChange={(e) => field.onChange(e.target.checked ? 'yes' : 'no')}
                      />
                    }
                    label={dictionary['navigation'].biddingZone}
                  />
                )}
              />
            </Grid>
          )}
        </>
      )} */}

      <Grid item xs={12} sm={12}>
        <CustomTextField
          fullWidth
          id="pac-input"
          label={dictionary['navigation'].Search}
          placeholder={dictionary['navigation'].Search}
          onChange={event => {
            const input = event.target.value;
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
          }}
        />
      </Grid>

      {/* <Grid item xs={12} sm={2}>
        <Button variant="contained" color="primary" style={{ marginTop: '18px' }} onClick={handleRemoveZone}>
          Remove Zone
        </Button>
      </Grid> */}

      <Grid item xs={12}>
        <PolygonDrawingMap
          setMap={setMap}
          setPolygonCoordinates={setPolygonCoordinates}
          setSelectedShape={setSelectedShape}
          onPolygonComplete={handlePolygonComplete}
          initialCoordinates={initialCoordinates}
          referencePolygonCoordinates={primaryBoundaryPath}
          referencePolygonKey={`${String(zoneLevel).toUpperCase()}:${
            isSecondaryZone ? String(primaryZoneId ?? primaryZoneDatas ?? '') : ''
          }`}
          zonesDisplayOnly={false}
          suppressSoloPrimaryOverlay={isSecondaryZone}
          peerSecondaryZones={peerSecondaryZones}
          excludePeerZoneId={zoneId != null ? String(zoneId) : undefined}
        />
      </Grid>
    </Grid>
  );
};

export default ServiceLocation;
