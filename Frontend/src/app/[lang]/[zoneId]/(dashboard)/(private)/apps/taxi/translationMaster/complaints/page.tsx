import { getComplaintsByLanguage } from '@/app/api/apps/taxi/complaints'
import { getDefaultLanguage } from '@/app/api/apps/taxi/setting'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import DynamicComplaintsTabs from '@/views/apps/taxi/complaints'

const ComplaintListTablePage = async ({ params }: { params: { lang: Locale; zoneId: string } }) => {
  const { zoneId } = params
  const langId = await getDefaultLanguage()
  const initialComplaintData = await getComplaintsByLanguage(langId,'', 1, 10, zoneId)

  // Fetch the dictionary for the given language
  const dictionary = await getDictionary(params.lang)

  // Render the FaqTable directly without any privilege checks
  // return <FaqTable FaqData={data} dictionary={dictionary} />;
  return (
    <DynamicComplaintsTabs
      dictionary={dictionary}
      initialLangId={langId}
      initialComplaintsData={initialComplaintData}
      zoneId={zoneId}
    />
  )
}

export default ComplaintListTablePage
