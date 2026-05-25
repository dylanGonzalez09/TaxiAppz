
  import { getDictionary } from '@/utils/getDictionary';
  import type { Locale } from '@/configs/i18n';
  import DispatcherIndex from '@/views/apps/taxi/dispatcher/createTrip';

  
  const Dispatcher = async ({ params }: { params: { lang: Locale } }) => {
  
  
    const dictionary = await getDictionary(params.lang);
  
    return  <DispatcherIndex dictionary={dictionary}  />
   
  };
  
  export default Dispatcher;
  