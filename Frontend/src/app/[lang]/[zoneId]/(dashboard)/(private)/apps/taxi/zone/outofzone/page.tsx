// Next Imports
// MUI Imports
import { getByOutOfZoneByPagination } from '@apis/outOfZone';
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import OutZoneIndex from '@/views/apps/taxi/zone/out-zone/OutOfZone';






const OutZone = async ({ params }: { params: { lang: Locale } }) => {
  const outZoneData = await getByOutOfZoneByPagination("", 1, 10);

  const dictionary = await getDictionary(params.lang);

  return  <OutZoneIndex OutZoneData={outZoneData} dictionary={dictionary}/>
 
};

export default OutZone;
