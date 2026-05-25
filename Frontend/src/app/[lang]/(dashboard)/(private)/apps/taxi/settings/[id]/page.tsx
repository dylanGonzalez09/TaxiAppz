import SettingListTable from '@views/apps/taxi/settings'
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getSettingById , getDefaultLanguage } from '@/app/api/apps/taxi/setting';
import { fetchActiveCountry } from '@/app/api/apps/taxi/country';
import { fetchActiveLanguageAndId } from '@apis/translation';


interface SettingsData {
  general?: any;
  terms?: any;
  keys?: any;
  modules?: any;
  activeLanguage?: any;
  activeCountry?: any;
  langId?: string;
}

const SettingListTablePage = async ({ params }: { params: { lang: Locale; id: string } }) => {
  // Fetch all data on server side
  const id = String(params.id);
  const dictionary = await getDictionary(params.lang);
  const response = await getSettingById(id);
  const activeLanguage = await fetchActiveLanguageAndId();
  const activeCountry = await fetchActiveCountry();
  const langId = await getDefaultLanguage();

  // Organize the data
  const settingsData: SettingsData = {
    general: response.find((item: { _id: string }) => item._id === "general"),
    terms: response.find((item: { _id: string }) => item._id === "terms"),
    keys: response.find((item: { _id: string }) => item._id === "keys"),
    modules: response.find((item: { _id: string }) => item._id === "modules"),
    activeLanguage,
    activeCountry,
    langId
  };

  return (
    <SettingListTable 
      dictionary={dictionary} 
      settingsData={settingsData}
      params={params}
    />
  );
}

export default SettingListTablePage;
