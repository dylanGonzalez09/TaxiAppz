// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports

// Data Imports
import type { Locale } from '@/configs/i18n';
import AddCompany from '@/views/apps/taxi/taxicompany/list/addcompany/AddCompany';
import { getDictionary } from '@/utils/getDictionary';


const AddCompanyScreen = async ({ params }: { params: { lang: Locale } }) => {
  const lang = params.lang;

  const dictionary = await getDictionary(params.lang);

  return (
    <Grid container>
      <Grid item xs={12}>
        <AddCompany lang={lang} dictionary={dictionary}/>
      </Grid>
    </Grid>
  );
};


export default AddCompanyScreen;
