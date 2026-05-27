// Data Imports
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import SubScriptionTable from '@/views/apps/taxi/package/list/SubScriptionTable';
import { getPackageByPagination } from '@/app/api/apps/taxi/package';



const SupScriptionListTablePage = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const data = await getPackageByPagination("", 1, 10, zoneId);
  const dictionary = await getDictionary(params.lang);


  return <SubScriptionTable subScriptionData={data} dictionary={dictionary}  />
}

export default SupScriptionListTablePage
