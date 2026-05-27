/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import InputAdornment from '@mui/material/InputAdornment';
import { toast } from 'react-toastify';
import { MenuItem, Grid, Select, FormControl, InputLabel } from '@mui/material';
import { Plus } from 'lucide-react';
import { setHours, setMinutes, startOfMinute ,addMinutes} from 'date-fns';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import Avatar from '@mui/material/Avatar';

import { getSession } from 'next-auth/react';

import { Controller } from 'react-hook-form';

import CustomTextField from '@core/components/mui/TextField';

import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';
import { getPromoByZoneId } from '@/app/api/apps/taxi/promoCode';

import {getRentalPakages} from '@apis/rental'

interface TripDetailsProps {
  serviceType: string;
  zoneDetails: any;
  zoneId: any;
  onPickPointChange: (value: { lat: number; lng: number }) => void;
  onDropPointChange: (value: { lat: number; lng: number }) => void;
  onStopPointChange: (value: { lat: number; lng: number }) => void;
  pickupDetails: { lat: number; lng: number },
  setTripDetails: (details: any) => void;
  tripDetails: any
  userDetails: any
  dictionary:any
}

const TripDetails: React.FC<TripDetailsProps> = ({ serviceType, zoneDetails, onPickPointChange, onDropPointChange, onStopPointChange, pickupDetails, setTripDetails, tripDetails, zoneId, userDetails ,dictionary }) => {

  // Helper to safely get values from tripDetails or default to empty
  const getInitialValue = (value: any, fallback: any = '') => (value ? value : fallback);

  const [pickupPoint, setPickupPoint] = useState<string>(getInitialValue(tripDetails?.pickupPoint));
  const [dropPoint, setDropPoint] = useState<string>(getInitialValue(tripDetails?.dropPoint));

  // NOTE: We still keep stopPoint for the autocomplete logic,
  // but the Input will use stops[index] for display.
  const [stopPoint, setStopPoint] = useState<string>(getInitialValue(tripDetails?.stops?.[0]));

  const [stops, setStops] = useState<string[]>(tripDetails?.stops || []);
  const [rentalDuration, setRentalDuration] = useState<string>(getInitialValue(tripDetails?.rentalDuration));
  const [rentalNotes, setRentalNotes] = useState<string>(getInitialValue(tripDetails?.rentalNotes));

  const [pickupPredictions, setPickupPredictions] = useState<any[]>([]);
  const [stopPredictions, setStopPredictions] = useState<any[]>([]);
  const [dropPredictions, setDropPredictions] = useState<any[]>([]);
  const [rideTime, setRideTime] = useState<string>(getInitialValue(tripDetails?.rideTime || 'rideNow'));
  const [dateTime, setDateTime] = useState<Date | null>(tripDetails?.dateTime || null);
  const [promoCode, setPromoCode] = useState<string>(getInitialValue(tripDetails?.promoCode));
  const [tripType, setTripType] = useState<string>(getInitialValue(tripDetails?.tripType ||  'manual'));
  const [minAllowedTime, setMinAllowedTime] = useState(addMinutes(new Date(), 15));

  const getRental = async()=>{
    const data = await getRentalPakages(zoneId)
    console.log(data);
  }
   getRental()





  const [pickCoordinates, setPickCoordinates] = useState<{ lat: number; lng: number }>(
    tripDetails?.pickCoordinates || { lat: 0, lng: 0 }
  );

  const [dropCoordinates, setDropCoordinates] = useState<{ lat: number; lng: number }>(
    tripDetails?.dropCoordinates || { lat: 0, lng: 0 }
  );

  const [stopCoordinates, setStopCoordinates] = useState<{ lat: number; lng: number }>(
    tripDetails?.stopCoordinates || { lat: 0, lng: 0 }
  );

  const [centroid, setCentroid] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [predictions, setPredictions] = useState<{ [key: number]: any[] }>({});
  const [promos, setPromos] = useState<{ id: number; promoCode: string }[]>([]);
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);

  const now = new Date();
  const minDate = startOfMinute(now);

  useEffect(() => {
    if (!tripDetails || Object.keys(tripDetails).length === 0) {
      return;
    }

    setPickupPoint(tripDetails.pickupPoint || '');
    setDropPoint(tripDetails.dropPoint || '');

    // Restore stop text from the array
    setStopPoint(tripDetails.stops?.[0] || '');
    setRideTime(tripDetails.rideTime === 'rideLater' ? 'rideLater' : 'rideNow');
    setPromoCode(tripDetails.promoCode || '');
    setPickCoordinates(tripDetails.pickCoordinates || { lat: 0, lng: 0 });
    setDropCoordinates(tripDetails.dropCoordinates || { lat: 0, lng: 0 });
    setStopCoordinates(tripDetails.stopCoordinates || { lat: 0, lng: 0 });
    setDateTime(tripDetails.dateTime || null);
    setStops(tripDetails.stops || []);
    setTripType(tripDetails.tripType || 'manual');
    setRentalDuration(tripDetails.rentalDuration || '');
    setRentalNotes(tripDetails.rentalNotes || '');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


      useEffect(() => {
      const interval = setInterval(() => {
        setMinAllowedTime(addMinutes(new Date(), 15));
      }, 60000); // 1 minute

      return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    const fetchData = async (zoneId: string) => {
      try {
        const DataKey = await getSession();
        const clientId = DataKey?.user?.image?.clientId;

        if (clientId === undefined) {
          throw new Error("ClientId is undefined");
        }

        const dropDownData = await getPromoByZoneId(zoneId, userDetails?.passengerNumber);

        setPromos(dropDownData);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      if (zoneId && userDetails?.passengerNumber) {
        fetchData(zoneId);
      }
    }, 4000);

    return () => clearTimeout(timer);

  }, [zoneId, userDetails?.passengerNumber]);

  useEffect(() => {
    if (zoneDetails && zoneDetails.mapZone && Array.isArray(zoneDetails.mapZone) && zoneDetails.mapZone.length > 0) {
      const coordinates = zoneDetails.mapZone;
      const centroid = calculateCentroid(coordinates);

      setCentroid(centroid);
    }
  }, [zoneDetails]);


  useEffect(() => {
    if (pickupDetails) {
      if (pickupDetails.lat === 0 && pickupDetails.lng === 0) {
        setPickupPoint('');
        setPickupPredictions([]);
      }
    }
  }, [pickupDetails]);


  const addStop = () => {
    if (stops.length < 1) {
      setStops([...stops, '']);
    } else {
      toast.error("You can only add a maximum of 1 stops.");
    }
  };

  const removeStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);

    setStops(newStops);
    setStopPoint('');
    setStopPredictions([]);
    onStopPointChange({
      lat: 0,
      lng: 0
    })
  };

  const handleStopChange = (index: number, value: string) => {
    const updatedStops = [...stops];

    updatedStops[index] = value;
    setStops(updatedStops);
  };


  const calculateCentroid = (coordinates: any[]) => {
    const totalLat = coordinates.reduce((sum, point) => sum + point.lat, 0);
    const totalLng = coordinates.reduce((sum, point) => sum + point.lng, 0);
    const centroidLat = totalLat / coordinates.length;
    const centroidLng = totalLng / coordinates.length;

    return { lat: centroidLat, lng: centroidLng };
  };



  const handlePlaceSelect = (
    place: any,
    setter: React.Dispatch<React.SetStateAction<string>>,
    predictionsSetter: React.Dispatch<React.SetStateAction<any[]>>,
    setCoordinates: (coords: { lat: number; lng: number }) => void,
    loc: string,
    index?: number // Added index to update specific stop
  ) => {

    const placesService = new google.maps.places.PlacesService(document.createElement("div"));

    placesService.getDetails(
      { placeId: place.place_id },
      (details: google.maps.places.PlaceResult | null, status: any) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && details) {
        const coords = {
          lat: details.geometry?.location?.lat() || 0,
          lng: details.geometry?.location?.lng() || 0
        };

        setCoordinates(coords);

        setter(place.description);

        if (loc == "pickup") {
          onPickPointChange(coords);
        } else if (loc == "drop") {
          onDropPointChange(coords);
        } else if (loc == "stop") {
          onStopPointChange(coords);


          // FIX: If it's a stop, update the specific index in the stops array
          if (index !== undefined) {
            handleStopChange(index, place.description);
          }

          // setter(place.description);
        }

        // else {
        //    setter(place.description);
        // }

        predictionsSetter([]);
      } else {
        console.error("Failed to get place details:", status);
      }
      }
    );
  };


  const initializeAutocomplete = (
    input: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    predictionsSetter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (input.length >= 5) {
      const autocomplete = new google.maps.places.AutocompleteService();

      autocomplete.getPlacePredictions(
        { input, location: new google.maps.LatLng(centroid.lat, centroid.lng), radius: 5000 },
        (predictions: google.maps.places.AutocompletePrediction[] | null, status: any) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            predictionsSetter(predictions);
          } else {
            predictionsSetter([]);
          }
        }
      );
    } else {
      predictionsSetter([]);
    }
  };

  useEffect(() => {
    setTripDetails({
      serviceType,
      pickupPoint,
      dropPoint,
      stops,
      rideTime,
      dateTime,
      promoCode,
      tripType,
      pickCoordinates,
      dropCoordinates,
      stopCoordinates,
      rentalDuration,
      rentalNotes
    });
  }, [serviceType, pickupPoint, dropPoint, stops, rideTime, dateTime, promoCode, tripType, setTripDetails, dropCoordinates, pickCoordinates, stopCoordinates, rentalDuration, rentalNotes]);


  const handlePromoChange = (e: React.SetStateAction<string>) => {
    setPromoCode(e);
  };


  return (
    <div className="mb-4">
      <h6 className="mb-4 font-bold text-lg flex items-center" style={{ marginTop: '-16%' }}>
        <Avatar className='bg-primary' style={{ width: 30, height: 30 }}>
          <AltRouteIcon style={{ color: 'white' }} />
        </Avatar>
        <span className="ml-2" style={{ fontSize: '1.1rem' }}>
          {dictionary['navigation'].TripDetails || 'Trip Details'}
        </span>
      </h6>

      {/* Pickup Point Input */}
      <CustomTextField
        fullWidth
        label={dictionary['navigation'].PickupPoint  || 'PickupPoint *'}
        value={pickupPoint}
        onChange={(e) => {
          const input = e.target.value;

          setPickupPoint(input);
          initializeAutocomplete(input, setPickupPoint, setPickupPredictions);
        }}
        className="mb-2"
      />
      {/* Display Autocomplete for Pickup Point */}
      {pickupPredictions.length > 0 && (
        <div className="autocomplete-suggestions">
          {pickupPredictions.map((prediction, index) => (
            <div
              key={index}
              onClick={() => {
                handlePlaceSelect(prediction, setPickupPoint, setPickupPredictions, setPickCoordinates, "pickup")
              }
              }
              className="suggestion"
              style={{ cursor: 'pointer', padding: '5px', backgroundColor: '#fff' }}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}
      {/* Stops Input */}
      {stops.map((stop, index) => (
        <div key={index} className="flex flex-col mb-2 relative">
          <CustomTextField
            fullWidth
            label={`Stop ${index + 1}`}

            // FIX: Use stops[index] directly so it persists on navigation
            value={stop || ''}
            onChange={(e) => {
              const input = e.target.value;

              setStopPoint(input); // Keep local state for autocomplete triggering
              handleStopChange(index, e.target.value);
              initializeAutocomplete(input, setStopPoint, setStopPredictions);
            }}
            className="mb-1"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <button
                    className="flex items-center justify-center p-0"
                    onClick={() => removeStop(index)}
                    aria-label={`Remove Stop ${index + 1}`}
                    type="button"
                    style={{ background: 'transparent', border: 'none' }}
                  >
                    <i className="tabler-x text-red-500" />
                  </button>
                </InputAdornment>
              ),
            }}
          />
          {/* Display Autocomplete for Stops */}
          {stopPredictions.length > 0 && (
            <div
              className="absolute z-10 w-full bg-white shadow-lg border rounded-md"
              style={{ top: '100%', left: 0 }}
            >
              {stopPredictions.map((prediction, suggestionIndex) => (
                <div
                  key={suggestionIndex}
                  onClick={() => {
                    // Pass index so it updates the correct stop in the array
                    handlePlaceSelect(prediction, setStopPoint, setStopPredictions, setStopCoordinates, "stop", index);
                  }}
                  className="suggestion hover:bg-gray-100 p-2 cursor-pointer"
                >
                  {prediction.description}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add Stop Button */}
      <div className="flex justify-end mb-2">
        <button
          className="flex items-center font-medium p-0"
          onClick={addStop}
          aria-label="Add Stop"
          type="button"
          style={{ background: 'transparent', border: 'none' }}
        >
         {dictionary['navigation'].AddStop || 'Add Stop'}
          <Plus className="ml-1" />
        </button>
      </div>


      {/* Drop Point Input */}
      <CustomTextField
        fullWidth
        label={dictionary['navigation'].DropPoint  || 'DropPoint *'}
        value={dropPoint}
        onChange={(e) => {
          const input = e.target.value;

          setDropPoint(input);
          initializeAutocomplete(input, setDropPoint, setDropPredictions);
        }}
        className="mb-2"
      />
      {/* Display Autocomplete for Drop Point */}
      {dropPredictions.length > 0 && (
        <div className="autocomplete-suggestions">
          {dropPredictions.map((prediction, index) => (
            <div
              key={index}
              onClick={() => {
                handlePlaceSelect(prediction, setDropPoint, setDropPredictions, setDropCoordinates, "drop");
                onDropPointChange(dropCoordinates);
              }
              }
              className="suggestion"
              style={{ cursor: 'pointer', padding: '5px', backgroundColor: '#fff' }}
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}


      {/* Rental Details */}
      {serviceType === 'rental' && (
        <div>
          <CustomTextField
            fullWidth
            label="Rental Duration*"
            placeholder="Enter duration"
            value={rentalDuration}
            onChange={(e) => setRentalDuration(e.target.value)}
            className="mb-2"
          />
          <CustomTextField
            fullWidth
            label="Additional Notes"
            placeholder="Any special requests?"
            value={rentalNotes}
            onChange={(e) => setRentalNotes(e.target.value)}
            className="mb-2"
          />
        </div>
      )}

      {/* Trip Type and Ride Time Selection */}
      <Grid container spacing={2} className="mt-2">
        <Grid item xs={6}>
          <CustomTextField
            select
            fullWidth
            label={dictionary['navigation'].TripType  || 'TripType'}
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            disabled={rideTime === 'rideLater'}
          >
            <MenuItem value="manual"> {dictionary['navigation'].Manual || 'Manual'}</MenuItem>
            <MenuItem value="automatic"> {dictionary['navigation'].Automatic || 'Automatic'}</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            select
            fullWidth
            label={dictionary['navigation'].RideTime  || 'Ride Time'}
            value={rideTime}
            onChange={(e) => {
              setRideTime(e.target.value)
            }}
          >
            <MenuItem value="rideNow"> {dictionary['navigation'].RideNow || 'RideNow'}</MenuItem>
            <MenuItem value="rideLater"> {dictionary['navigation'].Schedule || 'Schedule'}</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>




      {/* Date Picker and Promo Code */}
      <Grid container spacing={2} className="mt-2">

        <Grid item xs={6}>
          <CustomTextField
            select
            fullWidth
            label={dictionary['navigation'].Promo  || 'Promo'}
            SelectProps={{ displayEmpty: true }}
            value={promoCode}
            onChange={(e) => {
              handlePromoChange(e.target.value)
            }}>
             <MenuItem value="">{dictionary['navigation'].SelectPromo || 'Select Promo'}</MenuItem>
            {promos && promos.map((option:any) =>{
              return (
              <MenuItem key={option.id} value={option.id}>
                {option.promoCode + ` (${option.promoType === 'fixed' ? ` ${option.amount} ` : ` ${option.percentage}% `})`}
              </MenuItem>
            )})}
          </CustomTextField>
        </Grid>

        {rideTime === 'rideLater' && (
              <Grid item xs={6}>
                 <AppReactDatepicker
                   showTimeSelect
                   timeIntervals={1}
                   selected={dateTime}
                   dateFormat="MM/dd/yyyy h:mm aa"
                   minDate={new Date()}
                   filterTime={(time) => time.getTime() >= minAllowedTime.getTime()}
                   onChange={(date: Date | null) => {
                    if (!date) {
                      setDateTime(null);
                      setDateTimeError(null);

                      return;
                    }

                    const minTime = addMinutes(new Date(), 15);

                    if (date.getTime() < minTime.getTime()) {
                      setDateTimeError('Please select at least 15 minutes from now');
                      setDateTime(null);
                    } else {
                      setDateTime(date);
                      setDateTimeError(null);
                    }
                  }}
                customInput={
                  <CustomTextField
                    label="Date Time"
                    fullWidth
                    error={!!dateTimeError}
                    helperText={dateTimeError}
                  />
                }
              />
            </Grid>
        )}

      </Grid>

    </div>
  );
};

export default TripDetails;
