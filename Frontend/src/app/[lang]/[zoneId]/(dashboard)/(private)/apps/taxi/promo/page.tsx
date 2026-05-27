import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import PromoCodeTable from '@/views/apps/taxi/promo-code/promoCodeTable';
import { getPromoWithPagination } from '@/app/api/apps/taxi/promoCode';

const PromoCodeListTablePage = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const data = await getPromoWithPagination("", 1, 10, zoneId);
  const dictionary = await getDictionary(params.lang);

  return <PromoCodeTable promoData={data} dictionary={dictionary} zoneId={zoneId}/>;
};

export default PromoCodeListTablePage;
