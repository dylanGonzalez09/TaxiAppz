
import Grid from '@mui/material/Grid';

import UserProfileHeader from './UserProfileHeader';

const UserProfile = ({ dictionary, data,zoneId }: { dictionary: any; data: any,zoneId:any }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserProfileHeader profileData={data} dictionary={dictionary} zoneId={zoneId} />
      </Grid>
    </Grid>
  );
};

export default UserProfile;
