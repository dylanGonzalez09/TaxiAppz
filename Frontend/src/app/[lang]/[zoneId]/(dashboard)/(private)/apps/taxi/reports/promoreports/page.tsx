import React from 'react';

import type { Locale } from '@/configs/i18n';

import PromoReportsTable from '@/views/apps/taxi/reports/promoreports/promoreports';
import { getDictionary } from '@/utils/getDictionary';
import { getPromoUseReport } from '@/app/api/apps/taxi/promoCode';

const PromoReports = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const dictionary = await getDictionary(params.lang);
  const promoUsage = await getPromoUseReport(zoneId);

  return (
    <PromoReportsTable
      dictionary={dictionary}
      staticGroup={promoUsage}
    />
  );
};

export default PromoReports;
