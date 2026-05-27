// import BackButton from '@/components/common/BackButton'
import BrandTable from '@views/apps/taxi/master/brand/BrandTable'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

import { getBrandByPagination } from '@apis/brand'

const BrandListTablePage = async ({
 params,
}: {
  params: { lang: Locale; id: string; zoneId: string };
}) => {
  const { zoneId, id } = params;

  const data = await getBrandByPagination(id, '', 1, 10, zoneId);

  const dictionary = await getDictionary(params.lang);

  return (
    <>
      {/* <BackButton dictionary={dictionary} backPath='apps/taxi/master/vehicle' /> */}
      <BrandTable brandData={data} dictionary={dictionary} zoneId={zoneId} />
    </>
  );
};

export default BrandListTablePage;
