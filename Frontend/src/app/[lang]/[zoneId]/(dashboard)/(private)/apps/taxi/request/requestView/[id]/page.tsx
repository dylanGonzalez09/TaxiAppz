// Next Imports
// import { redirect } from 'next/navigation';

import RequestTable from '@/views/apps/taxi/request/requestView';
import { getByRequestId } from '@/app/api/apps/taxi/request';
import { getDictionary } from '@/utils/getDictionary';

// import BackButton from '@/components/common/BackButton';
const OrderDetailsPage = async ({ params }: { params: { lang: any; id: string; } }) => {

  // const lang = params.lang;

  const id = String(params.id);

  const data = await getByRequestId(id);


  // if (!data) {
  //   redirect('/not-found');
  // }

  const dictionary = await getDictionary(params.lang)

  return (
    <>
    {/* <BackButton dictionary={dictionary} /> */}
    <RequestTable requestData={data} dictionary={dictionary} />
    </>
  );
};

export default OrderDetailsPage;
