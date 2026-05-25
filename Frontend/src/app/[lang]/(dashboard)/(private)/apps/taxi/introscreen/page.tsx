// src/views/apps/taxi/master/vehicle/VehicleListTablePage.tsx

import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';


import IntroTable from '@/views/apps/taxi/introscreen/IntroTable';
import { fetchIntro } from '@/app/api/apps/taxi/intro';

const IntroListTablePage = async ({ params }: { params: { lang: Locale } }) => {

  const data = await fetchIntro();

  const dictionary = await getDictionary(params.lang);



  return <IntroTable staticData={data} dictionary={dictionary}  />
};

export default IntroListTablePage;
