import React from 'react';

import type { Locale } from '@/configs/i18n';
import DocumentExpiryTable from '@/views/apps/taxi/driver/documentExpiry/documents/documentExpiry';
import { getDictionary } from '@/utils/getDictionary';

import { fetchExpiryDocument } from '@/app/api/apps/taxi/driverDocument';

const DocumentExpiry = async ({ params }: { params: { lang: Locale, id: string; } }) => {
  const dictionary = await getDictionary(params.lang);
  const driverId = String(params.id);
  const driverDocument = await fetchExpiryDocument("",1,10)



  return (
    <DocumentExpiryTable
      dictionary={dictionary}
      staticGroup={driverDocument}
      driverId={driverId}
    />
  );
};

export default DocumentExpiry;
