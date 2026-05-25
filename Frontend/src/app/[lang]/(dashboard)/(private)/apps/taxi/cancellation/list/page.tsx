/* eslint-disable @typescript-eslint/no-unused-vars */
// Next Imports

// MUI Imports
import { getCancellationByLanguage } from '@apis/cancellationReason'
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getDefaultLanguage } from '@/app/api/apps/taxi/setting';
import DynamicCancellationTabs from '@/views/apps/taxi/cancellation';


const Cancellation = async ({ params }: { params: { lang: Locale } }) => {



    const langId = await getDefaultLanguage();
    const initialCancellationData = await getCancellationByLanguage(langId,"", 1, 10);
    const dictionary = await getDictionary(params.lang);

    return <DynamicCancellationTabs
      dictionary={dictionary}
      initialLangId={langId}
      initialCancellationData={initialCancellationData}
    />;
};

export default Cancellation;
