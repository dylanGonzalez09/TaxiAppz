import React from 'react';

import Grid from '@mui/material/Grid';

import { getDictionary } from '@/utils/getDictionary';

import DocumentStatusTable from '@views/apps/taxi/driver/document/DocumentActions';
import type { Locale } from '@/configs/i18n';
import { fetchDriverDocument } from '@/app/api/apps/taxi/driverDocument';



const DriverApp = async ({ params }: { params: { lang: Locale, id: any; } }) => {

  const driverId = String(params.id);
  const driverDocument = await fetchDriverDocument(driverId)
  const dictionary = await getDictionary(params.lang);
  
  return (
    <Grid container>
      <Grid item xs={12}>
        <DocumentStatusTable data={driverDocument} driverDataId={driverId} dictionary={dictionary} />
      </Grid>
    </Grid>
  );
};

export default DriverApp;
