// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import DriverList from '@views/apps/taxi/driver/list';

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getDriverByPagination } from '@/app/api/apps/taxi/driver';
import { fetchSettings } from '@/app/api/apps/taxi/setting';



const DriverApp = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getDriverByPagination("", 1, 10);

  const dictionary = await getDictionary(params.lang);

      const settings = await fetchSettings();

      const general = settings.find((item: any) => item._id === 'modules')

      const subscriptionDetails = general?.settings.find((s: any) => s.name === 'subScription')?.value || "no"
  
return   <Grid container>
      <Grid item xs={12}>
        <DriverList driverData={data} dictionary={dictionary} showAddButton={true} showActionButton={true}  subscriptionDetails={subscriptionDetails}/>
      </Grid>
    </Grid>
};

export default DriverApp;
