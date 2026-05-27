/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useEffect, useState } from 'react';

import { useRouter,useParams } from 'next/navigation';

import Button from '@mui/material/Button';

import { MenuItem } from '@mui/material';

import { toast } from 'react-toastify';

import CustomTextField from '@core/components/mui/TextField'

import UserDetails from './userDetails';
import TripDetails from './TripDetails';
import VehicleDetails from './VehicleDetails';
import MapComponent from './MapComponent';
import { createRequest, requestEta } from '@/app/api/apps/taxi/request';
import { createUserForDispatcher } from '@/app/api/apps/taxi/user';
import { useSettings } from '@/@core/hooks/useSettings';
import DriverDetails from './DriverShow';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';
import { fetchRoles } from '@/app/api/apps/taxi/role';

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

const RideBookingComponent: React.FC<any> = ({ dictionary ,zoneId}) => {

  const router = useRouter();

  const { updateSettings, settings } = useSettings()
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<string>('local');
  const [pickPoint, setPickPoint] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [dropPoint, setDropPoint] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [stopPoint, setStopPoint] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [tripDetails, setTripDetails] = useState<any>(null);
  const [zoneDetails, setZoneDetails] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>({});
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
  const [countries, setCountries] = useState<{ id: string; name: string; dial_code: string; phoneLength: number }[]>([])
  const [selectedDialCode, setSelectedDialCode] = useState<string | null>(null)
  const [isNewUser, setIsNewUser] = useState(false)
    const[openPopup,setOpenPopup] = useState(false)


  useEffect(() => {
  const loadCountries = async () => {
    try {
      const countryList =
        await fetchActiveCountry()

      setCountries(countryList || [])
    } catch (error) {
      console.error(
        'Failed to load countries',
        error
      )
    }
  }

  loadCountries()
}, [])

  useEffect(() => {
    updateSettings({ layout: 'collapsed' });
  }, []);


useEffect(() => {
  const phone = String(
    userDetails?.passengerNumber || ''
  ).replace(/\D/g, '')

  const selectedCountry = countries.find(
    c => c.id === userDetails?.countryId
  )

  const requiredLength = Number(selectedCountry?.phoneLength || 0)

  const hasValidPhone = requiredLength > 0 && phone.length === requiredLength

  const hasName = Boolean(String(userDetails?.passengerName || '').trim())

  const hasCountry = Boolean(userDetails?.dialCode)

  // ✅ Email Validation Logic
  const emailValue = String(userDetails?.passengerEmail || '').trim()

  const hasValidEmail = isNewUser
  ? /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailValue)
  : true

  const isValid = hasValidPhone && hasName && hasCountry && hasValidEmail

  setUserDetailsCompleted(isValid)
}, [userDetails, countries, isNewUser])

