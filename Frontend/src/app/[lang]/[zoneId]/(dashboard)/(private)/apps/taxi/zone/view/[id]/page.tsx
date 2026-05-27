// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports

// Data Imports
import { getDictionary } from '@/utils/getDictionary';

import ViewTable from '@/views/apps/taxi/zone/view/ViewAction';


const ZoneView = async ({ params }: { params: { lang: any; id: string; } }) => {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dictionary = await getDictionary(params.lang);

      const id = String(params.id);

  const lang = params.lang;

  return (
    <Grid container>
      <Grid item xs={12}>
        <ViewTable zoneId={id} lang={lang} dictionary={dictionary}/>
      </Grid>
    </Grid>
  );
};

export default ZoneView;
