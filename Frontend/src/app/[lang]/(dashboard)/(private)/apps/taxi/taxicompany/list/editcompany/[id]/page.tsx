/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getByRequestId } from '@/app/api/apps/taxi/request';
import EditCompany from '@/views/apps/taxi/taxicompany/list/editcompany/EditCompany';

// Example of passing companyData to EditCompany component
// const companyData = {
//   companyName: 'ABC Corp',
//   companyEmail: 'contact@abccorp.com',
//   companyPhoneNumber: '+1234567890',
//   contactPersonName: 'John Doe',
//   contactPersonEmail: 'johndoe@abccorp.com',
//   contactPersonPhoneNumber: '+9876543210',
//   commission: '5%',
//   noOfVehicle: '20',
//   active: true,
//   status: true,
// }

const EditCompanyScreen = async ({ params }: { params: { lang: Locale, id: string; } }) => {
  const dictionary = await getDictionary(params.lang);
  const lang = params.lang;
  const id = String(params.id);
  const companyData = await getByRequestId(id);

  
return (
    <Grid container>
      <Grid item xs={12}>
        <EditCompany companyData={companyData} lang={lang} dictionary={dictionary}/>
      </Grid>
    </Grid>
  )
}

export default EditCompanyScreen;