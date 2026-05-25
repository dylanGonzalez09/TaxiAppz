// Next Imports
// import { redirect } from 'next/navigation';

import RequestTable from '@/views/apps/taxi/request/requestView';
import { getByRequestId } from '@/app/api/apps/taxi/request';
import { getDictionary } from '@/utils/getDictionary';




const OrderDetailsPage = async ({ params }: { params: { lang: any; id: string; } }) => {

  // const lang = params.lang;

  const id = String(params.id);

  const data = await getByRequestId(id);


  // if (!data) {
  //   redirect('/not-found');
  // }

  return <RequestTable requestData={data} dictionary={await getDictionary(params.lang)} />;
};

export default OrderDetailsPage;
