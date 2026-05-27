// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import RequestDetailHeader from './RequestDetailHeader';
import TripDetailsCard from './TripDetailsCard';
import TripTimeDetails from './TripTimeDetailsCard';
import CustomerDetails from './CustomerDetailsCard';
import VehicleDetailsgAddress from './VehicleDetailsCard';
import AddressCard from './AddressCard';
import MapCard from "./MapCard"



const RequestTable = ({ requestData,dictionary }: { requestData?: any,dictionary:any }) => {



const tripEvents = requestData.map((request: any) => {
  const events = [
    {
      key: 'accepted',
      label: dictionary.navigation.TripAcceptedTime,
      time: request.acceptedAt && new Date(request.acceptedAt).toLocaleString()
    },
    {
      key: 'arrived',
      label: dictionary.navigation.TripArrivedTime,
      time: request.arrivedAt && new Date(request.arrivedAt).toLocaleString()
    },
    {
      key: 'started',
      label: dictionary.navigation.TripStartTime,
      time: request.tripStartTime && new Date(request.tripStartTime).toLocaleString()
    },
    {
      key: 'completed',
      label: dictionary.navigation.TripCompletedTime,
      time: request.completedAt && new Date(request.completedAt).toLocaleString()
    },
    {
      key: 'cancelled',
      label: dictionary.navigation.TripCancelTime,
      time: request.cancelledAt && new Date(request.cancelledAt).toLocaleString()
    }
  ];

  const validEvents = events.filter(e => e.time);

  const cancelIndex = validEvents.findIndex(e => e.key === 'cancelled');

  if (cancelIndex !== -1) {
    return validEvents.slice(0, cancelIndex + 1);
  }

  return validEvents;
}).flat();


  const initialCoordinates = [{lat: requestData[0]?.pickLat, lng: requestData[0]?.pickLng},
    {lat: requestData[0]?.dropLat, lng: requestData[0]?.dropLng}
  ];


  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
      <RequestDetailHeader requestData={requestData} order={requestData[0]?.requestNumber ?? ""} dictionary={dictionary} />
      </Grid>
      <Grid item xs={12} md={8}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <TripDetailsCard requestData={requestData} dictionary={dictionary} />
          </Grid>
          <Grid item xs={12}>
            <MapCard
              initialCoordinates={initialCoordinates}
              requestId={requestData?.[0]?._id}
              initialDriverPosition={{
                lat: requestData?.[0]?.driverCurrentLat,
                lng: requestData?.[0]?.driverCurrentLng,
              }}
              initialUserPosition={{
                lat: requestData?.[0]?.pickLat,
                lng: requestData?.[0]?.pickLng,
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={4}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <CustomerDetails requestData={requestData} dictionary={dictionary}/>
          </Grid>
          <Grid item xs={12}>
            <VehicleDetailsgAddress requestData={requestData} dictionary={dictionary} />
          </Grid>
          <Grid item xs={12}>
            <AddressCard requestData={requestData}  dictionary={dictionary}/>
          </Grid>
          <Grid item xs={12}>
            <TripTimeDetails events={tripEvents}  dictionary={dictionary} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RequestTable;
