// hooks/useSimplePrivilegeCache.ts
import { useState, useEffect } from 'react';

import { getPrivillageData } from '@/utils/privillage';

const cache: Record<string, any> = {};

export const usePrivilegeData = (screenName: string) => {
  const [data, setData] = useState(cache[screenName] || null);

  useEffect(() => {
    if (!cache[screenName]) {
      getPrivillageData(screenName).then(result => {
        cache[screenName] = result;
        setData(result);
      });
    }
  }, [screenName]);

  return data;
};
