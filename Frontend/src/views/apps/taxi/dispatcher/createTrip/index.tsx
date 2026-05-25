/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Button from '@mui/material/Button';

import { MenuItem } from '@mui/material';

import { toast } from 'react-toastify';

import CustomTextField from '@core/components/mui/TextField'

import UserDetails from './userDetails';
import TripDetails from './TripDetails';
import VehicleDetails from './VehicleDetails';
import MapComponent from './MapComponent';
import { createRequest, requestEta } from '@/app/api/apps/taxi/request';
import { useSettings } from '@/@core/hooks/useSettings';
import DriverDetails from './DriverShow';


const RideBookingComponent: React.FC<any> = ({ dictionary }) => {

  const router = useRouter();

  const { updateSettings, settings } = useSettings()
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<string>('local');
  const [pickPoint, setPickPoint] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [dropPoint, setDropPoint] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [stopPoint, setStopPoint] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [zoneDetails, setZoneDetails] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [etaDetails, setEtaDetails] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userDetailsCompleted, setUserDetailsCompleted] = useState<boolean>(false);
  const [tripDetailsCompleted, setTripDetailsCompleted] = useState<boolean>(false);
  const [selectedZone, setSelectedZone] = useState<any>(null); // State for storing the selected zone
  const [selectedVehicleData, setVehicleData] = useState<number | null>(null);
  const [userId, setUserId] = useState<any>(null);
  const [driverId, setDriverId] = useState<any>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [loadingData, setLoadingData] = useState(false); // Loading state
  const [zoneDetailsCompleted, setZoneDetailsCompleted] = useState<boolean>(false);
  const [driverError, setDriverError] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [rentalSelectedVehicle, setRentalSelectedVehicle] = useState<any>(null);

  useEffect(() => {
    updateSettings({ layout: 'collapsed' });
  }, []);

  const handleZoneChange = (zone: any) => {

    setUserDetails((prev: any) => ({ ...prev, zoneId: zone._id })); // Update user details
    setZoneDetailsCompleted(true);
    setSelectedZone(zone);
    setLoadingData(true);

  };

  const handleNewUserChange = (value: boolean) => {
    setIsNewUser(value);
  };


  const handleUserIdChange = (userId: any) => {
    setUserId(userId);
  };

  const setSelectedVehicleSelect = (vehicle: any) => {
    setVehicleData(vehicle);
  };

  const setDropPointLocation = (dropLocation: { lat: number; lng: number }) => {
    setDropPoint(dropLocation);
  };

  const setStopPointLocation = (stopLocation: { lat: number; lng: number }) => {
    setStopPoint(stopLocation);
  };

  const setOnDriverChange = (driverId: any) => {
    setDriverId(driverId);
  };

  const setPickPointLocation = (pickuplocation: { lat: number; lng: number }) => {
    setPickPoint(pickuplocation);
  };

  const setZoneLocation = (message: any) => {
    setZoneDetails(message);
  };

  const handleNext = async () => {
    if (currentStep === 0 && userDetailsCompleted) {
      setCurrentStep(1);
    } 
    else if (currentStep === 1 && tripDetailsCompleted && serviceType === 'local') {
      const formattedTripDetails = transformTripDetails(tripDetails);

      try {
        const requestEtaData = await requestEta(formattedTripDetails);
        
        if (!requestEtaData.success) {
          toast.error(requestEtaData.message);

          return;
        }

        setEtaDetails(requestEtaData.data);
        setCurrentStep(2);
      } catch (error) {
        toast.error(dictionary['navigation'].failedToFetchData);
        console.error('Error fetching data:', error);
      }
    }
  };

  const createRequestpDetails = (tripDetails: any, serviceType: any, selectedVehicleData: any) => {
    let rideDate, rideTime,dateTime;

    if(serviceType === 'local' && !selectedVehicleData)
    {
      toast.error('Kindly select any one vehicle');
      
return null;
    }

    if (tripDetails.dateTime) {
       dateTime = new Date(tripDetails.dateTime).getTime();

      // rideDate = dateTime.toISOString().split('T')[0]; // Extract date part
      // rideTime = dateTime.toISOString().split('T')[1].split('.')[0]; // Extract time part
    } else {
      const currentDate = new Date();

      dateTime = new Date().getTime();

      // rideDate = currentDate.toISOString().split('T')[0]; // Current date
      // rideTime = currentDate.toISOString().split('T')[1].split('.')[0]; // Current time
    }

    // Transforming the stops to the required format
    // const stops = tripDetails.stops.map((stop: string) => {
    //   return {
    //     latitude: tripDetails.stopCoordinates.lat,
    //     longitude: tripDetails.stopCoordinates.lng,
    //     address: stop
    //   };
    // });

    let stops = {};

    if(serviceType === 'local')
    {
      stops = {
        latitude: tripDetails.stopCoordinates.lat || null,
        longitude: tripDetails.stopCoordinates.lng || null,
        address: tripDetails.stopPoint || null
      };
    }

    const data: any = {
      // userId: userId,
      pick_lat: tripDetails.pickCoordinates.lat,
      pick_lng: tripDetails.pickCoordinates.lng,
      pick_address: tripDetails.pickupPoint,

      // booking_for: "OTHERS",
      payment_opt: "CASH",
      ride_type: tripDetails.rideTime === 'rideLater' ? 'RIDE_LATER' : 'RIDE_NOW',
      trip_type: serviceType.toUpperCase(),
      manual_trip: tripDetails.tripType.toUpperCase(),
      ...(tripDetails.tripType === "manual" && { driverId: driverId }),
      promo_code: tripDetails.promoCode,
      ride_date: dateTime
    }

    if(serviceType === 'local')
    {
      data.drop_lat = tripDetails.dropCoordinates.lat;
      data.drop_lng = tripDetails.dropCoordinates.lng;
      data.drop_address = tripDetails.dropPoint;
      data.stops = stops;
      data.vehicle_type = selectedVehicleData?._id;
      data.etaAmount = selectedVehicleData?.price;
    }

    if(serviceType === 'rental')
    {
      data.packageId = tripDetails.packageId;
      data.vehicle_type = tripDetails.vehicleId || rentalSelectedVehicle?._id;
    }

    if (isNewUser) {
      data.passengerName = userDetails?.passengerName;
      data.passengerNumber = userDetails?.passengerNumber;
    } else {
      data.userId = userId;
    }

    
return data;
  };


  // Function to map the format
  const transformTripDetails = (input: any) => {
    // Check if dateTime is available or fallback to current date/time
    let rideDate, rideTime;

    if (input.dateTime) {
      const dateTime = new Date(input.dateTime);

      rideDate = dateTime.toISOString().split('T')[0]; // Extract date part
      rideTime = dateTime.toISOString().split('T')[1].split('.')[0]; // Extract time part
    } else {
      // If no dateTime, use current date and time
      const currentDate = new Date();

      rideDate = currentDate.toISOString().split('T')[0]; // Current date
      rideTime = currentDate.toISOString().split('T')[1].split('.')[0]; // Current time
    }

    // Transforming the stops to the required format
    // const stops = input.stops.map((stop: string) => {
    //   return {
    //     latitude: input.stopCoordinates.lat,
    //     longitude: input.stopCoordinates.lng,
    //     address: stop
    //   };
    // });
    const stops = {
      latitude: input.stopCoordinates.lat,
      longitude: input.stopCoordinates.lng,
      address: input.stopPoint
    };

    return {
      ride_date: rideDate,
      drop_lat: input.dropCoordinates.lat,
      drop_long: input.dropCoordinates.lng,
      drop_address: input.dropPoint,
      pick_lat: input.pickCoordinates.lat,
      pick_lng: input.pickCoordinates.lng,
      pickup_address: input.pickupPoint,
      ride_time: rideTime,
      promo_code: input.promoCode,
      stops: stops, // Transform the stops into the required format
      ride_type: input.rideTime === 'rideLater' ? 'RIDE_LATER' : 'RIDE_NOW'
    };
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {

    if (tripDetails?.tripType === "manual" && !driverId) {
      setDriverError(true);
      
return;
    }

    setDriverError(false); 
    setLoading(true); // Set loading to true

    // Show loading toast
   
    const CreateRequestDetails = createRequestpDetails(
      tripDetails,
      serviceType,
      selectedVehicleData
    );

    if (!CreateRequestDetails) {
      setLoading(false);
      
return;
    }

    const toastId = toast.loading("Submitting your data...");

    try {
      const dispatcherCreate = await createRequest(CreateRequestDetails);

      console.log(dispatcherCreate);

      if (dispatcherCreate && dispatcherCreate.rideType === 'RIDE_NOW') {
        router.push('/apps/taxi/request/ridenow');
        toast.success("Ride created successfully!");
        setLoading(false);
      }
      else if(dispatcherCreate && dispatcherCreate.rideType === 'RIDE_LATER')
      {
        toast.success("Your ride scheduled successfully!");
        router.push('/apps/taxi/request/ridelater');
        setLoading(false);
      }
      else
      {
        toast.error("No Driver Found");
        setLoading(false);
      }

    } catch (error) {
      toast.error("Error creating zone. Please try again.");
      console.error("Error creating zone:", error);
    } finally {
      setLoading(false);
      toast.dismiss(toastId); // Dismiss the loading toast
    }

  };

  return (
    <div className="flex min-h-screen">
      <div className="w-96 p-4 shadow-lg overflow-y-auto" style={{ width: '27%' }}>
        <div className="flex justify-end mb-4">

          <CustomTextField
            select
            fullWidth
            value={serviceType}
            onChange={(e) => {
              setServiceType(e.target.value);
              setUserDetailsCompleted(false);
              setZoneDetailsCompleted(false);
              setTripDetailsCompleted(false);
              setSelectedVehicle(null);
              setCurrentStep(0);
            }}
            variant="standard" // Keep the variant if needed
            style={{ width: '35%' }} // Adjust width as necessary
          >
            <MenuItem value="local">{dictionary['navigation'].Local}</MenuItem>
            <MenuItem value="rental">{dictionary['navigation'].Rental}</MenuItem>
            <MenuItem value="outstation">{dictionary['navigation'].Outstation}</MenuItem>
          </CustomTextField>

        </div>

        {/* User Details Section */}
        {currentStep === 0 && (
          <UserDetails
            onPassengerChange={(value) => {
              setUserDetails((prev: any) => ({ ...prev, passengerNumber: value })); // Update user details with passenger number
              setUserDetailsCompleted(true);
            }}
            onNameChange={(value) => {
              setUserDetails((prev: any) => ({ ...prev, passengerName: value })); // Update user details
              setUserDetailsCompleted(true);
            }}
            onUserId={handleUserIdChange}
            onZoneChange={handleZoneChange}
            userDetails={userDetails}
            isLoadingData={loading}
            dictionary={dictionary}
            onIsNewUserChange={handleNewUserChange}
          />
        )}

        {/* Trip Details Section */}
        {currentStep === 1 && (
          <TripDetails
            serviceType={serviceType}
            zoneDetails={selectedZone}
            onPickPointChange={setPickPointLocation}
            onDropPointChange={setDropPointLocation}
            onStopPointChange={setStopPointLocation}
            pickupDetails={pickPoint}
            setTripDetails={(details) => {
              // const isValid = details.pickupPoint && details.dropPoint && (details.rideTime !== 'rideLater' || (!!details.dateTime && ((new Date(details.dateTime).getTime() - Date.now()) / (1000 * 60)) >= 30));
              let isValid = false;

              const hasValidDateTime =
                details.rideTime !== 'rideLater' ||
                (!!details.dateTime && ((new Date(details.dateTime).getTime() - Date.now()) / (1000 * 60)) >= 30);

              if (serviceType === 'local') {
                isValid = !!details.pickupPoint && !!details.dropPoint && hasValidDateTime;
              } else if (serviceType === 'rental') {
                isValid = !!details.pickupPoint && !!details.packageId && !!details.vehicleId && hasValidDateTime;
              }

              // const hasChanged = !tripDetails || 
              //   tripDetails.pickupPoint !== details.pickupPoint ||
              //   tripDetails.dropPoint !== details.dropPoint ||
              //   tripDetails.packageId !== details.packageId ||
              //   tripDetails.vehicleId !== details.vehicleId ||
              //   tripDetails.rideTime !== details.rideTime ||
              //   tripDetails.dateTime !== details.dateTime ||
              //   tripDetails.tripType !== details.tripType;
              const hasChanged =
                !tripDetails ||
                JSON.stringify(tripDetails) !== JSON.stringify(details);

              if (hasChanged) {
                setTripDetails(details);
                setTripDetailsCompleted(isValid);
              }
              
              // if (JSON.stringify(tripDetails) !== JSON.stringify(details)) {
              //   setTripDetails(details);
              //   setTripDetailsCompleted(isValid);
              // }
            }}
            tripDetails={tripDetails}
            onRentalVehicleSelect={(vehicle: any) => {
              if (serviceType === 'rental') {
                setRentalSelectedVehicle(vehicle);
              }
            }}
          />
        )}

        {/* Vehicle Details Section */}
        {currentStep === 2 && tripDetailsCompleted && (
          <VehicleDetails
            requestEtaData={etaDetails}
            selectedVehicle={selectedVehicle}
            SelectedonVehicleSelect={setSelectedVehicleSelect}
            onVehicleSelect={setSelectedVehicle}
            tripDetails={tripDetails}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          {/* {currentStep < 2 && serviceType === 'local' ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !userDetailsCompleted) || (currentStep === 0 && !zoneDetailsCompleted) ||
                (currentStep === 1 && !tripDetailsCompleted) 
              }
            >
              {dictionary['navigation'].Next}
            </Button>
          ) : (
            <Button
              variant="contained"
              style={{ backgroundColor: '#4CAF50' }}
              onClick={handleSubmit}
              disabled={
                (currentStep === 1 && serviceType === 'rental' && !tripDetailsCompleted)
              }
            >
              {dictionary['navigation'].Submit}
            </Button>
          )} */}
          {(() => {
            const isLastStep =
              (serviceType === 'local' && currentStep === 2) ||
              (serviceType === 'rental' && currentStep === 1);

            const isNextDisabled =
              (currentStep === 0 && (!userDetailsCompleted || !zoneDetailsCompleted)) ||
              (currentStep === 1 && !tripDetailsCompleted);

            const isSubmitDisabled =
              (serviceType === 'rental' && currentStep === 1 && !tripDetailsCompleted)

            return isLastStep ? (
              <Button
                variant="contained"
                style={{ backgroundColor: '#4CAF50' }}
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {dictionary['navigation'].Submit}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isNextDisabled}
              >
                {dictionary['navigation'].Next}
              </Button>
            );
          })()}
        </div>
      </div>

      <div className="flex-1 p-4 relative">
        <MapComponent
          onPickPointChange={setPickPointLocation}
          onDropPointChange={setDropPointLocation}
          onStopPointChange={setStopPointLocation}
          onZoneChange={setZoneLocation}
          pickupDetails={pickPoint}
          dropDetails={dropPoint}
          stopDetails={stopPoint}
          zoneDetails={selectedZone}
          isLoadingData={loadingData} />
      </div>
      {tripDetails?.tripType === "manual" && (selectedVehicleData || rentalSelectedVehicle) && (
        <div className="w-96 p-4 shadow-lg overflow-y-auto" style={{ width: '27%' }}>
          <DriverDetails
            zoneDetails={zoneDetails}
            selectedVehicle={selectedVehicleData || rentalSelectedVehicle}
            onDriverChange={setOnDriverChange}
            isValidationError={driverError}
          />
        </div>
      )}
    </div>
  );
};

export default RideBookingComponent;
