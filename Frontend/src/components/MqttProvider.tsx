'use client'
import { useEffect } from 'react';

import { connectMqtt, subscribeToTopic } from '@/utils/mqttClient';
import { usePrivilegeStore } from '@/store/privilegeStore';
import { clearPrivilegeCache } from '@/utils/privillage';

const MqttProvider = () => {
  
  const fetchPrivilege = usePrivilegeStore((s) => s.fetchPrivilege); // ✅ Use fetchPrivilege

  useEffect(() => {

    const client = connectMqtt();

    subscribeToTopic('Taxiappz/web/privilege/update', async () => {
      
      // Clear cache first
      await clearPrivilegeCache();
      
      // ✅ Fetch fresh data from API
      await fetchPrivilege();
    });

    return () => {
      client.end();
    };
  }, [fetchPrivilege]);

  return null;
};

export default MqttProvider;
