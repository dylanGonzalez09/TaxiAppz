
// Data Imports
import CountryTable from '@/views/apps/taxi/country/CountryTable';
import { getCountryByPagination } from '@apis/country';
import { getDictionary } from '@/utils/getDictionary';

import type { Locale } from '@/configs/i18n';


/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/ecommerce` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getEcommerceData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/ecommerce`)

  if (!res.ok) {
    // throw new Error('Failed to fetch ecommerce data')
  }

  return res.json()
} */

const CountryListTablePage = async ({ params }: { params: { lang: Locale, id: string } }) => {
  // Vars

    const id = String(params.id);
  const data = await getCountryByPagination("", 1,10,id);

  const dictionary = await getDictionary(params.lang)



  return <CountryTable countryData={data} dictionary={dictionary}  />

}

export default CountryListTablePage
