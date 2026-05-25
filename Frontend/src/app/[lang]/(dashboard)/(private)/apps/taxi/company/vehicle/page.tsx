// Component Imports
import CompanyVehicleList from '@views/apps/taxi/company/vehicle'

// Data Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getCompanyVehiclesWithPagination } from '@apis/companyVehicle';

const CompanyVehicleListApp = async ({ params }: { params: { lang: Locale } }) => {
  // Fetch data from the API with empty search, page 1, and limit 10
  const data = await getCompanyVehiclesWithPagination("", 1, 10);
  
  const dictionary = await getDictionary(params.lang)

  return <CompanyVehicleList tableData={data} dictionary={dictionary} />
}

export default CompanyVehicleListApp  