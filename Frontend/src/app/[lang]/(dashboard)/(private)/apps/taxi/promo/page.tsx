import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

import PromoCodeTable from '@/views/apps/taxi/promo-code/promoCodeTable';
import { getPromoWithPagination } from '@/app/api/apps/taxi/promoCode';

const PromoCodeListTablePage = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getPromoWithPagination("", 1, 10);




  const dictionary = await getDictionary(params.lang);

  return <PromoCodeTable promoData={data} dictionary={dictionary}/>;
};

export default PromoCodeListTablePage;
