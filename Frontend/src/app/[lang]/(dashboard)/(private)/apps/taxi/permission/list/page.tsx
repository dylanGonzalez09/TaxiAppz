import PemissionListTable from '@views/apps/taxi/permission/PermissionTable'

// Data Imports
import { getPermissionWithPagination } from '@apis/permission';

import type { Locale } from '@/configs/i18n';

import { getDictionary } from '@/utils/getDictionary';





const PermissionListTablePage = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const data = await getPermissionWithPagination("",1,10)
  const dictionary = await getDictionary(params.lang)



  return <PemissionListTable permissionData={data} dictionary={dictionary}/>
}

export default PermissionListTablePage
