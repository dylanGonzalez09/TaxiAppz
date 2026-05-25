// eslint-disable-next-line import/no-duplicates
import { getSession } from 'next-auth/react' // For client-side
import { getServerSession } from 'next-auth' // For server-side

// eslint-disable-next-line import/no-duplicates
import { signOut } from 'next-auth/react'

import { fetchRoles } from '@/app/api/apps/taxi/role'
import { fetchPrivillageName } from '@/app/api/apps/taxi/privillege'

/**
 * Fetches privilege data based on the current session and filters roles.
 * @returns {Promise<string | null>}
 */
export const getPrivillageData = async (screen: string): Promise<string | null> => {
  let session = null

  if (typeof window !== 'undefined') {
    session = await getSession()
  } else {
    session = await getServerSession()
  }

  const roles = await fetchRoles()



  const filteredIds = roles
    .filter((item: { role: string }) => item.role === session?.user?.image?.role)
    .map((item: { id: string }) => item.id)


  const roleId = filteredIds.length > 0 ? filteredIds[0] : null

  const privillageData = await fetchPrivillageName(roleId)
  
  if (!privillageData || !privillageData.data) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isDemoUser') 
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL })
    }

    return null
  }

  const screenValues = getValuesForCategory(privillageData.data, screen)

  return screenValues
}

const getValuesForCategory = (data: any, category: string) => {
  return data[category] || []
}
