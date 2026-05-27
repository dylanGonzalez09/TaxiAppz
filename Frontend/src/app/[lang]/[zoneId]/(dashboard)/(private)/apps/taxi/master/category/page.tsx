// src/views/apps/taxi/master/category/CategoryListTablePage.tsx

import CategoryTable from '@views/apps/taxi/master/category/CategoryTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getByCategoryByPagination } from '@apis/category';

const CategoryListTablePage = async ({ params }: { params: { lang: Locale, zoneId: string } }) => {
  const { zoneId } = params;
  const data = await getByCategoryByPagination("", 1, 10, zoneId);
  const dictionary = await getDictionary(params.lang);



  return <CategoryTable Categories={data} dictionary={dictionary} zoneId={zoneId} />
};

export default CategoryListTablePage;
