

// Data Imports
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import { getSubscriptionByPagination } from '@/app/api/apps/taxi/subscription';
import SubScriptionTable from '@/views/apps/taxi/subscription/SubScriptionTable';



const SupScriptionListTablePage = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const data = await getSubscriptionByPagination("",1,10)
  const dictionary = await getDictionary(params.lang)


  return <SubScriptionTable subScriptionData={data} dictionary={dictionary}  />
}

export default SupScriptionListTablePage
