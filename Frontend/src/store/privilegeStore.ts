/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';

import { getPrivillageData, getCachedPrivilege, fetchAndCachePrivilege, hasCachedPrivilege } from '@/utils/privillage';
import { SCREEN_NAMES } from '@/utils/screenNames';

type State = {
  privilege: string[]
  loading: boolean
  hasCache: boolean
  fetchPrivilege: () => Promise<void>
  refreshFromCache: () => void
  checkCache: () => Promise<void>
}

const getInitialPrivilege = () => {

  if (typeof window !== 'undefined') {
    try {
      const session = JSON.parse(localStorage.getItem('next-auth.session') || '{}');
      const role = session?.user?.image?.role;
      
      if (role) {
        const cached = getCachedPrivilege(role);
      
        if (cached) {
          return cached[SCREEN_NAMES.Sidemnu] || [];
        }
      }
    } catch (error) {
      console.error('[PrivilegeStore] Error reading initial privilege:', error);
    }
  }

  return [];
};

export const usePrivilegeStore = create<State>((set, get) => ({
  privilege: getInitialPrivilege(),
  loading: false,
  hasCache: false,
  
  // Manual API fetch (login/MQTT)
  fetchPrivilege: async () => {
    set({ loading: true });
   
    try {
      await fetchAndCachePrivilege();
      const data = await getPrivillageData(SCREEN_NAMES.Sidemnu);
      
      set({ privilege: data ?? [], loading: false, hasCache: true });
    } catch (error) {
      console.error('[PrivilegeStore] Error fetching privilege:', error);
      set({ privilege: [], loading: false, hasCache: false });
    }
  },
  
  // ✅ This now uses the enhanced getPrivillageData (cache + auto-fetch)
  refreshFromCache: async () => {
    set({ loading: true });
 
    try {
      const data = await getPrivillageData(SCREEN_NAMES.Sidemnu);
    
      set({ privilege: data ?? [], loading: false, hasCache: data !== null });
    } catch (error) {
      console.error('[PrivilegeStore] Error refreshing privilege:', error);
      set({ privilege: [], loading: false, hasCache: false });
    }
  },
  
  // Check cache status
  checkCache: async () => {
    const hasCache = await hasCachedPrivilege();
  
    set({ hasCache });
  }
}));
