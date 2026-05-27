// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import DriverList from '@views/apps/taxi/driver/list';

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getDriverByPagination } from '@/app/api/apps/taxi/driver';
import { getmoduleSetting } from '@/app/api/apps/taxi/setting';


/**
 * Note: If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * `.env` file found at the root of your project, and update the API endpoints like `/apps/invoice` in the example.
 * Also, remove the server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * because we've used the server action for getting our static data.
 */

/* const getInvoiceData = async () => {
  const res = await fetch(`${process.env.API_URL}/apps/invoice`);
  if (!res.ok) {
    throw new Error('Failed to fetch invoice data');
  }
  return res.json();
} */

const DriverApp = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const data = await getDriverByPagination("", 1, 10, zoneId,'All');
  const dictionary = await getDictionary(params.lang);
  const moduleSettings = await getmoduleSetting();

  const subscriptionDetails = Array.isArray(moduleSettings)
    ? moduleSettings.find((item: any) => item?.name === 'subScription')?.value || 'no'
    : moduleSettings?.subScription ??
      moduleSettings?.settings?.find((s: any) => s?.name === 'subScription')?.value ??
      'no';

  return <Grid container>
    <Grid item xs={12}>
      <DriverList
        driverData={data}
        dictionary={dictionary}
        showAddButton={false}
        showActionButton={false}
        subscriptionDetails={subscriptionDetails}
        zoneId={zoneId}
      />
    </Grid>
  </Grid>
};

export default DriverApp;
