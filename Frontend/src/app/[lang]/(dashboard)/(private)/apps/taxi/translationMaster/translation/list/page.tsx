import { fetchMobileTranslation, fetchActiveLanguage, fetchAllLanguages, fetchTranslation } from '@apis/translation'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import TabViewClient from '@/views/apps/taxi/translation'

const TabViewServer = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  const [mobileDataResponse, response, activeLe, allLanguageCodes] = await Promise.all([
    fetchMobileTranslation(),
    fetchTranslation(),
    fetchActiveLanguage(),
    fetchAllLanguages()
  ])

  return (
    <TabViewClient
      data={response}
      mobileData={mobileDataResponse}
      activeData={activeLe}
      allLanguageCodes={allLanguageCodes}
      dictionary={dictionary}
    />
  )
}

export default TabViewServer
