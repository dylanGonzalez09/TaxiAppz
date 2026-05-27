import VersionListTable from '@views/apps/taxi/version/VersionTable'

// Data Imports
import { getVersionByPagination } from '@apis/version'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

const VersionListTablePage = async ({ params }: { params: { lang: Locale } }) => {
  const data = await getVersionByPagination('', 1, 10)
  const dictionary = await getDictionary(params.lang)

  return <VersionListTable versionData={data} dictionary={dictionary} />
}

export default VersionListTablePage

