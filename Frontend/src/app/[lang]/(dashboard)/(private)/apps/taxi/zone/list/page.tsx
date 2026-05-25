// Component Imports
import ZoneManagement from '@views/apps/taxi/zone/list'
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getByZoneByPagination } from '@/app/api/apps/taxi/zone';

const ZoneApp = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getByZoneByPagination("", 1, 10);

  const dictionary = await getDictionary(params.lang)

  return <ZoneManagement tableData={data} dictionary={dictionary} />
}

export default ZoneApp
