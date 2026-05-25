import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getFaqByLanguage } from '@/app/api/apps/taxi/faq';
import DynamicFaqTabs from '@/views/apps/taxi/faq/index';
import { getDefaultLanguage } from '@/app/api/apps/taxi/setting';
 

const FaqListTablePage = async ({ params }: { params: { lang: Locale } }) => {
 
    // Fetch the FAQ data with pagination
    // const data = await getByFaqByPagination("", 1, 10);
    const langId = await getDefaultLanguage();
    const initialFaqData = await getFaqByLanguage(langId,"", 1, 10);
    
    // Fetch the dictionary for the given language
    
    const dictionary = await getDictionary(params.lang);
 
    // Render the FaqTable directly without any privilege checks
    // return <FaqTable FaqData={data} dictionary={dictionary} />;

    return <DynamicFaqTabs
      dictionary={dictionary}
      initialLangId={langId}
      initialFaqData={initialFaqData}
    />;
};
 
export default FaqListTablePage;
 