import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getFaqByLanguage } from '@/app/api/apps/taxi/faq';
import DynamicFaqTabs from '@/views/apps/taxi/faq/index';
import { getDefaultLanguage } from '@/app/api/apps/taxi/setting';
 

const FaqListTablePage = async ({ params }: { params: { lang: Locale, zoneId: string  } }) => {
   const { zoneId } = params;
    const langId = await getDefaultLanguage();
    const initialFaqData = await getFaqByLanguage(langId,"", 1, 10,zoneId);
    
    // Fetch the dictionary for the given language
    
    const dictionary = await getDictionary(params.lang);

    

    return (
      
       <DynamicFaqTabs
         dictionary={dictionary}
         initialLangId={langId}
         initialFaqData={initialFaqData}
         zoneId={zoneId}
       />
  );
};
 
export default FaqListTablePage;
 