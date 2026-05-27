import VehicleModelTable from '@views/apps/taxi/master/vehicle-model/vehicelModelTable' // Fixed import path and name
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

// import BackButton from '@/components/common/BackButton'
import { getVehicleModelByPagination } from '@apis/vehiclemodel'

const VehicleModelListTablePage = async ({ params }: { params: { lang: Locale; id: string; zoneId: string } }) => {
  const { id, zoneId } = params
  const data = await getVehicleModelByPagination(id, '', 1, 10, zoneId)

  const dictionary = await getDictionary(params.lang)

  return (
    <>
      {/* <BackButton dictionary={dictionary} backPath='apps/taxi/master/vehicle-model' /> */}
      <VehicleModelTable vehicleModelData={data} dictionary={dictionary} zoneId={zoneId} />
    </>
  )
}

export default VehicleModelListTablePage
