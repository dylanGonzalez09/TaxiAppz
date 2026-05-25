/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import ClientView from '@views/apps/taxi/client/view';
import SevenDays from '@views/apps/taxi/client/view/SevenDays';
import Renewal from '@views/apps/taxi/client/view/Renewal';



// Sample stats data for UserViewTab component
const statsHorizontalWithAvatar = [
  {
    stats: '24,983',
    title: 'No Of Drivers',
    avatarIcon: 'tabler-steering-wheel',
    avatarColor: 'primary',
  },
  {
    stats: '8,647',
    title: 'No Of users',
    avatarIcon: 'tabler-users',
    avatarColor: 'success',
  },
  {
    stats: '2,367',
    title: 'No of taxi companies',
    avatarIcon: 'tabler-award',
    avatarColor: 'error',
  },
  {
    stats: '4123',
    title: 'No of taxi corporate',
    avatarIcon: 'tabler-infinity',
    avatarColor: 'info',
  },
];

const UserViewTab = async ({ params }: { params: { lang: any; id: string } }) => {
 
  // const userId = params.id;

  return (
    <Grid container spacing={6}>
    <Grid item xs={12}>
        <ClientView data={statsHorizontalWithAvatar} />
      </Grid>  
      <Grid item xs={12} md={5}>
        <SevenDays />
      </Grid>  
      <Grid item xs={12} md={7}>
        <Renewal />
      </Grid>
    </Grid>
  );
};

export default UserViewTab;


