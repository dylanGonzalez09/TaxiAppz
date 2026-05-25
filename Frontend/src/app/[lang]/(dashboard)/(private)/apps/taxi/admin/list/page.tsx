/* eslint-disable import/no-unresolved */
// Component Imports
import AdminList from '@views/apps/taxi/admin/list'

// Data Imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAdminByPagination } from '@apis/user'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'




const AdminListApp = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getAdminByPagination("", 1, 10);


  const dictionary = await getDictionary(params.lang)



  return   <AdminList
      adminData={data}
      dictionary={dictionary}
    />

}

export default AdminListApp
