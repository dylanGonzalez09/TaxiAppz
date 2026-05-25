// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import CorporateCompanyForm from '@/views/apps/taxi/corporatecompany/addeditcorporatecompany/CorporateCompanyForm'


const AddCompanyApp = async ({ params }: { params: { lang: Locale } }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dictionary = await getDictionary(params.lang);

  return (
    <Grid container>
      <Grid item xs={12}>
        <CorporateCompanyForm  dictionary={dictionary}/>
      </Grid>
    </Grid>
  );
};

export default AddCompanyApp;
