/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';

import { Controller } from 'react-hook-form';
import { Grid, MenuItem, Button, Chip, FormControlLabel, Checkbox } from '@mui/material';

import CustomTextField from '@core/components/mui/TextField'; // Adjust path if needed
import CustomAutocomplete from '@core/components/mui/Autocomplete'; // Adjust path if needed
import PolygonDrawingMap from './mapDraw'; // Adjust path if needed
import { fetchVehicle } from '@/app/api/apps/taxi/vehicle';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';
import { fetchZone } from '@/app/api/apps/taxi/zone';

interface ServiceLocationProps {
  control: any;
  formErrors: any;
  clearErrors: any; // Ensure clearErrors is included here
  zoneLevel: string;
  handleChangeUnitLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeZoneLevel: (event: React.ChangeEvent<{ value: unknown }>) => void;
  handleChangeVehicles: (value: string[]) => void;
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
  const [primaryZoneRules, setPrimaryZoneRules] = useState<{ required?: string | boolean }>({});
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polygonCoordinates, setPolygonCoordinates] = useState<{ lat: number, lng: number }[]>([]); // State to store polygon coordinates
  const [selectedShape, setSelectedShape] = useState<google.maps.Polygon | null>(null);
  const [countries, setCountries] = useState<{ id: string; name: string, currency_symbol: any }[]>([]);
  const [vehicle, setVehicle] = useState<{ id: string; vehicleName: string }[]>([]);
  const [zoneData, setZoneData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [countrydata, vehicleData, zoneData] = await Promise.all([fetchActiveCountry(), fetchVehicle(), fetchZone()]);

      setVehicle(vehicleData);
      setCountries(countrydata);
      setZoneData(zoneData);
    };

    fetchData();
  }, []);

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
    zoneLevel: ['PRIMARY', 'SECONDARY'],
    unit: ['KM', 'MILE'],
  };

  useEffect(() => {
    setPrimaryZoneRules(zoneLevel === 'SECONDARY' ? { required: 'Primary Zone is required' } : {});
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
            <CustomAutocomplete
              multiple
              limitTags={2}
              options={vehicle}
              id="autocomplete-vehicle-types"
              getOptionLabel={(option) => option.vehicleName || ''}
              value={field.value || []}
              isOptionEqualToValue={(option, value) => option.vehicleName === value.vehicleName}
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
                    key={option.id}
                    size="small"
                  />
                ))
              }
              onChange={(event, value) => {
                field.onChange(value);
                handleAutocompleteChange(event, value, 'vehicle');

                // Clear the error if there's a valid selection
                if (value.length > 0) {
                  clearErrors('vehicleTypes'); // Now this should work correctly
                }
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


      <Grid item xs={12} sm={4}>
        <Controller
          name="nonServiceZone"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                />
              }
              label={dictionary['navigation'].NonServiceZone}
            />
          )}
        />
      </Grid>


      {subscriptionDetails === "yes" && (
        <Grid item xs={12} sm={4}>
          <Controller
            name="biddingZone"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.value === 'yes'}
                    onChange={(e) => field.onChange(e.target.checked ? 'yes' : 'no')}
                    color="primary"
                  />
                }
                label={dictionary['navigation'].biddingZone}
              />
            )}
          />
        </Grid>
      )}


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
        />
      </Grid>
    </Grid>
  );
};

export default ServiceLocation;
