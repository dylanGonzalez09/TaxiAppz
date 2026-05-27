import ClientList from '@views/apps/taxi/demoClient/list/index';
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import { getClientByPagination } from '@/app/api/apps/taxi/democlient';


const ClientListApp = async ({ params }: { params: { lang: Locale ,zoneId:any} }) => {

  const client = await getClientByPagination("",1,10);

  const dictionary = await getDictionary(params.lang);

  return  <ClientList clientData={client} dictionary={dictionary} overrideZoneId={params.zoneId}  />
 
};

export default ClientListApp;
