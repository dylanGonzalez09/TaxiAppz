// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import DriverDetails from './DriverDetails'

interface UserData {
  id: string;
  tripsCount: number;
  rating: number;
  active: boolean;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleIds: string[];
  avatar: string | null;
  profilePic: string | null;
}

// Define props for UserLeftOverview
interface UserLeftOverviewProps {
  userData: UserData;  // Pass userData as props
  dictionary: any;
}

const DriverLeftOverview: React.FC<UserLeftOverviewProps> = ({ userData ,dictionary}) =>{
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <DriverDetails  userData={userData} dictionary={dictionary}/>
      </Grid>
    </Grid>
  )
}

export default DriverLeftOverview
