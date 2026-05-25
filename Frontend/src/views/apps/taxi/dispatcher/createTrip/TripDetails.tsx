/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';

import InputAdornment from '@mui/material/InputAdornment';
import { toast } from 'react-toastify';
import { MenuItem, Grid, Select, FormControl, InputLabel,Paper,Typography,Divider } from '@mui/material';
import { Plus } from 'lucide-react';
import { setHours, setMinutes, startOfMinute } from 'date-fns';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import Avatar from '@mui/material/Avatar';

import { getSession } from 'next-auth/react';

import { Controller } from 'react-hook-form';

import CustomTextField from '@core/components/mui/TextField';

import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker';

interface TripDetailsProps {
  serviceType: string;
  zoneDetails: any;
  onPickPointChange: (value: { lat: number; lng: number }) => void;
  onDropPointChange: (value: { lat: number; lng: number }) => void;
  onStopPointChange: (value: { lat: number; lng: number }) => void;
  pickupDetails: { lat: number; lng: number },
  setTripDetails: (details: any) => void;
  tripDetails:any
  onRentalVehicleSelect?: (vehicle: any) => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ serviceType, zoneDetails, onPickPointChange, onDropPointChange, onStopPointChange, pickupDetails, setTripDetails,tripDetails,onRentalVehicleSelect }) => {

  const [pickupPoint, setPickupPoint] = useState<string>('');
  const [dropPoint, setDropPoint] = useState<string>('');
  const [stopPoint, setStopPoint] = useState<string>('');

  const [stops, setStops] = useState<string[]>([]);
  const [pickupPredictions, setPickupPredictions] = useState<any[]>([]);
  const [stopPredictions, setStopPredictions] = useState<any[]>([]);
  const [dropPredictions, setDropPredictions] = useState<any[]>([]);

  const [rideTime, setRideTime] = useState<string>('rideNow');
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [tripType, setTripType] = useState<string>('manual');
  const [pickCoordinates, setPickCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [dropCoordinates, setDropCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [stopCoordinates, setStopCoordinates] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [centroid, setCentroid] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [predictions, setPredictions] = useState<{ [key: number]: any[] }>({}); // Store predictions for each stop
  const [promos, setPromos] = useState<{ id: number; promoCode: string }[]>([]);
  const [dateTimeError, setDateTimeError] = useState<string | null>(null);
  const [showStop, setShowStop] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage,setSelectedPackage] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const now = new Date();
  const minDate = startOfMinute(now);


    useEffect(() => {
      if (tripDetails) {
        setPickupPoint(tripDetails.pickupPoint);
        setDropPoint(tripDetails.dropPoint);
        setStopPoint(tripDetails.stopPoint);
        setRideTime(tripDetails.rideTime === 'rideLater' ? 'rideLater' : 'rideNow');
        setPromoCode(tripDetails.promoCode);
        setPickCoordinates(tripDetails.pickCoordinates);
        setDropCoordinates(tripDetails.dropCoordinates);
        setStopCoordinates(tripDetails.stopCoordinates);
        setDateTime(tripDetails.dateTime)

        if (tripDetails.stopPoint) {
          setShowStop(true);
        }
      }
    },[]);


  useEffect(() => {
    const fetchData = async () => {

      try {

        const DataKey = getClientId();

        const clientId = (await DataKey).clientId;

        if (clientId === undefined) {

          throw new Error("ClientId is undefined");

        }

        const dropDownData = await fetch(ENDPOINTS.promocode.promoDropDownList(clientId));

        const data = await dropDownData.json();

        setPromos(data.data.promo);

        const packageDropDownData = await fetch(ENDPOINTS.rental.getRentalPackagesByZone(zoneDetails._id),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'clientId': clientId
          }
        });

        const packageData = await packageDropDownData.json();

        setPackages(packageData.data);
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 4000);

    return () => clearTimeout(timer);

  }, []);

  // Helper function to add headers to the request
  const getClientId = async () => {

    const session = await getSession();

    const clientId = session?.user?.image?.clientId; // Access clientId
    const companyId = session?.user?.image?.companyId; // Access companyId

    return { clientId, companyId };
  };

  useEffect(() => {
    if (zoneDetails && zoneDetails.mapZone && Array.isArray(zoneDetails.mapZone) && zoneDetails.mapZone.length > 0) {
      const coordinates = zoneDetails.mapZone;

      // Calculate centroid
      const centroid = calculateCentroid(coordinates);

      // Set the centroid to the state
      setCentroid(centroid);

    } else {
      console.warn('zoneDetails or zoneDetails.mapZone is invalid');
    }
  }, [zoneDetails]);


  useEffect(() => {
    if (pickupDetails) {
      // Check if the latitude and longitude are {lat: 0, lng: 0}
      if (pickupDetails.lat === 0 && pickupDetails.lng === 0) {
        setPickupPoint(''); // Clear the Pickup Point text
        setPickupPredictions([]); // Optionally, clear the predictions as well
      }
    }
  }, [pickupDetails]);


  const addStop = () => {
    // if (stops.length < 1) {
    //   setStops([...stops, '']);
    // } else {
    //   toast.error("You can only add a maximum of 1 stops.");
    // }
    if (!showStop) {
      setShowStop(true);
    }
  };

  const removeStop = () => {
    // setStops(stops.filter((_, i) => i !== index));
    setShowStop(false);
    setStopPoint('');
    setStopPredictions([]);
    onStopPointChange({
      lat: 0,
      lng: 0
    })
  };

  // Handler for stop input change
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
    loc: string
  ) => {

    const placesService = new google.maps.places.PlacesService(document.createElement("div"));

    placesService.getDetails({ placeId: place.place_id }, (details, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && details) {
        setCoordinates({
          lat: details.geometry?.location?.lat() || 0,
          lng: details.geometry?.location?.lng() || 0
        });

        if (loc == "pickup") {
          onPickPointChange({
            lat: details.geometry?.location?.lat() || 0,
            lng: details.geometry?.location?.lng() || 0
          })
        } else if (loc == "drop") {
          onDropPointChange({
            lat: details.geometry?.location?.lat() || 0,
            lng: details.geometry?.location?.lng() || 0
          })
        } else if (loc == "stop") {
          onStopPointChange({
            lat: details.geometry?.location?.lat() || 0,
            lng: details.geometry?.location?.lng() || 0
          })
        } else {
          console.log("loc")
        }

        setter(place.description);
        predictionsSetter([]);
      } else {
        console.error("Failed to get place details:", status);
      }
    });
  };


  const initializeAutocomplete = (
    input: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    predictionsSetter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (input.length >= 5) {
      const autocomplete = new google.maps.places.AutocompleteService();

      // Adjust request to consider the centroid location for nearby places
      autocomplete.getPlacePredictions(
        { input, location: new google.maps.LatLng(centroid.lat, centroid.lng), radius: 5000 },
        (predictions, status) => {
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
    const updatedDetails: any = {
      serviceType,
      pickupPoint,
      rideTime,
      dateTime,
      promoCode,
      tripType,
      pickCoordinates
    };

    if (serviceType === 'local') {
      updatedDetails.dropPoint = dropPoint;
      updatedDetails.stopPoint = stopPoint;
      updatedDetails.dropCoordinates = dropCoordinates;
      updatedDetails.stopCoordinates = stopCoordinates;
    }

    if (serviceType === 'rental') {
      updatedDetails.packageId = selectedPackage;
      updatedDetails.vehicleId = selectedVehicle;
    }

    setTripDetails(updatedDetails);

    // setTripDetails({
    //   serviceType,
    //   pickupPoint,
    //   dropPoint,
    //   // stops,
    //   stopPoint,
    //   rideTime,
    //   dateTime,
    //   promoCode,
    //   tripType,
    //   pickCoordinates,
    //   dropCoordinates,
    //   stopCoordinates
    // });
  }, [serviceType, pickupPoint, dropPoint, stopPoint, rideTime, dateTime, promoCode, tripType, setTripDetails, dropCoordinates, pickCoordinates,selectedPackage,
  selectedVehicle]);


  const handlePromoChange = (e: React.SetStateAction<string>) => {
    setPromoCode(e);
  };

  const selectedPackageDetails = packages.find(
    (pkg) => pkg.id === selectedPackage
  );

  const selectedVehicleDetail = selectedPackageDetails?.vehiclePrices.find(
    (vp:any) => vp.vehicleId.id === selectedVehicle
  );
  
return (
    <div className="mb-4">
      <h6 className="mb-4 font-bold text-lg flex items-center" style={{ marginTop: '-16%' }}>
        <Avatar className='bg-primary' style={{ width: 30, height: 30 }}>
          <AltRouteIcon style={{ color: 'white' }} />
        </Avatar>
        <span className="ml-2" style={{ fontSize: '1.1rem' }}>Trip Details</span>
      </h6>

      {/* Pickup Point Input */}
      <CustomTextField
        fullWidth
        label="Pickup Point*"
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
      {!showStop && serviceType === 'local' && (
        <div className="flex justify-end mb-2">
          <button className="flex items-center font-medium p-0" onClick={addStop} type="button">
            Add Stop
            <Plus className="ml-1" />
          </button>
        </div>
      )}
      {showStop && (
        <div className="flex flex-col mb-2 relative">
          <CustomTextField
            fullWidth
            label="Stop"
            value={stopPoint}
            onChange={(e) => {
              const input = e.target.value;

              setStopPoint(input);

              // handleStopChange(index, e.target.value);
              initializeAutocomplete(input, setStopPoint, setStopPredictions);
            }}
            className="mb-1"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <button
                    className="flex items-center justify-center p-0"
                    onClick={removeStop}
                    aria-label="Remove Stop"
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
                    handlePlaceSelect(prediction, setStopPoint, setStopPredictions, setStopCoordinates, "stop");
                  }}
                  className="suggestion hover:bg-gray-100 p-2 cursor-pointer"
                >
                  {prediction.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Stop Button */}
      {/* <div className="flex justify-end mb-2">
        <button
          className="flex items-center font-medium p-0"
          onClick={addStop}
          aria-label="Add Stop"
          type="button"
          style={{ background: 'transparent', border: 'none' }}
        >
          Add Stop
          <Plus className="ml-1" />
        </button>
      </div> */}


      {/* Drop Point Input */}
      {serviceType === 'local' && (
      <CustomTextField
        fullWidth
        label="Drop Point*"
        value={dropPoint}
        onChange={(e) => {
          const input = e.target.value;

          setDropPoint(input);
          initializeAutocomplete(input, setDropPoint, setDropPredictions);
        }}
        className="mb-2"
      />
      )}
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
        <>
        <div>
        <CustomTextField
          select
          fullWidth
          label="Rental Package"
          value={selectedPackage}
          onChange={(e) => {
            setSelectedVehicle('')
            setSelectedPackage(e.target.value)
            }
          }
          className="mb-2"
        >
          {packages.length === 0 ? (<MenuItem disabled>No Package Found</MenuItem>) :
            (
              packages.map((rental: any) => (
                <MenuItem key={rental.id} value={rental.id}>
                  {rental.hour + "hr/" + rental.km + " " + rental.zoneId.unit}
                </MenuItem>
              ))
            )}
        </CustomTextField>
        </div>
        <div>
          <CustomTextField
            select
            fullWidth
            label="Vehicles"
            value={selectedVehicle}
            onChange={(e) => {
              setSelectedVehicle(e.target.value)

              const selectedVehicleObject = selectedPackageDetails?.vehiclePrices.find(
                (vp: any) => vp.vehicleId.id === e.target.value
              );

              if (onRentalVehicleSelect && selectedVehicleObject) {
                onRentalVehicleSelect(selectedVehicleObject.vehicleId); // just vehicleId object
              }
            }}
            disabled={!selectedPackage}
          >
            {!selectedPackageDetails && selectedPackageDetails?.vehiclePrices?.length === 0 ? (<MenuItem disabled>No Vehicle Found</MenuItem>) :
              (
                selectedPackageDetails?.vehiclePrices?.map((vp: any) => (
                  <MenuItem key={vp.vehicleId.id} value={vp.vehicleId.id}>
                    {vp.vehicleId.vehicleName}
                  </MenuItem>
                ))
              )}
          </CustomTextField>
        </div>
        </>
      )}

      {/* Trip Type and Ride Time Selection */}
      <Grid container spacing={2} className="mt-2">
        <Grid item xs={6}>
          <CustomTextField
            select
            fullWidth
            label="Trip Type"
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}

            // disabled={rideTime === 'rideLater'}
          >
            <MenuItem value="manual">Manual</MenuItem>
            <MenuItem value="automatic">Automatic</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={6}>
          <CustomTextField
            select
            fullWidth
            label="Ride Time"
            value={rideTime}
            onChange={(e) => {
              setRideTime(e.target.value)
            }}
          >
            <MenuItem value="rideNow">Ride Now</MenuItem>
            <MenuItem value="rideLater">Schedule</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>




      {/* Date Picker and Promo Code */}
      <Grid container spacing={2} className="mt-2">
        {serviceType === 'local' && (
        
        <Grid item xs={6}>
          <CustomTextField
            select
            fullWidth
            label="Promo"
            value={promoCode} // Bind the value to rideTime state
            onChange={(e) => {
              handlePromoChange(e.target.value)
            }}
          >
            {promos.length === 0 ? (<MenuItem disabled>No Promo Available</MenuItem>) :
            (
              promos.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.promoCode}
              </MenuItem>
             ))
            )}
          </CustomTextField>
        </Grid>
        )}
        {/* <Grid item xs={6}>
          <CustomTextField
            fullWidth
            label="Promo Code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
        </Grid> */}
        {rideTime === 'rideLater' && (
          <Grid item xs={6}>
            <AppReactDatepicker
              showTimeSelect
              id='date-time-picker'
              selected={dateTime}
              dateFormat='MM/dd/yyyy h:mm aa'
              onChange={(date: Date | null) => {
                if(date)
                {
                  const now = new Date();
                  const diffInMinutes = (date.getTime() - now.getTime()) / (1000 * 60);

                  if(diffInMinutes <= 30)
                  {
                    setDateTimeError('Please select a time at least above 30 minutes from now.');
                    setDateTime(null);
                  }
                  else {
                    setDateTime(date);
                    setDateTimeError(null);
                  }
                }
                else {
                  setDateTime(null);
                  setDateTimeError('Please select a valid time.');
                }
              }}
              customInput={<CustomTextField label='Date Time' fullWidth error={!!dateTimeError} helperText={dateTimeError} />}
              minDate={minDate}
              excludeTimes={[
                setHours(setMinutes(new Date(), 0), 17),
                setHours(setMinutes(new Date(), 30), 18),
                setHours(setMinutes(new Date(), 30), 19),
                setHours(setMinutes(new Date(), 30), 20)
              ]}
            />
          </Grid>
        )}

      </Grid>
        {selectedVehicle && selectedPackageDetails && (
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                borderRadius: 2,
                backgroundColor: '#f9f9f9',
                mt: 4,
                border: '1px solid #09a865'
              }}
            >
              <Typography variant="h6" gutterBottom>
                Pricing Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="primary" className='mb-2'>
                    Price
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {selectedPackageDetails.zoneId.currency} {selectedPackageDetails.vehiclePrices.find((vp: any) => vp.vehicleId.id === selectedVehicle)?.price ?? '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="primary" className='mb-2'>
                    Grace Time
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {selectedPackageDetails.vehiclePrices.find((vp: any) => vp.vehicleId.id === selectedVehicle)?.graceTime ?? '-'} mins
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="primary" className='mb-2'>
                    Extra {selectedPackageDetails.zoneId.unit} Price
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {selectedPackageDetails.zoneId.currency} {selectedPackageDetails.vehiclePrices.find((vp: any) => vp.vehicleId.id === selectedVehicle)?.extraKmPrice ?? '-'} / {selectedPackageDetails.zoneId.unit}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}

    </div>
  );
};

export default TripDetails;
