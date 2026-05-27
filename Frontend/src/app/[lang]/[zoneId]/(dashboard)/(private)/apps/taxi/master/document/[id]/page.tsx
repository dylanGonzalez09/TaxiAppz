// eslint-disable-next-line import/namespace, import/default, import/no-named-as-default
import DocumentTable from '@views/apps/taxi/master/document/DocumentTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getDocumentByPagination } from '@apis/document';


const normalizeType = (type?: string): 'All' | 'driver' | 'vehicle' => {
  const normalized = String(type || '').toLowerCase();

  if (normalized === 'driver' || normalized === 'vehicle') {
    return normalized;
  }

  
return 'All';
};

const DocumentListTablePage = async ({
  params,
  searchParams,
}: {
  params: { lang: Locale, zoneId: string; id: string };
  searchParams?: { type?: string; groupDocumentId?: string };
}) => {
  const { zoneId, id } = params;
  const initialType = normalizeType(searchParams?.type);
  const selectedGroupDocumentId = searchParams?.groupDocumentId || id || undefined;

  const data = (await getDocumentByPagination(
    "",
    1,
    10,
    initialType === 'All' ? undefined : initialType,
    selectedGroupDocumentId,
    zoneId
  )) || {
    results: [],
    page: 1,
    totalResults: 0,
    limit: 10,
  };

  const dictionary = await getDictionary(params.lang);


  return (
    <DocumentTable
      staticGroup={data}
      dictionary={dictionary}
      initialType={initialType}
      selectedGroupDocumentId={selectedGroupDocumentId}
    />
  )
};

export default DocumentListTablePage;
