import UserList from '@views/apps/taxi/user/list' // Your UserList component

// Data Imports
import { getUserByPagination } from '@apis/user'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'

const walletUserApp = async ({ params }: { params: { lang: Locale } }) => {
  // Fetch user data and dictionary
  const data = await getUserByPagination("", 1, 10)
  const dictionary = await getDictionary(params.lang)

  // Render UserList with the showAddButton prop set to false for wallet
  return <UserList userData={data} dictionary={dictionary} showAddButton={false} showActionButton={false}/>
}

export default walletUserApp
