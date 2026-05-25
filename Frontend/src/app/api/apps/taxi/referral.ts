// src/utils/fetchRoles.ts
import { get } from './formApiService';
import { ENDPOINTS } from './endpoint';


export const fetchUserReferral = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.referral.getReferralByUser(id));

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};

export const fetchStatsData = async (id: string) => {
  try {
    const response = await get(ENDPOINTS.referral.getStatsByUser(id));

    if (response.success) {
      return response.data
    } else {
      return []
    }
  } catch (error) {
    return [];
  }
};
