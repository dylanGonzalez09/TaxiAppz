// Component Imports
// Data Imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getDictionary } from '@/utils/getDictionary';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Locale } from '@/configs/i18n';
import CorporateList from '@/views/apps/taxi/corporatecompany';
import { getCompanyByPagination } from '@apis/company';
import { getPrivillageData } from '@/utils/privillage'
import { SCREEN_NAMES } from '@/utils/screenNames'


const CorporateListApp = async ({ params }: { params: { lang: Locale } }) => {  
  // Vars
  const data = await getCompanyByPagination("", 1, 10);

    const privillageData = await getPrivillageData(SCREEN_NAMES.CorporateCompany);
   const dictionary = await getDictionary(params.lang)


  return <CorporateList adminData={data}  dictionary={dictionary}   privillageData={privillageData}/>
}

export default CorporateListApp
