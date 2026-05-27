import UserList from '@views/apps/taxi/user/list' // Your UserList component

// Data Imports
import { getUserByPagination } from '@apis/user'
import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'

const walletUserApp = async ({
  params,
  searchParams
}: {
  params: { lang: Locale; zoneId: string };
  searchParams?: { page?: string; pageSize?: string; search?: string };
}) => {
  const { zoneId } = params;
  const page = Math.max(1, parseInt(searchParams?.page || '1', 10));
  const apiPage = page - 1;
  const pageSize = Math.min(100, Math.max(5, parseInt(searchParams?.pageSize || '10', 10)));
  const search = searchParams?.search || '';
  const data = await getUserByPagination(search, apiPage, pageSize, zoneId);
  const dictionary = await getDictionary(params.lang);

  // Render UserList with the showAddButton prop set to false for wallet
  return <UserList userData={data} dictionary={dictionary} showAddButton={false} showActionButton={false} zoneId={zoneId}/>
}

export default walletUserApp
