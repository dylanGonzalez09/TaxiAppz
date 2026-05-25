// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import CorporateCompanyForm from '@/views/apps/taxi/corporatecompany/addeditcorporatecompany/CorporateCompanyForm'

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getByCompanyId } from '@apis/company';

const EditCompanyApp = async ({ params }: { params: { lang: Locale, id: string; } }) => {
  const dictionary = await getDictionary(params.lang);
  const corporateId = String(params.id);
  
  // Fetch corporate data for pre-filling the form
  const corporateData = await getByCompanyId(corporateId);
  
  
  return (
  

  <Grid container>
      <Grid item xs={12}>
        <CorporateCompanyForm 
          dictionary={dictionary} 
          isEditing={true} 
          editData={corporateData} 
        />
      </Grid>
    </Grid>
  );
};

export default EditCompanyApp;