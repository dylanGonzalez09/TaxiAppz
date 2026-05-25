// src/views/apps/taxi/master/vehicle/VehicleListTablePage.tsx

import VehicleTable from '@views/apps/taxi/master/vehicle/VehicleTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import { getVehiclesWithPagination } from '@apis/vehicle';




const VehicleListTablePage = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getVehiclesWithPagination("", 1, 10);


  const dictionary = await getDictionary(params.lang);


  return <VehicleTable staticData={data} dictionary={dictionary}  />
};

export default VehicleListTablePage;
