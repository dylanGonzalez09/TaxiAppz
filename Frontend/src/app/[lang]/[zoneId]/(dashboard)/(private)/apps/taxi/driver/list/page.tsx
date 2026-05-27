// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import DriverList from '@views/apps/taxi/driver/list';

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getDriverByPagination } from '@/app/api/apps/taxi/driver';
import { fetchSettings } from '@/app/api/apps/taxi/setting';



const DriverApp = async ({
  params,
  searchParams
}: {
  params: { lang: Locale, zoneId: string };
  searchParams?: { page?: string; pageSize?: string; search?: string };
}) => {
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = Math.min(100, Math.max(5, parseInt(searchParams?.pageSize || '10', 10)));
  const search = searchParams?.search || '';
  const data = await getDriverByPagination(search, page, pageSize, params.zoneId,'All');

  const dictionary = await getDictionary(params.lang);

  const settings = await fetchSettings();

  const general = settings.find((item: any) => item._id === 'modules')

  const subscriptionDetails = general?.settings.find((s: any) => s.name === 'subScription')?.value || "no"

  return <Grid container>
    <Grid item xs={12}>
      <DriverList driverData={data} dictionary={dictionary} showAddButton={true} showActionButton={true} subscriptionDetails={subscriptionDetails} zoneId={params.zoneId} />
    </Grid>
  </Grid>
};

export default DriverApp;
