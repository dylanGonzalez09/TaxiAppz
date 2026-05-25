import Grid from '@mui/material/Grid';

import UserDetails from './UserDetails';

// Define the type for user data
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

const UserLeftOverview: React.FC<UserLeftOverviewProps> = ({ userData , dictionary}) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {/* Pass userData to UserDetails */}
        <UserDetails userData={userData}  dictionary={dictionary}/>
      </Grid>
    </Grid>
  );
};

export default UserLeftOverview;
