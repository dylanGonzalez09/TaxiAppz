// src/views/apps/taxi/master/groupDocument/AdvertisementListTablePage.tsx

import AdvertisementTable from '@views/apps/taxi/advertisement/AdvertisementTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getAdvertisementsWithPagination } from '@apis/advertisement';

const AdvertisementListTablePage = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {

  const { zoneId } = params;

  const dictionary = await getDictionary(params.lang);
  const data = await getAdvertisementsWithPagination("", 1, 10, zoneId);

  return <AdvertisementTable staticGroup={data} dictionary={dictionary} />
};

export default AdvertisementListTablePage;
