// Component Imports

import { fetchRoles } from "@/app/api/apps/taxi/role"

import Roles from "@/views/apps/taxi/privillage"

import type { Locale } from '@/configs/i18n';

import { getDictionary } from '@/utils/getDictionary';





const RolesApp = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const data = await fetchRoles()
  const dictionary = await getDictionary(params.lang)

  const filteredRoles = data.filter(({ role }: any) => role !== 'User' && role !== 'Driver');


  return <Roles roleData={filteredRoles} dictionary={dictionary} />
}

export default RolesApp
