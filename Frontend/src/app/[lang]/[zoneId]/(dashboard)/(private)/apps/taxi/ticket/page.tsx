import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';


import TicketTable from '@/views/apps/taxi/ticket/ticket';
import { getByTicketByPagination } from '@/app/api/apps/taxi/ticket';

const TicketListTablePage = async ({ params }: { params: { lang: Locale,zoneId:any } }) => {

    const data = await getByTicketByPagination("", 1, 10,'All',params.zoneId);

    const dictionary = await getDictionary(params.lang);

    
return  <TicketTable ticketData={data} dictionary={dictionary} zoneId={params.zoneId} />



};

export default TicketListTablePage;
