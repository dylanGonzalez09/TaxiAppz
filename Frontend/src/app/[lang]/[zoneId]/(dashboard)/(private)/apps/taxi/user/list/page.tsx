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

interface UserListAppProps {
  params: { lang: Locale; zoneId: string }
  searchParams?: { page?: string; pageSize?: string; search?: string }
}

const UserListApp = async ({ params, searchParams = {} }: UserListAppProps) => {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10))
  const apiPage = page - 1
  const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.pageSize || '10', 10)))
  const search = searchParams.search || ''

  const data = await getUserByPagination(search, apiPage, pageSize, params.zoneId)

  const dictionary = await getDictionary(params.lang)



  return <UserList userData={data} dictionary={dictionary} showAddButton={true} showActionButton={true} zoneId={params.zoneId}/>
}

export default UserListApp
