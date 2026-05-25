/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';

import { Controller } from 'react-hook-form';
import { Grid, MenuItem, Button, Chip, FormControlLabel, Checkbox, Typography } from '@mui/material';

import CustomTextField from '@core/components/mui/TextField'; // Adjust path if needed
import CustomAutocomplete from '@core/components/mui/Autocomplete'; // Adjust path if needed
import PolygonDrawingMap from './mapDraw'; // Adjust path if needed
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';
import { fetchZone } from '@/app/api/apps/taxi/zone';

interface Step1Props {
  control: any;
  formErrors: any;
  zoneLevel: string;
  handleChangeUnitLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeZoneLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeVehicles: (value: string[]) => void;
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
  subscriptionDetails: string;
  biddingZone?: string;
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
  subscriptionDetails,
  biddingZone
}) => {
  const [primaryZoneRules, setPrimaryZoneRules] = useState<{ required?: string | boolean }>({});
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState<{ lat: number, lng: number }[]>(existingData?.mapZone || []);
  const [selectedShape, setSelectedShape] = useState<google.maps.Polygon | null>(null);
  const [countries, setCountries] = useState<{ id: string; name: string, currency_symbol: any }[]>([]);
  const [vehicle, setVehicle] = useState<{ id: string; role: string }[]>([]);
  const [zoneData, setZoneData] = useState<any[]>([]);
  const [primaryZoneDatas, setPrimaryZoneData] = useState('');
  const [nonServiceZoneDatas, setNonServiceZoneData] = useState(nonServiceZoneData);
  const [biddingZoneDatas, setbiddingZoneDatas] = useState(biddingZone);



  useEffect(() => {

    setNonServiceZoneData(nonServiceZoneDatas);
    setbiddingZoneDatas(biddingZoneDatas);

    const fetchData = async () => {
      const [countryData, vehicleData, zoneData] = await Promise.all([fetchActiveCountry(), fetchVehicle(), fetchZone()]);

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


      setPrimaryZoneRules(existingData.zoneLevel === 'Secondary' ? { required: 'Primary Zone is required' } : {});
      setVehicleTypes(existingData.vehicleTypes || []);
      setPaymentTypes(existingData.paymentTypes || []);
      setPolygonCoordinates(existingData.mapZone || []);

      setPrimaryZoneData(existingData.primaryZoneId || '');

      setNonServiceZoneData(existingData.nonServiceZone);
      setbiddingZoneDatas(existingData.biddingZone);

    }
  }, [existingData, setVehicleTypes, setPaymentTypes, setPrimaryZoneData]);

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
    zoneLevel: ['Select Zone Level', 'PRIMARY', 'SECONDARY'],
    unit: ['KM', 'MILE'],
  };

  useEffect(() => {
    setPrimaryZoneRules(zoneLevel === 'Secondary' ? { required: 'Primary Zone is required' } : {});
  }, [zoneLevel]);

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
          rules={{ required: dictionary['navigation'].ServiceLocationAreaZoneNameisrequired }}
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
              disabled={zoneLevel !== 'SECONDARY'}
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
          defaultValue={existingData?.vehicleTypes || []}
          render={({ field, fieldState }) => (
            <CustomAutocomplete
              multiple
              limitTags={2}
              options={vehicle}
              id="autocomplete-vehicle-types"
              getOptionLabel={(option) => option?.vehicleName || ''}
              value={field.value || []}
              isOptionEqualToValue={(option, value) => option.vehicleName === value.vehicleName}
              renderInput={(params) => (
                <CustomTextField
                  {...params}
                  label={dictionary['navigation'].AvailableVehicle}
                  placeholder="Type"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message || ''}
                />
              )}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    label={option.vehicleName}
                    {...getTagProps({ index })}
                    key={option.id}
                    size="small"
                  />
                ))
              }
              onChange={(event, value) => {
                field.onChange(value);
                handleAutocompleteChange(event, value, 'vehicle');
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={4}>
        <Controller
          name="paymentTypes"
          control={control}
          rules={{ required: dictionary['navigation'].Atleastonepaymenttypeisrequired }}
          defaultValue={existingData?.paymentTypes || []}
          render={({ field }) => (
            <CustomAutocomplete
              multiple
              limitTags={2}
              options={['Cash', 'Card', 'Wallet']}
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


      {nonServiceZoneDatas === "no" && (
        <Grid item xs={12} sm={4}>
          <Controller
            name="nonServiceZone"
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
                label={dictionary['navigation'].NonServiceZone}
              />
            )}
          />
        </Grid>
      )}

      {nonServiceZoneDatas === "yes" && (
        <Grid item xs={12} sm={4}>
          <Controller
            name="nonServiceZone"
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
                label={dictionary['navigation'].NonServiceZone}
              />
            )}
          />
        </Grid>
      )}




      {subscriptionDetails === "yes" && (
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
      )}

      <Grid item xs={12} sm={12}>
        <CustomTextField
          fullWidth
          id="pac-input"
          label={dictionary['navigation'].Search}
          placeholder={dictionary['navigation'].Search}
          onChange={event => {
            const input = event.target.value;
            const autocomplete = new google.maps.places.AutocompleteService();

            autocomplete.getPlacePredictions({ input }, (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                const placeId = predictions[0]?.place_id;

                if (placeId && map) {
                  const placesService = new google.maps.places.PlacesService(map);

                  placesService.getDetails({ placeId }, (place, status) => {
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
        <PolygonDrawingMap setMap={setMap} setPolygonCoordinates={polygonCoordinates} setSelectedShape={setSelectedShape} onPolygonComplete={handlePolygonComplete} initialCoordinates={initialCoordinates} />
      </Grid>
    </Grid>
  );
};

export default ServiceLocation;
