
import VersionListTable from '@views/apps/taxi/version/VersionTable'

// Data Imports
import { getVersionByPagination } from '@apis/version'
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';


/**

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

const VersionListTablePage = async ({ params }: { params: { lang: Locale } }) => {

  // Vars
  const data = await getVersionByPagination("", 1,10);
  const dictionary = await getDictionary(params.lang)


  return <VersionListTable versionData={data} dictionary={dictionary}  />
}

export default VersionListTablePage
