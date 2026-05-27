import RoleListTable from '@views/apps/taxi/role/RoleTable'

import { getRoleWithPagination } from '@apis/role'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

const RoleListTablePage = async ({ params }: { params: { lang: Locale } }) => {
  const data = await getRoleWithPagination('', 1, 10)
  const dictionary = await getDictionary(params.lang)

  return <RoleListTable roleData={data} dictionary={dictionary} />
}

export default RoleListTablePage

