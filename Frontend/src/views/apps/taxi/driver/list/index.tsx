// MUI Imports
import Grid from '@mui/material/Grid';

// Type Imports
// Component Imports
import DriverListTable from './DriverListTable';

const DriverList = ({ driverData, dictionary, showAddButton,showActionButton,subscriptionDetails }: { driverData?: any[]; dictionary: any, showAddButton?: boolean,showActionButton?: boolean,subscriptionDetails?: string}) => {
  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>
        <DriverCard driverData={driverData} />
      </Grid> */}
      <Grid item xs={12}>
        <DriverListTable driverData={driverData} dictionary={dictionary}  showAddButton={showAddButton} showActionButton={showActionButton}  subscriptionDetails={subscriptionDetails}/>
      </Grid>
    </Grid>
  );
};

export default DriverList;
