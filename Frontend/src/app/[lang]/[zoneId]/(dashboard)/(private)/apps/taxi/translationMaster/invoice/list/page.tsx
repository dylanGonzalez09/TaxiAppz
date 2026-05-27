// Next Imports

// MUI Imports
import { getDictionary } from '@/utils/getDictionary';
import type { Locale } from '@/configs/i18n';
import DynamicInvoiceTabs from '@/views/apps/taxi/invoice/index';
import { getDefaultLanguage } from '@/app/api/apps/taxi/setting';
import { getInvoiceByLanguage } from '@/app/api/apps/taxi/invoice';

const Invoice = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const langId = await getDefaultLanguage();
  const initialFaqData = await getInvoiceByLanguage(langId, "", 1, 10, zoneId);

  const dictionary = await getDictionary(params.lang);

  // return  <InvoiceIndex InvoiceData={InvoiceData} dictionary={dictionary}  />
  return (<DynamicInvoiceTabs 
      dictionary={dictionary}
      initialLangId={langId}
      initialFaqData={initialFaqData}
      zoneId={zoneId}
    />);
  };
  

export default Invoice;
