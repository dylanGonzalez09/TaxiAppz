import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';


import TicketTable from '@/views/apps/taxi/ticket/ticket';
import { getByTicketByPagination } from '@/app/api/apps/taxi/ticket';

const TicketListTablePage = async ({ params }: { params: { lang: Locale } }) => {

    const data = await getByTicketByPagination("", 1, 10);

    const dictionary = await getDictionary(params.lang);

    
return  <TicketTable ticketData={data} dictionary={dictionary}  />



};

export default TicketListTablePage;
