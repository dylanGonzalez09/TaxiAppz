import VehicleModelTable from '@views/apps/taxi/master/vehicle-model/vehicelModelTable'; // Fixed import path and name
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import { getVehicleModelByPagination } from '@apis/vehiclemodel';


const VehicleModelListTablePage = async ({ params }: { params: { lang: Locale ,id: string} }) => {


  const data = await getVehicleModelByPagination(params.id,"", 1, 10);

  


  const dictionary = await getDictionary(params.lang);

  return <VehicleModelTable vehicleModelData={data} dictionary={dictionary} />;
};

export default VehicleModelListTablePage;
