// src/views/apps/taxi/master/category/CategoryListTablePage.tsx

import CategoryTable from '@views/apps/taxi/master/category/CategoryTable';
import type { Locale } from '@/configs/i18n';
import { getDictionary } from '@/utils/getDictionary';
import { getByCategoryByPagination } from '@apis/category';

const CategoryListTablePage = async ({ params }: { params: { lang: Locale } }) => {


  const data = await getByCategoryByPagination("", 1, 10);
  const dictionary = await getDictionary(params.lang);



  return <CategoryTable Categories={data} dictionary={dictionary} />
};

export default CategoryListTablePage;
