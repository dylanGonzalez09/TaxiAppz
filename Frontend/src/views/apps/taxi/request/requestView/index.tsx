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

  const tripEvents = requestData.map((request: { acceptedAt: string | number | Date; arrivedAt: string | number | Date; tripStartTime: string | number | Date; completedAt: string | number | Date; cancelledAt: string | number | Date; }) => {
    return [
      {
        label: dictionary['navigation'].TripAcceptedTime,
        time: request.acceptedAt ? new Date(request.acceptedAt).toLocaleString() : dictionary['navigation'].notComplete
      },
      {
        label: dictionary['navigation'].TripStartTime,
        time: request.tripStartTime ? new Date(request.tripStartTime).toLocaleString() :  dictionary['navigation'].notComplete
      },
      {
        label: dictionary['navigation'].TripArrivedTime,
        time: request.arrivedAt ? new Date(request.arrivedAt).toLocaleString() :  dictionary['navigation'].notComplete
      },
      {
        label: dictionary['navigation'].TripCompletedTime,
        time: request.completedAt ? new Date(request.completedAt).toLocaleString() :  dictionary['navigation'].notComplete
      },
       {
        label: dictionary['navigation'].TripCancelTime,
        time: request.cancelledAt ? new Date(request.cancelledAt).toLocaleString() :  dictionary['navigation'].notComplete
      },
    ];
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
            <MapCard initialCoordinates={initialCoordinates} />
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
