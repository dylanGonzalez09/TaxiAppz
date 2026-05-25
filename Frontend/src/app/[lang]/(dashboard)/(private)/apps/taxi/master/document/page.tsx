import DocumentTable from '@views/apps/taxi/master/document/DocumentTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getDocumentByPagination } from '@apis/document';


const DocumentListTablePage = async ({ params }: { params: { lang: Locale } }) => {

  const data = await getDocumentByPagination("", 1, 10);
  const dictionary = await getDictionary(params.lang);


  return <DocumentTable staticGroup={data} dictionary={dictionary} />
};

export default DocumentListTablePage;
