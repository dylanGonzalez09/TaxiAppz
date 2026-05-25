// Component Imports
import CompanyList from '@views/apps/taxi/company/list'

// Data Imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getDictionary } from '@/utils/getDictionary';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Locale } from '@/configs/i18n';
import { getFleetByPagination } from '@apis/company';
import { getPrivillageData } from '@/utils/privillage'
import { SCREEN_NAMES } from '@/utils/screenNames'



const CompanyListApp = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const data = await getFleetByPagination("", 1, 10);
    const privillageData = await getPrivillageData(SCREEN_NAMES.CompanyTaxi);


  

  const dictionary = await getDictionary(params.lang)



  return <CompanyList adminData={data} dictionary={dictionary} privillageData={privillageData} />
}

export default CompanyListApp
