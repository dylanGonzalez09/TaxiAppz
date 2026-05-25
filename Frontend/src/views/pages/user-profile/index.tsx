
import Grid from '@mui/material/Grid';

import UserProfileHeader from './UserProfileHeader';

const UserProfile = ({ dictionary, data }: { dictionary: any; data: any }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserProfileHeader profileData={data} dictionary={dictionary} />
      </Grid>
    </Grid>
  );
};

export default UserProfile;
