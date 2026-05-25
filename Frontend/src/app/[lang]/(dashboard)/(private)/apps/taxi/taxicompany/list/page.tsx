// Component Imports
import CompanyList from '@views/apps/taxi/company/list'

// Data Imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getDictionary } from '@/utils/getDictionary';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Locale } from '@/configs/i18n';
import { getCompanyByPagination } from '@apis/company';


const CompanyListApp = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const data = await getCompanyByPagination("", 1, 10);


  const dictionary = await getDictionary(params.lang)



  return <CompanyList adminData={data} dictionary={dictionary} privillageData={undefined}  />
}

export default CompanyListApp
