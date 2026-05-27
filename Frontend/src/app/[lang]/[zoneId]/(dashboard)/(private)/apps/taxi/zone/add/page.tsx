// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import AddAction from '@views/apps/taxi/zone/add/AddAction';

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { fetchSettings } from '@/app/api/apps/taxi/setting';

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

const ZoneApp = async ({ params }: { params: { lang: Locale } }) => {


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dictionary = await getDictionary(params.lang);
  const lang = params.lang;

  const settings = await fetchSettings();

  const general = settings.find((item: any) => item._id === 'modules')
  
  const subscriptionDetails = general?.settings.find((s: any) => s.name === 'subScription')?.value || "no"

  return (
    <Grid container>
      <Grid item xs={12}>
        <AddAction lang={lang} dictionary={dictionary} subscriptionDetails={subscriptionDetails} />
      </Grid>
    </Grid>
  );
};

export default ZoneApp;
