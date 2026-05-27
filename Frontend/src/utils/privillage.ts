import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';

import { fetchRoles } from '@/app/api/apps/taxi/role';
import { fetchPrivillageName } from '@/app/api/apps/taxi/privillege';

let cachedPrivilegeData: Record<string, any> | null = null;

const getValuesForCategory = (data: any, category: string): string[] => {
  return data[category] || [];
};

const getCurrentSession = async () => {
  if (typeof window === 'undefined') {
    return await getServerSession();
  } else {
    return await getSession();
  }
};

// ✅ Updated function with automatic API fallback
export const getPrivillageData = async (screen: string): Promise<string[] | null> => {
  const session = await getCurrentSession();
  const userRole = session?.user?.image?.role;
  
  if (!userRole) {
    console.warn('[Privilege] No user role found in session.');
   
    return null;
  }

  let cached = getCachedPrivilege(userRole);
  
  // ✅ If no cache found, automatically fetch and cache data
  if (!cached) {
    
    try {
      await fetchAndCachePrivilegeInternal(userRole);
      cached = getCachedPrivilege(userRole);
      
      if (!cached) {
        console.error('[Privilege] Failed to fetch and cache privilege data');
      
        return null;
      }
      
    } catch (error) {
      console.error('[Privilege] Error fetching privilege data:', error);
     
      return null;
    }
  }
  
  return getValuesForCategory(cached, screen);
};

export const getCachedPrivilege = (userRole: string) => {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`privilegeData-${userRole}`);
   
    return cached ? JSON.parse(cached) : null;
  }

  return cachedPrivilegeData;
};

// ✅ Internal function for API calls (used by both manual and automatic fetching)
const fetchAndCachePrivilegeInternal = async (userRole: string): Promise<void> => {
  try {
    const roles = await fetchRoles();
    const roleId = roles.find((item: { role: string }) => item.role === userRole)?.id;
    
    if (!roleId) {
      throw new Error(`Role ID not found for role: ${userRole}`);
    }

    const privilegeData = await fetchPrivillageName(roleId);
    
    if (!privilegeData?.data) {
      throw new Error('No privilege data returned from API');
    }

    // Store in both localStorage and memory cache
    if (typeof window !== 'undefined') {
      localStorage.setItem(`privilegeData-${userRole}`, JSON.stringify(privilegeData.data));
    }
   
    cachedPrivilegeData = privilegeData.data;
    
  } catch (error) {
    console.error('[Privilege] Failed to fetch privilege data:', error);
    throw error; // Re-throw to handle in calling function
  }
};

// ✅ Public function for manual privilege fetching (login/MQTT)
export const fetchAndCachePrivilege = async (): Promise<void> => {
  const session = await getCurrentSession();
  const userRole = session?.user?.image?.role;
  
  if (!userRole) return;

  try {
    await fetchAndCachePrivilegeInternal(userRole);
  } catch (error) {
    console.error('[Privilege] Failed to fetch privilege data:', error);
  }
};

export const clearPrivilegeCache = async (): Promise<void> => {
  const session = await getCurrentSession();
  const userRole = session?.user?.image?.role;
  
  if (!userRole) return;

  if (typeof window !== 'undefined') {
    localStorage.removeItem(`privilegeData-${userRole}`);
  }

  cachedPrivilegeData = null;
};

// ✅ Optional: Function to check if cache exists without fetching
export const hasCachedPrivilege = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  const userRole = session?.user?.image?.role;
  
  if (!userRole) return false;
  
  const cached = getCachedPrivilege(userRole);

  return cached !== null;
};
