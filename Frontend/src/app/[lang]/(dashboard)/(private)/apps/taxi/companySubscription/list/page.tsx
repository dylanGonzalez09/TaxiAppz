// Data Imports
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import SubScriptionTable from '@/views/apps/taxi/companySubscription/list/SubScriptionTable';
import { getCompanySubscriptionByPagination } from '@/app/api/apps/taxi/companySubscription';



const SupScriptionListTablePage = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const data = await getCompanySubscriptionByPagination("", 1, 10)
  const dictionary = await getDictionary(params.lang)

  return <SubScriptionTable subScriptionData={data} dictionary={dictionary}  />
}

export default SupScriptionListTablePage
