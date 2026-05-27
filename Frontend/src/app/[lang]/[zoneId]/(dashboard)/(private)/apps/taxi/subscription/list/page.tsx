

// Data Imports
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import { getSubscriptionByPagination } from '@/app/api/apps/taxi/subscription';
import SubScriptionTable from '@/views/apps/taxi/subscription/SubScriptionTable';



const SupScriptionListTablePage = async ({ params }: { params: { lang: Locale; zoneId: string } }) => {
  const data =
    (await getSubscriptionByPagination('', 1, 10, params.zoneId)) ?? {
      results: [],
      totalResults: 0,
      page: 1,
      limit: 10
    }

  const dictionary = await getDictionary(params.lang)

  return (
    <SubScriptionTable
      subScriptionData={data}
      dictionary={dictionary}
      zoneId={params.zoneId}
    />
  )
}

export default SupScriptionListTablePage