const CreatNewUser = async (data: any,zoneId:string) => {
      setLoading(true)

     try {

        const roles = await fetchRoles()

        const userRoleIds = Array.isArray(roles)
          ? roles
              .filter((item: any) => String(item?.role || '').toLowerCase() === 'user')
              .map((item: any) => item?.id)
              .filter(Boolean)
          : []


        if (!userRoleIds.length) {
          toast.error('Unable to create user: User role not found.')

          return
        }

    const payload ={
      firstName : data?.passengerName,
      phoneNumber : data?.passengerNumber,
      email : data?.passengerEmail,
      countryCode : data?.countryId,
      roleIds: userRoleIds,
      active: true,
    }

    const response = await createUserForDispatcher(payload,zoneId)

    if(response.success){
      toast.success("user created successfully!")
      setIsNewUser(false)

      return true
    }else{
      toast.error(response)

      return false
    }

  } catch (error) {
    console.error('Create user failed:', error)

    return null
  }finally{
    setLoading(false)
  }
}

  const handleZoneChange = (zone: any) => {

    setUserDetails((prev: any) => ({ ...prev, zoneId: zone.id || zone._id })); // Update user details
    setZoneDetailsCompleted(true);
    setSelectedZone(zone);
    setLoadingData(true);

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

         if (isNewUser) {

               const data: any = await CreatNewUser(userDetails,zoneId)

               if (data) {
                 setCurrentStep(1)
               } else {
                 setCurrentStep(0)
               }

              return
           }

           setCurrentStep(1)
    } else if (currentStep === 1 && tripDetailsCompleted) {

      const formattedTripDetails = transformTripDetails(tripDetails);

      try {
        const requestEtaData = await requestEta(formattedTripDetails);

        if(requestEtaData.success === false){
          toast.error(requestEtaData.message || "Something went wrong while fetching ETA details.");

          return
        }

        setCurrentStep(2);
        setEtaDetails(requestEtaData);
      } catch (error) {
        toast.error(dictionary['navigation'].failedToFetchData);
        console.error('Error fetching data:', error);
      }



    }
  };

  const createRequestpDetails = (tripDetails: any, serviceType: any, selectedVehicleData: any) => {

    const isLater = tripDetails?.rideTime === 'rideLater'

    const tripTime =
      isLater && tripDetails?.dateTime
        ? new Date(tripDetails.dateTime).getTime()
        : null

    // Transforming the stops to the required format
    const stops = tripDetails.stops.map((stop: string) => {
      return {
        latitude: tripDetails.stopCoordinates.lat,
        longitude: tripDetails.stopCoordinates.lng,
        address: stop
      };
    });

    // Rental is pickup only; backend still expects drop fields so we send pickup for drop
    const isRental = serviceType.toUpperCase() === 'RENTAL'
    const dropLat = isRental ? tripDetails.pickCoordinates?.lat : tripDetails.dropCoordinates?.lat
    const dropLng = isRental ? tripDetails.pickCoordinates?.lng : tripDetails.dropCoordinates?.lng
    const dropAddress = isRental ? tripDetails.pickupPoint || '' : tripDetails.dropPoint
    const RentalDuration = isRental ? tripDetails?.rentalDuration : 0


    const data:any = {
      userId: userId,
      drop_lat: dropLat,
      drop_lng: dropLng,
      drop_address: dropAddress,
      pick_lat: tripDetails.pickCoordinates.lat,
      pick_lng: tripDetails.pickCoordinates.lng,
      pick_address: tripDetails.pickupPoint,
      booking_for: "OTHERS",
      payment_opt: "CASH",

      stops: stops,
      ride_type: isLater ? 'RIDE_LATER' : 'RIDE_NOW',
      tripTime: tripTime,

      trip_type: serviceType.toUpperCase(),
      vehicle_type: selectedVehicleData._id || selectedVehicleData.id,
      estimatedAmount :selectedVehicleData.price.toFixed(2) || 0,
      ...(tripDetails.tripType === "manual" && { driverId: driverId })
    }

    if(isRental){
       data.rentalDuration = RentalDuration
    }


    return data;
  };



    const transformTripDetails= (input: any) => {
    // Check if dateTime is available or fallback to current date/time
    let rideDate, rideTime

    if (input.dateTime) {
      const dateTime = new Date(input.dateTime)

      rideDate = dateTime.toISOString().split('T')[0] // Extract date part
      rideTime = dateTime.toISOString().split('T')[1].split('.')[0] // Extract time part
    } else {
      // If no dateTime, use current date and time
      const currentDate = new Date()

      rideDate = currentDate.toISOString().split('T')[0] // Current date
      rideTime = currentDate.toISOString().split('T')[1].split('.')[0] // Current time
    }

    // Transforming the stops to the required format expected by mobile ETA
    const stops =
      Array.isArray(input.stops) && input.stops.length
        ? input.stops.map((stop: string) => ({
          latitude: input.stopCoordinates?.lat || 0,
          longitude: input.stopCoordinates?.lng || 0,
          address: stop
        }))
        : []

    // Rental = pickup only; use pickup as drop for ETA so backend gets valid coords
    const isRentalEta = String(serviceType || '').toLowerCase() === 'rental'
    const dropLatEta = isRentalEta ? (input.pickCoordinates?.lat || 0) : (input.dropCoordinates?.lat || 0)
    const dropLngEta = isRentalEta ? (input.pickCoordinates?.lng || 0) : (input.dropCoordinates?.lng || 0)
    const dropAddressEta = isRentalEta ? (input.pickupPoint || '') : (input.dropPoint || '')

    return {
      ride_date: rideDate,
      drop_lat: dropLatEta,
      drop_long: dropLngEta,
      drop_address: dropAddressEta,
      pick_lat: input.pickCoordinates?.lat || 0,
      pick_lng: input.pickCoordinates?.lng || 0,
      pickup_address: input.pickupPoint,
      ride_time: rideTime,
      promo_code: input.promoCode,
      rentalDuration:input.rentalDuration || 0,
      stops,



      // Mobile expects ride_type as RIDE_NOW / RIDE_LATER
      ride_type: input.rideTime === 'rideLater' ? 'RIDE_LATER' : 'RIDE_NOW',

      // Tell ETA which trip type we are pricing (LOCAL / RENTAL)
      trip_type: String(serviceType || '').toUpperCase(),

      // Rental ETA may depend on the selected package
      ...(String(serviceType || '').toLowerCase() === 'rental' && input.packageId ? { packageId: input.packageId } : {}),

      // For dispatcher ETA, tell backend which passenger to price for.
      // Mobile does not send this field; web-only and ignored by mobile APIs.
      userIdForEta: userId

      // NOTE: trip_type (LOCAL / RENTAL) is NOT required by ETA API and
      // must remain unchanged on the backend. All three trip types share the same
      // /eta endpoint, identical to mobile.
    }
  }



  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {

    setLoading(true); // Set loading to true

    // Show loading toast
    const toastId = toast.loading("Submitting your data...");

    const CreateRequestDetails = createRequestpDetails(
      tripDetails,
      serviceType,
      selectedVehicleData
    );

    console.log({CreateRequestDetails});

    try {
      const dispatcherCreate = await createRequest(CreateRequestDetails);

      if (dispatcherCreate) {

        if(tripDetails.trip_type === 'RIDE_LATER'){

            router.push(`/${zoneId}/apps/taxi/request/ridelater`);
        }else {

            router.push(`/${zoneId}/apps/taxi/request/ridenow`);
        }

        toast.success("Dispatcher created successfully!");
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
            onDialCodeChange={(dial) => {
              setUserDetails((prev: any) => ({
                ...prev,
                dialCode: dial
              }))
            }}
            onEmailChange={(value) => {
              setUserDetails((prev: any) => ({ ...prev, passengerEmail: value })); // Update user details
              setUserDetailsCompleted(true);
            }}


            onCountryChange={(countryId) => {
              setUserDetails((prev: any) => ({
                ...prev,
                countryId
              }))
            }}
            isNewUser={isNewUser}
            onNewUserChange={setIsNewUser}
            onUserId={handleUserIdChange}
            onZoneChange={handleZoneChange}
            userDetails={userDetails}
            isLoadingData={loading}
            dictionary={dictionary}
            zoneId={zoneId}
          />
        )}

        {/* Trip Details Section */}
        {currentStep === 1 && (
          <TripDetails
            serviceType={serviceType}
            zoneDetails={selectedZone}
            zoneId={zoneId}
            userDetails={userDetails}
            onPickPointChange={setPickPointLocation}
            onDropPointChange={setDropPointLocation}
            onStopPointChange={setStopPointLocation}
            pickupDetails={pickPoint}
            dictionary={dictionary}
            setTripDetails={(details) => {
              const isValid = details.pickupPoint && details.dropPoint;

              if (JSON.stringify(tripDetails) !== JSON.stringify(details)) {
                setTripDetails(details);
                setTripDetailsCompleted(isValid);
              }
            }}
            tripDetails={tripDetails}
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
            {dictionary['navigation'].Back}
          </Button>
          {currentStep < 2 ? (
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
            >
              {dictionary['navigation'].Submit}
            </Button>
          )}
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
          isLoadingData={loadingData}
          setOpenPopup={setOpenPopup}
          dictionary={dictionary} />
      </div>
      {tripDetails?.tripType == "manual" && selectedVehicleData && (
        <div className="w-96 p-4 shadow-lg overflow-y-auto" style={{ width: '27%' }}>
          <DriverDetails
            zoneDetails={zoneDetails}
            selectedVehicle={selectedVehicleData}
            onDriverChange={setOnDriverChange}
          />
        </div>
      )}
           <Dialog
  open={openPopup}
  onClose={() => setOpenPopup(false)}
>
  <DialogTitle>
    {dictionary['navigation']?.PickupOutsideZone ||'Pickup Outside Zone'}
  </DialogTitle>

  <DialogContent>
    <DialogContentText>
      {dictionary['navigation']?.Pickuplocationisoutsidetheselectedzone ||'Pickup location is outside the selected zone.'}
    </DialogContentText>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setOpenPopup(false)}
      color='primary'
      variant='contained'
    >
      {dictionary['navigation']?.OK ||'OK'}
    </Button>
  </DialogActions>
</Dialog>
    </div>
  );
};

export default RideBookingComponent;
