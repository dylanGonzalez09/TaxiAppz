// src/views/apps/taxi/master/vehicle/VehicleListTablePage.tsx

import VehicleTable from '@views/apps/taxi/master/vehicle/VehicleTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import { getVehiclesWithPagination } from '@apis/vehicle';

const VehicleListTablePage = async ({
  params,
  searchParams
}: {
  params: { lang: Locale; zoneId: string };
  searchParams?: { page?: string; pageSize?: string; search?: string };
}) => {
  const { zoneId } = params;
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const pageSize = Math.min(100, Math.max(5, parseInt(searchParams?.pageSize || '10', 10)));
  const search = searchParams?.search || '';
  const data = await getVehiclesWithPagination(search, page, pageSize, zoneId);


  const dictionary = await getDictionary(params.lang);


  return (
   <>
   <VehicleTable staticData={data} dictionary={dictionary} zoneId={zoneId}  />
   </>
  )
};

export default VehicleListTablePage;
