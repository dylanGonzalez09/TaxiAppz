import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';


import RentalTable from '@/views/apps/taxi/rentalmaster/rentalmaster/rental';
import { getRentalWithPagination } from '@/app/api/apps/taxi/rental';

const RentalListTablePage = async ({ params }: { params: { lang: Locale,id: string; } }) => {

    const id = String(params.id);
    
    const data = await getRentalWithPagination(id,"", 1, 10);

    const zoneId = String(params.id);

    const dictionary = await getDictionary(params.lang);
    
return  <RentalTable RentalData={data} zone={zoneId} dictionary={dictionary}  />

};

export default RentalListTablePage;
