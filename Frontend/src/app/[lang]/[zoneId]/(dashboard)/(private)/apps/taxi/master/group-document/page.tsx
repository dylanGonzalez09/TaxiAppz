// src/views/apps/taxi/master/groupDocument/GroupDocumentListTablePage.tsx

import GroupDocumentTable from '@views/apps/taxi/master/group-document/GroupDocumentTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getGroupDocumentByPagination } from '@apis/groupDocument';

const GroupDocumentListTablePage = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const data = await getGroupDocumentByPagination("", 1, 10, zoneId);
  const dictionary = await getDictionary(params.lang);

  return <GroupDocumentTable staticGroup={data} dictionary={dictionary} />
};

export default GroupDocumentListTablePage;
