import LanguageListTable from '@views/apps/taxi/language/LanguageTable'

// Data Imports
import { getLanguageByPagination } from '@apis/language';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';


const LanguageListTablePage = async ({ params }: { params: { lang: Locale, id: string } }) => {
  // Vars
  const id = String(params.id);
  const data = await getLanguageByPagination("", 1, 10,id);
  const dictionary = await getDictionary(params.lang)

  return <LanguageListTable languageData={data} dictionary={dictionary}  />
}

export default LanguageListTablePage

