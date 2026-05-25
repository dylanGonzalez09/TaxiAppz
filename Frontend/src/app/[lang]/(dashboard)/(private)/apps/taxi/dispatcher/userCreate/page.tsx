// Component Imports
import DispatcherList from '@views/apps/taxi/dispatcher/userCreate/dispatcherList'

// Data Imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Locale } from '@/configs/i18n'

// import { fetchRoles } from '@apis/role'
// import { fetchUsers } from '@apis/user'
import { getDictionary } from '@/utils/getDictionary'
import { getDispatcherByPagination } from '@/app/api/apps/taxi/dispatcher'




const DispatcherListApp = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getDispatcherByPagination("", 1, 10)

  const dictionary = await getDictionary(params.lang)


  return <DispatcherList
      dispatcherData={data}
      dictionary={dictionary}
    />
  
}

export default DispatcherListApp
