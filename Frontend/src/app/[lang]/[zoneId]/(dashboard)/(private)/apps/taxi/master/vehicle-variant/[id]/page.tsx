import VehicleVariantTable from '@views/apps/taxi/master/vehicle-variant/VehicleVariantTable'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

// import BackButton from '@/components/common/BackButton'

import { getVehicleVariantByPagination } from '@apis/vehicleVariant'
import { getByVehicleIdModel } from '@apis/vehiclemodel'

const VehicleVariantListTablePage = async ({ params }: { params: { lang: Locale; id: string; zoneId: string } }) => {
  const { id: vehicleModelId, zoneId } = params;

  const [data, vehicleModel] = await Promise.all([
    getVehicleVariantByPagination(vehicleModelId, '', 1, 10, zoneId),
    getByVehicleIdModel(vehicleModelId, zoneId),
  ]);

  const dictionary = await getDictionary(params.lang);

  const brandId = vehicleModel?.brandId
    ? (typeof vehicleModel.brandId === 'object' && vehicleModel.brandId !== null && '_id' in vehicleModel.brandId
        ? (vehicleModel.brandId as { _id: string })._id
        : String(vehicleModel.brandId))
    : vehicleModel?.brand_id ?? null;

  return (
    <>
    {/* <BackButton dictionary={dictionary} backPath='apps/taxi/master/vehicle-variant' /> */}
    <VehicleVariantTable
      vehicleVariantData={data}
      dictionary={dictionary}
      zoneId={zoneId}
      brandId={brandId}
    />
    </>
  );
}

export default VehicleVariantListTablePage
