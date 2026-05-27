// Data Imports
import CountryTable from '@/views/apps/taxi/country/CountryTable'
import { getCountryByPagination } from '@apis/country'
import { getDictionary } from '@/utils/getDictionary'

import type { Locale } from '@/configs/i18n'

const CountryListTablePage = async ({ params }: { params: { lang: Locale; id: string } }) => {
  const { id } = params
  const data = await getCountryByPagination('', 1, 10, id)
  const dictionary = await getDictionary(params.lang)

  return <CountryTable countryData={data} dictionary={dictionary} />
}

export default CountryListTablePage

