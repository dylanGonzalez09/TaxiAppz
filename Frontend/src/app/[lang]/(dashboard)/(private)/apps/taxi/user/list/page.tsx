// Component Imports
import UserList from '@views/apps/taxi/user/list'

// Data Imports
import { getUserByPagination } from '@apis/user'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'


/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/user-list` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getUserData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/user-list`)

  if (!res.ok) {
    throw new Error('Failed to fetch userData')
  }

  return res.json()
} */

const UserListApp = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getUserByPagination("", 1, 10)

  const dictionary = await getDictionary(params.lang)



  return <UserList userData={data} dictionary={dictionary} showAddButton={true} showActionButton={true} />
}

export default UserListApp
