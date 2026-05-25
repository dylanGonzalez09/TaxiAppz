// page.tsx

import { fetchMobileTranslation, fetchTranslation, fetchActiveLanguage } from '@apis/translation';
import TabViewClient from '@/views/apps/taxi/translation';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';

const TabViewServer = async ({ params }: { params: { lang: Locale } }) => {
    const dictionary = await getDictionary(params.lang)
    const response = await fetchTranslation();
    const mobileDataResponse = await fetchMobileTranslation();
    const activeLe = await fetchActiveLanguage();

    return (
      <TabViewClient 
        data={response}
        mobileData={mobileDataResponse}
        activeData={activeLe}
        dictionary={dictionary}
      />
    );
  
};

export default TabViewServer;
